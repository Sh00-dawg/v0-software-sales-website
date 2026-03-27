'use server'

import { PRODUCTS, type Product } from './products'

// In-memory store for product modifications (in production, use a database)
let productOverrides: Map<string, Partial<Product> & { imageUrl?: string; filePathname?: string }> = new Map()

// Product keys store
export interface ProductKey {
  id: string
  productId: string
  key: string
  isUsed: boolean
  usedBy?: string
  usedAt?: number
  createdAt: number
}

let productKeys: ProductKey[] = []

// Customer purchases with keys
export interface CustomerPurchase {
  id: string
  sessionId: string
  productId: string
  customerEmail: string
  productKey?: string
  purchasedAt: number
}

let customerPurchases: CustomerPurchase[] = []

// Get all products with overrides applied
export async function getProducts(): Promise<(Product & { imageUrl?: string; filePathname?: string })[]> {
  return PRODUCTS.map((product) => {
    const override = productOverrides.get(product.id)
    if (override) {
      return { ...product, ...override }
    }
    return product
  })
}

// Get single product with overrides
export async function getProduct(id: string): Promise<(Product & { imageUrl?: string; filePathname?: string }) | undefined> {
  const product = PRODUCTS.find((p) => p.id === id)
  if (!product) return undefined

  const override = productOverrides.get(id)
  if (override) {
    return { ...product, ...override }
  }
  return product
}

// Update product
export async function updateProduct(
  id: string,
  updates: Partial<Product> & { imageUrl?: string; filePathname?: string }
): Promise<void> {
  const existing = productOverrides.get(id) || {}
  productOverrides.set(id, { ...existing, ...updates })
}

// Add product key
export async function addProductKey(productId: string, key: string): Promise<ProductKey> {
  const newKey: ProductKey = {
    id: `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productId,
    key,
    isUsed: false,
    createdAt: Date.now(),
  }
  productKeys.push(newKey)
  return newKey
}

// Add multiple product keys
export async function addProductKeys(productId: string, keys: string[]): Promise<ProductKey[]> {
  const newKeys = keys.map((key) => ({
    id: `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productId,
    key,
    isUsed: false,
    createdAt: Date.now(),
  }))
  productKeys.push(...newKeys)
  return newKeys
}

// Get available keys for a product
export async function getAvailableKeys(productId: string): Promise<ProductKey[]> {
  return productKeys.filter((k) => k.productId === productId && !k.isUsed)
}

// Get all keys for a product
export async function getAllKeys(productId: string): Promise<ProductKey[]> {
  return productKeys.filter((k) => k.productId === productId)
}

// Get all keys
export async function getAllProductKeys(): Promise<ProductKey[]> {
  return productKeys
}

// Use a key for a customer
export async function useProductKey(productId: string, customerEmail: string): Promise<string | null> {
  const availableKey = productKeys.find((k) => k.productId === productId && !k.isUsed)
  if (!availableKey) return null

  availableKey.isUsed = true
  availableKey.usedBy = customerEmail
  availableKey.usedAt = Date.now()

  return availableKey.key
}

// Delete a key
export async function deleteProductKey(keyId: string): Promise<void> {
  productKeys = productKeys.filter((k) => k.id !== keyId)
}

// Record a customer purchase
export async function recordCustomerPurchase(
  sessionId: string,
  productId: string,
  customerEmail: string,
  productKey?: string
): Promise<CustomerPurchase> {
  const purchase: CustomerPurchase = {
    id: `purchase-${Date.now()}`,
    sessionId,
    productId,
    customerEmail,
    productKey,
    purchasedAt: Date.now(),
  }
  customerPurchases.push(purchase)
  return purchase
}

// Get customer purchase by session
export async function getCustomerPurchase(sessionId: string): Promise<CustomerPurchase | undefined> {
  return customerPurchases.find((p) => p.sessionId === sessionId)
}

// Get all customer purchases
export async function getAllCustomerPurchases(): Promise<CustomerPurchase[]> {
  return customerPurchases
}

// Check if customer has purchased a product
export async function hasCustomerPurchased(sessionId: string): Promise<boolean> {
  return customerPurchases.some((p) => p.sessionId === sessionId)
}
