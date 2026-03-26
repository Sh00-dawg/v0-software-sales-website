'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { recordPageView } from '@/app/actions/analytics'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem('zentro_session_id')
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    sessionStorage.setItem('zentro_session_id', sessionId)
  }
  return sessionId
}

export function AnalyticsTracker() {
  const pathname = usePathname()
  const lastPathRef = useRef<string | null>(null)

  useEffect(() => {
    // Avoid duplicate tracking for the same path
    if (lastPathRef.current === pathname) return
    lastPathRef.current = pathname

    const sessionId = getSessionId()
    if (sessionId) {
      recordPageView(pathname, sessionId, navigator.userAgent)
    }
  }, [pathname])

  return null
}
