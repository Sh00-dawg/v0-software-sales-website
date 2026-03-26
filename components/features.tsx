import { Zap, Shield, BarChart3, Users, Cloud, RefreshCw } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Optimized performance that keeps your team moving at full speed.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-level encryption and security protocols to protect your data.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Deep insights into your development workflow and team productivity.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Real-time collaboration tools that keep everyone in sync.',
  },
  {
    icon: Cloud,
    title: 'Cloud Native',
    description:
      'Deploy anywhere with our flexible cloud infrastructure.',
  },
  {
    icon: RefreshCw,
    title: 'Continuous Updates',
    description:
      'Regular updates and new features delivered automatically.',
  },
]

export function Features() {
  return (
    <section className="border-t border-border bg-secondary/30 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to ship faster
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed for modern development teams.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
