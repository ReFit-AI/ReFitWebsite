-- SECURITY FIX: Re-enable RLS and fix overly permissive policies
-- This migration fixes the security issues introduced by previous migrations
-- Run this in production Supabase SQL editor

-- ============================================
-- STEP 1: Re-enable RLS on financial tables
-- ============================================

ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidity_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop overly permissive policies
-- ============================================

-- Drop dangerous "true" policies on orders
DROP POLICY IF EXISTS "Direct wallet match for orders" ON orders;
DROP POLICY IF EXISTS "Allow reading orders by wallet" ON orders;
DROP POLICY IF EXISTS "Allow order reads" ON orders;
DROP POLICY IF EXISTS "Allow creating orders with wallet" ON orders;

-- Drop overly permissive profile policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation with wallet" ON profiles;

-- Drop overly permissive shipping address policies
DROP POLICY IF EXISTS "Users can manage addresses" ON shipping_addresses;

-- ============================================
-- STEP 3: Create proper wallet-based policies
-- ============================================

-- ORDERS: Users can only see their own orders
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  USING (
    wallet_address = current_setting('app.current_wallet', true)
  );

CREATE POLICY "orders_insert_own"
  ON orders FOR INSERT
  WITH CHECK (
    wallet_address IS NOT NULL
    AND wallet_address = current_setting('app.current_wallet', true)
  );

CREATE POLICY "orders_update_own"
  ON orders FOR UPDATE
  USING (
    wallet_address = current_setting('app.current_wallet', true)
  );

-- PROFILES: Users can only manage their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (
    wallet_address = current_setting('app.current_wallet', true)
  );

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (
    wallet_address IS NOT NULL
    AND wallet_address = current_setting('app.current_wallet', true)
  );

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (
    wallet_address = current_setting('app.current_wallet', true)
  );

-- SHIPPING ADDRESSES: Users can only manage their own
CREATE POLICY "shipping_addresses_select_own"
  ON shipping_addresses FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles
      WHERE wallet_address = current_setting('app.current_wallet', true)
    )
  );

CREATE POLICY "shipping_addresses_all_own"
  ON shipping_addresses FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles
      WHERE wallet_address = current_setting('app.current_wallet', true)
    )
  );

-- ============================================
-- STEP 4: Financial tables - admin only access
-- ============================================

-- DEPOSITS: Only the depositor can see their own deposits
DROP POLICY IF EXISTS "deposits_select" ON deposits;
CREATE POLICY "deposits_select_own"
  ON deposits FOR SELECT
  USING (
    wallet_address = current_setting('app.current_wallet', true)
  );

-- Admin can manage all deposits via service role (bypasses RLS)
-- No need for explicit admin policy - use service role client

-- WITHDRAWAL_REQUESTS: Only the requester can see their own
DROP POLICY IF EXISTS "withdrawal_requests_select" ON withdrawal_requests;
CREATE POLICY "withdrawal_requests_select_own"
  ON withdrawal_requests FOR SELECT
  USING (
    wallet_address = current_setting('app.current_wallet', true)
  );

CREATE POLICY "withdrawal_requests_insert_own"
  ON withdrawal_requests FOR INSERT
  WITH CHECK (
    wallet_address IS NOT NULL
    AND wallet_address = current_setting('app.current_wallet', true)
  );

-- DISTRIBUTION_RECORDS: Users can see their own distributions
DROP POLICY IF EXISTS "distribution_records_select" ON distribution_records;
CREATE POLICY "distribution_records_select_own"
  ON distribution_records FOR SELECT
  USING (
    wallet_address = current_setting('app.current_wallet', true)
  );

-- LIQUIDITY_POOL: Read-only for everyone (public pool stats)
DROP POLICY IF EXISTS "liquidity_pool_select" ON liquidity_pool;
CREATE POLICY "liquidity_pool_select_public"
  ON liquidity_pool FOR SELECT
  USING (true);
-- Writes are admin-only via service role

-- ADMIN_ACTIONS: Admin only (via service role, no anon access)
-- No policies needed - service role bypasses RLS

-- ============================================
-- STEP 5: Revoke overly broad grants
-- ============================================

-- Revoke ALL from anon, grant only what's needed
REVOKE ALL ON deposits FROM anon;
REVOKE ALL ON withdrawal_requests FROM anon;
REVOKE ALL ON distribution_records FROM anon;
REVOKE ALL ON admin_actions FROM anon;
REVOKE ALL ON liquidity_pool FROM anon;
REVOKE ALL ON distributions FROM anon;

-- Grant appropriate permissions
GRANT SELECT ON deposits TO anon;
GRANT SELECT ON withdrawal_requests TO anon;
GRANT SELECT, INSERT ON withdrawal_requests TO anon;
GRANT SELECT ON distribution_records TO anon;
GRANT SELECT ON liquidity_pool TO anon;

-- Orders and profiles need insert for new users
GRANT SELECT, INSERT, UPDATE ON orders TO anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON shipping_addresses TO anon;

-- ============================================
-- STEP 6: Add comments for documentation
-- ============================================

COMMENT ON POLICY "orders_select_own" ON orders IS
  'Users can only view orders where wallet_address matches their wallet context';

COMMENT ON POLICY "profiles_select_own" ON profiles IS
  'Users can only view their own profile by wallet address';

COMMENT ON POLICY "deposits_select_own" ON deposits IS
  'Users can only view their own deposit history';

-- ============================================
-- VERIFICATION QUERIES (run manually to check)
-- ============================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
