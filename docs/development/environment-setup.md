# Environment Variables Setup

This guide explains all environment variables used in the ReFit platform and how to configure them for different environments.

## Environment Files

The project uses different environment files for different contexts:

- `.env.local` - Local development (gitignored)
- `.env.production` - Production values (gitignored)
- `.env.example` - Example template (committed to git)

## Variable Reference

### Public Variables (Client-side)

Variables prefixed with `NEXT_PUBLIC_` are available in the browser:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com
NEXT_PUBLIC_PLATFORM_WALLET=your_platform_wallet_address
NEXT_PUBLIC_ESCROW_PROGRAM_ID=your_program_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ReFit

# Feature Flags
NEXT_PUBLIC_USE_SUPABASE=true
NEXT_PUBLIC_USE_SHIPPO=true
NEXT_PUBLIC_USE_REAL_PAYMENTS=false
NEXT_PUBLIC_ENABLE_WEBHOOKS=false
```

### Server-side Variables

These are only available in API routes and server components:

```env
# Supabase Service Role (server-only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Shippo Configuration
SHIPPO_API_KEY=shippo_test_your_key
SHIPPO_WEBHOOK_SECRET=your_webhook_secret

# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Email Service
EMAIL_API_KEY=your_api_key
EMAIL_FROM=noreply@refit.trade
EMAIL_PROVIDER=sendgrid # or 'resend'

# Monitoring (optional)
SENTRY_DSN=https://your-sentry-dsn
```

## Environment-Specific Settings

### Development

For local development, use test/sandbox credentials:

```env
# .env.local
NODE_ENV=development
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com
SHIPPO_API_KEY=shippo_test_xxxxx
NEXT_PUBLIC_USE_REAL_PAYMENTS=false
```

### Staging

For staging environments, use production services with test data:

```env
# .env.staging
NODE_ENV=production
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.testnet.solana.com
SHIPPO_API_KEY=shippo_test_xxxxx
NEXT_PUBLIC_USE_REAL_PAYMENTS=false
```

### Production

For production, use live credentials:

```env
# .env.production
NODE_ENV=production
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.mainnet-beta.solana.com
SHIPPO_API_KEY=shippo_live_xxxxx
NEXT_PUBLIC_USE_REAL_PAYMENTS=true
```

## Service Configuration

### Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Find credentials in Settings > API
3. Use anon key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Use service role key for `SUPABASE_SERVICE_ROLE_KEY`

### Shippo Setup

1. Create account at [goshippo.com](https://goshippo.com)
2. For development: Use test API key
3. For production: Use live API key
4. Set up webhooks and get signing secret

### Solana Setup

1. **Development**: Use devnet
   - RPC: `https://api.devnet.solana.com`
   - Get devnet SOL from faucet
   
2. **Production**: Use mainnet
   - RPC: `https://api.mainnet-beta.solana.com`
   - Or use a private RPC provider

### Redis Setup (Upstash)

1. Create account at [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy REST URL and token

### Email Setup

Choose one provider:

**SendGrid**:
```env
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.xxxxx
```

**Resend**:
```env
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_xxxxx
```

## Feature Flags

Control feature availability:

```env
# Enable/disable Supabase integration
NEXT_PUBLIC_USE_SUPABASE=true

# Enable/disable Shippo integration
NEXT_PUBLIC_USE_SHIPPO=true

# Enable real payments (mainnet)
NEXT_PUBLIC_USE_REAL_PAYMENTS=false

# Enable webhook processing
NEXT_PUBLIC_ENABLE_WEBHOOKS=false
```

## Security Best Practices

1. **Never commit `.env.local` or `.env.production`**
   - Add to `.gitignore`
   - Use `.env.example` as template

2. **Use strong, unique keys**
   - Generate random strings for secrets
   - Rotate keys regularly

3. **Limit key permissions**
   - Use read-only keys where possible
   - Restrict API key scopes

4. **Environment isolation**
   - Never use production keys in development
   - Use separate projects/accounts for each environment

## Vercel Deployment

When deploying to Vercel:

1. Go to Project Settings > Environment Variables
2. Add each variable for the appropriate environment
3. Variables are automatically encrypted
4. Redeploy after changing variables

## Troubleshooting

### Variable not working?

1. **Client-side access**: Ensure it starts with `NEXT_PUBLIC_`
2. **Restart server**: Next.js caches env vars
3. **Check spelling**: Variable names are case-sensitive
4. **Verify in code**: Use `console.log(process.env.NEXT_PUBLIC_VAR)`

### Missing variables?

Check for required variables on startup:

```javascript
// lib/env-check.js
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  // ... other required vars
]

required.forEach(key => {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`)
  }
})
```

## Local Development Tips

1. Copy `.env.example` to `.env.local`
2. Fill in development/test credentials
3. Use devnet for Solana development
4. Use test mode for payment providers
5. Consider using local Supabase for offline development