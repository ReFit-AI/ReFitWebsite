-- Fix overly permissive RLS policies for production security
-- This migration replaces the dangerous "allow all" policies with proper wallet-based access control

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Enable all for profiles" ON profiles;
DROP POLICY IF EXISTS "Enable all for shipping_addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Enable all for orders" ON orders;

-- Also drop any existing proper policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can manage own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;

-- Profiles: Users can only see/edit their own profile based on wallet address
CREATE POLICY "Users view own profile"
  ON profiles FOR SELECT
  USING (
    wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    OR wallet_address = current_setting('app.current_wallet', true)
  );

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (
    wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    OR wallet_address = current_setting('app.current_wallet', true)
  );

CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (
    wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    OR wallet_address = current_setting('app.current_wallet', true)
  );

CREATE POLICY "Users delete own profile"
  ON profiles FOR DELETE
  USING (
    wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    OR wallet_address = current_setting('app.current_wallet', true)
  );

-- Shipping addresses: Users can only manage addresses linked to their profile
CREATE POLICY "Users view own addresses"
  ON shipping_addresses FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        OR wallet_address = current_setting('app.current_wallet', true)
    )
  );

CREATE POLICY "Users insert own addresses"
  ON shipping_addresses FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        OR wallet_address = current_setting('app.current_wallet', true)
    )
  );

CREATE POLICY "Users update own addresses"
  ON shipping_addresses FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM profiles 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        OR wallet_address = current_setting('app.current_wallet', true)
    )
  );

CREATE POLICY "Users delete own addresses"
  ON shipping_addresses FOR DELETE
  USING (
    profile_id IN (
      SELECT id FROM profiles 
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        OR wallet_address = current_setting('app.current_wallet', true)
    )
  );

-- Orders: Users can view and create their own orders
CREATE POLICY "Users view own orders"
  ON orders FOR SELECT
  USING (
    wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    OR wallet_address = current_setting('app.current_wallet', true)
  );

CREATE POLICY "Users create orders"
  ON orders FOR INSERT
  WITH CHECK (
    wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    OR wallet_address = current_setting('app.current_wallet', true)
  );

-- Users cannot update orders (only admins/system can)
-- This prevents users from modifying critical order data
CREATE POLICY "Users cannot update orders"
  ON orders FOR UPDATE
  USING (false);

-- Admin policies (requires admin role)
-- Note: You'll need to set up proper admin authentication
-- For now, these are commented out but show the pattern

-- CREATE POLICY "Admins can view all profiles"
--   ON profiles FOR SELECT
--   USING (
--     current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
--   );

-- CREATE POLICY "Admins can update all orders"
--   ON orders FOR UPDATE
--   USING (
--     current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
--   );

-- Service role bypass (for server-side operations)
-- The service role key bypasses RLS entirely, so no policies needed