-- Seed initial products (only if they don't exist)
INSERT INTO products (id, name, tagline, description, price_in_cents, features, icon, color, version, platform, popular)
VALUES 
  (
    'zentro-code',
    'Zentro Code',
    'Professional IDE',
    'A powerful code editor with AI-assisted development, syntax highlighting for 50+ languages, and built-in Git integration.',
    4900,
    ARRAY['AI code completion', 'Multi-language support', 'Git integration', 'Extensions marketplace', 'Live collaboration', 'Lifetime license'],
    'code',
    'from-blue-500 to-cyan-500',
    '3.2.1',
    ARRAY['Windows', 'macOS', 'Linux'],
    FALSE
  ),
  (
    'zentro-design',
    'Zentro Design',
    'UI/UX Design Suite',
    'Create stunning interfaces with vector tools, prototyping, and design systems. Export to any format.',
    7900,
    ARRAY['Vector editing tools', 'Prototyping & animations', 'Design system support', 'Auto-layout', 'Developer handoff', 'Unlimited exports', 'Plugin support'],
    'palette',
    'from-pink-500 to-rose-500',
    '2.8.0',
    ARRAY['Windows', 'macOS'],
    TRUE
  ),
  (
    'zentro-analytics',
    'Zentro Analytics',
    'Business Intelligence',
    'Transform your data into actionable insights with powerful dashboards, reports, and real-time tracking.',
    9900,
    ARRAY['Real-time dashboards', 'Custom reports', 'Data visualization', 'API integrations', 'Team collaboration', 'Export to PDF/Excel', 'White-label option', 'Priority support'],
    'chart',
    'from-emerald-500 to-teal-500',
    '4.1.0',
    ARRAY['Web', 'Windows', 'macOS'],
    FALSE
  ),
  (
    'zentro-secure',
    'Zentro Secure',
    'Security Suite',
    'Enterprise-grade security with password management, VPN, and encrypted file storage all in one.',
    5900,
    ARRAY['Password manager', 'Secure VPN', 'Encrypted storage', 'Two-factor auth', 'Cross-device sync', 'Dark web monitoring'],
    'shield',
    'from-amber-500 to-orange-500',
    '1.5.2',
    ARRAY['Windows', 'macOS', 'iOS', 'Android'],
    FALSE
  )
ON CONFLICT (id) DO NOTHING;
