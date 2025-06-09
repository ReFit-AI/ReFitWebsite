-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Solana wallet)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{"email": true, "order_updates": true, "marketing": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping addresses
CREATE TABLE shipping_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  street1 TEXT NOT NULL,
  street2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT DEFAULT 'US',
  phone TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_validated BOOLEAN DEFAULT FALSE,
  validation_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_default_per_user UNIQUE (user_id, is_default) WHERE is_default = true
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'awaiting_shipment', 'shipped', 'received', 'inspecting', 'completed', 'cancelled')),
  
  -- Device details
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  device_condition TEXT NOT NULL,
  device_details JSONB,
  
  -- Pricing
  quoted_price_usd DECIMAL(10,2) NOT NULL,
  quoted_price_sol DECIMAL(10,4) NOT NULL,
  final_price_usd DECIMAL(10,2),
  final_price_sol DECIMAL(10,4),
  sol_price_at_quote DECIMAL(10,2),
  
  -- Shipping
  shipping_address_id UUID REFERENCES shipping_addresses(id),
  shipping_rate_id TEXT,
  shipping_carrier TEXT,
  shipping_service TEXT,
  shipping_cost DECIMAL(10,2),
  tracking_number TEXT,
  label_url TEXT,
  return_tracking_number TEXT,
  
  -- Blockchain
  escrow_pubkey TEXT,
  payment_tx_signature TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  inspected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Order status history
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  metadata JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping events (from webhooks)
CREATE TABLE shipping_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  event_type TEXT NOT NULL,
  carrier_status TEXT,
  location TEXT,
  description TEXT,
  raw_data JSONB,
  occurred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device pricing cache
CREATE TABLE device_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  condition TEXT NOT NULL,
  base_price_usd DECIMAL(10,2) NOT NULL,
  market_adjustment DECIMAL(5,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand, model, condition)
);

-- Create indexes
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_shipping_events_order ON shipping_events(order_id);
CREATE INDEX idx_shipping_events_tracking ON shipping_events(tracking_number);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can manage own addresses" ON shipping_addresses
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own order history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_status_history.order_id 
      AND orders.user_id::text = auth.uid()::text
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM orders
  WHERE order_number LIKE 'ORD-' || year_month || '-%';
  
  RETURN 'ORD-' || year_month || '-' || LPAD(sequence_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shipping_addresses_updated_at BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert sample device prices
INSERT INTO device_prices (brand, model, condition, base_price_usd) VALUES
  ('Apple', 'iPhone 15 Pro', 'Excellent', 900),
  ('Apple', 'iPhone 15 Pro', 'Good', 750),
  ('Apple', 'iPhone 15 Pro', 'Fair', 600),
  ('Apple', 'iPhone 14 Pro', 'Excellent', 700),
  ('Apple', 'iPhone 14 Pro', 'Good', 600),
  ('Apple', 'iPhone 14 Pro', 'Fair', 500),
  ('Samsung', 'Galaxy S23 Ultra', 'Excellent', 800),
  ('Samsung', 'Galaxy S23 Ultra', 'Good', 650),
  ('Samsung', 'Galaxy S23 Ultra', 'Fair', 500),
  ('Google', 'Pixel 8 Pro', 'Excellent', 600),
  ('Google', 'Pixel 8 Pro', 'Good', 500),
  ('Google', 'Pixel 8 Pro', 'Fair', 400);
