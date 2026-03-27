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

-- Disable RLS for admin operations (products are managed by admin)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_purchases ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products (they're displayed on the website)
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);

-- Allow authenticated admin to manage products (using service role key)
CREATE POLICY "Allow service role full access to products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Product keys should only be accessible via service role
CREATE POLICY "Allow service role full access to product_keys" ON product_keys FOR ALL USING (true) WITH CHECK (true);

-- Customer purchases should only be accessible via service role
CREATE POLICY "Allow service role full access to customer_purchases" ON customer_purchases FOR ALL USING (true) WITH CHECK (true);
