# ReFit Pricing System Documentation

## Overview
ReFit uses a multi-tiered pricing system with different implementations for web and mobile. The system calculates buyback prices based on phone model, condition, storage, carrier status, and any issues.

## Current Pricing Structure

### 1. Main Pricing Engine (`/lib/pricing-engine-v3.js`)
The primary pricing system used by the web application.

#### Key Components:

**Margin Structure (Lines 35-40):**
```javascript
- Excellent condition → Grade B: 15% margin (0.85 multiplier)
- Good condition → Grade C: 18% margin (0.82 multiplier)
- Fair condition → Grade D: 20% margin (0.80 multiplier)
```

**Issue Deductions (Lines 42-53):**
- Face ID broken: -$400
- Cracked camera lens: -$80
- Unknown parts: -$80
- Bad charging port: -$200
- Back crack: -$150
- MDM locked: -$200
- Battery message: -$50
- Missing stylus: -$40 (Samsung Note/Fold)

**Pricing Calculation Flow:**
1. Load base prices from JSON data files
2. Apply condition-based margin (15-20%)
3. Subtract issue deductions
4. Add accessory bonuses (+$5 each for charger/box)
5. Enforce minimum price floor ($20)

### 2. Data Sources

#### iPhone Pricing (`/data/supplier-pricing-iphones-updated.json`)
- Contains pricing for all iPhone models
- Organized by: Model → Storage → Lock Status → Grade (A, B+, B, C, D)
- Example: iPhone 11 64GB Unlocked Grade B = $105

#### Android Pricing (`/data/supplier-pricing-androids-updated.json`)
- Samsung Galaxy models primarily
- Same structure as iPhone pricing

### 3. Mobile API (`/app/api/mobile/v1/phone/quote/route.js`)
**Different pricing system** - uses percentage-based multipliers:

```javascript
iPhone 16 Pro Max base: $1199
- Excellent: 85% of base
- Good: 70% of base
- Fair: 55% of base
- Broken: 30% of base
```

Storage adjustments:
- 256GB: +5%
- 512GB: +10%
- 1TB: +15%

Carrier adjustment:
- Unlocked: +10%

### 4. Pricing Grade Mapping

**Supplier Grades → User Conditions:**
- Grade A/B+ → "Excellent"
- Grade B → "Excellent" (with 15% margin)
- Grade C → "Good" (with 18% margin)
- Grade D → "Fair" (with 20% margin)

## Where Prices Are Used

1. **Web Quote Form:**
   - `/components/PhoneFormV2.jsx`
   - `/components/SmartPhoneSelector.jsx`
   - Uses `pricing-engine-v3.js`

2. **Mobile API:**
   - `/app/api/mobile/v1/phone/quote/route.js`
   - Has its own pricing logic (not using pricing-engine)

3. **Admin Inventory:**
   - Can manually set purchase prices
   - Tracks cost vs selling price for margin calculation

## How to Update Prices

### Option 1: Update JSON Data Files (Recommended)
1. Edit `/data/supplier-pricing-iphones-updated.json`
2. Edit `/data/supplier-pricing-androids-updated.json`
3. Prices automatically reflect in web quotes

### Option 2: Adjust Margins
1. Edit `/lib/pricing-engine-v3.js` lines 35-40
2. Change the margin multipliers (currently 0.85, 0.82, 0.80)

### Option 3: Update Mobile API
1. Edit `/app/api/mobile/v1/phone/quote/route.js`
2. Update the PHONE_DATABASE object with new base prices

### Option 4: Modify Issue Deductions
1. Edit `/lib/pricing-engine-v3.js` lines 42-53
2. Adjust deduction amounts for various issues

## Current Profit Margins

- **Excellent condition:** 15% margin
- **Good condition:** 18% margin
- **Fair condition:** 20% margin

Example calculation:
- Supplier price (Grade B): $100
- Our buyback price: $85 (15% margin)
- Profit when resold: $15

## Important Notes

1. **Two Different Systems:** The web and mobile APIs use completely different pricing logic
2. **Minimum Price:** All quotes have a $20 floor price
3. **SOL Conversion:** Uses live SOL price (fallback to $180 if API fails)
4. **Accessories:** Small bonuses for original charger (+$5) and box (+$5)

## Files to Update with New Price Sheets

1. **Primary Data Files:**
   - `/data/supplier-pricing-iphones-updated.json` ← Main iPhone prices
   - `/data/supplier-pricing-androids-updated.json` ← Main Android prices

2. **Mobile API (if needed):**
   - `/app/api/mobile/v1/phone/quote/route.js` ← Mobile app pricing

3. **Margin Adjustments (if needed):**
   - `/lib/pricing-engine-v3.js` ← Margins and deductions

## Testing Price Updates

After updating prices:
1. Test on `/sell` page (web quotes)
2. Test mobile API: `POST /api/mobile/v1/phone/quote`
3. Verify margins in admin panel at `/admin/inventory`