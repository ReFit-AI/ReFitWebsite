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
