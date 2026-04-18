-- Create admins table for dashboard login
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  price_in_cents INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  color TEXT,
  version TEXT,
  platforms TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  image_url TEXT,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product keys table
CREATE TABLE IF NOT EXISTS product_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  key_value TEXT NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  assigned_to TEXT,
  assigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id),
  customer_email TEXT,
  amount_in_cents INTEGER,
  payment_method TEXT DEFAULT 'stripe',
  product_key TEXT,
  session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics table for page views
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  visitor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create abandoned carts table
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id),
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin (password: admin123)
INSERT INTO admins (username, password_hash, role) 
VALUES ('admin', '$2a$10$rQEY9Gt6.NfT5X5oM9O5/.lZVZxA9xZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert default products
INSERT INTO products (id, name, tagline, description, price_in_cents, icon, color, version, platforms, features) VALUES
('zentro-code', 'Zentro Code', 'Professional IDE', 'A powerful integrated development environment with AI-assisted coding, intelligent autocomplete, and built-in debugging tools.', 4900, 'Code2', 'from-blue-500 to-cyan-500', '2.5.0', ARRAY['Windows', 'macOS', 'Linux'], ARRAY['AI Code Completion', 'Built-in Terminal', 'Git Integration', 'Extension Marketplace', 'Live Collaboration']),
('zentro-design', 'Zentro Design', 'UI/UX Design Suite', 'Complete design toolkit for creating stunning user interfaces with collaborative features and design system management.', 7900, 'Palette', 'from-purple-500 to-pink-500', '3.1.2', ARRAY['Windows', 'macOS', 'Web'], ARRAY['Vector Editing', 'Prototyping', 'Design Systems', 'Team Libraries', 'Developer Handoff']),
('zentro-analytics', 'Zentro Analytics', 'Business Intelligence', 'Transform your data into actionable insights with advanced analytics, real-time dashboards, and predictive modeling.', 12900, 'BarChart3', 'from-green-500 to-emerald-500', '4.0.1', ARRAY['Web', 'API'], ARRAY['Real-time Dashboards', 'Custom Reports', 'Data Connectors', 'AI Predictions', 'Team Sharing']),
('zentro-secure', 'Zentro Secure', 'Cybersecurity Suite', 'Enterprise-grade security solution with threat detection, vulnerability scanning, and compliance management.', 19900, 'Shield', 'from-orange-500 to-red-500', '1.8.5', ARRAY['Windows', 'macOS', 'Linux', 'Cloud'], ARRAY['Threat Detection', 'Vulnerability Scanner', 'Compliance Reports', 'Security Audits', '24/7 Monitoring'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  price_in_cents = EXCLUDED.price_in_cents,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  version = EXCLUDED.version,
  platforms = EXCLUDED.platforms,
  features = EXCLUDED.features;

-- Insert default payment methods
INSERT INTO payment_methods (name, type, enabled) VALUES
('Stripe', 'stripe', TRUE),
('PayPal', 'paypal', FALSE),
('Crypto', 'crypto', FALSE),
('Apple Pay', 'apple_pay', FALSE),
('Cash App', 'cashapp', FALSE)
ON CONFLICT DO NOTHING;
