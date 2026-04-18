'use server'

import { createClient } from '@/lib/supabase/server'

// Types
export interface ProductKey {
  id: string
  productId: string
  key: string
  isUsed: boolean
  usedBy?: string
  usedAt?: number
  createdAt: number
}

export interface CustomerPurchase {
  id: string
  sessionId: string
  productId: string
  customerEmail: string
  productKey?: string
  purchasedAt: number
}

export interface Product {
  id: string
  name: string
  tagline: string
  description: string
  priceInCents: number
  version: string
  color: string
  icon: string
  features: string[]
  platforms: string[]
  imageUrl?: string
  filePathname?: string
}

// Get all products from Supabase
export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  // Map database fields to expected format
  return (data || []).map(p => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    priceInCents: p.price_in_cents,
    version: p.version,
    color: p.color,
    icon: p.icon,
    features: p.features || [],
    platforms: p.platforms || [],
    imageUrl: p.image_url,
    filePathname: p.file_url
  }))
}

// Get single product
export async function getProduct(id: string): Promise<Product | undefined> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !data) return undefined
  
  return {
    id: data.id,
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    priceInCents: data.price_in_cents,
    version: data.version,
    color: data.color,
    icon: data.icon,
    features: data.features || [],
    platforms: data.platforms || [],
    imageUrl: data.image_url,
    filePathname: data.file_url
  }
}

// Update product
export async function updateProduct(
  id: string,
  updates: Partial<Product> & { imageUrl?: string; filePathname?: string }
): Promise<void> {
  const supabase = await createClient()
  
  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }
  
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.priceInCents !== undefined) dbUpdates.price_in_cents = updates.priceInCents
  if (updates.version !== undefined) dbUpdates.version = updates.version
  if (updates.color !== undefined) dbUpdates.color = updates.color
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl
  if (updates.filePathname !== undefined) dbUpdates.file_url = updates.filePathname
  
  const { error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', id)
  
  if (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

// Add single product key
export async function addProductKey(productId: string, key: string): Promise<ProductKey> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_keys')
    .insert({
      product_id: productId,
      key_value: key,
      is_used: false
    })
    .select()
    .single()
  
  if (error) throw error
  
  return {
    id: data.id,
    productId: data.product_id,
    key: data.key_value,
    isUsed: data.is_used,
    usedBy: data.used_by,
    usedAt: data.used_at ? new Date(data.used_at).getTime() : undefined,
    createdAt: new Date(data.created_at).getTime()
  }
}

// Add multiple product keys
export async function addProductKeys(productId: string, keys: string[]): Promise<ProductKey[]> {
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
  
  if (error) throw error
  
  return (data || []).map(k => ({
    id: k.id,
    productId: k.product_id,
    key: k.key_value,
    isUsed: k.is_used,
    usedBy: k.used_by,
    usedAt: k.used_at ? new Date(k.used_at).getTime() : undefined,
    createdAt: new Date(k.created_at).getTime()
  }))
}

// Get available keys for a product
export async function getAvailableKeys(productId: string): Promise<ProductKey[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_keys')
    .select('*')
    .eq('product_id', productId)
    .eq('is_used', false)
  
  if (error) return []
  
  return (data || []).map(k => ({
    id: k.id,
    productId: k.product_id,
    key: k.key_value,
    isUsed: k.is_used,
    usedBy: k.used_by,
    usedAt: k.used_at ? new Date(k.used_at).getTime() : undefined,
    createdAt: new Date(k.created_at).getTime()
  }))
}

// Get all keys for a product
export async function getAllKeys(productId: string): Promise<ProductKey[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_keys')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  
  if (error) return []
  
  return (data || []).map(k => ({
    id: k.id,
    productId: k.product_id,
    key: k.key_value,
    isUsed: k.is_used,
    usedBy: k.used_by,
    usedAt: k.used_at ? new Date(k.used_at).getTime() : undefined,
    createdAt: new Date(k.created_at).getTime()
  }))
}

// Get all keys
export async function getAllProductKeys(): Promise<ProductKey[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('product_keys')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return []
  
  return (data || []).map(k => ({
    id: k.id,
    productId: k.product_id,
    key: k.key_value,
    isUsed: k.is_used,
    usedBy: k.used_by,
    usedAt: k.used_at ? new Date(k.used_at).getTime() : undefined,
    createdAt: new Date(k.created_at).getTime()
  }))
}

// Use a key for a customer
export async function useProductKey(productId: string, customerEmail: string): Promise<string | null> {
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
    return null
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
    console.error('Error marking key as used:', updateError)
    return null
  }
  
  return availableKey.key_value
}

// Delete a key
export async function deleteProductKey(keyId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('product_keys')
    .delete()
    .eq('id', keyId)
  
  if (error) throw error
}

// Record a customer purchase
export async function recordCustomerPurchase(
  sessionId: string,
  productId: string,
  customerEmail: string,
  productKey?: string
): Promise<CustomerPurchase> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customer_purchases')
    .insert({
      session_id: sessionId,
      product_id: productId,
      customer_email: customerEmail,
      product_key: productKey || null
    })
    .select()
    .single()
  
  if (error) throw error
  
  return {
    id: data.id,
    sessionId: data.session_id,
    productId: data.product_id,
    customerEmail: data.customer_email,
    productKey: data.product_key,
    purchasedAt: new Date(data.created_at).getTime()
  }
}

// Get customer purchase by session
export async function getCustomerPurchase(sessionId: string): Promise<CustomerPurchase | undefined> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customer_purchases')
    .select('*')
    .eq('session_id', sessionId)
    .single()
  
  if (error || !data) return undefined
  
  return {
    id: data.id,
    sessionId: data.session_id,
    productId: data.product_id,
    customerEmail: data.customer_email,
    productKey: data.product_key,
    purchasedAt: new Date(data.created_at).getTime()
  }
}

// Get all customer purchases
export async function getAllCustomerPurchases(): Promise<CustomerPurchase[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customer_purchases')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return []
  
  return (data || []).map(p => ({
    id: p.id,
    sessionId: p.session_id,
    productId: p.product_id,
    customerEmail: p.customer_email,
    productKey: p.product_key,
    purchasedAt: new Date(p.created_at).getTime()
  }))
}

// Check if customer has purchased a product
export async function hasCustomerPurchased(sessionId: string): Promise<boolean> {
  const purchase = await getCustomerPurchase(sessionId)
  return !!purchase
}

// Payment methods
export async function getPaymentMethods() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) return []
  return data || []
}

export async function updatePaymentMethod(id: string, enabled: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('payment_methods')
    .update({ enabled })
    .eq('id', id)
  
  return { success: !error }
}
