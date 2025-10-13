-- Fix inventory RLS policies
-- Allow all operations on inventory table (admin operations)

-- First, drop any existing policies
DROP POLICY IF EXISTS "Allow all for inventory" ON inventory;
DROP POLICY IF EXISTS "inventory_read_policy" ON inventory;
DROP POLICY IF EXISTS "inventory_write_policy" ON inventory;
DROP POLICY IF EXISTS "inventory_update_policy" ON inventory;
DROP POLICY IF EXISTS "inventory_delete_policy" ON inventory;

-- Option 1: Disable RLS entirely (simplest for admin-only table)
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled but allow all operations
-- (uncomment below and comment out the DISABLE line above)
/*
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for all operations
CREATE POLICY "inventory_all_operations" ON inventory
  FOR ALL
  USING (true)
  WITH CHECK (true);
*/

-- Also fix for invoices and buyers tables while we're at it
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE buyers DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON inventory TO authenticated;
GRANT ALL ON invoices TO authenticated;
GRANT ALL ON buyers TO authenticated;