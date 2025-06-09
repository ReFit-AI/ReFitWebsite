# Production Setup Guide

## Overview

The ReFit platform is now configured for production use with:
- Real Supabase database (no mocks)
- Live Shippo shipping integration
- Mainnet Solana transactions
- Production webhooks and email

## What Changed

1. **Removed all mock services** - The app now only uses real APIs
2. **Hardcoded production mode** - No more feature flags needed
3. **Updated environment variables** - Simplified configuration

## Setting Up Services

### 1. Supabase Setup

1. Create account at https://supabase.com
2. Create new project
3. Run the database migration:
   ```sql
   -- See src/services/supabase-schema.sql for complete schema
   ```
4. Copy your project URL and anon key to `.env`

### 2. Shippo Setup

1. Create account at https://goshippo.com
2. Get your live API key from settings
3. Configure webhook endpoint for tracking updates
4. Add API key to `.env`

### 3. Solana Setup

1. Deploy your escrow program to mainnet
2. Create platform wallet for receiving funds
3. Fund wallet with SOL for transactions
4. Add program ID and wallet address to `.env`

### 4. Redis Setup (Upstash)

1. Create account at https://console.upstash.com
2. Create Redis database
3. Copy REST URL and token to `.env`

### 5. Email Setup

Choose SendGrid or Resend:
- SendGrid: https://sendgrid.com
- Resend: https://resend.com

Get API key and configure sender email.

## Deployment Checklist

- [ ] All environment variables set in `.env`
- [ ] Supabase database migrated
- [ ] Shippo webhook endpoint configured
- [ ] Solana program deployed and wallet funded
- [ ] Redis instance created
- [ ] Email service configured
- [ ] Built with `npm run build`
- [ ] Deployed to hosting service

## Common Issues

1. **White screen**: Check browser console for missing env variables
2. **Supabase errors**: Verify URL and anon key are correct
3. **Shippo errors**: Ensure using live API key (not test)
4. **Solana errors**: Check RPC endpoint and program ID

## Support

For issues, check:
- Browser console for errors
- Network tab for failed API calls
- Supabase logs for database errors
- Shippo dashboard for shipping issues
