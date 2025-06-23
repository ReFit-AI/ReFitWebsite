# ReFit Production Deployment Guide

This comprehensive guide covers deploying the ReFit platform to production, including all backend services, infrastructure setup, and monitoring.

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Shippo account (for shipping integration)
- Redis/Upstash account (for job queues)
- Email service provider (SendGrid, Resend, etc.)
- Vercel account (recommended for hosting)
- Solana wallet and mainnet RPC access

## 1. Database Setup (Supabase)

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

1. Go to Database > Tables
2. For each table, ensure RLS is enabled
3. Review policies for proper access control

## 2. Shipping Integration (Shippo)

### Get API Credentials

1. Sign up at [Shippo](https://goshippo.com)
2. Go to Settings > API
3. Copy your **Live API Token** (not test token)

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

## 3. Job Queue Setup (Redis/Upstash)

### Create Redis Instance

1. Sign up at [Upstash](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token

## 4. Email Service Setup

Choose one of the following providers:

### Option A: SendGrid
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create API key with full access
3. Configure sender authentication

### Option B: Resend
1. Sign up at [Resend](https://resend.com)
2. Create API key
3. Verify sender domain

## 5. Solana Configuration

### Deploy Smart Contracts

1. Deploy your escrow program to mainnet
2. Note the program ID
3. Create platform wallet for receiving funds
4. Fund wallet with SOL for transaction fees

## 6. Environment Variables

Create a `.env.production` file with all required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Shippo
SHIPPO_API_KEY=shippo_live_YOUR_KEY
SHIPPO_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://YOUR_REDIS.upstash.io
UPSTASH_REDIS_REST_TOKEN=YOUR_REDIS_TOKEN

# Email Service
EMAIL_API_KEY=YOUR_EMAIL_API_KEY
EMAIL_FROM=noreply@refit.trade
EMAIL_PROVIDER=sendgrid # or 'resend'

# Solana
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PLATFORM_WALLET=YOUR_PLATFORM_WALLET
NEXT_PUBLIC_ESCROW_PROGRAM_ID=YOUR_PROGRAM_ID

# App Configuration
NEXT_PUBLIC_APP_URL=https://refit.trade
NODE_ENV=production

# Feature Flags (all enabled for production)
NEXT_PUBLIC_USE_SUPABASE=true
NEXT_PUBLIC_USE_SHIPPO=true
NEXT_PUBLIC_USE_REAL_PAYMENTS=true
NEXT_PUBLIC_ENABLE_WEBHOOKS=true
```

## 7. Deploy to Vercel

### Automatic Deployment

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Configure environment variables
4. Deploy

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Build the project
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add VARIABLE_NAME
```

### Configure Function Timeouts

Create `vercel.json`:

```json
{
  "functions": {
    "app/api/webhooks/shippo/route.js": {
      "maxDuration": 30
    },
    "app/api/shipping/purchase-label/route.js": {
      "maxDuration": 30
    }
  }
}
```

## 8. Deploy Background Workers

Background workers handle asynchronous tasks like label purchases.

### Option A: Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init

# Deploy worker
railway up

# Set environment variables
railway variables set KEY=VALUE
```

### Option B: Render.com

1. Create a new Background Worker service
2. Connect your GitHub repo
3. Set build command: `npm install`
4. Set start command: `npm run worker:label`
5. Add all environment variables

### Option C: Vercel Cron Jobs

For serverless workers, use Vercel Cron:

```javascript
// app/api/cron/process-labels/route.js
export async function GET(request) {
  // Process pending labels
}
```

Configure in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/process-labels",
    "schedule": "*/5 * * * *"
  }]
}
```

## 9. Monitoring and Logging

### Error Tracking with Sentry

```bash
npm install @sentry/nextjs
```

Run the setup wizard:
```bash
npx @sentry/wizard@latest -i nextjs
```

### Application Monitoring

1. Use Vercel Analytics for performance monitoring
2. Set up Uptime monitoring with Better Uptime or Pingdom
3. Configure alerts for critical errors

## 10. Security Checklist

Before going live, ensure:

- [ ] All API keys are in environment variables
- [ ] Supabase RLS policies are enabled and tested
- [ ] Webhook signatures are verified
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] SSL certificates are valid
- [ ] Security headers are set (CSP, HSTS, etc.)
- [ ] Input validation on all API endpoints
- [ ] No sensitive data in client-side code

## 11. Testing Production

### Smoke Tests

1. Create a test order with a real wallet
2. Verify webhook receives tracking updates
3. Check worker processes label purchase
4. Verify real-time updates work
5. Test email notifications

### Load Testing

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

Run: `k6 run k6-test.js`

## 12. Rollback Plan

### Database Rollback

```bash
# List migrations
supabase db migrations list

# Rollback to specific migration
supabase db reset --to VERSION
```

### Application Rollback

```bash
# Vercel instant rollback
vercel rollback

# Or revert git commit
git revert HEAD
git push
```

## 13. Maintenance

### Regular Tasks

- **Daily**: Check error logs and monitoring alerts
- **Weekly**: Review metrics and performance
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Security audit and pen testing
- **Annually**: Rotate all API keys and secrets

### Monitoring Alerts

Configure alerts for:
- API error rate > 1%
- Response time > 3 seconds
- Worker queue depth > 1000
- Database connection errors
- Failed webhook deliveries

## 14. Troubleshooting

### Common Issues

1. **White screen in production**
   - Check browser console for missing env variables
   - Verify all NEXT_PUBLIC_ variables are set

2. **Supabase connection errors**
   - Verify URL and anon key are correct
   - Check RLS policies aren't blocking access

3. **Shippo API failures**
   - Ensure using live API key (not test)
   - Verify webhook endpoint is accessible

4. **Solana transaction failures**
   - Check wallet has sufficient SOL
   - Verify RPC endpoint is responsive

## Support

For production issues:
- Check application logs in Vercel dashboard
- Review Supabase logs for database errors
- Monitor Shippo dashboard for shipping issues
- Join our Discord for community support