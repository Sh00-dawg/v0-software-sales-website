import { Suspense } from 'react'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { PricingSection } from '@/components/pricing-section'
import { Footer } from '@/components/footer'

function PricingFallback() {
  return (
    <section id="products" className="scroll-mt-16 py-24">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <div className="animate-pulse">
          <div className="mx-auto h-10 w-64 rounded bg-secondary" />
          <div className="mx-auto mt-4 h-6 w-96 rounded bg-secondary" />
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Suspense fallback={<PricingFallback />}>
          <PricingSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
