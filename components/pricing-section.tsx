import { fetchProducts } from '@/app/actions/products'
import { PricingClient } from './pricing-client'

export async function PricingSection() {
  const products = await fetchProducts()
  return <PricingClient products={products} />
}
