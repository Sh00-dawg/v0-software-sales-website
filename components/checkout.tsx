'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { startCheckoutSession } from '@/app/actions/stripe'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function Checkout({ productId }: { productId: string }) {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)

  const startCheckoutSessionForProduct = useCallback(async () => {
    const { clientSecret, sessionId } = await startCheckoutSession(productId)
    setSessionId(sessionId)
    return clientSecret
  }, [productId])

  const handleComplete = useCallback(() => {
    if (sessionId) {
      router.push(`/review?session_id=${sessionId}`)
    }
  }, [router, sessionId])

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          fetchClientSecret: startCheckoutSessionForProduct,
          onComplete: handleComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
