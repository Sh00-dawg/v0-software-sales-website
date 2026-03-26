import Link from 'next/link'
import { Zap } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Zentro Services</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/#products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/reviews"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Reviews
          </Link>
        </nav>
      </div>
    </header>
  )
}
