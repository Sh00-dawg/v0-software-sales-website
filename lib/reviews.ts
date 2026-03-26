export interface Review {
  id: string
  sessionId: string
  productId: string
  customerName: string
  customerEmail: string
  rating: number
  title: string
  comment: string
  createdAt: string
}

// In-memory store for reviews (in production, use a database)
const reviews: Review[] = []

export function addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
  const newReview: Review = {
    ...review,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  reviews.push(newReview)
  return newReview
}

export function getReviews(): Review[] {
  return [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getReviewsByProductId(productId: string): Review[] {
  return reviews
    .filter((r) => r.productId === productId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

export function hasReviewedSession(sessionId: string): boolean {
  return reviews.some((r) => r.sessionId === sessionId)
}
