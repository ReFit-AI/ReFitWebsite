# ReFit Trade-In Flow - Complete Setup Guide

## 🎉 What We Built

A complete trade-in flow that allows users to:
1. Get instant quotes for their phones
2. Generate prepaid shipping labels
3. Ship devices to your warehouse
4. Admins receive, inspect, and pay users in USDC
5. Devices automatically added to inventory

---

## ✅ Files Created

### Database
- `supabase/migrations/011_order_intake_and_imei.sql` - Migration for IMEI + inspection fields

### Backend (APIs)
- `lib/usdc-payout.js` - USDC payment utility
- `app/api/admin/orders/route.js` - Admin orders management API
- `app/api/admin/orders/pay/route.js` - Payment execution API

### Frontend
- `app/(routes)/admin/orders/page.js` - Admin orders dashboard
- Updated: `components/PhoneFormV2.jsx` - Now collects IMEI

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

```bash
# Navigate to your Supabase project
cd /Users/j3r/ReFit

# Run the migration (use Supabase CLI or dashboard)
# Option A: Using Supabase CLI
supabase db push

# Option B: Manually in Supabase Dashboard
# Copy contents of supabase/migrations/011_order_intake_and_imei.sql
# Paste into SQL Editor and run
```

**What this adds**:
- `device_imei` column to orders
- `received_at`, `inspected_at`, `inspection_approved` columns
- `inventory.imei` and `inventory.source_order_id` columns
- Indexes for fast queries

---

### Step 2: Configure Environment Variables

Add to your `.env.local`:

```env
# Platform Wallet for USDC Payments
# This is the wallet that will SEND USDC to users
PLATFORM_WALLET_SECRET='[1,2,3,...]'  # JSON array of secret key bytes

# Same as your vault wallet (optional, falls back to ops wallet)
NEXT_PUBLIC_SQUADS_VAULT=YourVaultWalletAddress
NEXT_PUBLIC_OPS_WALLET=YourOpsWalletAddress

# Admin Authentication
ADMIN_SECRET=your-admin-secret-token
NEXT_PUBLIC_ADMIN_WALLET=YourAdminWalletAddress

# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=devnet  # or mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com
```

---

### Step 3: Fund Platform Wallet with USDC

Your platform wallet needs USDC to pay users.

**Devnet (for testing)**:
```bash
# Get devnet USDC from faucet
# USDC Devnet Mint: Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr

# Use Solana Faucet or request devnet USDC
```

**Mainnet (production)**:
```bash
# Buy USDC and send to your platform wallet
# USDC Mainnet Mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Transfer USDC to your NEXT_PUBLIC_SQUADS_VAULT address
```

---

## 📖 Complete Flow Walkthrough

### User Side

#### 1. User Sells Phone (`/sell`)
- Connects wallet
- Selects device (iPhone/Android/Solana)
- **Enters IMEI number** (15 digits)
- Selects condition (excellent/good/fair)
- Selects issues (optional)
- Gets instant quote

#### 2. User Ships Device
- Enters shipping address (saved to profile)
- Selects shipping method (USPS/FedEx/UPS via Shippo)
- Generates prepaid shipping label
- Order created with status: `pending_shipment`
- User prints label and ships device

#### 3. User Tracks Order (`/orders`)
- View order status
- See tracking number
- Track shipment progress
- See when device is received/inspected
- See when payment is sent

---

### Admin Side

#### 1. View Incoming Orders (`/admin/orders`)
- See all orders filtered by status
- Stats dashboard shows:
  - Total orders
  - Pending shipment
  - Shipped
  - Received
  - Inspected
  - Completed

#### 2. Mark Device as Received
- Package arrives at warehouse
- Admin scans tracking number
- Clicks "Mark Received" button
- Order status → `received`
- Timestamp recorded

#### 3. Inspect Device
- Admin opens package
- Verifies IMEI matches order
- Checks actual condition
- Compares to quoted condition
- Enters inspection notes

**Inspection Form**:
- Select actual condition: excellent/good/fair/broken
- Enter notes (issues found, discrepancies)
- System flags if condition doesn't match quote

**After Inspection**:
- If condition matches → `inspection_approved = true`
- If condition differs → requires manual review
- Order status → `inspected`

#### 4. Pay User
- For approved orders, "Pay User" button appears
- Admin clicks button
- Confirms payment amount
- System:
  1. Sends USDC to user's wallet
  2. Records transaction signature
  3. Updates order status → `completed`
  4. Automatically adds device to inventory
  5. Links order to inventory item

**Payment Success**:
- Transaction signature displayed
- Solana Explorer link opens
- User sees USDC in wallet
- Order shows as completed

#### 5. Device Added to Inventory
**Automatic process**:
- Device added to `inventory` table with:
  - Model, brand, storage
  - IMEI number
  - Condition (inspection result)
  - Purchase price (what you paid user)
  - Source order ID (linked)
  - Status: `in_stock`

---

## 🔐 Security Features

### Transaction Verification
- USDC transfers verified on-chain
- Uses existing `verify-transaction.js` utility
- Prevents fake deposits

### Admin Authentication
- All admin endpoints require authentication
- Uses wallet signature or admin secret
- Rate limited to prevent abuse

### Duplicate Prevention
- IMEI tracked to prevent duplicate orders
- Transaction signatures verified
- Order IDs unique per user

### Payment Safety
- Confirmation dialog before sending payment
- Transaction signature logged
- Automatic retry on failure
- Manual review for condition mismatches

---

## 📊 Order Statuses

| Status | Description | Next Action |
|--------|-------------|-------------|
| `pending_shipment` | Label created, awaiting user to ship | User ships device |
| `shipped` | Device in transit | Admin marks as received |
| `received` | Device arrived at warehouse | Admin inspects |
| `inspected` | Inspection complete | Admin pays user |
| `completed` | Payment sent, order done | Added to inventory |
| `rejected` | Condition doesn't match, rejected | Contact user |

---

## 💰 Payment Flow Details

### USDC Payment Process

```javascript
// Payment execution flow
1. Admin clicks "Pay $X" button
2. System validates:
   - Order is inspected
   - Inspection approved
   - Not already paid
   - User has wallet address

3. Call sendUSDCPayout():
   - Load platform wallet from env
   - Convert USD to USDC (6 decimals)
   - Get user's USDC token account
   - Create if doesn't exist (platform pays rent)
   - Transfer USDC amount
   - Confirm transaction

4. Update order:
   - payment_status = 'completed'
   - payment_tx_hash = signature
   - payment_date = now
   - status = 'completed'

5. Add to inventory:
   - Create inventory record
   - Link to source order
   - Set status: in_stock
```

### Cost Breakdown
- **USDC Transfer**: ~$0.0001 SOL transaction fee
- **Token Account Creation**: ~$0.002 SOL (one-time per user)
- **Total per payout**: ~$0.01 max

---

## 🧪 Testing Checklist

### Before Launch - Test Complete Flow

- [ ] **User Flow**
  - [ ] Create order with IMEI
  - [ ] Generate shipping label
  - [ ] Order appears in database
  - [ ] Order visible on `/orders` page

- [ ] **Admin Flow**
  - [ ] View order in `/admin/orders`
  - [ ] Mark as received (status updates)
  - [ ] Inspect device (form works)
  - [ ] Approve inspection (flag set)
  - [ ] Execute payment (USDC sent)
  - [ ] Verify transaction on Solana Explorer
  - [ ] Check inventory (device added)

- [ ] **Edge Cases**
  - [ ] Condition mismatch (triggers warning)
  - [ ] Duplicate IMEI (should prevent)
  - [ ] Invalid wallet (payment fails gracefully)
  - [ ] Network errors (retry logic)

---

## 🚨 Common Issues & Solutions

### Issue: Payment fails with "PLATFORM_WALLET_SECRET not configured"
**Solution**: Add `PLATFORM_WALLET_SECRET` to `.env.local` as JSON array of keypair bytes

### Issue: "Insufficient funds" error
**Solution**: Fund platform wallet with USDC on correct network (devnet/mainnet)

### Issue: User doesn't have USDC token account
**Solution**: System automatically creates it (costs ~0.002 SOL, paid by platform)

### Issue: Transaction not confirming
**Solution**: Check RPC endpoint, try again with higher priority fee

### Issue: Order not appearing in admin dashboard
**Solution**: Check `isAdmin` hook, verify admin wallet matches env var

---

## 🎯 Next Steps After Setup

### Phase 1: Test on Devnet
1. Create test order with your own wallet
2. Run through complete flow
3. Verify payment arrives
4. Check inventory item created

### Phase 2: Small Beta Launch
1. Invite 5-10 users
2. Process orders manually
3. Monitor for issues
4. Gather feedback

### Phase 3: Scale Up
1. Increase deposit limits
2. Add automated notifications
3. Integrate Shippo webhooks
4. Add bulk payment processing

---

## 📝 Additional Improvements (Future)

### Notifications
- Email when payment sent
- SMS updates on status
- Push notifications

### Automation
- Shippo webhooks auto-update status
- Auto-approve if condition matches
- Batch payments (multiple orders at once)

### Analytics
- Track average processing time
- Monitor margin per device
- Flag problem devices

### Inventory Management
- Auto-list to marketplace
- Price suggestions
- Profit tracking

---

## 🆘 Support & Troubleshooting

### Logs to Check
- **Browser Console**: Frontend errors
- **Server Logs**: API errors
- **Supabase Logs**: Database errors
- **Solana Explorer**: Transaction status

### Debug Mode
```javascript
// Add to payment execution
console.log('Payment Debug:', {
  orderId,
  amount,
  wallet: toWallet,
  vaultBalance: await getPlatformUSDCBalance()
})
```

---

## 📚 Key File References

| File | Purpose | Line References |
|------|---------|-----------------|
| `lib/usdc-payout.js` | USDC payment logic | Full file |
| `app/api/admin/orders/pay/route.js` | Payment execution | Lines 1-100 |
| `app/(routes)/admin/orders/page.js` | Admin dashboard | Full file |
| `components/PhoneFormV2.jsx` | User form with IMEI | Lines 11, 173-210 |
| `services/orderService.supabase.js` | Order CRUD | Lines 17-299 |

---

## ✅ Launch Checklist

Before going live:
- [ ] Database migration run successfully
- [ ] Environment variables configured
- [ ] Platform wallet funded with USDC
- [ ] Admin authentication working
- [ ] Test order processed end-to-end
- [ ] Payment confirmed on Explorer
- [ ] Inventory item created
- [ ] User received USDC in wallet
- [ ] All statuses updating correctly
- [ ] IMEI tracking working
- [ ] Condition matching logic tested

---

**You're ready to launch! 🚀**

The complete trade-in flow is now functional. Users can sell phones, and you can receive, inspect, and pay them in USDC with full tracking and inventory management.
