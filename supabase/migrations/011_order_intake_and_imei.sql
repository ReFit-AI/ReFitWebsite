-- Migration 011: Add order intake workflow fields and IMEI tracking
-- Purpose: Enable admin device receiving, inspection, and payment workflow

-- Add intake and inspection fields to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS device_imei TEXT,
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS inspected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS inspected_by TEXT, -- Admin wallet address
  ADD COLUMN IF NOT EXISTS inspection_notes TEXT,
  ADD COLUMN IF NOT EXISTS inspection_condition TEXT, -- Actual condition found
  ADD COLUMN IF NOT EXISTS inspection_approved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS inventory_id UUID REFERENCES inventory(id); -- Link to inventory item

-- Add IMEI to inventory table for tracking
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS imei TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS source_order_id TEXT REFERENCES orders(id); -- Link back to order

-- Create indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_received_at ON orders(received_at) WHERE received_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_imei ON orders(device_imei) WHERE device_imei IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_imei ON inventory(imei) WHERE imei IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_source_order ON inventory(source_order_id) WHERE source_order_id IS NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN orders.device_imei IS 'IMEI number for unique device identification';
COMMENT ON COLUMN orders.received_at IS 'Timestamp when device physically arrived at warehouse';
COMMENT ON COLUMN orders.inspected_at IS 'Timestamp when device inspection was completed';
COMMENT ON COLUMN orders.inspected_by IS 'Wallet address of admin who performed inspection';
COMMENT ON COLUMN orders.inspection_condition IS 'Actual device condition found during inspection (may differ from quoted condition)';
COMMENT ON COLUMN orders.inspection_approved IS 'Whether device passed inspection and matches quoted condition';
COMMENT ON COLUMN orders.inventory_id IS 'Link to inventory item created after payment';
COMMENT ON COLUMN inventory.source_order_id IS 'Original order that this inventory item came from';
