'use client'

import { useEffect, useState, use } from 'react' // Added 'use'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useStripe } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function SuccessStatus({ orderId }: { orderId: string }) {
  const stripe = useStripe()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!stripe) return

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    )

    if (!clientSecret) {
      setStatus('error')
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (paymentIntent?.status === 'succeeded') {
        setStatus('success')
      } else {
        setStatus('error')
      }
    })
  }, [stripe])

  if (status === 'loading') return <p className="text-center">Verifying payment...</p>

  return (
    <div className="space-y-4 text-center">
      <h1 className={`text-4xl font-bold ${status === 'success' ? 'text-green-600' : 'text-destructive'}`}>
        {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
      </h1>
      <p className="text-muted-foreground">Order ID: {orderId}</p>
      <Button asChild className="w-full">
        <Link href={`/account/orders/${orderId}`}>View Order Details</Link>
      </Button>
    </div>
  )
}

// FIX: params must be unwrapped using React.use()
export default function StripePaymentSuccessPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const unwrappedParams = use(params)
  const orderId = unwrappedParams.id

  return (
    <main className="max-w-2xl mx-auto py-20 px-4">
      <Elements stripe={stripePromise}>
        <SuccessStatus orderId={orderId} />
      </Elements>
    </main>
  )
}