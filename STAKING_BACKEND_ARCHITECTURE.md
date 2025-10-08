# ReFit Staking Backend Architecture
**Simple, Secure, and Ready to Scale**

---

## 🎯 Overview

Your staking mechanism needs to:
1. Accept user funds (USDC/SOL)
2. Store them securely
3. Generate yield
4. Track earnings
5. Allow withdrawals
6. Enable purchases of inventory (eBay, wholesalers)

---

## 🏗️ Architecture (Jobs-Simple Approach)

### **Tier 1: Manual MVP (Ship This Week)**

**What:** No smart contracts yet. Manual custody with Squads multisig.

**Flow:**
```
User stakes $600 → USDC sent to Squads vault → Manual tracking in Supabase
  → Yields calculated daily → Withdrawals processed manually
```

**Components:**

1. **Squads Multisig Wallet** (https://squads.so)
   - 2-of-3 multisig (You + trusted partner + cold wallet)
   - Holds all staked USDC
   - No code needed, just wallet
   - Cost: Free

2. **Supabase Database** (already have)
   - Track stakes, lock periods, APY rates
   - Calculate yields daily via cron job
   - Store withdrawal requests

3. **Simple Staking Flow:**
```javascript
// User stakes via your site
1. User connects wallet
2. User sends USDC to Squads vault address
3. Your API confirms transaction
4. Create stake record in Supabase
5. Daily cron calculates yield
6. Manual withdrawals on request
```

**Pros:**
- ✅ Ship in 1 day
- ✅ No smart contract risk
- ✅ Full control
- ✅ Can iterate fast

**Cons:**
- ⚠️ Manual withdrawals (but you can batch weekly)
- ⚠️ Requires trust (but so does Coinbase at start)

---

### **Tier 2: Semi-Automated (Month 2)**

**What:** Add Solana validator + automated yield distribution

**Components:**

1. **Squads Vault** → **Marinade Finance**
   - Stake USDC → Convert to SOL → Stake with Marinade
   - Marinade gives you mSOL (liquid staking token)
   - Earns ~7% APY automatically
   - Liquid = can unstake anytime

2. **Automated Yield Distribution:**
```javascript
// Daily cron job (Vercel Cron or similar)
async function distributeYields() {
  // 1. Check Marinade balance
  const totalYield = await getMarinadeYield()

  // 2. Get all active stakes from Supabase
  const stakes = await getActiveStakes()

  // 3. Calculate each user's share
  stakes.forEach(stake => {
    const userShare = (stake.amount / totalStaked) * totalYield
    // Update their claimable balance
    await updateClaimableBalance(stake.userId, userShare)
  })
}
```

3. **Self-Service Withdrawals:**
   - User requests withdrawal
   - If unlocked → instant (via Squads API)
   - If locked → queued for unlock date

**Cost:** ~$50/month for validator node

---

### **Tier 3: Full Smart Contract (Month 6)**

**What:** Fully trustless, automated, composable

Use **Anchor Framework** to build:
```rust
// Staking program (simplified)
pub fn stake(ctx: Context<Stake>, amount: u64, tier: u8) -> Result<()> {
    // Transfer USDC to vault
    // Create stake account with lock period
    // Emit stake event
}

pub fn claim_yield(ctx: Context<Claim>) -> Result<()> {
    // Calculate user's yield
    // Transfer from yield pool
    // Update last claim timestamp
}

pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
    // Check if lock expired
    // Transfer principal + yield
    // Close stake account
}
```

**Pros:**
- 🚀 Fully automated
- 🔒 Trustless
- 💪 Composable (can integrate with other DeFi)

**Cons:**
- 🐌 Takes 6+ weeks to build safely
- 💰 Audit costs ~$20-50k
- 🐛 Smart contract risk

---

## 💰 Yield Generation Strategy

### **How to Actually Generate 50-250% APR**

**Base Layer (6-8% from Solana):**
1. **Marinade Finance** - Liquid staking, ~7% APY
2. **Your Own Validator** - 6-7.5% APY + MEV
3. **Jito Labs** - MEV-enhanced staking, 8%+

**Bonus Layer (RFT Token Rewards):**
1. Mint RFT tokens according to emissions schedule
2. Distribute based on stake tier multipliers
3. RFT price appreciation = extra APR

**Example Math (Smart Tier - 150% APR):**
```
User stakes: $600
Lock period: 6 months
Base APY: 7% from Marinade = $42/year = $3.50/month
RFT APR: 143% (3x multiplier)
  → $600 * 0.006% of supply = 6,000 RFT/year
  → At $0.01 = $60/year = $5/month
Total: $8.50/month = $102/year = 17% actual APR

NOTE: The high APRs assume RFT appreciates to $0.01-0.05
```

---

## 🔐 Security Architecture

### **MVP Security Checklist:**

1. **Custody:**
   - [ ] Squads 2-of-3 multisig
   - [ ] One key on hardware wallet (Ledger)
   - [ ] One key on your device (secure)
   - [ ] One key in safe deposit box (recovery)

2. **Database:**
   - [ ] RLS policies on all staking tables
   - [ ] Audit logs for all transactions
   - [ ] Daily backups
   - [ ] Encryption at rest (Supabase default)

3. **API Security:**
   - [ ] Rate limiting on stake/unstake
   - [ ] Signature verification for all transactions
   - [ ] Transaction size limits ($10k max per stake)
   - [ ] Daily withdrawal limits

4. **Operational:**
   - [ ] Two-person approval for large withdrawals
   - [ ] Daily reconciliation (Squads balance vs Supabase)
   - [ ] Incident response plan
   - [ ] Insurance (later, via Solana DeFi protocols)

---

## 🛠️ Implementation Plan

### **Week 1: Manual Staking**

1. **Setup Squads Vault:**
```bash
# 1. Go to https://v3.squads.so
# 2. Create new multisig
# 3. Add signers
# 4. Copy vault address
```

2. **Create Staking API:**
```javascript
// /app/api/staking/create/route.js
export async function POST(req) {
  const { walletAddress, amount, tier } = await req.json()

  // 1. Verify signature
  const verified = await verifyWalletSignature(...)

  // 2. Check transaction to Squads vault
  const tx = await verifyUSDCTransfer(walletAddress, SQUADS_VAULT, amount)

  // 3. Create stake record
  const stake = await supabase.from('stakes').insert({
    wallet_address: walletAddress,
    amount,
    tier,
    lock_days: TIERS[tier].lockDays,
    unlock_date: addDays(Date.now(), TIERS[tier].lockDays),
    apy: TIERS[tier].apy,
    tx_signature: tx.signature
  })

  return { success: true, stakeId: stake.id }
}
```

3. **Daily Yield Calculator:**
```javascript
// Run via Vercel Cron
export async function GET() {
  const stakes = await supabase.from('stakes')
    .select('*')
    .eq('status', 'active')

  for (const stake of stakes) {
    const dailyYield = (stake.amount * stake.apy / 100) / 365

    await supabase.from('stake_yields').insert({
      stake_id: stake.id,
      amount: dailyYield,
      calculated_at: new Date()
    })
  }

  return { processed: stakes.length }
}
```

### **Week 2: Buy Phones from eBay**

**Problem:** Can't use USDC on eBay

**Solution:** Hybrid treasury
```
Total Stakes: $10,000
  → $7,000 in Marinade (earning yield)
  → $3,000 in bank account (for eBay purchases)
```

**Off-ramping Flow:**
1. Weekly: Calculate needed inventory budget
2. Sell USDC → USD via Coinbase/Kraken
3. Transfer to business checking account
4. Buy phones on eBay
5. List phones on your platform

**Automate with:**
- **Coinbase Commerce** for USDC → USD
- **Plaid** to link bank account
- **eBay API** for automated purchasing

---

## 📊 Database Schema Updates

```sql
-- Add staking tables
CREATE TABLE stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tier TEXT NOT NULL, -- 'flex', 'smart', 'diamond'
  lock_days INTEGER NOT NULL,
  unlock_date TIMESTAMP NOT NULL,
  apy DECIMAL(5,2) NOT NULL,
  tx_signature TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'unlocked', 'withdrawn'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stake_yields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stake_id UUID REFERENCES stakes(id),
  amount DECIMAL(10,6) NOT NULL,
  source TEXT NOT NULL, -- 'validator', 'rft_emission', 'bonus'
  calculated_at TIMESTAMP NOT NULL,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP
);

CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stake_id UUID REFERENCES stakes(id),
  amount DECIMAL(10,2) NOT NULL,
  penalty DECIMAL(10,2), -- if early withdrawal
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'completed', 'rejected'
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_stakes_wallet ON stakes(wallet_address);
CREATE INDEX idx_stakes_status ON stakes(status);
CREATE INDEX idx_yields_stake ON stake_yields(stake_id);
```

---

## 🚦 Go-Live Checklist

### **Before Accepting First Stake:**

- [ ] Squads vault created and tested
- [ ] Test stake with your own $100
- [ ] Withdrawal flow tested
- [ ] Daily yield calculation working
- [ ] Supabase backups enabled
- [ ] Monitoring/alerts set up
- [ ] Terms of service updated
- [ ] Risk disclosures added
- [ ] $10k max stake limit enforced

### **Legal/Compliance:**

- [ ] Talk to crypto lawyer (seriously)
- [ ] Understand securities laws in your jurisdiction
- [ ] Add disclaimer: "Not FDIC insured, may lose value"
- [ ] Terms clearly state you custody funds
- [ ] Privacy policy covers staking data

---

## 💡 Pro Tips

### **Start Small:**
- Limit to $50k total stakes in month 1
- Only allow known users/testers initially
- Run withdrawals manually weekly
- Don't promise what you can't deliver

### **Be Transparent:**
- Show live Squads vault balance on site
- Publish daily APY (it will fluctuate)
- Share monthly treasury reports
- Overcommunicate everything

### **Risk Management:**
- Keep 20% liquidity for withdrawals
- Don't stake 100% to validator
- Have emergency exit plan
- Get smart contract insurance later

---

## 🎯 Recommended Path

**Today → Week 1:**
✅ Set up Squads multisig
✅ Create manual staking flow
✅ Accept first 10 stakes (capped at $5k total)

**Week 2-4:**
✅ Integrate Marinade for auto-yield
✅ Build self-service withdrawals
✅ Automate daily yield distribution

**Month 2-3:**
✅ Launch your own validator
✅ Add RFT token emissions
✅ Scale to $100k TVL

**Month 4-6:**
✅ Build Anchor smart contracts
✅ Security audit
✅ Full decentralization

---

**Remember:** Coinbase started with manual custody. Crypto.com started with spreadsheets. Start simple, earn trust, scale up.

You got this! 🚀
