# ReFit Trade-In Launch Plan

## Critical Files Needed for MVP Launch

### 1. Admin Orders Dashboard
**File**: `app/(routes)/admin/orders/page.js`
- View all orders in table format
- Filter by status: pending_shipment, shipped, received, inspected, completed
- Actions: Mark as Received, Inspect, Pay User
- Status: ❌ NOT CREATED

### 2. Admin Order Detail Page
**File**: `app/(routes)/admin/orders/[id]/page.js`
- Full order details
- Inspection form
- Payment execution button
- Order timeline
- Status: ❌ NOT CREATED

### 3. Payment Execution API
**File**: `app/api/admin/orders/pay/route.js`
- Transfer SOL to user wallet
- Update payment status
- Add device to inventory
- Status: ❌ NOT CREATED

### 4. Order Update API
**File**: `app/api/admin/orders/update-status/route.js`
- Mark as received
- Mark as inspected
- Add inspection notes
- Status: ❌ NOT CREATED

### 5. Shippo Webhook Handler
**File**: `app/api/webhooks/shippo/route.js`
- Handle delivery notifications
- Auto-update order status
- Status: ❌ NOT CREATED

### 6. Database Migration
**File**: `supabase/migrations/011_order_intake_fields.sql`
```sql
ALTER TABLE orders ADD COLUMN received_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN inspected_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN inspected_by TEXT;
ALTER TABLE orders ADD COLUMN inspection_notes TEXT;
ALTER TABLE orders ADD COLUMN inspection_condition TEXT;
ALTER TABLE orders ADD COLUMN inspection_approved BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN device_imei TEXT;
ALTER TABLE orders ADD COLUMN device_serial TEXT;
ALTER TABLE orders ADD COLUMN device_battery_health INTEGER;
ALTER TABLE orders ADD COLUMN device_photos TEXT[];
ALTER TABLE orders ADD COLUMN icloud_status TEXT; -- 'locked' | 'unlocked' | 'unknown'

-- Index for admin queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_received_at ON orders(received_at);
```
- Status: ❌ NOT CREATED

### 7. SOL Transfer Utility
**File**: `lib/solana-transfer.js`
```javascript
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function transferSOL({ from, to, amountSOL }) {
  // Implementation needed
}
```
- Status: ❌ NOT CREATED

### 8. Inventory Auto-Add Function
**File**: `lib/inventory-integration.js`
```javascript
export async function addOrderToInventory(order, inspectionData) {
  // Add device to inventory table
  // Link order_id
  // Set initial status as 'in_stock'
}
```
- Status: ❌ NOT CREATED

---

## Database Schema Updates Needed

### Current Schema ✅
- orders table exists
- profiles table exists
- inventory table exists
- status_history (JSONB) exists

### Missing Columns ❌
Add to `orders` table:
- `received_at` - timestamp when device arrives
- `inspected_at` - timestamp when inspection completes
- `inspected_by` - admin wallet who inspected
- `inspection_notes` - notes from inspection
- `inspection_condition` - actual condition found
- `inspection_approved` - boolean
- `device_imei` - IMEI number
- `device_serial` - serial number
- `device_battery_health` - percentage
- `device_photos` - array of photo URLs
- `icloud_status` - locked/unlocked/unknown

Add to `inventory` table:
- `source_order_id` - link back to order
- `imei` - IMEI number (might already exist)
- `serial_number` - serial number
- `acquisition_date` - when added to inventory

---

## Testing Checklist

### Manual Testing Flow
- [ ] User creates order on `/sell`
- [ ] Shipping label generated successfully
- [ ] Order appears in `/orders` for user
- [ ] Order appears in `/admin/orders` for admin
- [ ] Admin marks order as "received"
- [ ] Admin inspects device, approves condition
- [ ] Admin clicks "Pay User" button
- [ ] SOL transfer executes on Solana
- [ ] User sees payment in wallet
- [ ] Order status updates to "completed"
- [ ] Device auto-added to inventory
- [ ] Invoice can be created from inventory item

### Automated Tests (Future)
- [ ] Order creation test
- [ ] Status update test
- [ ] Payment execution test
- [ ] Inventory integration test

---

## Launch Criteria

### Must Have (Blockers)
- [x] User can get quote
- [x] User can generate shipping label
- [x] Order saved to database
- [ ] Admin can view incoming orders
- [ ] Admin can mark device as received
- [ ] Admin can inspect and approve device
- [ ] Admin can execute SOL payment
- [ ] Device auto-added to inventory

### Should Have
- [ ] Shippo webhook for auto-updates
- [ ] Email notifications
- [ ] IMEI/Serial collection
- [ ] Photo upload for devices

### Nice to Have
- [ ] Public stats page
- [ ] Advanced analytics
- [ ] CSV export
- [ ] Dispute resolution flow

---

## Estimated Timeline

### Phase 1: Critical Features (3-4 days)
- Day 1: Admin orders dashboard + detail page
- Day 2: Payment execution API + SOL transfer
- Day 3: Database migration + testing
- Day 4: Inventory integration + bug fixes

### Phase 2: Polish (2-3 days)
- Day 5-6: Webhooks + notifications
- Day 7: Missing data fields + photo upload

### Phase 3: Launch Prep (1-2 days)
- Day 8: End-to-end testing with real devices
- Day 9: Documentation + admin training

**Total: 7-9 days to production-ready MVP**

---

## Next Steps

1. Create database migration for inspection fields
2. Build `/admin/orders` dashboard
3. Build payment execution endpoint
4. Test with 1-2 real devices
5. Launch to beta users

---

Last Updated: 2025-11-05
