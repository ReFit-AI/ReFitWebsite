-- Completely disable RLS for liquidity pool tables
-- Security is handled at the API level (transaction verification, etc.)

-- Drop ALL existing policies first
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on deposits
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'deposits') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON deposits';
    END LOOP;

    -- Drop all policies on withdrawal_requests
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'withdrawal_requests') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON withdrawal_requests';
    END LOOP;

    -- Drop all policies on distribution_records
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'distribution_records') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON distribution_records';
    END LOOP;
END $$;

-- Now disable RLS completely
ALTER TABLE deposits DISABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE liquidity_pool DISABLE ROW LEVEL SECURITY;
ALTER TABLE distributions DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role for deposits
GRANT ALL ON deposits TO anon;
GRANT ALL ON withdrawal_requests TO anon;
GRANT ALL ON distribution_records TO anon;
GRANT ALL ON admin_actions TO anon;