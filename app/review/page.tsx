import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowLeft } from 'lucide-react'

import { getCheckoutSession } from '@/app/actions/stripe'
import { recordPurchase } from '@/app/actions/analytics'
import { PRODUCTS } from '@/lib/products'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ReviewForm } from '@/components/review-form'
import { PurchaseTracker } from '@/components/purchase-tracker'

interface ReviewPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const { session_id } = await searchParams

  if (!session_id) {
    redirect('/')
  }

  const session = await getCheckoutSession(session_id)

  if (session.status !== 'complete') {
    redirect('/')
  }

  const product = PRODUCTS.find((p) => p.id === session.productId)

  return (
    <div className="flex min-h-screen flex-col">
      <PurchaseTracker 
        productId={session.productId}
        amountInCents={product?.priceInCents || 0}
        customerEmail={session.customerEmail}
      />
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-4">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-8 w-8 shrink-0 text-green-600 dark:text-green-400" />
              <div>
                <h1 className="text-xl font-semibold text-green-900 dark:text-green-100">
                  Thank you for your purchase!
                </h1>
                <p className="mt-1 text-green-700 dark:text-green-300">
                  {product
                    ? `You've successfully purchased ${product.name}.`
                    : 'Your payment was successful.'}
                </p>
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  A confirmation email has been sent to {session.customerEmail}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-2 text-xl font-semibold">
              Share your experience
            </h2>
            <p className="mb-6 text-muted-foreground">
              We&apos;d love to hear your feedback! Your review helps other
              customers make informed decisions.
            </p>

            <ReviewForm
              sessionId={session_id}
              productId={session.productId}
              customerName={session.customerName}
              customerEmail={session.customerEmail}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
