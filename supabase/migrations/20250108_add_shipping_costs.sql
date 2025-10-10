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
