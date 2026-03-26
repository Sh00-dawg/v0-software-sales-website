'use server'

import {
  trackPageView,
  trackPurchase,
  trackAbandonedCheckout,
  getAnalyticsData,
  getStats,
} from '@/lib/analytics'
import { getProductById } from '@/lib/products'

export async function recordPageView(page: string, sessionId: string, userAgent?: string) {
  trackPageView(page, sessionId, userAgent)
  return { success: true }
}

export async function recordCheckoutStarted(productId: string, sessionId: string) {
  const product = getProductById(productId)
  if (product) {
    trackAbandonedCheckout(productId, product.name, sessionId, 'started')
  }
  return { success: true }
}

export async function recordCheckoutAbandoned(productId: string, sessionId: string) {
  const product = getProductById(productId)
  if (product) {
    trackAbandonedCheckout(productId, product.name, sessionId, 'abandoned')
  }
  return { success: true }
}

export async function recordPurchase(
  productId: string,
  amountInCents: number,
  customerEmail: string,
  sessionId: string
) {
  const product = getProductById(productId)
  if (product) {
    trackPurchase(productId, product.name, amountInCents / 100, customerEmail, sessionId)
  }
  return { success: true }
}

export async function fetchAnalyticsData() {
  return getAnalyticsData()
}

export async function fetchStats() {
  return getStats()
}
