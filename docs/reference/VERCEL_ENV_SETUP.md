# Vercel Environment Variables Setup Guide

## Issue
Your Vercel deployment shows all environment variables as "NOT SET" despite being configured in Vercel dashboard.

## Common Causes & Solutions

### 1. Check Environment Scope
Vercel has three environment scopes:
- **Production** - Used for the main branch deployment
- **Preview** - Used for pull request previews
- **Development** - Used for local development (not relevant here)

**Action Required:**
1. Go to your Vercel project dashboard
2. Click on "Settings" → "Environment Variables"
3. Make sure each variable is checked for **Production** (and Preview if needed)
4. If they're only set for "Development", that won't work for deployed sites

### 2. Verify Variable Names (EXACT MATCH REQUIRED)
These must match EXACTLY (case-sensitive):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_ADMIN_WALLET
NEXT_PUBLIC_SOLANA_NETWORK
NEXT_PUBLIC_SQUADS_VAULT
SUPABASE_SERVICE_ROLE_KEY
```

### 3. Redeploy After Adding Variables
**IMPORTANT**: Vercel requires a new deployment after adding/changing environment variables.

**Option A - Redeploy from Dashboard:**
1. Go to your Vercel project
2. Go to "Deployments" tab
3. Find the latest deployment
4. Click the three dots menu → "Redeploy"

**Option B - Trigger via Git:**
Push any small change to trigger a new deployment (I'll do this for you).

### 4. Check for Quotation Marks
Make sure the values in Vercel do NOT have quotation marks around them.
- ❌ Wrong: `"https://kxtuwewckwqpveaupkwv.supabase.co"`
- ✅ Correct: `https://kxtuwewckwqpveaupkwv.supabase.co`

### 5. Verify Values Format
Your values should look like:
- `NEXT_PUBLIC_SUPABASE_URL`: Should start with `https://` and end with `.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Long JWT string starting with `eyJ`
- `SUPABASE_SERVICE_ROLE_KEY`: Long JWT string starting with `eyJ`
- `NEXT_PUBLIC_ADMIN_WALLET`: Solana wallet address (base58 string)

### 6. Check Project vs Team Level
Make sure variables are set at the PROJECT level, not team level.

## Quick Verification Steps

1. **In Vercel Dashboard**, go to Settings → Environment Variables
2. **Screenshot or verify** you see all 6 variables listed
3. **Check each variable** has "Production" checkbox selected
4. **Click on each variable** to edit and verify:
   - No quotes around values
   - No extra spaces before/after values
   - Values match exactly what's in your .env.local

## If Still Not Working

If after verifying all above, it's still not working, try:

1. **Delete and re-add** the variables in Vercel
2. **Clear build cache**: Settings → Functions → Clear Cache
3. **Check deployment logs** for any warnings about environment variables

## Test After Fix

Visit: `https://your-site.vercel.app/test-env`

You should see:
- NEXT_PUBLIC_SUPABASE_URL: `https://kxtuwewckwqpveaupkwv.supabase.co`
- NEXT_PUBLIC_SUPABASE_ANON_KEY: SET (hidden)
- Other variables showing as SET

## Need More Help?

If none of the above works, the issue might be:
- A Vercel platform issue (rare)
- Variables set in wrong project (if you have multiple)
- Branch protection rules preventing env var access

Let me know which step reveals the issue!