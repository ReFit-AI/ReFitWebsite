-- Upgrade Forever Tables
-- Run this in your Supabase SQL editor

-- Create upgrade_funds table
CREATE TABLE IF NOT EXISTS upgrade_funds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  device_traded TEXT NOT NULL,
  trade_value DECIMAL(10, 2) NOT NULL,
  staked_amount DECIMAL(10, 2) NOT NULL,
  instant_payout DECIMAL(10, 2) NOT NULL,
  device_goal TEXT,
  device_goal_price DECIMAL(10, 2),
  current_apy DECIMAL(5, 2) NOT NULL,
  estimated_goal_date TIMESTAMP,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'achieved')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for wallet lookups
CREATE INDEX idx_upgrade_funds_wallet ON upgrade_funds(wallet_address);
CREATE INDEX idx_upgrade_funds_status ON upgrade_funds(status);

-- Create earnings_history table to track actual earnings
CREATE TABLE IF NOT EXISTS earnings_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_id UUID REFERENCES upgrade_funds(id) ON DELETE CASCADE,
  epoch INTEGER NOT NULL,
  earned_amount DECIMAL(10, 6) NOT NULL,
  apy_at_time DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create validator_stats table
CREATE TABLE IF NOT EXISTS validator_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  epoch INTEGER NOT NULL,
  apy DECIMAL(5, 2) NOT NULL,
  uptime DECIMAL(5, 2) NOT NULL,
  commission DECIMAL(5, 2) NOT NULL,
  total_staked DECIMAL(15, 2) NOT NULL,
  active_funds INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create family_groups table for family stacking
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  total_staked DECIMAL(10, 2) DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  nickname TEXT,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, wallet_address)
);

-- Enable Row Level Security
ALTER TABLE upgrade_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Create policies for upgrade_funds
CREATE POLICY "Users can view their own funds" ON upgrade_funds
  FOR SELECT USING (wallet_address = current_user);

CREATE POLICY "Users can create their own funds" ON upgrade_funds
  FOR INSERT WITH CHECK (wallet_address = current_user);

CREATE POLICY "Users can update their own funds" ON upgrade_funds
  FOR UPDATE USING (wallet_address = current_user);

-- Create public read policy for validator stats (everyone can see network stats)
CREATE POLICY "Public can view validator stats" ON validator_stats
  FOR SELECT USING (true);

-- Create view for leaderboard (anonymized)
CREATE OR REPLACE VIEW upgrade_leaderboard AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY staked_amount DESC) as rank,
  SUBSTRING(wallet_address, 1, 4) || '...' || SUBSTRING(wallet_address, LENGTH(wallet_address) - 3) as wallet,
  staked_amount,
  device_goal,
  estimated_goal_date,
  created_at
FROM upgrade_funds
WHERE status = 'active'
ORDER BY staked_amount DESC
LIMIT 100;

-- Create function to calculate total platform stats
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_staked', COALESCE(SUM(staked_amount), 0),
    'active_funds', COUNT(*),
    'total_users', COUNT(DISTINCT wallet_address),
    'average_stake', COALESCE(AVG(staked_amount), 0),
    'total_devices_traded', COUNT(*),
    'most_popular_goal', (
      SELECT device_goal 
      FROM upgrade_funds 
      WHERE device_goal IS NOT NULL
      GROUP BY device_goal 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    )
  ) INTO stats
  FROM upgrade_funds
  WHERE status = 'active';
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_upgrade_funds_updated_at
  BEFORE UPDATE ON upgrade_funds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample validator stats (for demo)
INSERT INTO validator_stats (epoch, apy, uptime, commission, total_staked, active_funds)
VALUES (500, 6.5, 99.8, 5.0, 0, 0);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;