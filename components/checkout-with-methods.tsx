'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'
import { CreditCard, Wallet, Bitcoin, Apple, DollarSign, Loader2, Check, AlertCircle } from 'lucide-react'
import { createCheckoutSession } from '@/app/actions/stripe'

interface PaymentMethod {
  id: string
  name: string
  icon: string
  enabled: boolean
}

interface CheckoutWithMethodsProps {
  productId: string
  productName: string
  priceInCents: number
  paymentMethods: PaymentMethod[]
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  Wallet,
  Bitcoin,
  Apple,
  DollarSign
}

export function CheckoutWithMethods({ 
  productId, 
  productName,
  priceInCents,
  paymentMethods 
}: CheckoutWithMethodsProps) {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<string>(
    paymentMethods.find(m => m.id === 'stripe')?.id || paymentMethods[0]?.id || 'stripe'
  )
  const [showCheckout, setShowCheckout] = useState(false)
  const [cryptoAddress, setCryptoAddress] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  // For tracking checkout completion
  const hasCompletedRef = useRef(false)
  const sessionIdRef = useRef<string | null>(null)

  const handleComplete = useCallback(() => {
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true
    
    if (sessionIdRef.current) {
      router.push(`/review?session_id=${sessionIdRef.current}`)
    }
  }, [router])

  const fetchClientSecret = useCallback(async () => {
    const result = await createCheckoutSession(productId)
    if ('error' in result) {
      throw new Error(result.error)
    }
    sessionIdRef.current = result.sessionId
    return result.clientSecret
  }, [productId])

  const options = useMemo(() => ({
    fetchClientSecret,
    onComplete: handleComplete,
  }), [fetchClientSecret, handleComplete])

  const handleStripeCheckout = () => {
    setShowCheckout(true)
  }

  const handleOtherPayment = async () => {
    setProcessing(true)
    setError('')
    
    // Simulate processing for other payment methods
    // In production, you would integrate with actual payment APIs
    setTimeout(() => {
      setProcessing(false)
      setError(`${selectedMethod} payment integration is not yet configured. Please use Stripe (Credit/Debit Card) or contact support.`)
    }, 1500)
  }

  const getMethodIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || CreditCard
    return IconComponent
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Payment Methods Available</h3>
        <p className="text-muted-foreground">
          Please contact support or try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paymentMethods.map((method) => {
            const Icon = getMethodIcon(method.icon)
            return (
              <button
                key={method.id}
                onClick={() => {
                  setSelectedMethod(method.id)
                  setShowCheckout(false)
                  setError('')
                }}
                className={`flex items-center gap-3 rounded-lg border p-4 transition-all ${
                  selectedMethod === method.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  selectedMethod === method.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{method.name}</p>
                  {selectedMethod === method.id && (
                    <p className="text-xs text-primary">Selected</p>
                  )}
                </div>
                {selectedMethod === method.id && (
                  <Check className="ml-auto h-5 w-5 text-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        <div className="flex items-center justify-between py-3 border-b border-border">
          <span className="text-muted-foreground">{productName}</span>
          <span className="font-semibold">${(priceInCents / 100).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-bold">${(priceInCents / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Form */}
      <AnimatePresence mode="wait">
        {selectedMethod === 'stripe' ? (
          <motion.div
            key="stripe"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            {!showCheckout ? (
              <div className="p-6">
                <button
                  onClick={handleStripeCheckout}
                  className="w-full rounded-lg bg-primary py-4 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Pay with Card
                </button>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Secure payment powered by Stripe
                </p>
              </div>
            ) : (
              <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </motion.div>
        ) : selectedMethod === 'crypto' ? (
          <motion.div
            key="crypto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-4">Pay with Cryptocurrency</h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground mb-2">Send exactly:</p>
                <p className="text-2xl font-bold font-mono">${(priceInCents / 100).toFixed(2)} USDT</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground mb-2">To wallet address:</p>
                <p className="font-mono text-sm break-all">
                  {cryptoAddress || 'Configure wallet address in admin panel'}
                </p>
              </div>
              <button
                onClick={handleOtherPayment}
                disabled={processing}
                className="w-full rounded-lg bg-primary py-4 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying Payment...
                  </>
                ) : (
                  <>
                    <Bitcoin className="h-5 w-5" />
                    I&apos;ve Sent the Payment
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="other"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="font-semibold mb-4">
              Pay with {paymentMethods.find(m => m.id === selectedMethod)?.name}
            </h3>
            <button
              onClick={handleOtherPayment}
              disabled={processing}
              className="w-full rounded-lg bg-primary py-4 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Payment
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-500">Payment Method Not Available</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-4 text-muted-foreground">
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-500" />
          <span>Secure Checkout</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-500" />
          <span>Instant Delivery</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-500" />
          <span>30-Day Guarantee</span>
        </div>
      </div>
    </div>
  )
}
