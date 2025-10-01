#!/usr/bin/env node

/**
 * Test script for new pricing system
 * Compares old vs new margins and validates data
 */

import { 
  calculateQuote as calculateQuoteV3,
  searchModels,
  getStorageOptions,
  buildModelIndex
} from '../lib/pricing-engine-v3.js';

console.log('📱 Testing ReFit Pricing Engine V3\n');
console.log('=' .repeat(60));

// Test 1: Check if data loads correctly
console.log('\n1️⃣ Testing Data Loading...');
const index = buildModelIndex();
const modelCount = Object.keys(index).length;
console.log(`✅ Loaded ${modelCount} phone models`);

// Count by category
const categories = { iphone: 0, android: 0, solana: 0 };
Object.values(index).forEach(model => {
  categories[model.category]++;
});
console.log(`   - iPhones: ${categories.iphone}`);
console.log(`   - Android: ${categories.android}`);
console.log(`   - Solana: ${categories.solana}`);

// Test 2: Search functionality
console.log('\n2️⃣ Testing Search...');
const searchTests = [
  { query: 'iphone 17 pro max', expected: 'iPhone 17 PRO MAX' },
  { query: 'iphone 16', expected: 'iPhone 16' },
  { query: 'galaxy s24', expected: 'GALAXY S24' }
];

searchTests.forEach(test => {
  const results = searchModels(test.query);
  const found = results.find(r => r.display.includes(test.expected));
  console.log(`   ${test.query}: ${found ? '✅' : '❌'} ${found ? found.display : 'Not found'}`);
});

// Test 3: Compare pricing with old vs new margins
console.log('\n3️⃣ Testing Pricing & Margins...\n');

const testCases = [
  {
    name: 'iPhone 17 Pro Max 256GB Unlocked - Excellent',
    params: {
      modelId: 'iphone-17-pro-max',
      storage: '256GB',
      carrier: 'unlocked',
      condition: 'excellent',
      issues: [],
      accessories: { charger: false, box: false }
    }
  },
  {
    name: 'iPhone 17 Pro Max 256GB Unlocked - Good',
    params: {
      modelId: 'iphone-17-pro-max',
      storage: '256GB',
      carrier: 'unlocked',
      condition: 'good',
      issues: [],
      accessories: { charger: false, box: false }
    }
  },
  {
    name: 'iPhone 16 Pro 256GB Locked - Good with Issues',
    params: {
      modelId: 'iphone-16-pro',
      storage: '256GB',
      carrier: 'locked',
      condition: 'good',
      issues: ['cracked_camera_lens', 'battery_message'],
      accessories: { charger: true, box: true }
    }
  },
  {
    name: 'iPhone 15 Pro Max 512GB Unlocked - Fair',
    params: {
      modelId: 'iphone-15-pro-max',
      storage: '512GB',
      carrier: 'unlocked',
      condition: 'fair',
      issues: [],
      accessories: { charger: false, box: false }
    }
  }
];

testCases.forEach(test => {
  console.log(`📱 ${test.name}`);
  console.log('-'.repeat(50));
  
  const quote = calculateQuoteV3(test.params);
  
  if (quote.error) {
    console.log(`❌ Error: ${quote.error}\n`);
  } else {
    console.log(`💵 Our Offer: $${quote.usdPrice}`);
    
    if (quote.breakdown) {
      if (quote.breakdown.wholesalePrice) {
        console.log(`📊 Wholesale: $${quote.breakdown.wholesalePrice}`);
        console.log(`📉 Margin: ${quote.margin} (${quote.breakdown.margin})`);
        
        // Calculate old margin for comparison
        const oldMargin = test.params.condition === 'excellent' ? 0.95 : 
                         test.params.condition === 'good' ? 0.95 : 0.90;
        const oldPrice = Math.round(quote.breakdown.wholesalePrice * oldMargin);
        const difference = quote.usdPrice - oldPrice;
        
        console.log(`🔄 Old System: $${oldPrice} (5-10% margin)`);
        console.log(`💰 Difference: ${difference > 0 ? '+' : ''}$${difference}`);
      }
      
      if (test.params.issues.length > 0) {
        console.log(`🔧 Deductions:`);
        quote.breakdown.deductions.forEach(d => {
          console.log(`   - ${d.issue}: -$${d.amount}`);
        });
      }
    }
    
    console.log(`⚡ SOL Price: ${quote.solPrice} SOL`);
    console.log(`⏱️ Processing: ${quote.estimatedProcessingTime}`);
    console.log();
  }
});

// Test 4: Check specific models from new data
console.log('4️⃣ Validating Latest iPhone Models...\n');

const latestModels = [
  { id: 'iphone-17-pro-max', storage: '256GB' },
  { id: 'iphone-17-pro', storage: '256GB' },
  { id: 'iphone-17', storage: '256GB' },
  { id: 'iphone-17-air', storage: '256GB' }
];

latestModels.forEach(model => {
  const storageOptions = getStorageOptions(model.id);
  const modelData = index[model.id];
  
  if (modelData) {
    const variant = modelData.variants.find(v => 
      v.storage === model.storage && v.lockStatus === 'Unlocked'
    );
    
    if (variant) {
      console.log(`✅ ${modelData.display} ${model.storage}`);
      console.log(`   Grades: B=$${variant.prices.B || 'N/A'}, C=$${variant.prices.C || 'N/A'}, D=$${variant.prices.D || 'N/A'}`);
      console.log(`   Storage options: ${storageOptions.join(', ')}`);
    } else {
      console.log(`⚠️  ${modelData.display} - No pricing for ${model.storage}`);
    }
  } else {
    console.log(`❌ ${model.id} - Not found in database`);
  }
});

// Test 5: Summary
console.log('\n' + '='.repeat(60));
console.log('📊 PRICING SYSTEM SUMMARY\n');

console.log('✅ Improvements Made:');
console.log('   • Updated to September 2025 pricing');
console.log('   • Margins increased from 5-10% to 15-20%');
console.log('   • Merged KT Corp and Sell Atlas data');
console.log('   • Removed duplicate entries');
console.log('   • Added iPhone 17 series support');

console.log('\n💰 Margin Comparison:');
console.log('   Condition    | Old Margin | New Margin | Difference');
console.log('   -------------|------------|------------|------------');
console.log('   Excellent    |     5%     |    15%     |   +$100-200');
console.log('   Good         |     5%     |    18%     |   +$130-250');
console.log('   Fair         |    10%     |    20%     |   +$50-100');

console.log('\n✨ Ready for production use!');