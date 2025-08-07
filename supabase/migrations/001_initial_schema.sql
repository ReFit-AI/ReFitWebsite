-- Initial database schema for ReFit
-- This migration creates all necessary tables for the phone buyback system

-- Enable UUID extension (try both methods for compatibility)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users/Profiles table (linked to wallet addresses)
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  
  -- Profile data
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  
  -- Preferences
  preferences JSONB DEFAULT '{}',
  
  -- Stats
  total_orders INTEGER DEFAULT 0,
  total_earned_usd DECIMAL(10, 2) DEFAULT 0,
  total_earned_sol DECIMAL(10, 4) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Shipping addresses table
CREATE TABLE shipping_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Address fields
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
  
  -- Settings
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY, -- Using our custom order ID format
  profile_id UUID REFERENCES profiles(id),
  wallet_address TEXT NOT NULL,
  
  -- Device information
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  device_storage TEXT,
  device_carrier TEXT,
  device_condition TEXT NOT NULL,
  device_category TEXT NOT NULL, -- iphone, android, solana
  device_issues JSONB DEFAULT '[]',
  
  -- Pricing
  quote_usd DECIMAL(10, 2) NOT NULL,
  quote_sol DECIMAL(10, 4) NOT NULL,
  price_breakdown JSONB,
  
  -- Shipping
  shipping_address JSONB NOT NULL,
  shipping_rate JSONB,
  shipping_label JSONB,
  tracking_number TEXT,
  carrier TEXT,
  label_url TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'created',
  status_history JSONB DEFAULT '[]',
  
  -- Payment
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'SOL',
  payment_amount DECIMAL(10, 4),
  payment_tx_hash TEXT,
  payment_date TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  inspected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Order status enum (for validation)
CREATE TYPE order_status AS ENUM (
  'created',
  'pending_shipment',
  'shipped',
  'received',
  'inspecting',
  'approved',
  'payment_pending',
  'payment_complete',
  'completed',
  'cancelled',
  'disputed'
);

-- Create indexes for performance
CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);
CREATE INDEX idx_orders_profile ON orders(profile_id);
CREATE INDEX idx_orders_wallet ON orders(wallet_address);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_shipping_profile ON shipping_addresses(profile_id);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (wallet_address = current_setting('app.current_wallet', true));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (wallet_address = current_setting('app.current_wallet', true));

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (wallet_address = current_setting('app.current_wallet', true));

-- Shipping addresses: Users can only manage their own addresses
CREATE POLICY "Users can view own addresses"
  ON shipping_addresses FOR SELECT
  USING (profile_id IN (
    SELECT id FROM profiles WHERE wallet_address = current_setting('app.current_wallet', true)
  ));

CREATE POLICY "Users can manage own addresses"
  ON shipping_addresses FOR ALL
  USING (profile_id IN (
    SELECT id FROM profiles WHERE wallet_address = current_setting('app.current_wallet', true)
  ));

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (wallet_address = current_setting('app.current_wallet', true));

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (wallet_address = current_setting('app.current_wallet', true));

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables
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

-- Function to update profile stats when order completes
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    UPDATE profiles 
    SET 
      total_orders = total_orders + 1,
      total_earned_usd = total_earned_usd + NEW.quote_usd,
      total_earned_sol = total_earned_sol + NEW.payment_amount
    WHERE id = NEW.profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_stats_on_payment
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats();