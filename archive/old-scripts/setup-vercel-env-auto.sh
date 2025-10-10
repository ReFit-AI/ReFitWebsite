#!/bin/bash

# Auto-setup Vercel Environment Variables
echo "🚀 Setting up Vercel production environment variables..."

# You need to fill these in:
JWT_SECRET="mK4iYoNyCVm/TXH6N8vxPjpydOakvHuiRWjvzVNPu/A="
UPSTASH_REDIS_REST_URL="https://able-molly-36800.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AY_AAAIjcDE5ZGRiODhmOGNmMDg0ZWQyYjY5MzI0MDEyZjE5ZThkN3AxMA"
SHIPPO_API_KEY="shippo_test_e5116e7cd5f1153ae3b0535aaf4d50481bc6592f"  # Using test key for now

# Load Supabase keys from backup
source .env.backup

echo "Setting environment variables for production..."

# Core Supabase
vercel env add SUPABASE_SERVICE_ROLE_KEY production --force <<< "$SUPABASE_SERVICE_ROLE_KEY"
vercel env add NEXT_PUBLIC_SUPABASE_URL production --force <<< "$NEXT_PUBLIC_SUPABASE_URL"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --force <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Security
vercel env add JWT_SECRET production --force <<< "$JWT_SECRET"
vercel env add UPSTASH_REDIS_REST_URL production --force <<< "$UPSTASH_REDIS_REST_URL"
vercel env add UPSTASH_REDIS_REST_TOKEN production --force <<< "$UPSTASH_REDIS_REST_TOKEN"

# Shippo
vercel env add SHIPPO_API_KEY production --force <<< "$SHIPPO_API_KEY"
vercel env add NEXT_PUBLIC_SHIPPO_API_KEY production --force <<< "$SHIPPO_API_KEY"
vercel env add SHIPPO_WEBHOOK_SECRET production --force <<< "temp_webhook_secret"

# Solana
vercel env add NEXT_PUBLIC_SOLANA_RPC_HOST production --force <<< "https://api.testnet.solana.com"
vercel env add NEXT_PUBLIC_SOLANA_NETWORK production --force <<< "testnet"

# App config
vercel env add NEXT_PUBLIC_APP_URL production --force <<< "https://refit-app.vercel.app"
vercel env add NODE_ENV production --force <<< "production"

# Feature flags
vercel env add USE_SUPABASE production --force <<< "true"
vercel env add USE_SHIPPO production --force <<< "true"
vercel env add USE_REAL_PAYMENTS production --force <<< "false"
vercel env add ENABLE_WEBHOOKS production --force <<< "true"
vercel env add NEXT_PUBLIC_USE_SERVER_AUTH production --force <<< "true"

echo "✅ Done! View with: vercel env ls production"