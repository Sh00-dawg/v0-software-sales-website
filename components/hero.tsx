'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary via-background to-background" />
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground"
          >
            <Sparkles className="h-4 w-4" />
            <span>Professional software solutions</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
          >
            Premium software from
            <span className="mt-2 block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Zentro Services
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl"
          >
            Powerful software solutions designed to boost your productivity.
            Get started instantly with our suite of professional tools.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Button asChild size="lg" className="gap-2 transition-transform hover:scale-105">
              <Link href="#products">
                View Pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="transition-transform hover:scale-105">
              <Link href="/reviews">Read Reviews</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
