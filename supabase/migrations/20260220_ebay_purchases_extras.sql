-- Add model, storage, sale_price columns to ebay_purchases
-- Add seller_feedback_percent to ebay_contacts

ALTER TABLE ebay_purchases
  ADD COLUMN IF NOT EXISTS model VARCHAR(100),
  ADD COLUMN IF NOT EXISTS storage VARCHAR(20),
  ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2);

ALTER TABLE ebay_contacts
  ADD COLUMN IF NOT EXISTS feedback_percent DECIMAL(5,1);

CREATE INDEX IF NOT EXISTS idx_ebay_purchases_model ON ebay_purchases(model);
