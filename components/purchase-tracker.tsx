'use client'

import { useEffect, useRef } from 'react'
import { recordPurchase } from '@/app/actions/analytics'

interface PurchaseTrackerProps {
  productId: string
  amountInCents: number
  customerEmail: string
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = sessionStorage.getItem('zentro_session_id')
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    sessionStorage.setItem('zentro_session_id', sessionId)
  }
  return sessionId
}

export function PurchaseTracker({ productId, amountInCents, customerEmail }: PurchaseTrackerProps) {
  const trackedRef = useRef(false)

  useEffect(() => {
    // Only track once per mount
    if (trackedRef.current) return
    trackedRef.current = true

    const analyticsSessionId = getSessionId()
    if (analyticsSessionId && productId && amountInCents > 0) {
      recordPurchase(productId, amountInCents, customerEmail, analyticsSessionId)
    }
  }, [productId, amountInCents, customerEmail])

  return null
}
