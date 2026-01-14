# Shipping Configuration: UPS Only

## ✅ Changes Made

Updated `/app/api/shipping/rates/route.js` to show only UPS shipping options.

### What Changed:
- **Removed:** USPS Priority Mail options
- **Kept:** Multiple UPS service levels for flexibility

### Available UPS Services:

1. **UPS Ground Saver** (~$8.09)
   - Most economical option
   - 5 days transit time
   - Full tracking included

2. **UPS Ground** (~$8.61)
   - Standard option
   - 4 days transit time
   - Slightly faster than Ground Saver

3. **UPS 3 Day Select** (~$12.95)
   - Mid-tier option
   - 3 days guaranteed
   - Good for time-sensitive trades

4. **UPS 2nd Day Air** (~$13.55)
   - Premium option
   - 2 days guaranteed
   - For urgent shipments

### Excluded Services:
- ❌ UPS Next Day Air (too expensive at $42+)
- ❌ UPS Next Day Air Early (too expensive at $81+)
- ❌ All USPS options

## 📦 User Experience

### What Users See:
- **Free shipping** (you cover the cost)
- Up to 3 UPS options based on availability
- Sorted by cost (cheapest first)
- Clear transit times

### Example Display:
```
Select Shipping Method:

□ UPS Ground Saver - FREE
  Estimated delivery: 5 business days

□ UPS Ground - FREE
  Estimated delivery: 4 business days

□ UPS 3 Day Select - FREE
  Estimated delivery: 3 business days
```

## 💰 Cost Impact

### Typical Costs (you pay):
- **Most users:** $8-9 (Ground options)
- **Urgent:** $13 (2-Day Air)
- **Average:** ~$9 per shipment

### On Your Margins:
- iPhone trade example: $150 profit - $9 shipping = $141 net
- Still healthy 14% margin after shipping

## 🎯 Why UPS Only?

### Benefits:
- **Consistency:** One carrier, one tracking system
- **Reliability:** UPS has excellent track record
- **Professional:** Business-focused service
- **Insurance:** Better coverage for electronics

### Considerations:
- Some rural areas may have longer transit times
- No USPS fallback for PO boxes (UPS doesn't deliver to PO boxes)

## 🔧 To Revert (if needed):

If you want to add USPS back later, change lines 134-153 in `/app/api/shipping/rates/route.js`:

```javascript
// Add back USPS Priority Mail
if (rate.provider === 'USPS' &&
    serviceName.includes('priority mail') &&
    !serviceName.includes('express')) {
  return true;
}
```

## ✅ Current Status

- **Configuration:** UPS-only shipping
- **Services:** Ground, 3-Day, 2-Day options
- **User cost:** FREE (you pay)
- **Your cost:** $8-14 per label
- **Ready to use:** Yes!