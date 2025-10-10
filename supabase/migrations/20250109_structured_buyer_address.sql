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
