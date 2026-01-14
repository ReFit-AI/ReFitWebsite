# ReFit Liquidity Pool Setup Guide

## Quick Start

### 1. Database Setup
Run these migrations in your Supabase dashboard:
1. `/supabase/migrations/005_liquidity_pool.sql` - Core tables
2. `/supabase/migrations/006_pool_rpc_functions.sql` - Helper functions

### 2. Environment Variables
Add to `.env.local`:
```bash
# Admin secret for protected endpoints
ADMIN_SECRET=your-secret-key-here
NEXT_PUBLIC_ADMIN_SECRET=your-secret-key-here

# Squads multisig vault (create at app.squads.so)
NEXT_PUBLIC_SQUADS_VAULT=your-vault-address
NEXT_PUBLIC_OPS_WALLET=your-operations-wallet

# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### 3. Squads Multisig Setup
1. Go to https://app.squads.so
2. Create new Squad called "ReFit LP Vault"
3. Set 2/3 signature threshold
4. Add the vault address to your `.env.local`

### 4. Test Flow
1. Connect wallet on `/stake`
2. Enter deposit amount ($1000 minimum)
3. Click deposit (creates mock transaction for testing)
4. Check admin dashboard at `/admin`

## How It Works

### User Flow
1. **Deposit**: Users deposit USDC to the Squads vault
2. **Earn**: 2% weekly returns + RFT tokens
3. **Withdraw**: Request withdrawal, processed within 7 days

### Admin Flow
1. **Receive Deposits**: USDC goes to Squads vault
2. **Buy Phones**: Use funds to purchase inventory
3. **Sell Phones**: Liquidate to wholesale buyers (10-20% margin)
4. **Distribute Profits**: Weekly distribution via admin dashboard
   - 80% to LPs (2% of their deposit)
   - 20% platform fee

### Weekly Operations
Every Monday:
1. Calculate week's profits from phone sales
2. Go to `/admin` dashboard
3. Enter total profit amount
4. Click "Process Distribution"
5. System automatically:
   - Calculates each LP's share (2% of deposit)
   - Awards RFT tokens (1 per $1 per week)
   - Updates all balances
   - Logs the distribution

## Database Structure

### Core Tables
- `liquidity_pool` - Single row tracking pool stats
- `deposits` - User deposit records
- `distributions` - Weekly distribution history
- `distribution_records` - Individual LP payouts
- `withdrawal_requests` - Pending withdrawals
- `admin_actions` - Audit log

### Key Features
- Automatic 2% weekly calculation
- RFT bonus for first 100 depositors (1.5x rate)
- Transparent distribution history
- Row-level security for user data

## Security

### Funds Security
- All USDC held in Squads multisig
- 2/3 signatures required for withdrawals
- Transparent on-chain transactions

### Admin Security
- Protected endpoints require `ADMIN_SECRET`
- All actions logged in `admin_actions` table
- Distribution history publicly viewable

## Testing Checklist

- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Deposit flow works
- [ ] Admin can view deposits
- [ ] Distribution calculation correct
- [ ] Pool stats update properly

## Production Checklist

- [ ] Create production Squads vault
- [ ] Set strong ADMIN_SECRET
- [ ] Enable Supabase RLS policies
- [ ] Set up weekly distribution cron
- [ ] Add real USDC transfer logic
- [ ] Implement withdrawal queue
- [ ] Add email notifications
- [ ] Set up monitoring/alerts

## Support

For issues, check:
1. Browser console for errors
2. Network tab for API responses
3. Supabase logs for database errors
4. Ensure all env variables are set