#!/bin/bash

# Weekly Price Update Script
# Run this script weekly to update prices from all vendors

echo "=========================================="
echo "REFIT WEEKLY PRICE UPDATE"
echo "=========================================="
echo ""

# Get current date
DATE=$(date +"%Y-%m-%d %H:%M")
echo "📅 Running update at: $DATE"
echo ""

# Step 1: Run the unified import script
echo "📊 Importing vendor prices..."
python3 scripts/import-vendor-prices.py

if [ $? -eq 0 ]; then
    echo "✅ Price import successful"
else
    echo "❌ Price import failed"
    exit 1
fi

echo ""
echo "🔄 Testing pricing engine..."

# Step 2: Test the pricing engine
node -e "
import { calculateQuote, getPricingStats } from './lib/pricing-engine.js';

// Get stats
const stats = getPricingStats();
console.log('📊 Pricing Stats:');
console.log('  Last updated:', stats.lastUpdated);
console.log('  Total devices:', stats.deviceCount.total);
console.log('  iPhones:', stats.deviceCount.iphone);
console.log('  Samsung:', stats.deviceCount.samsung);

// Test a sample quote
const quote = calculateQuote({
  modelId: 'iphone-17-pro-max',
  storage: '256GB',
  carrier: 'unlocked',
  condition: 'excellent',
  issues: [],
  accessories: {}
});

if (quote.error) {
  console.log('❌ Quote test failed:', quote.error);
  process.exit(1);
} else {
  console.log('\n✅ Quote test successful:');
  console.log('  iPhone 17 Pro Max 256GB Unlocked');
  console.log('  Our price: $' + quote.usdPrice);
  console.log('  Wholesale: $' + quote.wholesalePrice);
  console.log('  Margin:', quote.marginPercent);
}
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Pricing engine working correctly"
else
    echo "❌ Pricing engine test failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ PRICE UPDATE COMPLETE"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review the updated prices in /data/pricing-*.json"
echo "2. Test the sell flow in the app"
echo "3. Deploy changes if everything looks good"
echo ""
echo "To schedule weekly updates, add to crontab:"
echo "0 9 * * 1 cd /Users/j3r/ReFit && bash scripts/update-prices.sh"
echo ""