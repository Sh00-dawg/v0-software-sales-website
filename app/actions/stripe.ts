'use server'

import { stripe } from '@/lib/stripe'
import { getProduct, useProductKey, recordCustomerPurchase, getCustomerPurchase } from '@/lib/product-store'

export async function startCheckoutSession(productId: string) {
  // Get product from database (includes price overrides)
  const product = await getProduct(productId)
  
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      productId: product.id,
    },
  })

  return { clientSecret: session.client_secret, sessionId: session.id }
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    customerEmail: session.customer_details?.email || '',
    customerName: session.customer_details?.name || '',
    productId: session.metadata?.productId || '',
    amountTotal: session.amount_total || 0,
  }
}

export async function processPurchase(sessionId: string) {
  // Get session details
  const session = await getCheckoutSession(sessionId)
  
  if (session.status !== 'complete') {
    return { success: false, error: 'Session not complete' }
  }
  
  // Check if already processed
  const existingPurchase = await getCustomerPurchase(sessionId)
  if (existingPurchase) {
    return {
      success: true,
      purchase: existingPurchase,
      alreadyProcessed: true,
    }
  }
  
  // Assign a product key if available
  const productKey = await useProductKey(session.productId, session.customerEmail)
  
  // Record the purchase
  const purchase = await recordCustomerPurchase(
    sessionId,
    session.productId,
    session.customerEmail,
    session.customerName,
    session.amountTotal,
    productKey || undefined
  )
  
  return {
    success: true,
    purchase,
    alreadyProcessed: false,
  }
}
