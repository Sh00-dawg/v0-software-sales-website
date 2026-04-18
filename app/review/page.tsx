import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowLeft, Key, Download } from 'lucide-react'

import { getCheckoutSession } from '@/app/actions/stripe'
import { recordPurchase } from '@/app/actions/analytics'
import { createCustomerPurchase, fetchProduct } from '@/app/actions/products'
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

  // Get product details including file pathname
  const product = await fetchProduct(session.productId)
  
  // Create customer purchase and get product key
  const purchase = await createCustomerPurchase(
    session_id,
    session.productId,
    session.customerEmail
  )

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

          {/* Success Message */}
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
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

          {/* Product Key */}
          {purchase.productKey && (
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <Key className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">Your Product Key</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Save this key - you&apos;ll need it to activate your software
                  </p>
                  <div className="mt-3 rounded-lg bg-background p-3">
                    <code className="select-all font-mono text-lg font-bold tracking-wider text-primary">
                      {purchase.productKey}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Download Link */}
          {product?.filePathname && (
            <div className="mb-6 rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Download className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">Download Your Software</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click below to download {product.name}
                  </p>
                  <a
                    href={`/api/file?pathname=${encodeURIComponent(product.filePathname)}`}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    download
                  >
                    <Download className="h-4 w-4" />
                    Download {product.name}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Review Form */}
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
