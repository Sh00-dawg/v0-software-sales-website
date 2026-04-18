'use server'

import { createClient } from '@/lib/supabase/server'

// Admin Actions
export async function getAdmins() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching admins:', error)
    return []
  }
  return data || []
}

export async function loginAdmin(username: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single()
  
  if (error || !data) {
    return { success: false, error: 'Invalid credentials' }
  }
  
  // Update last login
  await supabase
    .from('admins')
    .update({ last_login: new Date().toISOString() })
    .eq('id', data.id)
  
  return { success: true, admin: data }
}

export async function createAdmin(username: string, password: string, role: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('admins')
    .insert({ username, password, role })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true, admin: data }
}

export async function deleteAdmin(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('admins')
    .delete()
    .eq('id', id)
  
  return { success: !error, error: error?.message }
}

// Product Actions
export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data || []
}

export async function getProduct(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function updateProduct(id: string, updates: {
  name?: string
  tagline?: string
  description?: string
  price_in_cents?: number
  version?: string
  image_url?: string
  file_url?: string
  color?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true, product: data }
}

export async function createProduct(product: {
  name: string
  tagline: string
  description: string
  price_in_cents: number
  version: string
  color: string
  icon: string
  features: string[]
  platforms: string[]
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true, product: data }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  return { success: !error, error: error?.message }
}

// Product Keys Actions
export async function getProductKeys(productId?: string) {
  const supabase = await createClient()
  let query = supabase.from('product_keys').select('*').order('created_at', { ascending: false })
  
  if (productId) {
    query = query.eq('product_id', productId)
  }
  
  const { data, error } = await query
  if (error) {
    console.error('Error fetching keys:', error)
    return []
  }
  return data || []
}

export async function addProductKeys(productId: string, keys: string[]) {
  const supabase = await createClient()
  const keysToInsert = keys.map(key => ({
    product_id: productId,
    key_value: key,
    is_used: false
  }))
  
  const { data, error } = await supabase
    .from('product_keys')
    .insert(keysToInsert)
    .select()
  
  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true, keys: data }
}

export async function deleteProductKey(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('product_keys')
    .delete()
    .eq('id', id)
  
  return { success: !error, error: error?.message }
}

export async function assignKeyToCustomer(productId: string, customerEmail: string) {
  const supabase = await createClient()
  
  // Find an unused key
  const { data: availableKey, error: findError } = await supabase
    .from('product_keys')
    .select('*')
    .eq('product_id', productId)
    .eq('is_used', false)
    .limit(1)
    .single()
  
  if (findError || !availableKey) {
    return { success: false, error: 'No available keys' }
  }
  
  // Mark as used
  const { error: updateError } = await supabase
    .from('product_keys')
    .update({
      is_used: true,
      used_by: customerEmail,
      used_at: new Date().toISOString()
    })
    .eq('id', availableKey.id)
  
  if (updateError) {
    return { success: false, error: updateError.message }
  }
  
  return { success: true, key: availableKey.key_value }
}

// Purchases Actions
export async function getPurchases() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching purchases:', error)
    return []
  }
  return data || []
}

export async function recordPurchaseDb(purchase: {
  product_id: string
  customer_email: string
  amount_in_cents: number
  payment_method: string
  product_key?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('purchases')
    .insert(purchase)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true, purchase: data }
}

// Analytics Actions
export async function getAnalytics() {
  const supabase = await createClient()
  
  const [
    { data: pageViews },
    { data: purchases },
    { data: abandonedCarts }
  ] = await Promise.all([
    supabase.from('page_views').select('*').order('created_at', { ascending: false }),
    supabase.from('purchases').select('*'),
    supabase.from('abandoned_carts').select('*').order('created_at', { ascending: false })
  ])
  
  const today = new Date().toISOString().split('T')[0]
  const todayViews = pageViews?.filter(v => v.created_at?.startsWith(today)) || []
  const todayPurchases = purchases?.filter(p => p.created_at?.startsWith(today)) || []
  
  const totalRevenue = purchases?.reduce((sum, p) => sum + (p.amount_in_cents || 0), 0) || 0
  const todayRevenue = todayPurchases.reduce((sum, p) => sum + (p.amount_in_cents || 0), 0)
  
  return {
    totalViews: pageViews?.length || 0,
    todayViews: todayViews.length,
    totalPurchases: purchases?.length || 0,
    todayPurchases: todayPurchases.length,
    totalRevenue,
    todayRevenue,
    abandonedCarts: abandonedCarts?.length || 0,
    recentViews: pageViews?.slice(0, 10) || [],
    recentPurchases: purchases?.slice(0, 10) || [],
    recentAbandoned: abandonedCarts?.slice(0, 10) || []
  }
}

export async function recordPageView(page: string) {
  const supabase = await createClient()
  await supabase.from('page_views').insert({ page })
}

export async function recordAbandonedCart(productId: string, sessionId: string) {
  const supabase = await createClient()
  await supabase.from('abandoned_carts').insert({ product_id: productId, session_id: sessionId })
}

// Payment Methods
export async function getPaymentMethods() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) return []
  return data || []
}

export async function updatePaymentMethod(id: string, enabled: boolean, config?: object) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('payment_methods')
    .update({ enabled, config: config || {} })
    .eq('id', id)
  
  return { success: !error }
}
