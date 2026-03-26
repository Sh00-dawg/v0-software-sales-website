'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Eye,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertTriangle,
  LogOut,
  Zap,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchAnalyticsData, fetchStats } from '@/app/actions/analytics'
import type { AnalyticsData } from '@/lib/analytics'

interface Stats {
  totalPageViews: number
  todayPageViews: number
  totalPurchases: number
  totalRevenue: number
  todayRevenue: number
  abandonedCarts: number
  conversionRate: string
}

export default function DevDashboardPage() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('dev_auth')
    if (auth !== 'true') {
      router.push('/dev/login')
    } else {
      setIsAuthed(true)
      loadData()
    }
  }, [router])

  const loadData = async () => {
    setRefreshing(true)
    const [statsData, analyticsData] = await Promise.all([
      fetchStats(),
      fetchAnalyticsData(),
    ])
    setStats(statsData)
    setAnalytics(analyticsData)
    setLoading(false)
    setRefreshing(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('dev_auth')
    router.push('/dev/login')
  }

  if (!isAuthed || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Page Views',
      value: stats?.totalPageViews || 0,
      subValue: `${stats?.todayPageViews || 0} today`,
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toFixed(2)}`,
      subValue: `$${(stats?.todayRevenue || 0).toFixed(2)} today`,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Total Purchases',
      value: stats?.totalPurchases || 0,
      subValue: `${stats?.conversionRate || 0}% conversion`,
      icon: ShoppingCart,
      color: 'from-pink-500 to-rose-500',
    },
    {
      label: 'Abandoned Carts',
      value: stats?.abandonedCarts || 0,
      subValue: 'Potential revenue lost',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Zentro Services</h1>
              <p className="text-xs text-muted-foreground">Developer Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.subValue}</p>
                </div>
                <div className={`rounded-lg bg-gradient-to-br ${stat.color} p-2`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recent Purchases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-border bg-card"
          >
            <div className="border-b border-border p-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <Users className="h-4 w-4 text-primary" />
                Recent Purchases
              </h2>
            </div>
            <div className="max-h-80 overflow-auto p-4">
              {analytics?.purchases && analytics.purchases.length > 0 ? (
                <div className="space-y-3">
                  {analytics.purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                    >
                      <div>
                        <p className="font-medium">{purchase.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {purchase.customerEmail}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-500">
                          ${purchase.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(purchase.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                  <ShoppingCart className="mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">No purchases yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Abandoned Checkouts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-border bg-card"
          >
            <div className="border-b border-border p-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Abandoned Checkouts
              </h2>
            </div>
            <div className="max-h-80 overflow-auto p-4">
              {analytics?.abandonedCheckouts && analytics.abandonedCheckouts.length > 0 ? (
                <div className="space-y-3">
                  {analytics.abandonedCheckouts.map((abandoned) => (
                    <div
                      key={abandoned.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                    >
                      <div>
                        <p className="font-medium">{abandoned.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Session: {abandoned.sessionId.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-500">
                          {abandoned.stage}
                        </span>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(abandoned.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
                  <TrendingUp className="mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">No abandoned checkouts</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Page Views */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-border bg-card lg:col-span-2"
          >
            <div className="border-b border-border p-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <Eye className="h-4 w-4 text-blue-500" />
                Recent Page Views
              </h2>
            </div>
            <div className="max-h-60 overflow-auto p-4">
              {analytics?.pageViews && analytics.pageViews.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {analytics.pageViews.slice(0, 15).map((view) => (
                    <div
                      key={view.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 p-2 text-sm"
                    >
                      <span className="truncate font-mono text-xs">{view.page}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {new Date(view.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-20 items-center justify-center text-muted-foreground">
                  <p className="text-sm">No page views recorded yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
