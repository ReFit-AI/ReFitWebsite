#!/bin/bash

# Setup Vercel Environment Variables for Production
# Run this after: vercel login

echo "🚀 Setting up Vercel production environment variables..."

# Check if logged in
vercel whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Vercel"
    echo "Please run: vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""
echo "This script will set production environment variables."
echo "Make sure you have:"
echo "  - JWT_SECRET generated"
echo "  - Upstash Redis credentials"
echo "  - Shippo production keys (or using test keys)"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Load from .env.backup for Supabase keys
if [ -f .env.backup ]; then
    echo "📁 Loading Supabase keys from .env.backup..."
    source .env.backup
else
    echo "❌ .env.backup not found"
    exit 1
fi

# Prompt for new values
echo ""
echo "Enter your new production values:"
echo ""

read -p "JWT_SECRET (32+ chars): " JWT_SECRET_INPUT
read -p "UPSTASH_REDIS_REST_URL: " UPSTASH_URL_INPUT  
read -p "UPSTASH_REDIS_REST_TOKEN: " UPSTASH_TOKEN_INPUT
read -p "SHIPPO_API_KEY (or press enter to use test key): " SHIPPO_KEY_INPUT

# Use test key if not provided
SHIPPO_KEY_FINAL=${SHIPPO_KEY_INPUT:-"shippo_test_e5116e7cd5f1153ae3b0535aaf4d50481bc6592f"}

echo ""
echo "Setting production environment variables..."

# Set each variable for production
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPABASE_SERVICE_ROLE_KEY"
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$NEXT_PUBLIC_SUPABASE_URL"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

vercel env add JWT_SECRET production <<< "$JWT_SECRET_INPUT"
vercel env add UPSTASH_REDIS_REST_URL production <<< "$UPSTASH_URL_INPUT"
vercel env add UPSTASH_REDIS_REST_TOKEN production <<< "$UPSTASH_TOKEN_INPUT"

vercel env add SHIPPO_API_KEY production <<< "$SHIPPO_KEY_FINAL"
vercel env add NEXT_PUBLIC_SHIPPO_API_KEY production <<< "$SHIPPO_KEY_FINAL"
vercel env add SHIPPO_WEBHOOK_SECRET production <<< "temp_webhook_secret"

vercel env add NEXT_PUBLIC_SOLANA_RPC_HOST production <<< "https://api.testnet.solana.com"
vercel env add NEXT_PUBLIC_SOLANA_NETWORK production <<< "testnet"

vercel env add NEXT_PUBLIC_APP_URL production <<< "https://shoprefit.com"
vercel env add NODE_ENV production <<< "production"

vercel env add USE_SUPABASE production <<< "true"
vercel env add USE_SHIPPO production <<< "true"
vercel env add USE_REAL_PAYMENTS production <<< "false"
vercel env add ENABLE_WEBHOOKS production <<< "true"
vercel env add NEXT_PUBLIC_USE_SERVER_AUTH production <<< "true"

echo ""
echo "✅ Environment variables set!"
echo ""
echo "Next steps:"
echo "1. Run: vercel --prod"
echo "2. Your app will deploy with all security fixes"
echo "3. Update Shippo keys when you get production access"
echo ""
echo "To view your env vars: vercel env ls production"