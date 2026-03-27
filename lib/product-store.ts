'use server'

import { createClient } from '@/lib/supabase/server'
import { PRODUCTS, type Product } from './products'

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
  customerName?: string
  productKey?: string
  amountInCents: number
  purchasedAt: number
}

export interface DBProduct extends Product {
  imageUrl?: string
  filePathname?: string
}

// Get all products - merges base products with DB overrides
export async function getProducts(): Promise<DBProduct[]> {
  const supabase = await createClient()
  
  const { data: dbProducts } = await supabase
    .from('products')
    .select('*')
  
  // Merge DB products with defaults
  return PRODUCTS.map((baseProduct) => {
    const dbProduct = dbProducts?.find((p) => p.id === baseProduct.id)
    if (dbProduct) {
      return {
        ...baseProduct,
        name: dbProduct.name || baseProduct.name,
        tagline: dbProduct.tagline || baseProduct.tagline,
        description: dbProduct.description || baseProduct.description,
        priceInCents: dbProduct.price_in_cents ?? baseProduct.priceInCents,
        features: dbProduct.features || baseProduct.features,
        icon: dbProduct.icon || baseProduct.icon,
        color: dbProduct.color || baseProduct.color,
        version: dbProduct.version || baseProduct.version,
        platform: dbProduct.platform || baseProduct.platform,
        popular: dbProduct.popular ?? baseProduct.popular,
        imageUrl: dbProduct.image_url || undefined,
        filePathname: dbProduct.file_pathname || undefined,
      }
    }
    return baseProduct
  })
}

// Get single product
export async function getProduct(id: string): Promise<DBProduct | undefined> {
  const products = await getProducts()
  return products.find((p) => p.id === id)
}

// Update product in database
export async function updateProduct(
  id: string,
  updates: Partial<Product> & { imageUrl?: string; filePathname?: string }
): Promise<void> {
  const supabase = await createClient()
  const baseProduct = PRODUCTS.find((p) => p.id === id)
  
  if (!baseProduct) return
  
  // Check if product exists in DB
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .single()
  
  const dbData = {
    name: updates.name,
    tagline: updates.tagline,
    description: updates.description,
    price_in_cents: updates.priceInCents,
    features: updates.features,
    icon: updates.icon,
    color: updates.color,
    version: updates.version,
    platform: updates.platform,
    popular: updates.popular,
    image_url: updates.imageUrl,
    file_pathname: updates.filePathname,
    updated_at: new Date().toISOString(),
  }
  
  // Remove undefined values
  const cleanData = Object.fromEntries(
    Object.entries(dbData).filter(([_, v]) => v !== undefined)
  )
  
  if (existing) {
    await supabase.from('products').update(cleanData).eq('id', id)
  } else {
    // Insert new product with all required fields from base product
    await supabase.from('products').insert({
      id,
      name: updates.name || baseProduct.name,
      tagline: updates.tagline || baseProduct.tagline,
      description: updates.description || baseProduct.description,
      price_in_cents: updates.priceInCents ?? baseProduct.priceInCents,
      features: updates.features || baseProduct.features,
      icon: updates.icon || baseProduct.icon,
      color: updates.color || baseProduct.color,
      version: updates.version || baseProduct.version,
      platform: updates.platform || baseProduct.platform,
      popular: updates.popular ?? baseProduct.popular,
      image_url: updates.imageUrl,
      file_pathname: updates.filePathname,
    })
  }
}

// Add product key
export async function addProductKey(productId: string, key: string): Promise<ProductKey> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('product_keys')
    .insert({
      product_id: productId,
      key,
      is_used: false,
    })
    .select()
    .single()
  
  if (error) throw error
  
  return {
    id: data.id,
    productId: data.product_id,
    key: data.key,
    isUsed: data.is_used,
    usedBy: data.used_by || undefined,
    usedAt: data.used_at ? new Date(data.used_at).getTime() : undefined,
    createdAt: new Date(data.created_at).getTime(),
  }
}

// Add multiple product keys
export async function addProductKeys(productId: string, keys: string[]): Promise<ProductKey[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('product_keys')
    .insert(keys.map((key) => ({
      product_id: productId,
      key,
      is_used: false,
    })))
    .select()
  
  if (error) throw error
  
  return (data || []).map((k) => ({
    id: k.id,
    productId: k.product_id,
    key: k.key,
    isUsed: k.is_used,
    usedBy: k.used_by || undefined,
    usedAt: k.used_at ? new Date(k.used_at).getTime() : undefined,
    createdAt: new Date(k.created_at).getTime(),
  }))
}

// Get available keys for a product
export async function getAvailableKeys(productId: string): Promise<ProductKey[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('product_keys')
    .select('*')
    .eq('product_id', productId)
    .eq('is_used', false)
  
  return (data || []).map((k) => ({
    id: k.id,
    productId: k.product_id,
    key: k.key,
    isUsed: k.is_used,
    usedBy: k.used_by || undefined,
    usedAt: k.used_at ? new Date(k.used_at).getTime() : undefined,
    createdAt: new Date(k.created_at).getTime(),
  }))
}

// Get all keys for a product
export async function getAllKeys(productId: string): Promise<ProductKey[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('product_keys')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  
  return (data || []).map((k) => ({
    id: k.id,
    productId: k.product_id,
    key: k.key,
    isUsed: k.is_used,
    usedBy: k.used_by || undefined,
    usedAt: k.used_at ? new Date(k.used_at).getTime() : undefined,
    createdAt: new Date(k.created_at).getTime(),
  }))
}

// Get all keys
export async function getAllProductKeys(): Promise<ProductKey[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('product_keys')
    .select('*')
    .order('created_at', { ascending: false })
  
  return (data || []).map((k) => ({
    id: k.id,
    productId: k.product_id,
    key: k.key,
    isUsed: k.is_used,
    usedBy: k.used_by || undefined,
    usedAt: k.used_at ? new Date(k.used_at).getTime() : undefined,
    createdAt: new Date(k.created_at).getTime(),
  }))
}

// Use a key for a customer
export async function useProductKey(productId: string, customerEmail: string): Promise<string | null> {
  const supabase = await createClient()
  
  // Find available key
  const { data: availableKey } = await supabase
    .from('product_keys')
    .select('*')
    .eq('product_id', productId)
    .eq('is_used', false)
    .limit(1)
    .single()
  
  if (!availableKey) return null
  
  // Mark as used
  await supabase
    .from('product_keys')
    .update({
      is_used: true,
      used_by: customerEmail,
      used_at: new Date().toISOString(),
    })
    .eq('id', availableKey.id)
  
  return availableKey.key
}

// Delete a key
export async function deleteProductKey(keyId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('product_keys').delete().eq('id', keyId)
}

// Record a customer purchase
export async function recordCustomerPurchase(
  sessionId: string,
  productId: string,
  customerEmail: string,
  customerName?: string,
  amountInCents?: number,
  productKey?: string
): Promise<CustomerPurchase> {
  const supabase = await createClient()
  
  // Check if already recorded
  const { data: existing } = await supabase
    .from('customer_purchases')
    .select('*')
    .eq('session_id', sessionId)
    .single()
  
  if (existing) {
    return {
      id: existing.id,
      sessionId: existing.session_id,
      productId: existing.product_id,
      customerEmail: existing.customer_email,
      customerName: existing.customer_name || undefined,
      productKey: existing.product_key || undefined,
      amountInCents: existing.amount_in_cents,
      purchasedAt: new Date(existing.purchased_at).getTime(),
    }
  }
  
  const { data, error } = await supabase
    .from('customer_purchases')
    .insert({
      session_id: sessionId,
      product_id: productId,
      customer_email: customerEmail,
      customer_name: customerName,
      product_key: productKey,
      amount_in_cents: amountInCents || 0,
    })
    .select()
    .single()
  
  if (error) throw error
  
  return {
    id: data.id,
    sessionId: data.session_id,
    productId: data.product_id,
    customerEmail: data.customer_email,
    customerName: data.customer_name || undefined,
    productKey: data.product_key || undefined,
    amountInCents: data.amount_in_cents,
    purchasedAt: new Date(data.purchased_at).getTime(),
  }
}

// Get customer purchase by session
export async function getCustomerPurchase(sessionId: string): Promise<CustomerPurchase | undefined> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('customer_purchases')
    .select('*')
    .eq('session_id', sessionId)
    .single()
  
  if (!data) return undefined
  
  return {
    id: data.id,
    sessionId: data.session_id,
    productId: data.product_id,
    customerEmail: data.customer_email,
    customerName: data.customer_name || undefined,
    productKey: data.product_key || undefined,
    amountInCents: data.amount_in_cents,
    purchasedAt: new Date(data.purchased_at).getTime(),
  }
}

// Get all customer purchases
export async function getAllCustomerPurchases(): Promise<CustomerPurchase[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('customer_purchases')
    .select('*')
    .order('purchased_at', { ascending: false })
  
  return (data || []).map((p) => ({
    id: p.id,
    sessionId: p.session_id,
    productId: p.product_id,
    customerEmail: p.customer_email,
    customerName: p.customer_name || undefined,
    productKey: p.product_key || undefined,
    amountInCents: p.amount_in_cents,
    purchasedAt: new Date(p.purchased_at).getTime(),
  }))
}

// Check if customer has purchased a product
export async function hasCustomerPurchased(sessionId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('customer_purchases')
    .select('id')
    .eq('session_id', sessionId)
    .single()
  
  return !!data
}
