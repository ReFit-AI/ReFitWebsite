#!/bin/bash

echo "🚀 Setting up environment variables for refit-website..."

# Your actual values
JWT_SECRET="mK4iYoNyCVm/TXH6N8vxPjpydOakvHuiRWjvzVNPu/A="
UPSTASH_REDIS_REST_URL="https://able-molly-36800.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AY_AAAIjcDE5ZGRiODhmOGNmMDg0ZWQyYjY5MzI0MDEyZjE5ZThkN3AxMA"

# Load Supabase from backup
source .env.backup

# Add all environment variables
echo -n "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo -n "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production  
echo -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo -n "$JWT_SECRET" | vercel env add JWT_SECRET production
echo -n "$UPSTASH_REDIS_REST_URL" | vercel env add UPSTASH_REDIS_REST_URL production
echo -n "$UPSTASH_REDIS_REST_TOKEN" | vercel env add UPSTASH_REDIS_REST_TOKEN production

echo -n "shippo_test_e5116e7cd5f1153ae3b0535aaf4d50481bc6592f" | vercel env add SHIPPO_API_KEY production
echo -n "shippo_test_e5116e7cd5f1153ae3b0535aaf4d50481bc6592f" | vercel env add NEXT_PUBLIC_SHIPPO_API_KEY production
echo -n "temp_webhook_secret" | vercel env add SHIPPO_WEBHOOK_SECRET production

echo -n "https://api.testnet.solana.com" | vercel env add NEXT_PUBLIC_SOLANA_RPC_HOST production
echo -n "testnet" | vercel env add NEXT_PUBLIC_SOLANA_NETWORK production

echo -n "https://refit-website.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production
echo -n "production" | vercel env add NODE_ENV production

echo -n "true" | vercel env add USE_SUPABASE production
echo -n "true" | vercel env add USE_SHIPPO production
echo -n "false" | vercel env add USE_REAL_PAYMENTS production
echo -n "true" | vercel env add ENABLE_WEBHOOKS production
echo -n "true" | vercel env add NEXT_PUBLIC_USE_SERVER_AUTH production

echo "✅ Done setting environment variables for refit-website!"