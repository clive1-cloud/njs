'use client'

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  approvePayPalOrder,
  createPayPalOrder,
} from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/db/models/order.models'
import { formatDateTime } from '@/lib/utils'
import CheckoutFooter from '../checkout-footer'
import { redirect, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ProductPrice from '@/components/shared/product/product-price'

// FIX 1: Moved PrintLoadingState outside the main component so it doesn't
// get recreated on every render
function PrintLoadingState() {
  const [{ isPending, isRejected }] = usePayPalScriptReducer()
  if (isPending) return <span>Loading PayPal...</span>
  if (isRejected) return <span>Error loading PayPal.</span>
  return null
}

export default function OrderPaymentForm({
  order,
  paypalClientId,
}: {
  order: IOrder
  paypalClientId: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()

  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    expectedDeliveryDate,
    isPaid,
  } = order

  if (isPaid) {
    redirect(`/account/orders/${order._id}`)
  }

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order._id)
    if (!res.success) {
      toast({ description: res.message, variant: 'destructive' })
      throw new Error(res.message)
    }
    return res.data as string
  }

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order._id, data)
    
    toast({
      description: res.message,
      variant: res.success ? 'default' : 'destructive',
    })

    // --- ADD THIS BLOCK ---
    if (res.success) {
      router.push(`/account/orders/${order._id}`)
    }
    // ----------------------

    
  }
  // FIX 2: PayPal rendered ONCE here at the top level, outside CheckoutSummary
  // This prevents double-mounting (mobile + desktop) which caused the flicker
 const PayPalSection = () => (
  <>
    {!isPaid && paymentMethod === 'PayPal' && (
      <PayPalScriptProvider options={{ 
        clientId: paypalClientId,
        currency: 'USD'  // ← add this
      }}>
        <PrintLoadingState />
        <PayPalButtons
          createOrder={handleCreatePayPalOrder}
          onApprove={handleApprovePayPalOrder}
        />
      </PayPalScriptProvider>
    )}
    {!isPaid && paymentMethod === 'Cash On Delivery' && (
      <Button
        className='w-full rounded-full'
        onClick={() => router.push(`/account/orders/${order._id}`)}
      >
        View Order
      </Button>
    )}
  </>
)
  // FIX 3: CheckoutSummary no longer contains PayPal — just the price summary
  const CheckoutSummary = () => (
    <Card>
      <CardContent className='p-4'>
        <div className='text-lg font-bold'>Order Summary</div>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span>Items:</span>
            <span><ProductPrice price={itemsPrice} plain /></span>
          </div>
          <div className='flex justify-between'>
            <span>Shipping & Handling:</span>
            <span>
              {shippingPrice === undefined ? (
                '--'
              ) : shippingPrice === 0 ? (
                'FREE'
              ) : (
                <ProductPrice price={shippingPrice} plain />
              )}
            </span>
          </div>
          <div className='flex justify-between'>
            <span>Tax:</span>
            <span>
              {taxPrice === undefined ? (
                '--'
              ) : (
                <ProductPrice price={taxPrice} plain />
              )}
            </span>
          </div>
          <div className='flex justify-between pt-1 font-bold text-lg'>
            <span>Order Total:</span>
            <span><ProductPrice price={totalPrice} plain /></span>
          </div>
          {/* FIX 4: PayPal only shown on desktop sidebar */}
          <div className='hidden md:block'>
            <PayPalSection />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <main className='max-w-6xl mx-auto'>
      <div className='grid md:grid-cols-4 gap-6'>
        <div className='md:col-span-3'>
          {/* Shipping Address */}
          <div className='grid md:grid-cols-3 my-3 pb-3'>
            <div className='text-lg font-bold'>Shipping Address</div>
            <div className='col-span-2'>
              <p>
                {shippingAddress.fullName} <br />
                {shippingAddress.street} <br />
                {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className='border-y'>
            <div className='grid md:grid-cols-3 my-3 pb-3'>
              <div className='text-lg font-bold'>Payment Method</div>
              <div className='col-span-2'>
                <p>{paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Items and Shipping */}
          <div className='grid md:grid-cols-3 my-3 pb-3'>
            <div className='text-lg font-bold'>Items and shipping</div>
            <div className='col-span-2'>
              <p>Delivery date: {formatDateTime(expectedDeliveryDate).dateOnly}</p>
              <ul>
                {items.map((item) => (
                  <li key={item.slug}>
                    {item.name} x {item.quantity} = {item.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FIX 5: Mobile — show summary + PayPal once here only */}
          <div className='block md:hidden'>
            <CheckoutSummary />
            <div className='mt-4'>
              <PayPalSection />
            </div>
          </div>

          <CheckoutFooter />
        </div>

        {/* Desktop sidebar */}
        <div className='hidden md:block'>
          <CheckoutSummary />
        </div>
      </div>
    </main>
  )
}
