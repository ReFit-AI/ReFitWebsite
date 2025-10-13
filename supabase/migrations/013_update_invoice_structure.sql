-- Update invoices table structure
-- Add buyer_id foreign key and new fields

-- First add the new columns if they don't exist
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES buyers(id),
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100) DEFAULT 'Net 30',
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(100);

-- Add cost column to invoice_items
ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0;

-- Create index for buyer_id lookups
CREATE INDEX IF NOT EXISTS idx_invoices_buyer_id ON invoices(buyer_id);

-- Update existing invoices to have subtotal and total if they don't
UPDATE invoices
SET subtotal = COALESCE(subtotal, total_amount),
    total = COALESCE(total, total_amount)
WHERE subtotal IS NULL OR total IS NULL;