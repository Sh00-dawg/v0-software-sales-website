export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  popular?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals and small projects getting started.',
    priceInCents: 2900,
    features: [
      'Single user license',
      '5 projects',
      'Basic analytics',
      'Email support',
      '1 GB storage',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Best for growing teams and businesses with advanced needs.',
    priceInCents: 7900,
    features: [
      'Up to 10 users',
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      '50 GB storage',
      'API access',
      'Custom integrations',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations requiring maximum power and control.',
    priceInCents: 19900,
    features: [
      'Unlimited users',
      'Unlimited projects',
      'Enterprise analytics',
      'Dedicated support',
      'Unlimited storage',
      'Full API access',
      'Custom integrations',
      'SSO & SAML',
      'SLA guarantee',
    ],
  },
]
