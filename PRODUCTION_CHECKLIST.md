# Production Deployment Checklist

## 🔴 Critical - Must Do Before Launch

### 1. Database Setup
```bash
# Run migrations in Supabase SQL editor
1. supabase/migrations/005_liquidity_pool.sql
2. supabase/migrations/006_pool_rpc_functions.sql
3. supabase/migrations/007_atomic_bonus_and_batch.sql
```

### 2. Replace Mock Transfers with USDC
**File**: `/app/(routes)/stake/page.js`

Replace the deposit handler with:
```javascript
import { createUsdcTransfer, verifyUsdcTransfer } from '@/lib/usdc-transfer'

// In handleDeposit():
const { transaction, blockhash, lastValidBlockHeight } = await createUsdcTransfer(
  connection,
  publicKey,
  new PublicKey(SQUADS_CONFIG.vaultAddress),
  value
)

// After confirmation:
const { verified, error } = await verifyUsdcTransfer(
  connection,
  txid,
  new PublicKey(SQUADS_CONFIG.vaultAddress),
  value
)
```

### 3. Set Up Squads Multisig
1. Go to https://app.squads.so
2. Click "Create Squad"
3. Settings:
   - Name: "ReFit LP Vault"
   - Threshold: 2 of 3 signatures
   - Members: Your wallet + 2 backup wallets
4. Copy the vault address

### 4. Environment Variables
Create `.env.local`:
```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vault
NEXT_PUBLIC_SQUADS_VAULT=your_squads_vault_address
NEXT_PUBLIC_OPS_WALLET=your_operations_wallet

# Security
ADMIN_SECRET=generate_strong_random_secret_here

# Network
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC=your_rpc_endpoint
```

### 5. Add Admin Authentication
**Recommended**: Use NextAuth or Clerk

Quick setup with NextAuth:
```bash
npm install next-auth
```

Create `/app/api/auth/[...nextauth]/route.js`:
```javascript
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials.password === process.env.ADMIN_PASSWORD) {
          return { id: 1, name: "Admin" }
        }
        return null
      }
    })
  ]
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

Add to distribute/withdraw routes:
```javascript
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const session = await getServerSession(authOptions)
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 6. Transaction Verification
Add to `/app/api/pool/deposit/route.js`:

```javascript
import { verifyUsdcTransfer } from '@/lib/usdc-transfer'
import { Connection, PublicKey } from '@solana/web3.js'

// After receiving deposit request:
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC)
const vaultPubkey = new PublicKey(process.env.NEXT_PUBLIC_SQUADS_VAULT)

const { verified, error } = await verifyUsdcTransfer(
  connection,
  txSignature,
  vaultPubkey,
  amount
)

if (!verified) {
  return NextResponse.json(
    { success: false, error: `Invalid transaction: ${error}` },
    { status: 400 }
  )
}
```

## 🟡 Important - Do Before Scale

### 7. Set Up Monitoring
- Add Sentry for error tracking
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Create Slack/Discord webhook for alerts

### 8. Add Rate Limiting
```bash
npm install @upstash/ratelimit @upstash/redis
```

### 9. Email Notifications
Set up SendGrid/Resend for:
- Deposit confirmations
- Distribution notifications
- Withdrawal approvals

### 10. Withdrawal Processing
Create admin UI for processing withdrawals:
- List pending requests
- Approve/reject with one click
- Batch process to Squads vault

## 🟢 Nice to Have

### 11. Analytics
- Track deposits, withdrawals, distributions
- User metrics dashboard
- Revenue tracking

### 12. Automated Distributions
Set up cron job (Vercel Cron or separate service):
```javascript
// /app/api/cron/distribute/route.js
export async function GET(request) {
  // Verify cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Calculate week's profits from your accounting
  const weeklyProfit = await getWeeklyProfit()

  // Trigger distribution
  const response = await fetch('/api/pool/distribute', {
    method: 'POST',
    body: JSON.stringify({ weeklyProfit, adminSecret: process.env.ADMIN_SECRET })
  })

  return response
}
```

### 13. User Dashboard
Create `/app/profile/page.js`:
- Show deposit history
- Current balance
- Earnings history
- Withdrawal requests

## 📋 Launch Day Checklist

- [ ] All migrations run successfully
- [ ] USDC transfers working (test on devnet first!)
- [ ] Squads vault created and funded with test amount
- [ ] Environment variables set
- [ ] Admin authentication working
- [ ] Transaction verification working
- [ ] Test full deposit flow with real wallet
- [ ] Test withdrawal request flow
- [ ] Test distribution with small amount
- [ ] Set up monitoring
- [ ] Backup database
- [ ] Document emergency procedures
- [ ] Announce launch 🚀

## 🆘 Emergency Procedures

### Pause Deposits
Set in Supabase:
```sql
UPDATE liquidity_pool SET rft_bonus_active = false WHERE id = 1;
```

### Emergency Withdrawal
Use Squads interface to withdraw funds manually

### Rollback Distribution
```sql
-- If distribution failed, mark as failed and reverse
UPDATE distributions SET status = 'failed' WHERE id = 'xxx';
-- Contact users about issue
```

## 📞 Support Contacts

- Supabase Support: support@supabase.com
- Squads Discord: https://discord.gg/squads
- Solana Support: https://solana.com/developers

## 🎯 Success Metrics

Week 1 Target:
- [ ] 10 deposits
- [ ] $10,000 TVL
- [ ] First distribution completed
- [ ] Zero errors/bugs

Month 1 Target:
- [ ] 100 deposits
- [ ] $100,000 TVL
- [ ] 4 successful distributions
- [ ] $10k+ platform revenue