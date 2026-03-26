'use server'

import { addReview, getReviews, hasReviewedSession } from '@/lib/reviews'

export async function submitReview(data: {
  sessionId: string
  productId: string
  customerName: string
  customerEmail: string
  rating: number
  title: string
  comment: string
}) {
  if (hasReviewedSession(data.sessionId)) {
    return { success: false, error: 'You have already submitted a review for this purchase.' }
  }

  const review = addReview(data)
  return { success: true, review }
}

export async function fetchReviews() {
  return getReviews()
}
