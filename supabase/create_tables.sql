-- ReFit Database Schema
-- Run this in your Supabase SQL Editor

-- Clean up if tables exist
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS shipping_addresses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  total_orders INTEGER DEFAULT 0,
  total_earned_usd DECIMAL(10, 2) DEFAULT 0,
  total_earned_sol DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Create shipping addresses table
CREATE TABLE shipping_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  street1 TEXT NOT NULL,
  street2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT DEFAULT 'US',
  phone TEXT,
  email TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  wallet_address TEXT NOT NULL,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  device_storage TEXT,
  device_carrier TEXT,
  device_condition TEXT NOT NULL,
  device_category TEXT NOT NULL,
  device_issues JSONB DEFAULT '[]',
  quote_usd DECIMAL(10, 2) NOT NULL,
  quote_sol DECIMAL(10, 4) NOT NULL,
  price_breakdown JSONB,
  shipping_address JSONB NOT NULL,
  shipping_rate JSONB,
  shipping_label JSONB,
  tracking_number TEXT,
  carrier TEXT,
  label_url TEXT,
  status TEXT NOT NULL DEFAULT 'created',
  status_history JSONB DEFAULT '[]',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'SOL',
  payment_amount DECIMAL(10, 4),
  payment_tx_hash TEXT,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  inspected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);
CREATE INDEX idx_orders_profile ON orders(profile_id);
CREATE INDEX idx_orders_wallet ON orders(wallet_address);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_shipping_profile ON shipping_addresses(profile_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create RLS policies (simplified for now - you can adjust based on your auth setup)
-- For now, allowing all operations (you should restrict this in production)

-- Profiles policies
CREATE POLICY "Enable all for profiles" ON profiles
  FOR ALL USING (true);

-- Shipping addresses policies  
CREATE POLICY "Enable all for shipping_addresses" ON shipping_addresses
  FOR ALL USING (true);

-- Orders policies
CREATE POLICY "Enable all for orders" ON orders
  FOR ALL USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Tables created successfully!';
  RAISE NOTICE 'Profiles table ready ✓';
  RAISE NOTICE 'Shipping addresses table ready ✓';
  RAISE NOTICE 'Orders table ready ✓';
END $$;