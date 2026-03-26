// In-memory analytics store (in production, use a database)
export interface PageView {
  id: string
  page: string
  timestamp: Date
  sessionId: string
  userAgent?: string
}

export interface Purchase {
  id: string
  productId: string
  productName: string
  amount: number
  customerEmail: string
  timestamp: Date
  sessionId: string
}

export interface AbandonedCheckout {
  id: string
  productId: string
  productName: string
  timestamp: Date
  sessionId: string
  stage: 'viewed' | 'started' | 'abandoned'
}

export interface AnalyticsData {
  pageViews: PageView[]
  purchases: Purchase[]
  abandonedCheckouts: AbandonedCheckout[]
  totalRevenue: number
  todayRevenue: number
  todayViews: number
  conversionRate: number
}

// In-memory storage
const pageViews: PageView[] = []
const purchases: Purchase[] = []
const abandonedCheckouts: AbandonedCheckout[] = []

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Track page view
export function trackPageView(page: string, sessionId: string, userAgent?: string): void {
  pageViews.push({
    id: generateId(),
    page,
    timestamp: new Date(),
    sessionId,
    userAgent,
  })
}

// Track purchase
export function trackPurchase(
  productId: string,
  productName: string,
  amount: number,
  customerEmail: string,
  sessionId: string
): void {
  purchases.push({
    id: generateId(),
    productId,
    productName,
    amount,
    customerEmail,
    timestamp: new Date(),
    sessionId,
  })
  
  // Remove from abandoned if exists
  const abandonedIndex = abandonedCheckouts.findIndex(
    (a) => a.sessionId === sessionId && a.productId === productId
  )
  if (abandonedIndex > -1) {
    abandonedCheckouts.splice(abandonedIndex, 1)
  }
}

// Track abandoned checkout
export function trackAbandonedCheckout(
  productId: string,
  productName: string,
  sessionId: string,
  stage: 'viewed' | 'started' | 'abandoned'
): void {
  const existing = abandonedCheckouts.find(
    (a) => a.sessionId === sessionId && a.productId === productId
  )
  
  if (existing) {
    existing.stage = stage
    existing.timestamp = new Date()
  } else {
    abandonedCheckouts.push({
      id: generateId(),
      productId,
      productName,
      timestamp: new Date(),
      sessionId,
      stage,
    })
  }
}

// Get analytics data
export function getAnalyticsData(): AnalyticsData {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const todayViews = pageViews.filter(
    (pv) => new Date(pv.timestamp) >= todayStart
  ).length
  
  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0)
  
  const todayPurchases = purchases.filter(
    (p) => new Date(p.timestamp) >= todayStart
  )
  const todayRevenue = todayPurchases.reduce((sum, p) => sum + p.amount, 0)
  
  const totalCheckoutStarts = abandonedCheckouts.filter(
    (a) => a.stage === 'started' || a.stage === 'abandoned'
  ).length + purchases.length
  
  const conversionRate = totalCheckoutStarts > 0
    ? (purchases.length / totalCheckoutStarts) * 100
    : 0
  
  return {
    pageViews: [...pageViews].reverse().slice(0, 100),
    purchases: [...purchases].reverse().slice(0, 100),
    abandonedCheckouts: abandonedCheckouts.filter((a) => a.stage === 'abandoned').reverse().slice(0, 100),
    totalRevenue,
    todayRevenue,
    todayViews,
    conversionRate,
  }
}

// Get summary stats
export function getStats() {
  const data = getAnalyticsData()
  
  return {
    totalPageViews: pageViews.length,
    todayPageViews: data.todayViews,
    totalPurchases: purchases.length,
    totalRevenue: data.totalRevenue,
    todayRevenue: data.todayRevenue,
    abandonedCarts: abandonedCheckouts.filter((a) => a.stage === 'abandoned').length,
    conversionRate: data.conversionRate.toFixed(1),
  }
}
