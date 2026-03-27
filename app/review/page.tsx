import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowLeft, Download, Key, Package } from 'lucide-react'

import { getCheckoutSession, processPurchase } from '@/app/actions/stripe'
import { fetchProduct } from '@/app/actions/products'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ReviewForm } from '@/components/review-form'
import { PurchaseTracker } from '@/components/purchase-tracker'
import { DownloadButton } from '@/components/download-button'

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

  // Process the purchase (assigns key, records in DB)
  const purchaseResult = await processPurchase(session_id)
  const product = await fetchProduct(session.productId)

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

          {/* Product Access Section */}
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className={`rounded-lg bg-gradient-to-br ${product?.color || 'from-blue-500 to-cyan-500'} p-2`}>
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{product?.name || 'Your Product'}</h2>
                <p className="text-sm text-muted-foreground">Version {product?.version || '1.0.0'}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Product Key */}
              {purchaseResult.success && purchaseResult.purchase?.productKey && (
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Key className="h-4 w-4 text-primary" />
                    Your License Key
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-background px-3 py-2 font-mono text-sm">
                      {purchaseResult.purchase.productKey}
                    </code>
                    <button
                      onClick={() => {
                        if (typeof navigator !== 'undefined') {
                          navigator.clipboard.writeText(purchaseResult.purchase!.productKey!)
                        }
                      }}
                      className="rounded bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Save this key in a safe place. You will need it to activate your product.
                  </p>
                </div>
              )}

              {/* Download Section */}
              {product?.filePathname && (
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Download className="h-4 w-4 text-primary" />
                    Download Your Product
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Click below to download {product.name}. Your download link is available for 24 hours.
                  </p>
                  <DownloadButton 
                    pathname={product.filePathname} 
                    productName={product.name}
                  />
                </div>
              )}

              {/* No download available */}
              {!product?.filePathname && (
                <div className="rounded-lg border border-dashed border-border bg-secondary/10 p-4 text-center">
                  <Download className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Download will be available once the product file is uploaded by the admin.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Review Section */}
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
