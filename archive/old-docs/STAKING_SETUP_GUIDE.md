# 🚀 ReFit Staking System - Setup Guide

## Step 1: Set Up Squads Multisig (30 minutes)

### Create Your Vault:
1. Go to https://v3.squads.so
2. Click "Create New Squad"
3. Choose "Multisig Vault"
4. Add signers:
   - Your main wallet (hot wallet)
   - Hardware wallet (Ledger/Trezor)
   - Recovery wallet (cold storage)
5. Set threshold: **2 of 3** signatures required
6. Copy the vault address

### Save This Address:
```bash
# Add to .env.local
NEXT_PUBLIC_SQUADS_VAULT_ADDRESS=<your_vault_address>
```

---

## Step 2: Run Database Migration (5 minutes)

1. Open Supabase Dashboard: https://app.supabase.com
2. Go to SQL Editor
3. Copy contents of `supabase/migrations/004_staking_tables.sql`
4. Paste and run
5. Verify tables created:
   - stakes
   - stake_yields
   - withdrawal_requests
   - treasury_snapshots

---

## Step 3: Configure Environment Variables

Add to your `.env.local`:

```bash
# Staking System
NEXT_PUBLIC_SQUADS_VAULT_ADDRESS=your_vault_address_here
CRON_SECRET=generate_random_32_char_string

# Optional: For production transaction verification
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_key (or use default RPC)
```

---

## Step 4: Set Up Daily Yield Calculation

### Option A: Vercel Cron (Recommended if using Vercel)

Create `vercel.json` in project root:
```json
{
  "crons": [
    {
      "path": "/api/cron/calculate-yields",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Option B: GitHub Actions

Create `.github/workflows/daily-yields.yml`:
```yaml
name: Calculate Daily Yields
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:  # Manual trigger

jobs:
  calculate:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger yields calculation
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/cron/calculate-yields
```

### Option C: External Cron (EasyCron, cron-job.org)

1. Sign up at https://cron-job.org (free)
2. Create new cron job:
   - URL: `https://your-domain.com/api/cron/calculate-yields`
   - Schedule: Daily at 00:00 UTC
   - Add header: `Authorization: Bearer YOUR_CRON_SECRET`

---

## Step 5: Test the System (30 minutes)

### Test Stake Creation:

```javascript
// In browser console on your site:
const testStake = async () => {
  const response = await fetch('/api/staking/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: 'your_test_wallet',
      amount: 100,
      tier: 'flexible',
      txSignature: 'test_tx_sig_' + Date.now()
    })
  });
  const data = await response.json();
  console.log(data);
}

testStake();
```

### Test Yield Calculation:

```bash
# Manually trigger yield calculation
curl -X POST http://localhost:3000/api/cron/calculate-yields
```

### Check Results:

```sql
-- In Supabase SQL Editor
SELECT * FROM stakes;
SELECT * FROM stake_yields;
```

---

## Step 6: User Flow Integration

### Update Sell Page to Include Staking Option

When user completes phone quote, add:
```javascript
// After getting quote
const [stakePercentage, setStakePercentage] = useState(100)

// In UI
<div>
  <h3>Stake and Earn</h3>
  <input
    type="range"
    min="0"
    max="100"
    value={stakePercentage}
    onChange={(e) => setStakePercentage(e.target.value)}
  />
  <div>
    Stake: ${quote * stakePercentage / 100} (earn {selectedTier.apy}% APR)
    Cash out: ${quote * (100 - stakePercentage) / 100}
  </div>
</div>
```

### After Order Completion:

```javascript
// If user chose to stake
if (stakePercentage > 0) {
  const stakeAmount = quote * (stakePercentage / 100)

  // Create stake record
  await fetch('/api/staking/create', {
    method: 'POST',
    body: JSON.stringify({
      walletAddress: user.wallet,
      amount: stakeAmount,
      tier: selectedTier,
      txSignature: paymentTx.signature,
      fromOrderId: order.id
    })
  })
}
```

---

## Step 7: Treasury Management

### Daily Checklist:

1. **Check Squads Balance**
   - Go to https://v3.squads.so
   - Verify balance matches Supabase records

2. **Process Withdrawals**
   ```sql
   SELECT * FROM withdrawal_requests WHERE status = 'pending';
   ```
   - Review each request
   - If approved: Send USDC from Squads vault
   - Update status to 'completed'

3. **Monitor Yields**
   ```sql
   SELECT get_staking_stats();
   ```

### Weekly Tasks:

1. **Allocate Funds**
   ```
   Total Stakes: $10,000
   → $7,000 to Marinade (earning yield)
   → $3,000 keep liquid (for withdrawals & eBay purchases)
   ```

2. **Buy Inventory**
   - Check which phones need restocking
   - Off-ramp $X from Squads → Bank account
   - Purchase on eBay
   - Update inventory system

3. **Create Treasury Snapshot**
   ```sql
   INSERT INTO treasury_snapshots (
     total_staked, liquid_balance, validator_balance,
     active_stakes, total_yield_distributed,
     expected_balance, actual_balance, variance,
     snapshot_date
   ) VALUES (...);
   ```

---

## Step 8: Launch Strategy

### Phase 1: Friends & Family (Week 1)
- Max $5,000 total stakes
- Only allow known testers
- Manual withdrawal processing
- Daily monitoring

### Phase 2: Limited Beta (Week 2-4)
- Increase to $50,000 cap
- Open to waitlist
- Semi-automated withdrawals
- Integrate Marinade staking

### Phase 3: Public Launch (Month 2+)
- Remove stake cap
- Full automation
- Launch validator
- Add RFT token emissions

---

## 🚨 Important Notes

### Security:
- [ ] Never store private keys in code
- [ ] Always use 2-of-3 multisig
- [ ] Keep one key offline in safe
- [ ] Enable 2FA on all accounts
- [ ] Regular balance reconciliation

### Legal:
- [ ] Consult crypto lawyer
- [ ] Update terms of service
- [ ] Add risk disclosures
- [ ] Comply with local regulations

### Operations:
- [ ] Document withdrawal process
- [ ] Create incident response plan
- [ ] Set up monitoring alerts
- [ ] Train backup admin

---

## 📞 Need Help?

Common Issues:

**Stakes not showing up?**
- Check Supabase logs
- Verify RLS policies allow user access
- Ensure wallet address matches exactly

**Yields not calculating?**
- Check cron job is running
- Verify database function exists
- Look at Vercel/GitHub Actions logs

**Withdrawals stuck?**
- Check withdrawal_requests table
- Process manually via Squads
- Update status after sending

---

## ✅ Go-Live Checklist

Before accepting first real stake:

- [ ] Squads vault created and tested
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Cron job configured
- [ ] Test withdrawal completed
- [ ] Terms of service updated
- [ ] Risk disclosures added
- [ ] Monitoring set up
- [ ] Backup plan documented
- [ ] $10k stake limit enforced

---

**You're ready to launch!** 🚀

Start with small amounts, be transparent, over-communicate.

Good luck! 💪
