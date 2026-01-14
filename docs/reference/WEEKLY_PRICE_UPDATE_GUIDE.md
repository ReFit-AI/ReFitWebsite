# Weekly Price Update Guide

## 📅 Weekly Process for Updating Supplier Prices

### Overview
ReFit uses supplier pricing from SA (formerly Atlas) and KT Corp. These prices update weekly, typically on Tuesdays. This guide explains how to update your system with new prices.

---

## 🔄 Quick Update Process

### Step 1: Receive New Price Lists
**When:** Every Tuesday morning
**From:**
- SA (Eric/Will/Kyle) - CSV format
- KT Corp - Excel format

**Save to:** `/PriceLists/` directory with date in filename
- Example: `SA_11.5.2025 - iPhone Used.csv`
- Example: `KT Corp - PPL (USED) #20251105.xlsx`

### Step 2: Import SA Prices
```bash
# Run the import script
node scripts/import-sa-prices.js

# This will:
# - Parse the CSV file
# - Convert grades (A→B+, B→B, C→C, D→D)
# - Update /data/supplier-pricing-iphones-updated.json
# - Show processed devices count
```

### Step 3: Test Pricing
```bash
# Run pricing test to verify margins
node scripts/test-pricing-simple.js

# Should show:
# ✅ All tests passed
# - Excellent: 15% margin
# - Good: 18% margin
# - Fair: 20% margin
```

### Step 4: Deploy Changes
```bash
# Commit and push
git add data/supplier-pricing-*.json PriceLists/*
git commit -m "feat: Update pricing - SA 11/5/2025"
git push

# Deploy to production
vercel --prod
```

---

## 📊 Understanding the Pricing Flow

### Supplier Grades → Our System
```
SA Grade A  → Our Grade B+ (not used currently)
SA Grade B  → Our Grade B  → "Excellent" (15% margin)
SA Grade C  → Our Grade C  → "Good" (18% margin)
SA Grade D  → Our Grade D  → "Fair" (20% margin)
```

### Example Calculation
**iPhone 16 Pro Max 256GB Unlocked - Excellent:**
- SA buys at: $1,000 (Grade B)
- Our margin: 15%
- We pay user: $850
- Our profit: $150

---

## 🛠️ Troubleshooting

### Issue: Import script can't find CSV
**Solution:** Check filename matches exactly in `scripts/import-sa-prices.js` line 16

### Issue: Prices seem too low/high
**Solution:** Verify SA didn't change their grade structure. Check deductions haven't changed.

### Issue: Model not found
**Solution:** SA may have added new models. Update POPULAR_MODELS in `pricing-engine-v3.js`

---

## 📝 Manual Price Adjustments

### Update Individual Prices
Edit `/data/supplier-pricing-iphones-updated.json` directly:
```json
{
  "model": "iPhone 16 Pro Max",
  "storage": "256GB",
  "lock_status": "Unlocked",
  "prices": {
    "B+": 1020,  // SA Grade A
    "B": 1000,   // SA Grade B
    "C": 750,    // SA Grade C
    "D": 500     // SA Grade D
  }
}
```

### Adjust Margins
Edit `/lib/pricing-engine-v3.js` lines 37-39:
```javascript
const CONDITION_MAPPING = {
  'excellent': { grade: 'B', margin: 0.85 },  // 15% margin
  'good': { grade: 'C', margin: 0.82 },       // 18% margin
  'fair': { grade: 'D', margin: 0.80 },       // 20% margin
};
```

### Change Deductions
Edit `/lib/pricing-engine-v3.js` lines 43-52:
```javascript
const ISSUE_DEDUCTIONS = {
  'face_id_broken': 400,
  'cracked_camera_lens': 80,
  'back_crack': 150,
  // etc...
};
```

---

## 📈 Monitoring & Analytics

### Track Key Metrics
- **Average margin per device:** Should be 15-20%
- **Popular models:** iPhone 16/15 Pro Max usually highest volume
- **Condition distribution:** Most are "Good" (60%), then "Excellent" (30%), "Fair" (10%)

### Weekly Review Checklist
- [ ] Prices updated from latest sheets
- [ ] Test shows correct margins
- [ ] No errors in production
- [ ] Order volume normal
- [ ] Margin targets met

---

## 🚨 Important Notes

1. **iPhone 17 in SA sheets:** SA uses "iPhone 17" as placeholder for iPhone 16. The import script automatically corrects this.

2. **Timing matters:** Update prices Tuesday morning before users start trading. Consider maintenance window 6-8 AM EST.

3. **Backup first:** Always backup current JSON before updating:
   ```bash
   cp data/supplier-pricing-iphones-updated.json data/backup/$(date +%Y%m%d).json
   ```

4. **Test on staging:** If available, test on staging environment first.

---

## 📞 Contacts

### SA (formerly Atlas)
- Eric Wolak: 610-462-4275 (WhatsApp preferred)
- Will Godiska: 610-428-6859
- Kyle Werner: 484-866-1772
- Email: SellAtlas@gmail.com

### KT Corp
- Check their Excel sheet for current contact

---

## 🔧 Future Improvements

### Automation Ideas
1. **API Integration:** Request API access from suppliers
2. **Email Parser:** Auto-import from weekly emails
3. **Price History:** Track price trends over time
4. **Alerts:** Notify when prices drop >10%

### Currently Manual But Could Automate
- Parsing KT Excel files (more complex format)
- Android pricing updates
- Comparing SA vs KT prices for arbitrage
- Sending price update notifications to users

---

**Last Updated:** November 5, 2025
**Next Price Update Due:** November 12, 2025 (Tuesday)