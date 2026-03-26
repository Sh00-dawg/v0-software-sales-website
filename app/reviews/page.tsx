import Link from 'next/link'
import { ArrowLeft, Star, CheckCircle2 } from 'lucide-react'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { fetchReviews } from '@/app/actions/reviews'
import { PRODUCTS } from '@/lib/products'

interface ReviewsPageProps {
  searchParams: Promise<{ submitted?: string }>
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const { submitted } = await searchParams
  const reviews = await fetchReviews()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Customer Reviews</h1>
            <p className="mt-2 text-muted-foreground">
              See what our customers are saying about DevFlow
            </p>
          </div>

          {submitted === 'true' && (
            <div className="mb-8 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-green-700 dark:text-green-300">
                Thank you! Your review has been submitted successfully.
              </p>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-lg text-muted-foreground">
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => {
                const product = PRODUCTS.find((p) => p.id === review.productId)
                return (
                  <div
                    key={review.id}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {review.customerName || 'Anonymous'}
                          </span>
                          {product && (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                              {product.name}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <time className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <h3 className="mb-2 font-medium">{review.title}</h3>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
