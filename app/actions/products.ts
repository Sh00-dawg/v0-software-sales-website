'use server'

import {
  getProducts,
  getProduct,
  updateProduct,
  addProductKey,
  addProductKeys,
  getAllKeys,
  getAllProductKeys,
  deleteProductKey,
  useProductKey,
  recordCustomerPurchase,
  getCustomerPurchase,
  getAllCustomerPurchases,
  type ProductKey,
  type CustomerPurchase,
  type DBProduct,
} from '@/lib/product-store'
import type { Product } from '@/lib/products'

export async function fetchProducts(): Promise<DBProduct[]> {
  return getProducts()
}

export async function fetchProduct(id: string): Promise<DBProduct | undefined> {
  return getProduct(id)
}

export async function saveProduct(
  id: string,
  updates: Partial<Product> & { imageUrl?: string; filePathname?: string }
) {
  await updateProduct(id, updates)
  return { success: true }
}

export async function createProductKey(productId: string, key: string) {
  return addProductKey(productId, key)
}

export async function createProductKeys(productId: string, keys: string[]) {
  return addProductKeys(productId, keys)
}

export async function fetchProductKeys(productId: string) {
  return getAllKeys(productId)
}

export async function fetchAllProductKeys() {
  return getAllProductKeys()
}

export async function removeProductKey(keyId: string) {
  await deleteProductKey(keyId)
  return { success: true }
}

export async function assignKeyToCustomer(productId: string, customerEmail: string) {
  return useProductKey(productId, customerEmail)
}

export async function createCustomerPurchase(
  sessionId: string,
  productId: string,
  customerEmail: string,
  customerName?: string,
  amountInCents?: number
) {
  // First, try to assign a key
  const key = await useProductKey(productId, customerEmail)
  
  // Record the purchase
  return recordCustomerPurchase(sessionId, productId, customerEmail, customerName, amountInCents, key || undefined)
}

export async function fetchCustomerPurchase(sessionId: string) {
  return getCustomerPurchase(sessionId)
}

export async function fetchAllCustomerPurchases() {
  return getAllCustomerPurchases()
}
