# ReFit Production Deployment Guide

This guide provides step-by-step instructions for deploying the ReFit platform's backend infrastructure to production.

## Prerequisites

- Node.js 20+ and npm
- Supabase account and project
- Shippo account
- Redis/Upstash account for job queues
- Email service provider (SendGrid, Postmark, etc.)
- Vercel/Netlify account for hosting

## 1. Supabase Setup

### Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Note down your project URL and keys

### Deploy Database Schema

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize Supabase in your project
supabase init

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy migration
supabase db push
```

### Configure Authentication

1. Go to Authentication > Providers
2. Disable email auth (we use wallet-based auth)
3. Configure JWT expiry to 7 days

### Enable Row Level Security

The migration script already includes RLS policies, but verify they're enabled:

1. Go to Database > Tables
2. For each table, ensure RLS is enabled
3. Review policies for proper access control

## 2. Shippo Configuration

### Get API Credentials

1. Sign up at [Shippo](https://goshippo.com)
2. Go to Settings > API
3. Copy your Live API Token (not test token for production)

### Configure Webhooks

1. Go to Settings > Webhooks
2. Add webhook endpoint: `https://yourdomain.com/api/webhooks/shippo`
3. Select events:
   - `track_updated`
   - `transaction_created`
   - `transaction_updated`
4. Copy the webhook signing key

### Set Up Warehouse Address

1. Go to Settings > Addresses
2. Add your warehouse address
3. Set as default sender address

## 3. Redis/Upstash Setup

### Create Redis Instance

1. Sign up at [Upstash](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token

### Configure for BullMQ

No additional configuration needed - BullMQ will use the Upstash Redis instance.

## 4. Environment Variables

Create a `.env.production` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Shippo
SHIPPO_API_KEY=YOUR_LIVE_SHIPPO_KEY
SHIPPO_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://YOUR_REDIS.upstash.io
UPSTASH_REDIS_REST_TOKEN=YOUR_REDIS_TOKEN

# Email Service (example for SendGrid)
EMAIL_API_KEY=YOUR_SENDGRID_API_KEY
EMAIL_FROM=noreply@refit.trade

# Solana
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.mainnet-beta.solana.com
ESCROW_PROGRAM_ID=YOUR_ESCROW_PROGRAM_ID

# App Configuration
NEXT_PUBLIC_APP_URL=https://refit.trade
NODE_ENV=production

# Feature Flags
REACT_APP_USE_SUPABASE=true
REACT_APP_USE_SHIPPO=true
REACT_APP_USE_REAL_PAYMENTS=true
REACT_APP_ENABLE_WEBHOOKS=true
```

## 5. Deploy to Vercel

### Install Vercel CLI

```bash
npm install -g vercel
```

### Deploy

```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env pull .env.production
```

### Configure API Routes

Vercel automatically detects Next.js API routes. Ensure your `vercel.json` includes:

```json
{
  "functions": {
    "pages/api/webhooks/shippo.js": {
      "maxDuration": 30
    },
    "pages/api/orders/create.js": {
      "maxDuration": 30
    }
  }
}
```

## 6. Deploy Background Worker

### Option 1: Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Deploy worker
railway up

# Set environment variables
railway variables set KEY=VALUE
```

### Option 2: Render.com

1. Create a new Background Worker service
2. Connect your GitHub repo
3. Set build command: `npm install`
4. Set start command: `npm run worker:label`
5. Add all environment variables

### Option 3: Fly.io

Create `fly.toml`:

```toml
app = "refit-worker"

[processes]
worker = "npm run worker:label"

[env]
NODE_ENV = "production"

[[services]]
internal_port = 8080
protocol = "tcp"
```

Deploy:

```bash
fly launch
fly secrets set KEY=VALUE
fly deploy
```

## 7. Monitoring and Logging

### Set up Sentry

```bash
npm install @sentry/node @sentry/nextjs
```

Configure in your app:

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Set up Logging

Use a service like LogDNA or Papertrail:

```javascript
import winston from 'winston';
import { LogdnaWinston } from 'logdna-winston';

const logger = winston.createLogger({
  transports: [
    new LogdnaWinston({
      key: process.env.LOGDNA_KEY,
      app: 'refit-backend',
      env: process.env.NODE_ENV,
    })
  ]
});
```

## 8. Data Migration

### Migrate Existing Users

1. Deploy the app with feature flags disabled:
   ```env
   REACT_APP_USE_SUPABASE=false
   ```

2. Run migration script in production:
   ```bash
   node scripts/migrate-to-supabase.js
   ```

3. Verify data in Supabase dashboard

4. Enable feature flags:
   ```env
   REACT_APP_USE_SUPABASE=true
   ```

## 9. Testing Production

### Smoke Tests

1. Create a test order
2. Verify webhook receives updates
3. Check worker processes label purchase
4. Verify real-time updates work

### Load Testing

Use k6 or Artillery:

```javascript
// k6-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100,
  duration: '30s',
};

export default function() {
  let response = http.get('https://refit.trade/api/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}
```

## 10. Rollback Plan

### Database Rollback

```bash
# List migrations
supabase db migrations list

# Rollback to specific migration
supabase db reset --to VERSION
```

### Application Rollback

```bash
# Vercel rollback
vercel rollback

# Or revert git commit and redeploy
git revert HEAD
git push
vercel --prod
```

## Security Checklist

- [ ] All API keys are in environment variables
- [ ] Supabase RLS policies are enabled
- [ ] Webhook signatures are verified
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] SSL certificates are valid
- [ ] Security headers are set

## Maintenance

### Regular Tasks

1. **Weekly**: Review error logs and metrics
2. **Monthly**: Update dependencies
3. **Quarterly**: Security audit
4. **Annually**: Review and rotate API keys

### Monitoring Alerts

Set up alerts for:
- API errors > 1% of requests
- Worker queue depth > 1000
- Database connection errors
- Shippo webhook failures

## Support

For issues or questions:
- GitHub Issues: [github.com/refit/issues](https://github.com/refit/issues)
- Email: support@refit.trade
- Discord: [discord.gg/refit](https://discord.gg/refit)
