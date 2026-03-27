'use client'

import Link from 'next/link'
import { Code2, Palette, BarChart3, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/products'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code2,
  palette: Palette,
  chart: BarChart3,
  shield: Shield,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

type ProductWithOverrides = Product & { imageUrl?: string; filePathname?: string }

export function Pricing({ products }: { products: ProductWithOverrides[] }) {
  return (
    <section id="products" className="scroll-mt-16 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Our Software Products
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Professional tools designed to boost your productivity
          </p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {products.map((product) => {
            const IconComponent = icons[product.icon] || Code2
            return (
              <motion.div
                key={product.id}
                variants={cardVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-2xl border bg-card',
                  product.popular
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : 'border-border'
                )}
              >
                {product.popular && (
                  <div className="absolute right-3 top-3 z-10 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    Popular
                  </div>
                )}

                <div className={cn(
                  'relative flex h-40 items-center justify-center bg-gradient-to-br',
                  product.color
                )}>
                  <div className="absolute inset-0 bg-black/10" />
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
                  >
                    <IconComponent className="h-10 w-10 text-white" />
                  </motion.div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {product.tagline}
                    </p>
                    <h3 className="mt-1 text-lg font-bold">{product.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      v{product.version}
                    </p>
                  </div>

                  <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-1">
                    {product.platform.map((p) => (
                      <span
                        key={p}
                        className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  <ul className="mb-4 space-y-1.5">
                    {product.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-primary" />
                        {feature}
                      </li>
                    ))}
                    {product.features.length > 3 && (
                      <li className="text-xs text-muted-foreground/70">
                        +{product.features.length - 3} more features
                      </li>
                    )}
                  </ul>

                  <div className="mt-auto border-t border-border pt-4">
                    <div className="mb-3 flex items-baseline justify-between">
                      <span className="text-2xl font-bold">
                        ${(product.priceInCents / 100).toFixed(0)}
                      </span>
                      <span className="text-xs text-muted-foreground">one-time</span>
                    </div>
                    <Button
                      asChild
                      variant={product.popular ? 'default' : 'outline'}
                      className="w-full transition-all group-hover:shadow-md"
                      size="sm"
                    >
                      <Link href={`/checkout/${product.id}`}>Buy Now</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
