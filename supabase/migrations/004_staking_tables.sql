-- Staking System Tables
-- Run this in your Supabase SQL editor

-- Create stakes table
CREATE TABLE IF NOT EXISTS stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,

  -- Stake details
  amount DECIMAL(10,2) NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('flexible', 'smart', 'diamond')),
  lock_days INTEGER NOT NULL,
  unlock_date TIMESTAMP NOT NULL,
  apy DECIMAL(5,2) NOT NULL,

  -- Transaction details
  tx_signature TEXT NOT NULL UNIQUE,
  from_order_id TEXT, -- If stake came from device trade-in

  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unlocked', 'withdrawn', 'cancelled')),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  withdrawn_at TIMESTAMP
);

-- Create stake_yields table for tracking daily earnings
CREATE TABLE IF NOT EXISTS stake_yields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stake_id UUID REFERENCES stakes(id) ON DELETE CASCADE,

  -- Yield details
  amount DECIMAL(10,6) NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('validator', 'rft_emission', 'bonus')),

  -- Claiming
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP,
  claim_tx_signature TEXT,

  -- Timestamps
  calculated_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stake_id UUID REFERENCES stakes(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,

  -- Withdrawal details
  amount DECIMAL(10,2) NOT NULL,
  penalty DECIMAL(10,2) DEFAULT 0, -- Early withdrawal penalty
  net_amount DECIMAL(10,2) NOT NULL, -- After penalty

  -- Processing
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  rejection_reason TEXT,

  -- Transaction details
  tx_signature TEXT,

  -- Timestamps
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Create treasury_snapshots table for daily reconciliation
CREATE TABLE IF NOT EXISTS treasury_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Balances
  total_staked DECIMAL(15,2) NOT NULL,
  liquid_balance DECIMAL(15,2) NOT NULL, -- Available for withdrawals
  validator_balance DECIMAL(15,2) NOT NULL, -- Staked with validator
  marinade_balance DECIMAL(15,2), -- If using Marinade

  -- Stats
  active_stakes INTEGER NOT NULL,
  total_yield_distributed DECIMAL(15,6) NOT NULL,

  -- Reconciliation
  expected_balance DECIMAL(15,2) NOT NULL,
  actual_balance DECIMAL(15,2) NOT NULL,
  variance DECIMAL(15,2) NOT NULL,

  -- Timestamp
  snapshot_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_stakes_wallet ON stakes(wallet_address);
CREATE INDEX idx_stakes_status ON stakes(status);
CREATE INDEX idx_stakes_unlock ON stakes(unlock_date) WHERE status = 'active';
CREATE INDEX idx_yields_stake ON stake_yields(stake_id);
CREATE INDEX idx_yields_claimed ON stake_yields(claimed);
CREATE INDEX idx_withdrawals_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawals_stake ON withdrawal_requests(stake_id);

-- Enable Row Level Security
ALTER TABLE stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stake_yields ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stakes
CREATE POLICY "Users can view their own stakes" ON stakes
  FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can create stakes" ON stakes
  FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- RLS Policies for yields
CREATE POLICY "Users can view their yields" ON stake_yields
  FOR SELECT USING (
    stake_id IN (
      SELECT id FROM stakes
      WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- RLS Policies for withdrawals
CREATE POLICY "Users can view their withdrawal requests" ON withdrawal_requests
  FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can create withdrawal requests" ON withdrawal_requests
  FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Public read for treasury snapshots (transparency)
CREATE POLICY "Anyone can view treasury snapshots" ON treasury_snapshots
  FOR SELECT USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_stakes_updated_at
  BEFORE UPDATE ON stakes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for user stake summary
CREATE OR REPLACE VIEW user_stake_summary AS
SELECT
  s.wallet_address,
  COUNT(*) as total_stakes,
  SUM(s.amount) as total_staked,
  SUM(CASE WHEN s.status = 'active' THEN s.amount ELSE 0 END) as active_amount,
  SUM(COALESCE(y.amount, 0)) as total_yield_earned,
  SUM(CASE WHEN y.claimed = false THEN y.amount ELSE 0 END) as claimable_yield,
  MAX(s.unlock_date) as next_unlock_date
FROM stakes s
LEFT JOIN stake_yields y ON s.id = y.stake_id
GROUP BY s.wallet_address;

-- Create function to calculate total claimable yield for a stake
CREATE OR REPLACE FUNCTION get_claimable_yield(stake_uuid UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM stake_yields
  WHERE stake_id = stake_uuid AND claimed = false;
$$ LANGUAGE SQL;

-- Create function to process daily yields
CREATE OR REPLACE FUNCTION calculate_daily_yields()
RETURNS INTEGER AS $$
DECLARE
  stake_record RECORD;
  daily_yield DECIMAL(10,6);
  yields_created INTEGER := 0;
BEGIN
  -- Loop through all active stakes
  FOR stake_record IN
    SELECT * FROM stakes WHERE status = 'active'
  LOOP
    -- Calculate daily yield: (amount * APY / 100) / 365
    daily_yield := (stake_record.amount * stake_record.apy / 100.0) / 365.0;

    -- Insert yield record
    INSERT INTO stake_yields (stake_id, amount, source, calculated_at)
    VALUES (stake_record.id, daily_yield, 'validator', NOW());

    yields_created := yields_created + 1;
  END LOOP;

  RETURN yields_created;
END;
$$ LANGUAGE plpgsql;

-- Create function to get platform staking stats
CREATE OR REPLACE FUNCTION get_staking_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_staked', COALESCE(SUM(amount), 0),
    'active_stakes', COUNT(*),
    'unique_stakers', COUNT(DISTINCT wallet_address),
    'average_stake', COALESCE(AVG(amount), 0),
    'total_yield_distributed', (
      SELECT COALESCE(SUM(amount), 0)
      FROM stake_yields
      WHERE claimed = true
    ),
    'tier_breakdown', (
      SELECT json_object_agg(tier, tier_stats)
      FROM (
        SELECT
          tier,
          json_build_object(
            'count', COUNT(*),
            'total_amount', SUM(amount),
            'avg_apy', AVG(apy)
          ) as tier_stats
        FROM stakes
        WHERE status = 'active'
        GROUP BY tier
      ) tier_data
    )
  ) INTO stats
  FROM stakes
  WHERE status = 'active';

  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON stakes, stake_yields, withdrawal_requests, treasury_snapshots TO authenticated;
GRANT SELECT ON user_stake_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_claimable_yield TO authenticated;
GRANT EXECUTE ON FUNCTION get_staking_stats TO anon, authenticated;
