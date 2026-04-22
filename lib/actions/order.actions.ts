'use server'

import { Cart, OrderItem, ShippingAddress } from "@/types"
import { formatError, round2 } from '../utils'
import { AVAILABLE_DELIVERY_DATES } from "../constant"
import { connectToDatabase } from "../db"
import { auth } from '@/auth'
import { OrderInputSchema } from '../validator'
import Order, { IOrder } from '../db/models/order.models'
import { paypal } from '../paypal'
import { sendPurchaseReceipt } from '@/emails'
import { revalidatePath } from 'next/cache'
import User from '../db/models/user.model'

// CREATE ORDER
export const createOrder = async (clientSideCart: Cart) => {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session) throw new Error('User not authenticated')
    if (!session.user?.email) throw new Error('No user email in session')

    let userId = session.user.id

    if (!userId) {
  console.log('Searching for email:', session.user.email)

  // Check raw mongoose connection collections
  const mongoose = require('mongoose')
  const collections = await mongoose.connection.db.listCollections().toArray()
  console.log('ALL COLLECTIONS:', collections.map((c: any) => c.name))

  const allUsers = await User.find({}).select('email _id').limit(5)
  console.log('Users in DB:', JSON.stringify(allUsers))

  const dbUser = await User.findOne({ email: session.user.email }).select('_id')
  if (!dbUser) throw new Error('User not found in database')
  userId = dbUser._id.toString()
}

    console.log('RESOLVED USER ID:', userId)

    const createdOrder = await createOrderFromCart(clientSideCart, userId)

    return {
      success: true,
      message: 'Order placed successfully',
      data: { orderId: createdOrder._id.toString() },
    }
  } catch (error) {
    console.error('CREATE ORDER ERROR:', error)
    return { success: false, message: formatError(error) }
  }
}

export const createOrderFromCart = async (
  clientSideCart: Cart,
  userId: string
) => {
  const calculatedCart = await calcDeliveryDateAndPrice({
    items: clientSideCart.items,
    ShippingAddress: clientSideCart.ShippingAddress,
    deliveryDateIndex: clientSideCart.deliveryDateIndex,
  })

  const cart = {
    ...clientSideCart,
    ...calculatedCart,
  }

  console.log('ORDER TO PARSE:', JSON.stringify({
    user: userId,
    itemsCount: cart.items?.length,
    shippingAddress: cart.ShippingAddress,
    paymentMethod: cart.paymentMethod,
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
    expectedDeliveryDate: cart.expectedDeliveryDate,
  }))

  const order = OrderInputSchema.parse({
    user: userId,
    items: cart.items,
    shippingAddress: cart.ShippingAddress,
    paymentMethod: cart.paymentMethod,
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice ?? 0,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
    expectedDeliveryDate: cart.expectedDeliveryDate,
  })

  return await Order.create(order)
}

export async function getOrderById(orderId: string): Promise<IOrder> {
  await connectToDatabase()
  const order = await Order.findById(orderId)
  if (!order) throw new Error('Order not found')
  return JSON.parse(JSON.stringify(order))
}

export async function createPayPalOrder(orderId: string) {
  await connectToDatabase()
  try {
    const order = await Order.findById(orderId)
    if (order) {
      const paypalOrder = await paypal.createOrder(order.totalPrice)
      order.paymentResult = {
        _id: paypalOrder.id,
        email_address: '',
        status: '',
        pricePaid: '0',
      }
      await order.save()
      return {
        success: true,
        message: 'PayPal order created successfully',
        data: paypalOrder.id,
      }
    } else {
      throw new Error('Order not found')
    }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  await connectToDatabase()
  try {
    const order = await Order.findById(orderId).populate('user', 'email')
    if (!order) throw new Error('Order not found')

    const captureData = await paypal.capturePayment(data.orderID)

    if (
      !captureData ||
      captureData.id !== order.paymentResult?._id ||
      captureData.status !== 'COMPLETED'
    ) {
      throw new Error('Error in paypal payment')
    }

    order.isPaid = true
    order.paidAt = new Date()
    order.paymentResult = {
      _id: captureData.id,
      status: captureData.status,
      email_address: captureData.payer.email_address,
      pricePaid:
        captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
    }

    await order.save()
    await sendPurchaseReceipt({ order })
    revalidatePath(`/account/orders/${orderId}`)

    return {
      success: true,
      message: 'Your order has been successfully paid by PayPal',
    }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

export const calcDeliveryDateAndPrice = async ({
  items,
  ShippingAddress,
  deliveryDateIndex,
}: {
  deliveryDateIndex?: number
  items: OrderItem[]
  ShippingAddress?: ShippingAddress
}) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  )

  const deliveryDate =
    AVAILABLE_DELIVERY_DATES[
      deliveryDateIndex === undefined
        ? AVAILABLE_DELIVERY_DATES.length - 1
        : deliveryDateIndex
    ]

  const shippingPrice =
    !ShippingAddress || !deliveryDate
      ? undefined
      : deliveryDate.freeShippingMinPrices > 0 &&
        itemsPrice >= deliveryDate.freeShippingMinPrices
      ? 0
      : deliveryDate.shippingPrice

  const taxPrice = !ShippingAddress ? 0 : round2(itemsPrice * 0.15)

  const totalPrice = round2(
    itemsPrice +
      (shippingPrice ? round2(shippingPrice) : 0) +
      (taxPrice ? round2(taxPrice) : 0)
  )

  return {
    AVAILABLE_DELIVERY_DATES,
    deliveryDateIndex:
      deliveryDateIndex === undefined
        ? AVAILABLE_DELIVERY_DATES.length - 1
        : deliveryDateIndex,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    expectedDeliveryDate: new Date(
      Date.now() + (deliveryDate?.daysToDeliver || 0) * 24 * 60 * 60 * 1000
    ),
  }
}