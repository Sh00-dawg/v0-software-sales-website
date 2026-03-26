'use client'

import { useCallback, useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { startCheckoutSession } from '@/app/actions/stripe'
import { recordCheckoutStarted, recordCheckoutAbandoned } from '@/app/actions/analytics'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = sessionStorage.getItem('zentro_session_id')
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    sessionStorage.setItem('zentro_session_id', sessionId)
  }
  return sessionId
}

export default function Checkout({ productId }: { productId: string }) {
  const router = useRouter()
  const sessionIdRef = useRef<string | null>(null)
  const checkoutCompletedRef = useRef(false)
  const [, forceUpdate] = useState(0)

  // Track checkout started and handle abandonment
  useEffect(() => {
    const analyticsSessionId = getSessionId()
    if (analyticsSessionId) {
      recordCheckoutStarted(productId, analyticsSessionId)
    }

    // Track abandonment when user leaves without completing
    const handleBeforeUnload = () => {
      if (!checkoutCompletedRef.current && analyticsSessionId) {
        recordCheckoutAbandoned(productId, analyticsSessionId)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (!checkoutCompletedRef.current && analyticsSessionId) {
        recordCheckoutAbandoned(productId, analyticsSessionId)
      }
    }
  }, [productId])

  // Memoize these functions to prevent Stripe warnings about prop changes
  const fetchClientSecret = useCallback(async () => {
    const { clientSecret, sessionId } = await startCheckoutSession(productId)
    sessionIdRef.current = sessionId
    return clientSecret
  }, [productId])

  const onComplete = useCallback(() => {
    checkoutCompletedRef.current = true
    if (sessionIdRef.current) {
      router.push(`/review?session_id=${sessionIdRef.current}`)
    }
  }, [router])

  // Memoize options object to prevent recreation
  const options = useMemo(() => ({
    fetchClientSecret,
    onComplete,
  }), [fetchClientSecret, onComplete])

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
