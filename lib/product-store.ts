'use server'

import { promises as fs } from 'fs'
import path from 'path'
import { PRODUCTS, type Product } from './products'

export interface ProductOverride extends Partial<Product> {
  imageUrl?: string
  filePathname?: string
}

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

interface StoreData {
  productOverrides: Record<string, ProductOverride>
  productKeys: ProductKey[]
  customerPurchases: CustomerPurchase[]
}

const STORE_PATH = path.join(process.cwd(), 'data', 'product-store.json')

const defaultStore: StoreData = {
  productOverrides: {},
  productKeys: [],
  customerPurchases: [],
}

async function ensureStoreFile() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })

  try {
    await fs.access(STORE_PATH)
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(defaultStore, null, 2), 'utf8')
  }
}

async function readStore(): Promise<StoreData> {
  await ensureStoreFile()

  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8')
    const parsed = JSON.parse(raw) as Partial<StoreData>

    return {
      productOverrides: parsed.productOverrides ?? {},
      productKeys: parsed.productKeys ?? [],
      customerPurchases: parsed.customerPurchases ?? [],
    }
  } catch {
    return defaultStore
  }
}

async function writeStore(data: StoreData): Promise<void> {
  await ensureStoreFile()
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), 'utf8')
}

export async function getProducts(): Promise<(Product & { imageUrl?: string; filePathname?: string })[]> {
  const store = await readStore()

  return PRODUCTS.map((product) => ({
    ...product,
    ...(store.productOverrides[product.id] ?? {}),
  }))
}

export async function getProduct(
  id: string
): Promise<(Product & { imageUrl?: string; filePathname?: string }) | undefined> {
  const product = PRODUCTS.find((p) => p.id === id)
  if (!product) return undefined

  const store = await readStore()
  return {
    ...product,
    ...(store.productOverrides[id] ?? {}),
  }
}

export async function updateProduct(id: string, updates: ProductOverride): Promise<void> {
  const store = await readStore()
  const existing = store.productOverrides[id] ?? {}
  store.productOverrides[id] = { ...existing, ...updates }
  await writeStore(store)
}

export async function addProductKey(productId: string, key: string): Promise<ProductKey> {
  const store = await readStore()
  const newKey: ProductKey = {
    id: `key-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    productId,
    key,
    isUsed: false,
    createdAt: Date.now(),
  }

  store.productKeys.push(newKey)
  await writeStore(store)
  return newKey
}

export async function addProductKeys(productId: string, keys: string[]): Promise<ProductKey[]> {
  const store = await readStore()
  const timestamp = Date.now()
  const newKeys: ProductKey[] = keys.map((key, index) => ({
    id: `key-${timestamp}-${index}-${Math.random().toString(36).slice(2, 11)}`,
    productId,
    key,
    isUsed: false,
    createdAt: timestamp,
  }))

  store.productKeys.push(...newKeys)
  await writeStore(store)
  return newKeys
}

export async function getAvailableKeys(productId: string): Promise<ProductKey[]> {
  const store = await readStore()
  return store.productKeys.filter((k) => k.productId === productId && !k.isUsed)
}

export async function getAllKeys(productId: string): Promise<ProductKey[]> {
  const store = await readStore()
  return store.productKeys.filter((k) => k.productId === productId)
}

export async function getAllProductKeys(): Promise<ProductKey[]> {
  const store = await readStore()
  return store.productKeys
}

export async function useProductKey(productId: string, customerEmail: string): Promise<string | null> {
  const store = await readStore()
  const availableKey = store.productKeys.find((k) => k.productId === productId && !k.isUsed)
  if (!availableKey) return null

  availableKey.isUsed = true
  availableKey.usedBy = customerEmail
  availableKey.usedAt = Date.now()
  await writeStore(store)

  return availableKey.key
}

export async function deleteProductKey(keyId: string): Promise<void> {
  const store = await readStore()
  store.productKeys = store.productKeys.filter((k) => k.id !== keyId)
  await writeStore(store)
}

export async function recordCustomerPurchase(
  sessionId: string,
  productId: string,
  customerEmail: string,
  productKey?: string
): Promise<CustomerPurchase> {
  const store = await readStore()
  const purchase: CustomerPurchase = {
    id: `purchase-${Date.now()}`,
    sessionId,
    productId,
    customerEmail,
    productKey,
    purchasedAt: Date.now(),
  }

  store.customerPurchases.push(purchase)
  await writeStore(store)
  return purchase
}

export async function getCustomerPurchase(sessionId: string): Promise<CustomerPurchase | undefined> {
  const store = await readStore()
  return store.customerPurchases.find((p) => p.sessionId === sessionId)
}

export async function getAllCustomerPurchases(): Promise<CustomerPurchase[]> {
  const store = await readStore()
  return store.customerPurchases
}

export async function hasCustomerPurchased(sessionId: string): Promise<boolean> {
  const store = await readStore()
  return store.customerPurchases.some((p) => p.sessionId === sessionId)
}
