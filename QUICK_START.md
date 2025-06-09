# Production Deployment Guide

## Environment Setup

To deploy the ReFit platform in production, you need to configure the following services:

### 1. Required Services

- **Supabase**: Database and authentication
- **Shippo**: Shipping and logistics
- **Upstash Redis**: Background job processing
- **Email Provider**: SendGrid or Resend for notifications
- **Solana**: Mainnet RPC and wallet configuration

### 2. Environment Variables

Create a `.env` file with your production credentials:

```bash
# Supabase (Get from: https://supabase.com/dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Shippo (Get from: https://goshippo.com/settings/api/)
VITE_SHIPPO_API_KEY=shippo_live_your_api_key
VITE_SHIPPO_WEBHOOK_SECRET=your_webhook_secret

# Redis (Get from: https://console.upstash.com/)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Email (Choose SendGrid or Resend)
EMAIL_API_KEY=your_email_api_key
EMAIL_FROM=noreply@refit.trade

# Solana
VITE_SOLANA_RPC_HOST=https://api.mainnet-beta.solana.com
VITE_PLATFORM_WALLET=your_platform_wallet_address
VITE_ESCROW_PROGRAM_ID=your_deployed_program_id

# App Configuration
VITE_APP_URL=https://refit.trade
VITE_API_BASE_URL=/api
VITE_WEBHOOK_URL=/api/webhooks

NODE_ENV=production
```

### 3. Production Configuration

The app is now configured to run in production mode only:
- ✅ All services use real APIs (no mocks)
- ✅ Shippo runs in production mode
- ✅ Real payment processing enabled
- ✅ Webhooks enabled for real-time updates

### 4. Deployment Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Deploy the `dist` folder to your hosting service

### 5. Required API Keys

Before deploying, ensure you have:
- [ ] Supabase project created with database schema
- [ ] Shippo account with live API key
- [ ] Upstash Redis instance
- [ ] Email service configured
- [ ] Solana escrow program deployed to mainnet
- [ ] Platform wallet with SOL for transactions

## Security Notes

- Never commit `.env` files to git
- Use environment variables in your hosting platform
- Rotate API keys regularly
- Monitor usage and set up alerts
