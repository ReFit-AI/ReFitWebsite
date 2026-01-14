# Privy Wallet Integration Fix - Complete Instructions (Updated)

## Changes Made

### 1. ✅ Removed Dashboard Skip (services/index.js)
- Removed lines 50-56 that skipped profile initialization for dashboard/stake/admin/stats pages
- Now ALL pages will initialize the profile when wallet connects

### 2. ✅ Profile Creation (userProfile.production.js)
- Updated `initializeProfile()` to always create a profile row in the `profiles` table
- Added fallback to check profile by wallet address when no JWT auth
- Added call to `set_wallet_context` RPC (will fail gracefully if not exists)

### 3. ✅ Orders Page Error Handling (orders/page.js)
- Fixed infinite spinner by always calling `setLoading(false)` 
- Shows empty state on error instead of spinning forever
- Better error messages that don't spam on "Not authenticated"

### 4. ✅ Layout Service Init (Layout.jsx)
- Now uses `useUnifiedWallet` to get Privy wallets
- Calls `initializeServices()` with correct wallet address

### 5. ✅ Unified Wallet Hook (useUnifiedWallet.js)
- Sets Supabase wallet context via `setSupabaseWalletContext()`
- Clears context on disconnect

### 6. ✅ Auth Error Handling (api/auth/wallet-link)
- Now handles "email_exists" error gracefully
- Returns existing user instead of throwing error
- Prevents duplicate user creation attempts

### 7. ✅ Profile Creation Error Details
- Better error logging with full error details
- Conditionally includes user.id based on UUID format
- Always sets currentUser to prevent null references
- Uses lowercase emails for consistency

## Required Supabase Migration

**IMPORTANT**: You must run this migration in your Supabase SQL Editor:

```sql
-- Copy the contents of: supabase/migrations/20250111_fix_rls_wallet_context.sql
-- Paste and execute in Supabase SQL Editor
```

This migration:
1. Creates the `set_wallet_context()` function for RLS
2. Simplifies RLS policies to work with wallet context
3. Adds fallback policies for direct wallet queries

## Testing Steps

1. **Run the Migration** in Supabase SQL Editor
2. **Clear Browser Data**:
   - Clear localStorage
   - Clear cookies
   - Hard refresh (Cmd+Shift+R)

3. **Test Flow**:
   - Sign in with Privy (Google/Email)
   - Wait for wallet to be created
   - Navigate to `/orders` - should show "No Orders Yet" instead of spinning
   - Navigate to `/profile` - should show wallet address
   - Try `/sell` flow - addresses should save

## Troubleshooting

### If Orders Still Fail:
Check Supabase logs for RLS errors. The policies now check:
- `current_setting('app.current_wallet')` - Set by RPC call
- `auth.jwt() ->> 'wallet_address'` - From JWT token
- Direct `wallet_address` match as fallback

### If Profile Not Created:
1. Check browser console for "Failed to create profile" error
2. Verify `profiles` table exists with correct schema
3. Check if `profiles` table has RLS enabled

### If set_wallet_context Fails:
The app will still work via fallback policies. The error "set_wallet_context not available" is non-critical.

## What Was Fixed

1. **Dashboard Skip Bug** - Profile now initializes on ALL pages
2. **Missing Profile Rows** - Profile creation now happens on wallet connect
3. **RLS Context Issue** - Added PostgreSQL function to set wallet context
4. **Infinite Spinner** - Orders page now handles errors gracefully
5. **Header vs Config Mismatch** - RLS policies now check multiple sources

## Next Steps

After running the migration and testing:
1. Monitor for any RLS errors in Supabase logs
2. Verify orders display correctly for users with orders
3. Test the full sell flow end-to-end

The Privy wallet should now work seamlessly across the entire site!
