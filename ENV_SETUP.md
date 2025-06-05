# Environment Setup Guide

To fix the environment variable errors, you need to create a `.env` file in the root of your project with the following variables:

```bash
# Copy these to your .env file

# Supabase (leave empty if not using)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Shippo (leave empty if not using)
VITE_SHIPPO_API_KEY=
VITE_SHIPPO_TEST_MODE=true
VITE_SHIPPO_WEBHOOK_SECRET=

# Solana
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_PLATFORM_WALLET=11111111111111111111111111111111

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_API_BASE_URL=/api
VITE_WEBHOOK_URL=/api/webhooks

# Feature Flags (set to false for development with mocks)
VITE_USE_SUPABASE=false
VITE_USE_SHIPPO=false
VITE_USE_REAL_PAYMENTS=false
VITE_ENABLE_WEBHOOKS=false
```

## Quick Fix Steps:

1. Create a `.env` file in the project root
2. Copy the above environment variables
3. Restart the development server: `npm run dev`

The application will use mock services when the feature flags are set to `false`, so you can test without real API keys.
