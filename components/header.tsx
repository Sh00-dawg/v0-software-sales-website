'use client'

import Link from 'next/link'
import { Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <motion.div
            whileHover={{ rotate: 15 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary"
          >
            <Zap className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <span className="text-xl font-semibold tracking-tight">Zentro Services</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/#products"
            className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="relative">
              Pricing
              <motion.span
                className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary"
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.2 }}
              />
            </span>
          </Link>
          <Link
            href="/reviews"
            className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="relative">
              Reviews
              <motion.span
                className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary"
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.2 }}
              />
            </span>
          </Link>
        </nav>
      </div>
    </motion.header>
  )
}
