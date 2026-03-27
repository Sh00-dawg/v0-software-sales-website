-- Products table to store editable product information
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  price_in_cents INTEGER NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  icon TEXT NOT NULL DEFAULT 'code',
  color TEXT NOT NULL DEFAULT 'from-blue-500 to-cyan-500',
  version TEXT NOT NULL DEFAULT '1.0.0',
  platform TEXT[] NOT NULL DEFAULT '{}',
  popular BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  file_pathname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product keys table
CREATE TABLE IF NOT EXISTS product_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by TEXT,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer purchases table
CREATE TABLE IF NOT EXISTS customer_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  product_key TEXT,
  amount_in_cents INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_keys_product_id ON product_keys(product_id);
CREATE INDEX IF NOT EXISTS idx_product_keys_is_used ON product_keys(is_used);
CREATE INDEX IF NOT EXISTS idx_customer_purchases_session_id ON customer_purchases(session_id);
CREATE INDEX IF NOT EXISTS idx_customer_purchases_customer_email ON customer_purchases(customer_email);
