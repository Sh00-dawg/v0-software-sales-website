'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { submitReview } from '@/app/actions/reviews'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  sessionId: string
  productId: string
  customerName: string
  customerEmail: string
}

export function ReviewForm({
  sessionId,
  productId,
  customerName,
  customerEmail,
}: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    if (!title.trim()) {
      setError('Please enter a review title')
      return
    }
    if (!comment.trim()) {
      setError('Please enter your review')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await submitReview({
      sessionId,
      productId,
      customerName,
      customerEmail,
      rating,
      title: title.trim(),
      comment: comment.trim(),
    })

    if (result.success) {
      router.push('/reviews?submitted=true')
    } else {
      setError(result.error || 'Failed to submit review')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  (hoveredRating || rating) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium">
          Review Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="comment" className="mb-2 block text-sm font-medium">
          Your Review
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience with our software..."
          rows={5}
          maxLength={1000}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
}
