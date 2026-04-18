-- Seed default admin account
INSERT INTO admins (username, password, role) 
VALUES ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Seed default products
INSERT INTO products (id, name, tagline, description, price_in_cents, version, color, icon, features, platforms) VALUES
('zentro-code', 'Zentro Code', 'Professional IDE for Modern Development', 'A powerful integrated development environment with AI assistance, real-time collaboration, and support for 50+ programming languages.', 4900, '2.5.0', 'from-violet-500 to-purple-500', 'Code2', '["AI-powered code completion", "Real-time collaboration", "50+ language support", "Built-in terminal", "Git integration"]', '["Windows", "Mac", "Linux"]'),
('zentro-design', 'Zentro Design', 'UI/UX Design Made Simple', 'Create stunning user interfaces with our intuitive design tool. Features real-time collaboration, component libraries, and export to code.', 7900, '3.1.0', 'from-pink-500 to-rose-500', 'Palette', '["Vector editing tools", "Component libraries", "Real-time collaboration", "Export to code", "Figma import"]', '["Windows", "Mac", "Web"]'),
('zentro-analytics', 'Zentro Analytics', 'Data Insights at Your Fingertips', 'Transform your data into actionable insights with powerful analytics, custom dashboards, and AI-powered predictions.', 9900, '1.8.0', 'from-emerald-500 to-teal-500', 'BarChart3', '["Custom dashboards", "AI predictions", "Real-time data sync", "API integrations", "Export reports"]', '["Web", "API"]'),
('zentro-secure', 'Zentro Secure', 'Enterprise Security Suite', 'Protect your digital assets with our comprehensive security solution featuring threat detection, encryption, and compliance tools.', 19900, '4.0.0', 'from-amber-500 to-orange-500', 'Shield', '["Threat detection", "End-to-end encryption", "Compliance tools", "24/7 monitoring", "Incident response"]', '["Windows", "Mac", "Linux", "Cloud"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  price_in_cents = EXCLUDED.price_in_cents,
  version = EXCLUDED.version,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  features = EXCLUDED.features,
  platforms = EXCLUDED.platforms;

-- Seed payment methods
INSERT INTO payment_methods (id, name, icon, enabled) VALUES
('stripe', 'Stripe (Credit/Debit Card)', 'CreditCard', true),
('paypal', 'PayPal', 'Wallet', false),
('crypto', 'Cryptocurrency', 'Bitcoin', false),
('applepay', 'Apple Pay', 'Apple', false),
('cashapp', 'Cash App', 'DollarSign', false)
ON CONFLICT (id) DO NOTHING;
