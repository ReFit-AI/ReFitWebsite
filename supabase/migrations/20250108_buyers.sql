-- Create buyers table for storing repeat customer information
-- SECURITY: This table contains sensitive customer data and is only accessible via admin API routes
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact Info
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),

  -- Shipping Address (formatted for Shippo API)
  address_line1 VARCHAR(200),
  address_line2 VARCHAR(200),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  country VARCHAR(2) DEFAULT 'US',

  -- Internal
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_order_at TIMESTAMPTZ,

  -- Ensure at minimum we have name and shipping address
  CONSTRAINT buyer_required_fields CHECK (
    name IS NOT NULL AND
    address_line1 IS NOT NULL AND
    city IS NOT NULL AND
    state IS NOT NULL AND
    zip IS NOT NULL
  )
);

-- Create index for faster lookups (only admin searches)
CREATE INDEX idx_buyers_name ON buyers(name);

-- Add security comments
COMMENT ON TABLE buyers IS 'SENSITIVE: Customer shipping information - admin access only';
COMMENT ON COLUMN buyers.email IS 'SENSITIVE: Customer email';
COMMENT ON COLUMN buyers.phone IS 'SENSITIVE: Customer phone number';
COMMENT ON COLUMN buyers.address_line1 IS 'SENSITIVE: Shipping address';

-- RLS Policies - STRICT: Only service role can access
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;

-- Only service role (backend API) can access - NO public/anon access
CREATE POLICY "Only service role can access buyers" ON buyers
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Explicitly deny all other access
CREATE POLICY "Deny all non-service access to buyers" ON buyers
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Grant permissions ONLY to service role
GRANT SELECT, INSERT, UPDATE, DELETE ON buyers TO service_role;
REVOKE ALL ON buyers FROM anon, authenticated;
