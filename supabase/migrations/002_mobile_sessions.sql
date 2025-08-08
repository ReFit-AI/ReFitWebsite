-- Mobile sessions table for secure mobile authentication
-- This migration adds the missing mobile_sessions table referenced in the codebase

-- Create mobile_sessions table
CREATE TABLE IF NOT EXISTS mobile_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE, -- Store as hashed value
  wallet_address TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Device information
  user_agent TEXT,
  ip_address TEXT,
  device_type TEXT,
  browser TEXT,
  
  -- Activity tracking
  last_used TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Link to profile (optional, can be null initially)
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_mobile_sessions_token ON mobile_sessions(session_token);
CREATE INDEX idx_mobile_sessions_wallet ON mobile_sessions(wallet_address);
CREATE INDEX idx_mobile_sessions_expires ON mobile_sessions(expires_at);

-- Enable Row Level Security
ALTER TABLE mobile_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Sessions are private to the wallet owner
CREATE POLICY "Users can view own sessions"
  ON mobile_sessions FOR SELECT
  USING (wallet_address = current_setting('app.current_wallet', true));

CREATE POLICY "Users can delete own sessions"
  ON mobile_sessions FOR DELETE
  USING (wallet_address = current_setting('app.current_wallet', true));

-- System can insert sessions (no user restriction on INSERT)
CREATE POLICY "System can insert sessions"
  ON mobile_sessions FOR INSERT
  WITH CHECK (true);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM mobile_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up expired sessions
-- Note: This requires pg_cron extension which may not be available
-- You can run this cleanup function periodically from your application instead