-- Liquidity Pool System - Simple & Bulletproof
-- 2% weekly returns + RFT token tracking

-- Main pool state (only one row)
CREATE TABLE liquidity_pool (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Enforce single row

  -- Pool financials
  total_deposits DECIMAL(15,2) DEFAULT 0,         -- Total USDC deposited all time
  total_withdrawals DECIMAL(15,2) DEFAULT 0,      -- Total USDC withdrawn all time
  current_balance DECIMAL(15,2) DEFAULT 0,        -- Current USDC in pool

  -- Operations
  total_profits DECIMAL(15,2) DEFAULT 0,          -- Total profits generated
  total_distributed DECIMAL(15,2) DEFAULT 0,      -- Total USDC distributed to LPs
  platform_fees_collected DECIMAL(15,2) DEFAULT 0, -- Your fees collected

  -- Stats
  total_depositors INTEGER DEFAULT 0,             -- Unique depositors count
  active_depositors INTEGER DEFAULT 0,            -- Currently active

  -- RFT tracking
  rft_per_dollar_per_week DECIMAL(10,6) DEFAULT 1, -- 1 RFT per $1 per week
  rft_bonus_active BOOLEAN DEFAULT true,           -- First 100 users bonus
  rft_bonus_slots_remaining INTEGER DEFAULT 100,   -- Countdown

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User deposits (positions)
CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User info
  wallet_address TEXT NOT NULL,

  -- Deposit details
  amount DECIMAL(15,2) NOT NULL,                   -- Initial deposit amount
  deposit_tx TEXT NOT NULL UNIQUE,                 -- Solana transaction signature

  -- Current state
  current_value DECIMAL(15,2) NOT NULL,           -- Current value (principal + earnings)
  total_earned_usdc DECIMAL(15,2) DEFAULT 0,      -- Total USDC earned
  total_withdrawn DECIMAL(15,2) DEFAULT 0,        -- Total withdrawn

  -- RFT tracking
  rft_earned DECIMAL(15,2) DEFAULT 0,             -- Total RFT tokens earned
  rft_rate DECIMAL(10,6) DEFAULT 1,               -- Rate when they joined (for bonuses)
  has_early_bonus BOOLEAN DEFAULT false,          -- Got early bird bonus

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'paused')),

  -- Timestamps
  deposited_at TIMESTAMP DEFAULT NOW(),
  last_distribution_at TIMESTAMP DEFAULT NOW(),   -- Last time they received distribution
  withdrawn_at TIMESTAMP
);

-- Weekly distributions tracking
CREATE TABLE distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distribution info
  week_number INTEGER NOT NULL,                   -- Week 1, 2, 3, etc.
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,

  -- Pool snapshot at distribution
  pool_balance DECIMAL(15,2) NOT NULL,           -- Total pool size
  total_profit DECIMAL(15,2) NOT NULL,           -- Profit this week

  -- Distribution details
  lp_distribution DECIMAL(15,2) NOT NULL,        -- Amount to LPs (profit * 0.8)
  platform_fee DECIMAL(15,2) NOT NULL,           -- Your fee (profit * 0.2)
  distribution_rate DECIMAL(10,6) NOT NULL,      -- % each LP gets (0.02 = 2%)

  -- RFT distribution
  rft_distributed DECIMAL(15,2) NOT NULL,        -- Total RFT distributed this week

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  processed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual distribution records
CREATE TABLE distribution_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links
  distribution_id UUID REFERENCES distributions(id),
  deposit_id UUID REFERENCES deposits(id),
  wallet_address TEXT NOT NULL,

  -- Amounts
  usdc_earned DECIMAL(15,2) NOT NULL,            -- USDC earned this distribution
  rft_earned DECIMAL(15,2) NOT NULL,             -- RFT earned this distribution

  -- Snapshot
  deposit_balance DECIMAL(15,2) NOT NULL,        -- Their balance at distribution

  created_at TIMESTAMP DEFAULT NOW()
);

-- Withdrawal requests
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User info
  deposit_id UUID REFERENCES deposits(id),
  wallet_address TEXT NOT NULL,

  -- Withdrawal details
  amount DECIMAL(15,2) NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),

  -- Transaction
  withdrawal_tx TEXT,                            -- Solana transaction signature

  -- Timestamps
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Admin actions log (for transparency)
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  action_type TEXT NOT NULL,                     -- 'distribution', 'withdrawal', 'fee_collection', etc.
  description TEXT,
  amount DECIMAL(15,2),
  tx_signature TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_deposits_wallet ON deposits(wallet_address);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_distributions_week ON distributions(week_number);
CREATE INDEX idx_distribution_records_wallet ON distribution_records(wallet_address);
CREATE INDEX idx_withdrawals_status ON withdrawal_requests(status);

-- Initialize pool
INSERT INTO liquidity_pool (
  total_deposits,
  current_balance,
  rft_per_dollar_per_week,
  rft_bonus_active,
  rft_bonus_slots_remaining
) VALUES (
  0,    -- No deposits yet
  0,    -- No balance yet
  1,    -- 1 RFT per dollar per week
  true, -- Bonus active
  100   -- 100 slots for early birds
);

-- Helper functions

-- Function to calculate current pool value
CREATE OR REPLACE FUNCTION get_pool_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_deposits', total_deposits,
    'current_balance', current_balance,
    'total_profits', total_profits,
    'total_distributed', total_distributed,
    'platform_fees', platform_fees_collected,
    'active_depositors', active_depositors,
    'weekly_return_rate', 0.02, -- 2% hardcoded
    'rft_bonus_remaining', rft_bonus_slots_remaining,
    'total_depositors', total_depositors
  ) INTO stats
  FROM liquidity_pool
  WHERE id = 1;

  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to process weekly distribution
CREATE OR REPLACE FUNCTION process_weekly_distribution(
  week_profit DECIMAL,
  platform_fee_rate DECIMAL DEFAULT 0.20 -- 20% platform fee
)
RETURNS UUID AS $$
DECLARE
  distribution_id UUID;
  lp_share DECIMAL;
  platform_share DECIMAL;
  current_week INTEGER;
BEGIN
  -- Calculate shares
  lp_share := week_profit * (1 - platform_fee_rate);
  platform_share := week_profit * platform_fee_rate;

  -- Get current week number
  SELECT COALESCE(MAX(week_number), 0) + 1 INTO current_week FROM distributions;

  -- Create distribution record
  INSERT INTO distributions (
    week_number,
    week_start,
    week_end,
    pool_balance,
    total_profit,
    lp_distribution,
    platform_fee,
    distribution_rate,
    rft_distributed,
    status
  ) VALUES (
    current_week,
    date_trunc('week', CURRENT_DATE),
    date_trunc('week', CURRENT_DATE) + interval '6 days',
    (SELECT current_balance FROM liquidity_pool WHERE id = 1),
    week_profit,
    lp_share,
    platform_share,
    0.02, -- 2% weekly
    (SELECT SUM(amount) FROM deposits WHERE status = 'active'), -- 1 RFT per dollar
    'pending'
  ) RETURNING id INTO distribution_id;

  -- Update pool stats
  UPDATE liquidity_pool
  SET
    total_profits = total_profits + week_profit,
    platform_fees_collected = platform_fees_collected + platform_share,
    updated_at = NOW()
  WHERE id = 1;

  RETURN distribution_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user position
CREATE OR REPLACE FUNCTION get_user_position(user_wallet TEXT)
RETURNS JSON AS $$
DECLARE
  position JSON;
BEGIN
  SELECT json_build_object(
    'deposits', COALESCE(json_agg(
      json_build_object(
        'id', id,
        'amount', amount,
        'current_value', current_value,
        'total_earned_usdc', total_earned_usdc,
        'rft_earned', rft_earned,
        'status', status,
        'deposited_at', deposited_at
      )
    ), '[]'::json)
  ) INTO position
  FROM deposits
  WHERE wallet_address = user_wallet
  AND status = 'active';

  RETURN position;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own deposits
CREATE POLICY "Users can view own deposits" ON deposits
  FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can view their own withdrawals
CREATE POLICY "Users can view own withdrawals" ON withdrawal_requests
  FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can view their own distributions
CREATE POLICY "Users can view own distributions" ON distribution_records
  FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Public can view pool stats
CREATE POLICY "Public can view pool stats" ON liquidity_pool
  FOR SELECT USING (true);

-- Public can view distributions (transparency)
CREATE POLICY "Public can view distributions" ON distributions
  FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON liquidity_pool TO anon, authenticated;
GRANT SELECT ON distributions TO anon, authenticated;
GRANT ALL ON deposits TO authenticated;
GRANT ALL ON withdrawal_requests TO authenticated;
GRANT ALL ON distribution_records TO authenticated;
GRANT EXECUTE ON FUNCTION get_pool_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_position TO authenticated;