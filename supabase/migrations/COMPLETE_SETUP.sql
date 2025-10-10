-- Inventory System Tables
-- Tracks phone purchases, sales, and generates invoices

-- Main inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model VARCHAR(100) NOT NULL,
  imei VARCHAR(20) NOT NULL UNIQUE,
  price_paid DECIMAL(10, 2) NOT NULL,
  price_sold DECIMAL(10, 2),
  battery_health INTEGER,
  condition VARCHAR(50),
  notes TEXT,
  seller VARCHAR(100),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  sold_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold', 'returned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  buyer_name VARCHAR(200),
  buyer_email VARCHAR(200),
  buyer_address TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Invoice line items (links inventory to invoices)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
  model VARCHAR(100) NOT NULL,
  imei VARCHAR(20) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_sold_at ON inventory(sold_at);
CREATE INDEX IF NOT EXISTS idx_inventory_model ON inventory(model);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Row Level Security (RLS)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Public can view inventory (transparency)
CREATE POLICY "Public can view inventory" ON inventory
  FOR SELECT USING (true);

-- Public can view invoices (for buyer access via link)
CREATE POLICY "Public can view invoices" ON invoices
  FOR SELECT USING (true);

-- Public can view invoice items
CREATE POLICY "Public can view invoice items" ON invoice_items
  FOR SELECT USING (true);

-- Service role can do everything (for API routes with admin verification)
-- Service role bypasses RLS by default, but we'll add explicit policies for clarity
CREATE POLICY "Service role full access to inventory" ON inventory
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access to invoices" ON invoices
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access to invoice items" ON invoice_items
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for inventory stats (used on stats page)
CREATE OR REPLACE VIEW inventory_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'in_stock') as active_inventory_count,
  COALESCE(SUM(price_paid) FILTER (WHERE status = 'in_stock'), 0) as capital_deployed,
  COUNT(*) FILTER (WHERE status = 'sold') as total_sales_count,
  COALESCE(SUM(price_sold - price_paid) FILTER (WHERE status = 'sold'), 0) as total_profit,
  COALESCE(AVG(price_sold - price_paid) FILTER (WHERE status = 'sold' AND price_sold > 0), 0) as avg_profit_per_unit,
  COALESCE(AVG((price_sold - price_paid) / NULLIF(price_paid, 0) * 100) FILTER (WHERE status = 'sold' AND price_sold > 0), 0) as avg_margin_percent,
  COALESCE(SUM(price_paid) FILTER (WHERE status = 'sold'), 0) as total_invested,
  COALESCE(SUM(price_sold) FILTER (WHERE status = 'sold'), 0) as total_revenue
FROM inventory;

-- Grant permissions
GRANT SELECT ON inventory_stats TO anon, authenticated;
-- Add shipping fields to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_label_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS label_url TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tracking_url TEXT;

-- Add comments
COMMENT ON COLUMN invoices.shipping_cost IS 'Total shipping cost for this invoice/shipment';
COMMENT ON COLUMN invoices.shipping_label_id IS 'Shippo label object ID';
COMMENT ON COLUMN invoices.tracking_number IS 'Carrier tracking number';
COMMENT ON COLUMN invoices.shipping_carrier IS 'Shipping carrier (USPS, UPS, FedEx)';
COMMENT ON COLUMN invoices.label_url IS 'URL to download shipping label PDF';
COMMENT ON COLUMN invoices.tracking_url IS 'URL to track shipment';

-- Function to auto-update inventory shipping costs when invoice ships
CREATE OR REPLACE FUNCTION update_inventory_shipping_from_invoice()
RETURNS TRIGGER AS $$
DECLARE
  item_count INTEGER;
  cost_per_item DECIMAL(10, 2);
BEGIN
  -- Only run if shipping_cost is being set/updated
  IF NEW.shipping_cost IS NOT NULL AND NEW.shipping_cost > 0 THEN
    -- Count items in this invoice
    SELECT COUNT(*) INTO item_count
    FROM invoice_items
    WHERE invoice_id = NEW.id;

    -- Calculate cost per item
    IF item_count > 0 THEN
      cost_per_item := NEW.shipping_cost / item_count;

      -- Update each inventory item with its share of shipping
      UPDATE inventory
      SET shipping_cost_out = cost_per_item,
          tracking_number = NEW.tracking_number,
          shipping_carrier = NEW.shipping_carrier,
          shipped_date = NOW()
      WHERE id IN (
        SELECT inventory_id
        FROM invoice_items
        WHERE invoice_id = NEW.id AND inventory_id IS NOT NULL
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS invoice_shipping_update ON invoices;
CREATE TRIGGER invoice_shipping_update
  AFTER UPDATE OF shipping_cost ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_shipping_from_invoice();
-- Add shipping cost tracking to inventory
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS shipping_cost_in DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS shipping_cost_out DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS shipping_label_id VARCHAR(100);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS shipped_date TIMESTAMPTZ;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(50);

-- Add comments for clarity
COMMENT ON COLUMN inventory.shipping_cost_in IS 'Cost to receive phone from seller';
COMMENT ON COLUMN inventory.shipping_cost_out IS 'Cost to ship phone to buyer';
COMMENT ON COLUMN inventory.shipping_label_id IS 'Shippo label ID for tracking';
COMMENT ON COLUMN inventory.shipped_date IS 'Date phone was shipped to buyer';
COMMENT ON COLUMN inventory.tracking_number IS 'Carrier tracking number';
COMMENT ON COLUMN inventory.shipping_carrier IS 'Shipping carrier (USPS, UPS, FedEx)';

-- Update the inventory_stats view to include shipping costs
DROP VIEW IF EXISTS inventory_stats;

CREATE OR REPLACE VIEW inventory_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'in_stock') as active_inventory_count,
  COALESCE(SUM(price_paid) FILTER (WHERE status = 'in_stock'), 0) as capital_deployed,
  COUNT(*) FILTER (WHERE status = 'sold') as total_sales_count,

  -- Gross profit (without shipping)
  COALESCE(SUM(price_sold - price_paid) FILTER (WHERE status = 'sold' AND price_sold > 0), 0) as gross_profit,

  -- Total shipping costs
  COALESCE(SUM(shipping_cost_in + shipping_cost_out) FILTER (WHERE status = 'sold'), 0) as total_shipping_costs,

  -- Net profit (with shipping)
  COALESCE(
    SUM(price_sold - price_paid - COALESCE(shipping_cost_in, 0) - COALESCE(shipping_cost_out, 0))
    FILTER (WHERE status = 'sold' AND price_sold > 0),
    0
  ) as net_profit,

  -- Average profit per unit (net)
  COALESCE(
    AVG(price_sold - price_paid - COALESCE(shipping_cost_in, 0) - COALESCE(shipping_cost_out, 0))
    FILTER (WHERE status = 'sold' AND price_sold > 0),
    0
  ) as avg_net_profit_per_unit,

  -- Average margin percent (net)
  COALESCE(
    AVG(
      (price_sold - price_paid - COALESCE(shipping_cost_in, 0) - COALESCE(shipping_cost_out, 0))
      / NULLIF(price_paid + COALESCE(shipping_cost_in, 0) + COALESCE(shipping_cost_out, 0), 0) * 100
    ) FILTER (WHERE status = 'sold' AND price_sold > 0),
    0
  ) as avg_net_margin_percent,

  -- Gross margin percent (without shipping)
  COALESCE(
    AVG((price_sold - price_paid) / NULLIF(price_paid, 0) * 100)
    FILTER (WHERE status = 'sold' AND price_sold > 0),
    0
  ) as avg_gross_margin_percent,

  COALESCE(SUM(price_paid) FILTER (WHERE status = 'sold'), 0) as total_invested,
  COALESCE(SUM(price_sold) FILTER (WHERE status = 'sold'), 0) as total_revenue
FROM inventory;

-- Grant permissions
GRANT SELECT ON inventory_stats TO anon, authenticated;
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
-- Create settings table for app configuration
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default from address
INSERT INTO settings (key, value) VALUES
  ('shipping_from_address', '{
    "name": "ReFit",
    "street1": "123 Main St",
    "city": "Your City",
    "state": "CA",
    "zip": "12345",
    "country": "US",
    "phone": "",
    "email": ""
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS Policies - Only service role can access
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can access settings" ON settings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON settings TO service_role;
REVOKE ALL ON settings FROM anon, authenticated;

-- Add comments
COMMENT ON TABLE settings IS 'App configuration settings - admin access only';
-- Update invoices table to have structured buyer address fields (for Shippo integration)

-- Add new structured address fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_phone VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_address_line1 VARCHAR(200);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_address_line2 VARCHAR(200);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_city VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_state VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_zip VARCHAR(20);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_country VARCHAR(2) DEFAULT 'US';

-- Keep old buyer_address field for backward compatibility but mark as deprecated
COMMENT ON COLUMN invoices.buyer_address IS 'DEPRECATED: Use structured address fields instead';

-- Add status for finalized
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('draft', 'finalized', 'sent', 'paid', 'cancelled'));

-- Add comments
COMMENT ON COLUMN invoices.buyer_phone IS 'Buyer phone number';
COMMENT ON COLUMN invoices.buyer_address_line1 IS 'Shipping address line 1';
COMMENT ON COLUMN invoices.buyer_address_line2 IS 'Shipping address line 2 (apt, suite, etc)';
COMMENT ON COLUMN invoices.buyer_city IS 'Shipping city';
COMMENT ON COLUMN invoices.buyer_state IS 'Shipping state (2-letter code)';
COMMENT ON COLUMN invoices.buyer_zip IS 'Shipping ZIP/postal code';
COMMENT ON COLUMN invoices.buyer_country IS 'Shipping country (2-letter ISO code)';
