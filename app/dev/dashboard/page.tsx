'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Eye,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  LogOut,
  Zap,
  RefreshCw,
  Package,
  Key,
  Upload,
  Trash2,
  Plus,
  Save,
  X,
  FileDown,
  Edit3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchAnalyticsData, fetchStats } from '@/app/actions/analytics'
import {
  fetchProducts,
  saveProduct,
  createProductKeys,
  fetchAllProductKeys,
  removeProductKey,
} from '@/app/actions/products'
import type { AnalyticsData } from '@/lib/analytics'
import type { Product } from '@/lib/products'
import type { ProductKey, DBProduct } from '@/lib/product-store'

interface Stats {
  totalPageViews: number
  todayPageViews: number
  totalPurchases: number
  totalRevenue: number
  todayRevenue: number
  abandonedCarts: number
  conversionRate: string
}

type Tab = 'overview' | 'products' | 'keys'

export default function DevDashboardPage() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [products, setProducts] = useState<DBProduct[]>([])
  const [productKeys, setProductKeys] = useState<ProductKey[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Product> & { imageUrl?: string }>({})
  const [newKeys, setNewKeys] = useState<{ [productId: string]: string }>({})
  const [uploading, setUploading] = useState<{ [productId: string]: boolean }>({})
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const loadData = useCallback(async () => {
    setRefreshing(true)
    const [statsData, analyticsData, productsData, keysData] = await Promise.all([
      fetchStats(),
      fetchAnalyticsData(),
      fetchProducts(),
      fetchAllProductKeys(),
    ])
    setStats(statsData)
    setAnalytics(analyticsData)
    setProducts(productsData)
    setProductKeys(keysData)
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    const auth = sessionStorage.getItem('dev_auth')
    if (auth !== 'true') {
      router.push('/dev/login')
    } else {
      setIsAuthed(true)
      loadData()
    }
  }, [router, loadData])

  const handleLogout = () => {
    sessionStorage.removeItem('dev_auth')
    router.push('/dev/login')
  }

  const startEditing = (product: Product & { imageUrl?: string }) => {
    setEditingProduct(product.id)
    setEditForm({
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      priceInCents: product.priceInCents,
      version: product.version,
      imageUrl: product.imageUrl,
    })
  }

  const cancelEditing = () => {
    setEditingProduct(null)
    setEditForm({})
  }

  const handleSaveProduct = async (productId: string) => {
    setSaving(true)
    await saveProduct(productId, editForm)
    await loadData()
    setEditingProduct(null)
    setEditForm({})
    setSaving(false)
  }

  const handleFileUpload = async (productId: string, file: File, type: 'image' | 'product-file') => {
    setUploading((prev) => ({ ...prev, [productId]: true }))
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('productId', productId)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      
      if (type === 'image') {
        await saveProduct(productId, { imageUrl: data.pathname })
      } else {
        await saveProduct(productId, { filePathname: data.pathname })
      }
      
      await loadData()
    } catch (error) {
      console.error('Upload failed:', error)
    }
    
    setUploading((prev) => ({ ...prev, [productId]: false }))
  }

  const handleAddKeys = async (productId: string) => {
    const keysText = newKeys[productId]
    if (!keysText) return
    
    const keys = keysText.split('\n').map((k) => k.trim()).filter(Boolean)
    if (keys.length === 0) return
    
    await createProductKeys(productId, keys)
    setNewKeys((prev) => ({ ...prev, [productId]: '' }))
    await loadData()
  }

  const handleDeleteKey = async (keyId: string) => {
    await removeProductKey(keyId)
    await loadData()
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

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: TrendingUp },
    { id: 'products' as Tab, label: 'Products', icon: Package },
    { id: 'keys' as Tab, label: 'Product Keys', icon: Key },
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

      {/* Tabs */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-7xl gap-1 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
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
                    <ShoppingCart className="h-4 w-4 text-primary" />
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
            </div>
          </>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Product Management</h2>
            <div className="grid gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  {editingProduct === product.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Editing: {product.name}</h3>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveProduct(product.id)}
                            disabled={saving}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium">Name</label>
                          <Input
                            value={editForm.name || ''}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">Tagline</label>
                          <Input
                            value={editForm.tagline || ''}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, tagline: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">Price (in cents)</label>
                          <Input
                            type="number"
                            value={editForm.priceInCents || 0}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, priceInCents: parseInt(e.target.value) }))}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">Version</label>
                          <Input
                            value={editForm.version || ''}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, version: e.target.value }))}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-sm font-medium">Description</label>
                          <textarea
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            rows={3}
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex flex-col gap-6 md:flex-row">
                      <div className="flex-1">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.tagline}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => startEditing(product)}>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                        
                        <p className="mb-4 text-sm text-muted-foreground">{product.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="font-medium">
                            Price: <span className="text-primary">${(product.priceInCents / 100).toFixed(0)}</span>
                          </span>
                          <span className="text-muted-foreground">Version: {product.version}</span>
                          <span className="text-muted-foreground">
                            Keys Available: {productKeys.filter((k) => k.productId === product.id && !k.isUsed).length}
                          </span>
                        </div>
                      </div>
                      
                      {/* File Uploads */}
                      <div className="flex flex-col gap-3 md:w-64">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Product Image
                          </label>
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 px-3 py-2 text-xs hover:bg-secondary/50">
                                <Upload className="mr-2 h-3 w-3" />
                                {uploading[`${product.id}-image`] ? 'Uploading...' : product.imageUrl ? 'Replace' : 'Upload Image'}
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleFileUpload(product.id, file, 'image')
                                }}
                              />
                            </label>
                            {product.imageUrl && (
                              <span className="text-xs text-emerald-500">Uploaded</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Product File (Download)
                          </label>
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 px-3 py-2 text-xs hover:bg-secondary/50">
                                <FileDown className="mr-2 h-3 w-3" />
                                {uploading[`${product.id}-file`] ? 'Uploading...' : product.filePathname ? 'Replace File' : 'Upload File'}
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleFileUpload(product.id, file, 'product-file')
                                }}
                              />
                            </label>
                            {product.filePathname && (
                              <span className="text-xs text-emerald-500">Ready</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Keys Tab */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Product Keys Management</h2>
            
            {products.map((product) => {
              const keys = productKeys.filter((k) => k.productId === product.id)
              const availableKeys = keys.filter((k) => !k.isUsed)
              const usedKeys = keys.filter((k) => k.isUsed)
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card"
                >
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {availableKeys.length} available / {usedKeys.length} used
                      </p>
                    </div>
                    <div className={`rounded-lg bg-gradient-to-br ${product.color} px-3 py-1 text-sm font-medium text-white`}>
                      {keys.length} Total Keys
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {/* Add Keys */}
                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-medium">
                        Add Product Keys (one per line)
                      </label>
                      <div className="flex gap-2">
                        <textarea
                          className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
                          rows={3}
                          placeholder="XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY&#10;ZZZZZ-ZZZZZ-ZZZZZ"
                          value={newKeys[product.id] || ''}
                          onChange={(e) => setNewKeys((prev) => ({ ...prev, [product.id]: e.target.value }))}
                        />
                        <Button 
                          onClick={() => handleAddKeys(product.id)}
                          disabled={!newKeys[product.id]}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Keys
                        </Button>
                      </div>
                    </div>
                    
                    {/* Keys List */}
                    {keys.length > 0 && (
                      <div className="space-y-4">
                        {/* Available Keys */}
                        {availableKeys.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-medium text-emerald-500">
                              Available Keys ({availableKeys.length})
                            </h4>
                            <div className="max-h-40 space-y-1 overflow-auto">
                              {availableKeys.map((key) => (
                                <div
                                  key={key.id}
                                  className="flex items-center justify-between rounded bg-emerald-500/10 px-3 py-2"
                                >
                                  <code className="font-mono text-sm">{key.key}</code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteKey(key.id)}
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Used Keys */}
                        {usedKeys.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                              Used Keys ({usedKeys.length})
                            </h4>
                            <div className="max-h-40 space-y-1 overflow-auto">
                              {usedKeys.map((key) => (
                                <div
                                  key={key.id}
                                  className="flex items-center justify-between rounded bg-secondary/50 px-3 py-2"
                                >
                                  <div>
                                    <code className="font-mono text-sm text-muted-foreground">{key.key}</code>
                                    <p className="text-xs text-muted-foreground">
                                      Used by: {key.usedBy}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {key.usedAt && new Date(key.usedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {keys.length === 0 && (
                      <div className="flex h-20 items-center justify-center text-muted-foreground">
                        <p className="text-sm">No keys added yet. Add keys above.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
