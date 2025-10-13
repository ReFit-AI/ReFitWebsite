-- Add shipping fields to invoices table
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS shipping_tracking VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_label_url TEXT,
ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;

-- Add address fields to buyers table for proper shipping
ALTER TABLE buyers
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(50),
ADD COLUMN IF NOT EXISTS zip VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'US';

-- Create index on shipping_tracking for quick lookups
CREATE INDEX IF NOT EXISTS idx_invoices_shipping_tracking ON invoices(shipping_tracking);

-- Create index on shipped_at for filtering shipped invoices
CREATE INDEX IF NOT EXISTS idx_invoices_shipped_at ON invoices(shipped_at);