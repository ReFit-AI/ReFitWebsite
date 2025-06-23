# Solana Saga Mobile App Setup Guide

## Current Status

✅ **Completed:**
- Archived old `solana-buyback` project
- Migrated smart contracts to `refit-next/contracts/`
- Cleaned up duplicate files in main project
- Created dedicated mobile API endpoints at `/api/mobile/v1/`
- Set up authentication middleware for mobile sessions

## Mobile API Structure

```
app/api/mobile/v1/
├── route.js                    # API discovery endpoint
├── auth/
│   └── connect/route.js        # Wallet connection
├── phone/
│   ├── models/route.js         # Available phone models
│   └── quote/route.js          # Price quotes
└── README.md                   # API documentation
```

## Next Steps for Mobile Development

### 1. Database Setup
Run this SQL in Supabase to create the mobile sessions table:

```sql
CREATE TABLE mobile_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token UUID NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  device_info TEXT,
  last_used TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mobile_sessions_token ON mobile_sessions(session_token);
CREATE INDEX idx_mobile_sessions_wallet ON mobile_sessions(wallet_address);
```

### 2. React Native App Structure
Create a new React Native app with Solana Mobile SDK:

```bash
npx react-native init RefitMobile
cd RefitMobile
npm install @solana/web3.js @solana/wallet-adapter-react-native @solana-mobile/mobile-wallet-adapter-react-native
```

### 3. Environment Configuration
The mobile API is completely separate from the main site:
- Main site: `/` (all existing routes work unchanged)
- Mobile API: `/api/mobile/v1/*` (dedicated endpoints)

### 4. Mobile App Features
- **Seed Vault Integration**: Secure key storage on Saga devices
- **Mobile Wallet Adapter**: Native wallet integration
- **Camera Integration**: Phone condition assessment
- **Push Notifications**: Order status updates
- **Offline Support**: Queue transactions when offline

### 5. Testing the Mobile API

Test the API discovery endpoint:
```bash
curl http://localhost:3000/api/mobile/v1
```

Test phone models endpoint:
```bash
curl http://localhost:3000/api/mobile/v1/phone/models
```

Test quote generation:
```bash
curl -X POST http://localhost:3000/api/mobile/v1/phone/quote \
  -H "Content-Type: application/json" \
  -d '{
    "model": "iPhone 16 Pro Max",
    "condition": "excellent",
    "carrier": "unlocked",
    "storage": "256GB"
  }'
```

## Development Workflow

1. **Web Development**: Continue as normal in the main app
2. **Mobile API**: Add new endpoints under `/api/mobile/v1/`
3. **Shared Logic**: Import from existing services (e.g., `services/solana.js`)
4. **No Interference**: Mobile APIs are completely isolated

## Security Considerations

- Mobile sessions expire after 7 days
- All endpoints require authentication (except `/auth/connect`)
- Rate limiting should be implemented
- Signature verification for wallet connections
- HTTPS required in production

## Deployment

The mobile API deploys with your Next.js app:
- No additional configuration needed
- Same domain as web app
- Automatic scaling with Vercel/Netlify

## Resources

- [Solana Mobile SDK Docs](https://docs.solanamobile.com/)
- [React Native Solana Template](https://github.com/solana-mobile/solana-mobile-dapp-scaffold)
- [Mobile Wallet Adapter](https://github.com/solana-mobile/mobile-wallet-adapter)