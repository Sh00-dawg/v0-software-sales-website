import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PRODUCTS } from '@/lib/products'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Checkout from '@/components/checkout'

interface CheckoutPageProps {
  params: Promise<{ productId: string }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { productId } = await params
  const product = PRODUCTS.find((p) => p.id === productId)

  if (!product) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <Link
            href="/#products"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pricing
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Complete your purchase</h1>
            <p className="mt-2 text-muted-foreground">
              You&apos;re purchasing {product.name} for $
              {(product.priceInCents / 100).toFixed(2)}/month
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Checkout productId={productId} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
