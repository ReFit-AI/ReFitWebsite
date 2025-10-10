-- Inventory System Complete Setup (with IF EXISTS checks)

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
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'sent', 'paid', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
  model VARCHAR(100) NOT NULL,
  imei VARCHAR(20) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyers table (secure storage)
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),
  address_line1 VARCHAR(200),
  address_line2 VARCHAR(200),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  country VARCHAR(2) DEFAULT 'US',
  notes TEXT,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add shipping fields to inventory
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS shipping_cost_in DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS shipping_cost_out DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(50);
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS shipped_date TIMESTAMPTZ;

-- Add shipping fields to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_label_id VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS label_url TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tracking_url TEXT;

-- Add buyer address fields to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_phone VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_address_line1 VARCHAR(200);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_address_line2 VARCHAR(200);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_city VARCHAR(100);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_state VARCHAR(50);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_zip VARCHAR(20);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS buyer_country VARCHAR(2) DEFAULT 'US';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_sold_at ON inventory(sold_at);
CREATE INDEX IF NOT EXISTS idx_inventory_model ON inventory(model);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_buyers_name ON buyers(name);
CREATE INDEX IF NOT EXISTS idx_buyers_email ON buyers(email);

-- Enable Row Level Security
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view inventory" ON inventory;
DROP POLICY IF EXISTS "Public can view invoices" ON invoices;
DROP POLICY IF EXISTS "Public can view invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Service role full access to inventory" ON inventory;
DROP POLICY IF EXISTS "Service role full access to invoices" ON invoices;
DROP POLICY IF EXISTS "Service role full access to invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Only service role can access buyers" ON buyers;
DROP POLICY IF EXISTS "Deny all non-service access to buyers" ON buyers;
DROP POLICY IF EXISTS "Service role can access settings" ON settings;
DROP POLICY IF EXISTS "Public can view settings" ON settings;

-- Create RLS policies
-- Public can view inventory (transparency)
CREATE POLICY "Public can view inventory" ON inventory
  FOR SELECT USING (true);

-- Public can view invoices
CREATE POLICY "Public can view invoices" ON invoices
  FOR SELECT USING (true);

-- Public can view invoice items
CREATE POLICY "Public can view invoice items" ON invoice_items
  FOR SELECT USING (true);

-- Service role full access to inventory
CREATE POLICY "Service role full access to inventory" ON inventory
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Service role full access to invoices
CREATE POLICY "Service role full access to invoices" ON invoices
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Service role full access to invoice items
CREATE POLICY "Service role full access to invoice items" ON invoice_items
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Buyers table - ONLY service role (extremely sensitive data)
CREATE POLICY "Only service role can access buyers" ON buyers
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Explicitly deny all other access to buyers
CREATE POLICY "Deny all non-service access to buyers" ON buyers
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Settings - Service role can edit, public can view
CREATE POLICY "Service role can access settings" ON settings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Public can view settings" ON settings
  FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON invoices TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON invoice_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON buyers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON settings TO service_role;

-- Revoke from anon/authenticated for buyers (extra security)
REVOKE ALL ON buyers FROM anon, authenticated;

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('shipping_from_address', '{
    "name": "ReFit",
    "street1": "123 Main St",
    "city": "Your City",
    "state": "CA",
    "zip": "12345",
    "country": "US"
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

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

-- Function to update invoice status to 'sent' when label is created
CREATE OR REPLACE FUNCTION update_invoice_status_on_label()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NOT NULL AND OLD.tracking_number IS NULL THEN
    NEW.status := 'sent';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS invoice_label_status_update ON invoices;
CREATE TRIGGER invoice_label_status_update
  BEFORE UPDATE OF tracking_number ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_status_on_label();
