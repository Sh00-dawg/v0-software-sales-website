import Link from 'next/link'
import { Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Zentro Services</span>
          </div>
          <nav className="flex gap-6">
            <Link
              href="/#products"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Products
            </Link>
            <Link
              href="/reviews"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Reviews
            </Link>
            <Link
              href="/dev/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Developer
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Zentro Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
