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
