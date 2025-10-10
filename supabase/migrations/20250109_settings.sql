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
