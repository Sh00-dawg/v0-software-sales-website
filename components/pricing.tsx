import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRODUCTS } from '@/lib/products'
import { cn } from '@/lib/utils'

export function Pricing() {
  return (
    <section id="products" className="scroll-mt-16 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card p-8',
                product.popular
                  ? 'border-primary shadow-xl shadow-primary/10'
                  : 'border-border'
              )}
            >
              {product.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {product.description}
                </p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${(product.priceInCents / 100).toFixed(0)}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={product.popular ? 'default' : 'outline'}
                className="w-full"
              >
                <Link href={`/checkout/${product.id}`}>Get Started</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
