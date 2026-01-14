// Verify KT Corp pricing is correctly applied
const ktCorpPrices = {
  'iPhone 15 Pro Max 256GB': { B: 500, C: 320, D: 200 },
  'iPhone 14 Pro 128GB': { B: 300, C: 200, D: 110 },
  'iPhone 13 128GB': { B: 160, C: 90, D: 50 }
};

const margins = {
  'good': { grade: 'B', margin: 0.82 },    // 18% margin
  'fair': { grade: 'C', margin: 0.80 },    // 20% margin
  'poor': { grade: 'D', margin: 0.80 }     // 20% margin (maps to fair)
};

async function verifyPricing() {
  console.log("🔍 Verifying KT Corp Pricing Implementation\n");
  console.log("=" . repeat(60));

  const tests = [
    {
      model: "iPhone 15 Pro Max",
      storage: "256GB",
      condition: "good",
      expectedSupplierPrice: 500,
      expectedMargin: 0.82,
      expectedQuote: Math.round(500 * 0.82) // $410
    },
    {
      model: "iPhone 15 Pro Max",
      storage: "256GB",
      condition: "fair",
      expectedSupplierPrice: 320,
      expectedMargin: 0.80,
      expectedQuote: Math.round(320 * 0.80) // $256
    },
    {
      model: "iPhone 14 Pro",
      storage: "128GB",
      condition: "good",
      expectedSupplierPrice: 300,
      expectedMargin: 0.82,
      expectedQuote: Math.round(300 * 0.82) // $246
    },
    {
      model: "iPhone 13",
      storage: "128GB",
      condition: "fair",
      expectedSupplierPrice: 90,
      expectedMargin: 0.80,
      expectedQuote: Math.round(90 * 0.80) // $72
    }
  ];

  let allPassed = true;

  for (const test of tests) {
    const response = await fetch('http://localhost:3001/api/mobile/v1/phone/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: test.model,
        storage: test.storage,
        carrier: "Unlocked",
        condition: test.condition
      })
    });

    const result = await response.json();

    console.log(`\n📱 ${test.model} ${test.storage} - ${test.condition}`);
    console.log(`   KT Corp Price (Grade ${margins[test.condition].grade}): $${test.expectedSupplierPrice}`);
    console.log(`   Applied Margin: ${(1 - test.expectedMargin) * 100}%`);
    console.log(`   Expected Quote: $${test.expectedQuote}`);
    console.log(`   Actual Quote: $${result.data?.quote || result.quoteUSD}`);

    const actualQuote = result.data?.quote || result.quoteUSD;
    if (actualQuote === test.expectedQuote) {
      console.log(`   ✅ CORRECT!`);
    } else {
      console.log(`   ❌ MISMATCH - Expected $${test.expectedQuote}, got $${actualQuote}`);
      allPassed = false;
    }
  }

  console.log("\n" + "=" . repeat(60));
  if (allPassed) {
    console.log("✅ All prices match KT Corp pricing with correct margins!");
  } else {
    console.log("❌ Some prices don't match expected values");
  }

  console.log("\n📊 Margin Summary:");
  console.log("   Grade B (Good): 18% margin (customer pays 82% of supplier price)");
  console.log("   Grade C (Fair): 20% margin (customer pays 80% of supplier price)");
  console.log("   Grade D (Poor): 20% margin (customer pays 80% of supplier price)");
}

verifyPricing().catch(console.error);