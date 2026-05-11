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
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import StripeForm from './stripe-form'

// --- GLOBAL INITIALIZATION ---
// Initialize Stripe outside the component to prevent re-initializing on every render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)

// --- HELPER COMPONENTS ---

function PrintLoadingState() {
  const [{ isPending, isRejected }] = usePayPalScriptReducer()
  if (isPending) return <span>Loading PayPal...</span>
  if (isRejected) return <span>Error loading PayPal.</span>
  return null
}

// Moved outside to maintain a stable React identity (Fixes Stripe Context Error)
const CheckoutSummary = ({ 
  order, 
  paypalClientId, 
  clientSecret, 
  handleCreatePayPalOrder, 
  handleApprovePayPalOrder 
}: {
  order: IOrder,
  paypalClientId: string,
  clientSecret: string | null,
  handleCreatePayPalOrder: () => Promise<string>,
  handleApprovePayPalOrder: (data: { orderID: string }) => Promise<void>
}) => {
  const router = useRouter()
  const {
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
  } = order

  return (
    <Card>
      <CardContent className='p-4'>
        <div>
          <div className='text-lg font-bold'>Order Summary</div>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>Items:</span>
              <span>
                <ProductPrice price={itemsPrice} plain />
              </span>
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
              <span> Tax:</span>
              <span>
                {taxPrice === undefined ? (
                  '--'
                ) : (
                  <ProductPrice price={taxPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between pt-1 font-bold text-lg'>
              <span> Order Total:</span>
              <span>
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>

            {!isPaid && paymentMethod === 'PayPal' && (
              <div>
                <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                  <PrintLoadingState />
                  <PayPalButtons
                    createOrder={handleCreatePayPalOrder}
                    onApprove={handleApprovePayPalOrder}
                  />
                </PayPalScriptProvider>
              </div>
            )}

            {!isPaid && paymentMethod === 'Stripe' && clientSecret && (
              <Elements
                options={{ clientSecret }}
                stripe={stripePromise}
              >
                <StripeForm
                  priceInCents={Math.round(totalPrice * 100)}
                  orderId={order._id}
                />
              </Elements>
            )}

            {!isPaid && paymentMethod === 'Cash On Delivery' && (
              <Button
                className='w-full rounded-full'
                onClick={() => router.push(`/account/orders/${order._id}`)}
              >
                View Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- MAIN COMPONENT ---

export default function OrderPaymentForm({
  order,
  paypalClientId,
  clientSecret,
}: {
  order: IOrder
  paypalClientId: string
  isAdmin: boolean
  clientSecret: string | null
}) {
  const router = useRouter()
  const { toast } = useToast()

  if (order.isPaid) {
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
    if (res.success) {
      router.push(`/account/orders/${order._id}`)
    }
  }

  return (
    <main className='max-w-6xl mx-auto'>
      <div className='grid md:grid-cols-4 gap-6'>
        <div className='md:col-span-3'>
          <div className='grid md:grid-cols-3 my-3 pb-3'>
            <div className='text-lg font-bold'>Shipping Address</div>
            <div className='col-span-2'>
              <p>
                {order.shippingAddress.fullName} <br />
                {order.shippingAddress.street} <br />
                {`${order.shippingAddress.city}, ${order.shippingAddress.province}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`}
              </p>
            </div>
          </div>

          <div className='border-y'>
            <div className='grid md:grid-cols-3 my-3 pb-3'>
              <div className='text-lg font-bold'>Payment Method</div>
              <div className='col-span-2'>
                <p>{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className='grid md:grid-cols-3 my-3 pb-3'>
            <div className='text-lg font-bold'>Items and shipping</div>
            <div className='col-span-2'>
              <p>Delivery date: {formatDateTime(order.expectedDeliveryDate).dateOnly}</p>
              <ul>
                {order.items.map((item) => (
                  <li key={item.slug}>
                    {item.name} x {item.quantity} = {item.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='block md:hidden'>
            <CheckoutSummary 
              order={order}
              paypalClientId={paypalClientId}
              clientSecret={clientSecret}
              handleCreatePayPalOrder={handleCreatePayPalOrder}
              handleApprovePayPalOrder={handleApprovePayPalOrder}
            />
          </div>

          <CheckoutFooter />
        </div>

        <div className='hidden md:block'>
          <CheckoutSummary 
            order={order}
            paypalClientId={paypalClientId}
            clientSecret={clientSecret}
            handleCreatePayPalOrder={handleCreatePayPalOrder}
            handleApprovePayPalOrder={handleApprovePayPalOrder}
          />
        </div>
      </div>
    </main>
  )
}