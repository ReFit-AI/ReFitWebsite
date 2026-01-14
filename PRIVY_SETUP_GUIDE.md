# Privy Integration Setup Guide

## Step 1: Create a Privy Account

1. Go to https://dashboard.privy.io/
2. Sign up with your email or GitHub account
3. Verify your email address

## Step 2: Create Your First App

1. Click "Create New App"
2. App Name: **ReFit Marketplace**
3. Select blockchain networks:
   - ✅ Solana (required)
   - Optional: EVM chains if needed later

## Step 3: Get Your API Keys

1. In the Privy dashboard, go to **Settings** → **API Keys**
2. Copy your **App ID** (it looks like: `clp...`)
3. You'll see two environments:
   - **Development**: For localhost/testing
   - **Production**: For shoprefit.com

## Step 4: Add to Environment Variables

Add to your `.env.local` file:

```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here

# Optional: Custom domains for production
# NEXT_PUBLIC_PRIVY_CUSTOM_DOMAIN=https://www.shoprefit.com
```

## Step 5: Configure Login Methods

In the Privy dashboard → **Login Methods**:

1. **Email** (Recommended):
   - ✅ Enable email login
   - Set verification method: OTP (One-Time Password)

2. **Social Logins** (Optional):
   - ✅ Google OAuth
   - ✅ Twitter/X
   - ✅ Discord (for web3 users)
   - ✅ Apple Sign In (for iOS users)

3. **Wallet Connections** (Recommended):
   - ✅ External wallets (Phantom, Backpack, etc.)
   - Users can link their existing Solana wallets

## Step 6: Configure Embedded Wallets

In Privy dashboard → **Embedded Wallets**:

1. **Wallet Creation**:
   - ✅ Auto-create wallet on first login
   - ✅ Solana wallet type

2. **Recovery Options**:
   - ✅ Email recovery
   - ✅ Social recovery
   - Consider: User-controlled backups

3. **Smart Wallet Features** (Optional):
   - Session keys
   - Gasless transactions
   - Batch transactions

## Step 7: Security Settings

In Privy dashboard → **Security**:

1. **Allowed Origins** (Development):
   ```
   http://localhost:3000
   http://localhost:3001
   ```

2. **Allowed Origins** (Production):
   ```
   https://www.shoprefit.com
   https://shoprefit.com
   ```

3. **MFA Settings**:
   - ✅ Enable optional MFA for users
   - Methods: TOTP, SMS (requires upgrade)

## Step 8: Customize Branding (Optional)

In Privy dashboard → **Appearance**:

1. **Logo**: Upload ReFit logo
2. **Colors**:
   - Primary: `#9945FF` (Solana purple)
   - Background: `#000000` (Black)
3. **Theme**: Dark mode (matches ReFit design)

## Pricing

**Free Tier** (Perfect for beta launch):
- Up to 1,000 monthly active users (MAU)
- All features included
- No credit card required

**Growth Tier** ($99/month):
- Starts at 1,001 MAU
- $0.02 per additional user
- Priority support

## Integration Checklist

After completing setup:

- [ ] App ID added to `.env.local`
- [ ] Email login enabled
- [ ] Google OAuth configured (optional)
- [ ] Embedded wallet creation enabled
- [ ] Localhost added to allowed origins
- [ ] Production domain added (when ready)
- [ ] Branding customized
- [ ] Test login flow

## Next Steps

Once you've completed the setup:

1. Restart your Next.js dev server
2. Visit http://localhost:3001
3. Click "Connect Wallet"
4. Test both:
   - Email login (creates embedded wallet)
   - Phantom/Backpack connection (uses existing wallet)

## Support

- **Privy Docs**: https://docs.privy.io/
- **Privy Discord**: https://discord.com/invite/privy
- **Privy Support**: support@privy.io

## Current Implementation Status

✅ Privy SDK installed
⏳ Waiting for App ID from dashboard
⏳ Integration code ready to deploy
⏳ Testing embedded wallet flows

---

**Created**: 2025-01-08
**Last Updated**: 2025-01-08
