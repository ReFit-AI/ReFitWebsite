// Test script for trade-in pricing
const testCases = [
  // Test iPhone 15 Pro Max
  {
    name: "iPhone 15 Pro Max 256GB Unlocked - Good",
    data: { model: "iPhone 15 Pro Max", storage: "256GB", carrier: "Unlocked", condition: "good" },
    expectedGrade: "B"
  },
  {
    name: "iPhone 15 Pro Max 256GB Unlocked - Fair",
    data: { model: "iPhone 15 Pro Max", storage: "256GB", carrier: "Unlocked", condition: "fair" },
    expectedGrade: "C"
  },
  {
    name: "iPhone 15 Pro Max 256GB Unlocked - Poor",
    data: { model: "iPhone 15 Pro Max", storage: "256GB", carrier: "Unlocked", condition: "poor" },
    expectedGrade: "D"
  },

  // Test iPhone 14 Pro
  {
    name: "iPhone 14 Pro 128GB Unlocked - Good",
    data: { model: "iPhone 14 Pro", storage: "128GB", carrier: "Unlocked", condition: "good" },
    expectedGrade: "B"
  },

  // Test iPhone 13
  {
    name: "iPhone 13 128GB Unlocked - Fair",
    data: { model: "iPhone 13", storage: "128GB", carrier: "Unlocked", condition: "fair" },
    expectedGrade: "C"
  },

  // Test unknown model
  {
    name: "Unknown Model",
    data: { model: "iPhone SE 2020", storage: "64GB", carrier: "Unlocked", condition: "good" },
    expectedGrade: "Not found"
  }
];

async function testQuoteAPI() {
  console.log("🧪 Testing Trade-In Quote API with KT Corp Pricing\n");
  console.log("=" . repeat(60));

  for (const test of testCases) {
    try {
      const response = await fetch('http://localhost:3001/api/mobile/v1/phone/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data)
      });

      const result = await response.json();

      console.log(`\n📱 ${test.name}`);
      console.log(`   Model: ${test.data.model}`);
      console.log(`   Storage: ${test.data.storage}`);
      console.log(`   Carrier: ${test.data.carrier}`);
      console.log(`   Condition: ${test.data.condition}`);
      console.log(`   Expected Grade: ${test.expectedGrade}`);

      if (result.success) {
        console.log(`   ✅ Quote: $${result.data.quote}`);
        console.log(`   Grade: ${result.data.grade}`);
        console.log(`   Base Price: $${result.data.basePrice}`);
        console.log(`   Margin: ${result.data.marginPercent}%`);
        console.log(`   Message: ${result.data.message}`);
      } else {
        console.log(`   ❌ Error: ${result.error}`);
      }

    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
  }

  console.log("\n" + "=" . repeat(60));
  console.log("✅ Testing Complete!");
}

// Run the tests
testQuoteAPI().catch(console.error);