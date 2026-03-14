import { OrderItem, ShippingAddress } from "@/types"
import { round2 } from '../utils'
import { AVAILABLE_DELIVERY_DATES } from "../constant"
import { FREE_SHIPPING_MIN_PRICE } from "../constant"

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
      : deliveryDate. freeShippingMinPrices > 0 &&
          itemsPrice >= deliveryDate. freeShippingMinPrices
        ? 0
        : deliveryDate.shippingPrice

  const taxPrice = !ShippingAddress ? undefined : round2(itemsPrice * 0.15)
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
  }
}