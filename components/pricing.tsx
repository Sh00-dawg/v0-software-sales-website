'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRODUCTS } from '@/lib/products'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

export function Pricing() {
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
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid gap-8 lg:grid-cols-3"
        >
          {PRODUCTS.map((product) => (
            <motion.div
              key={product.id}
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card p-8',
                product.popular
                  ? 'border-primary shadow-xl shadow-primary/10'
                  : 'border-border'
              )}
            >
              {product.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground"
                >
                  Most Popular
                </motion.div>
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
                {product.features.map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </motion.li>
                ))}
              </ul>
              <Button
                asChild
                variant={product.popular ? 'default' : 'outline'}
                className="w-full transition-transform hover:scale-105"
              >
                <Link href={`/checkout/${product.id}`}>Get Started</Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
