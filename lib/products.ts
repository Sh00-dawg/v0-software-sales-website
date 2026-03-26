export interface Product {
  id: string
  name: string
  tagline: string
  description: string
  priceInCents: number
  features: string[]
  icon: string
  color: string
  version: string
  platform: string[]
  popular?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: 'zentro-code',
    name: 'Zentro Code',
    tagline: 'Professional IDE',
    description: 'A powerful code editor with AI-assisted development, syntax highlighting for 50+ languages, and built-in Git integration.',
    priceInCents: 4900,
    version: '3.2.1',
    platform: ['Windows', 'macOS', 'Linux'],
    icon: 'code',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'AI code completion',
      'Multi-language support',
      'Git integration',
      'Extensions marketplace',
      'Live collaboration',
      'Lifetime license',
    ],
  },
  {
    id: 'zentro-design',
    name: 'Zentro Design',
    tagline: 'UI/UX Design Suite',
    description: 'Create stunning interfaces with vector tools, prototyping, and design systems. Export to any format.',
    priceInCents: 7900,
    version: '2.8.0',
    platform: ['Windows', 'macOS'],
    icon: 'palette',
    color: 'from-pink-500 to-rose-500',
    features: [
      'Vector editing tools',
      'Prototyping & animations',
      'Design system support',
      'Auto-layout',
      'Developer handoff',
      'Unlimited exports',
      'Plugin support',
    ],
    popular: true,
  },
  {
    id: 'zentro-analytics',
    name: 'Zentro Analytics',
    tagline: 'Business Intelligence',
    description: 'Transform your data into actionable insights with powerful dashboards, reports, and real-time tracking.',
    priceInCents: 9900,
    version: '4.1.0',
    platform: ['Web', 'Windows', 'macOS'],
    icon: 'chart',
    color: 'from-emerald-500 to-teal-500',
    features: [
      'Real-time dashboards',
      'Custom reports',
      'Data visualization',
      'API integrations',
      'Team collaboration',
      'Export to PDF/Excel',
      'White-label option',
      'Priority support',
    ],
  },
  {
    id: 'zentro-secure',
    name: 'Zentro Secure',
    tagline: 'Security Suite',
    description: 'Enterprise-grade security with password management, VPN, and encrypted file storage all in one.',
    priceInCents: 5900,
    version: '1.5.2',
    platform: ['Windows', 'macOS', 'iOS', 'Android'],
    icon: 'shield',
    color: 'from-amber-500 to-orange-500',
    features: [
      'Password manager',
      'Secure VPN',
      'Encrypted storage',
      'Two-factor auth',
      'Cross-device sync',
      'Dark web monitoring',
    ],
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id)
}
