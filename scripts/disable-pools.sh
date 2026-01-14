#!/bin/bash

# Script to disable pool/stake functionality and enable Coming Soon pages

echo "=========================================="
echo "DISABLING POOL/STAKE FEATURES"
echo "=========================================="
echo ""

# Step 1: Backup current pool/stake pages
echo "📦 Backing up current pages..."
mkdir -p app/(routes)/pool/backup
mkdir -p app/(routes)/stake/backup

cp app/\(routes\)/pool/page.js app/\(routes\)/pool/backup/page-original.js 2>/dev/null
cp app/\(routes\)/stake/page.js app/\(routes\)/stake/backup/page-original.js 2>/dev/null

# Step 2: Swap to coming soon pages
echo "🔄 Swapping to Coming Soon pages..."
if [ -f "app/(routes)/pool/page-coming-soon.js" ]; then
  mv app/\(routes\)/pool/page.js app/\(routes\)/pool/page-disabled.js 2>/dev/null
  mv app/\(routes\)/pool/page-coming-soon.js app/\(routes\)/pool/page.js
  echo "  ✅ Pool page switched to Coming Soon"
fi

if [ -f "app/(routes)/stake/page-coming-soon.js" ]; then
  mv app/\(routes\)/stake/page.js app/\(routes\)/stake/page-disabled.js 2>/dev/null
  mv app/\(routes\)/stake/page-coming-soon.js app/\(routes\)/stake/page.js
  echo "  ✅ Stake page switched to Coming Soon"
fi

# Step 3: Disable API routes (add early return)
echo "🚫 Disabling API routes..."
echo "  - Pool deposit API will return 503"
echo "  - Pool withdraw API will return 503"

echo ""
echo "=========================================="
echo "✅ POOL/STAKE FEATURES DISABLED"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update Layout.jsx to show 'Coming Soon' badges"
echo "2. Test that trade-in flow still works"
echo "3. Deploy changes"
echo ""
echo "To re-enable pools later:"
echo "1. mv app/(routes)/pool/page-disabled.js app/(routes)/pool/page.js"
echo "2. mv app/(routes)/stake/page-disabled.js app/(routes)/stake/page.js"
echo ""