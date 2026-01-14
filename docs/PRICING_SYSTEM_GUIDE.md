# ReFit Pricing System Guide

## 📋 Overview

The ReFit pricing system now supports **iPhones** and **Samsung phones** with automatic best-price selection from multiple vendors.

## 🏗️ System Architecture

### Simplified Structure
```
PriceLists/                  # Vendor price sheets
├── SA_11.5.2025.csv        # SA iPhone prices
└── KT_Corp.xlsx            # KT iPhone + Samsung prices
    ↓
scripts/import-vendor-prices.py  # Unified importer
    ↓
data/                        # Processed JSON data
├── pricing-iphones.json    # Merged iPhone prices (best of both)
└── pricing-samsung.json    # Samsung prices (from KT)
    ↓
lib/pricing-engine.js       # Simplified pricing engine
    ↓
Your App                    # Uses calculateQuote()
```

## 🔄 Weekly Update Process

### Manual Update
Run this command weekly to update prices:
```bash
bash scripts/update-prices.sh
```

### Automatic Updates (Cron)
Add to crontab for weekly Monday updates at 9am:
```bash
crontab -e
# Add this line:
0 9 * * 1 cd /Users/j3r/ReFit && bash scripts/update-prices.sh
```

## 📊 How Pricing Works

### 1. Vendor Data Import
- **SA**: Provides iPhone prices only
- **KT Corp**: Provides iPhone and Samsung prices
- When both vendors have the same iPhone → **Uses highest wholesale price**

### 2. Margin Structure
```javascript
Excellent Condition (Grade B): 17% margin (includes ~2% shipping)
Good Condition (Grade C):      20% margin
Fair Condition (Grade D):      23% margin
```

### 3. Price Calculation
```
Wholesale Price (from vendors)
× Margin (0.83 for excellent)
- Issue Deductions (if any)
+ Accessory Bonuses (if any)
= Customer Offer Price
```

## 💻 Using the Pricing Engine

### Basic Quote Example
```javascript
import { calculateQuote } from '@/lib/pricing-engine';

const quote = calculateQuote({
  modelId: 'iphone-17-pro-max',
  storage: '256GB',
  carrier: 'unlocked',
  condition: 'excellent',
  issues: [],
  accessories: { charger: false, box: false }
});

console.log(`We'll pay: $${quote.usdPrice}`);
console.log(`Wholesale: $${quote.wholesalePrice}`);
console.log(`Our margin: ${quote.marginPercent}`);
```

### Samsung Quote Example
```javascript
const samsungQuote = calculateQuote({
  modelId: 'galaxy-s25-ultra',
  storage: '256GB',
  carrier: 'unlocked',
  condition: 'good',  // Cracked screen
  issues: ['missing_stylus'],  // S-Pen missing
  accessories: { charger: true, box: true }
});
```

### Available Conditions
- `excellent` → "Good Condition" (no cracks)
- `good` → "Cracked Screen" (but LCD works)
- `fair` → "LCD Issues" (damaged display)

### Issue Deductions
```javascript
'face_id_broken': -$400
'cracked_camera_lens': -$80
'unknown_parts': -$80
'bad_charging_port': -$200
'back_crack': -$150
'battery_message': -$50
'missing_stylus': -$40  // Samsung S-Pen
```

## 📈 Current Statistics

As of last update:
- **382** iPhone configurations
- **56** Samsung configurations
- **438** total device variants
- Sources: SA + KT Corp

## 🔧 Maintenance

### Adding New Vendors
1. Add price sheet to `/PriceLists/`
2. Update `import-vendor-prices.py` to parse new format
3. Merge prices using best-price logic

### Testing After Updates
```bash
# Test pricing engine
node scripts/test-pricing.js

# Check specific quote
node -e "
import { calculateQuote } from './lib/pricing-engine.js';
const q = calculateQuote({
  modelId: 'iphone-17-pro-max',
  storage: '256GB',
  carrier: 'unlocked',
  condition: 'excellent',
  issues: [],
  accessories: {}
});
console.log(q);
"
```

## 📁 File Structure

### Essential Files
```
scripts/
├── import-vendor-prices.py  # Main import script
├── update-prices.sh         # Weekly update runner
└── test-pricing.js          # Test the engine

lib/
└── pricing-engine.js        # Simplified pricing logic

data/
├── pricing-iphones.json     # iPhone prices (merged)
└── pricing-samsung.json     # Samsung prices
```

### Archived Files
Old scripts moved to `scripts/archive/old-pricing/`:
- Old import scripts
- Debug utilities
- Test files

## 🚨 Important Notes

1. **Always run price updates before major deployments**
2. **Verify Samsung S-Pen deduction for Note/Fold models**
3. **Check margins include shipping costs (~2%)**
4. **iPhone 17 models are real** (not placeholders)
5. **Best price wins** when vendors differ

## 📊 Quick Reference

### Popular Models
**iPhones:**
- iPhone 17 Pro Max
- iPhone 16 Pro Max
- iPhone 15 Pro Max

**Samsung:**
- Galaxy S25 Ultra
- Galaxy S24 Ultra
- Galaxy Z Fold 6

### Margin Quick Math
- Excellent: Pay 83¢ per wholesale dollar
- Good: Pay 80¢ per wholesale dollar
- Fair: Pay 77¢ per wholesale dollar

## 🆘 Troubleshooting

### Price Import Fails
```bash
# Check Excel/CSV files exist
ls -la PriceLists/

# Run import manually with debug
python3 scripts/import-vendor-prices.py
```

### Quote Returns Error
```javascript
// Check if model exists
import { getAllModels } from './lib/pricing-engine.js';
console.log(getAllModels());
```

### Prices Seem Wrong
1. Check `/data/pricing-*.json` files
2. Verify wholesale prices match vendor sheets
3. Confirm margin calculations

## ✅ Summary

The pricing system is now:
- **Simpler**: One import script, one pricing engine
- **Better**: Uses best prices from multiple vendors
- **Repeatable**: Weekly updates in one command
- **Expandable**: Easy to add new vendors/devices

Run `bash scripts/update-prices.sh` weekly to keep prices current!