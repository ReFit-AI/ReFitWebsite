#!/usr/bin/env node

/**
 * Test the simplified pricing engine
 */

import { calculateQuote, getPricingStats, getAllModels, POPULAR_MODELS } from '../lib/pricing-engine.js';

console.log('========================================');
console.log('PRICING ENGINE TEST');
console.log('========================================\n');

// Get stats
const stats = getPricingStats();
console.log('📊 Pricing Statistics:');
console.log('  Last updated:', stats.lastUpdated);
console.log('  Sources:', stats.sources.join(', '));
console.log('  Total devices:', stats.deviceCount.total);
console.log('  - iPhones:', stats.deviceCount.iphone);
console.log('  - Samsung:', stats.deviceCount.samsung);
console.log('\n');

// Test iPhone quote
console.log('📱 Testing iPhone Quote:');
console.log('  Model: iPhone 17 Pro Max 256GB Unlocked');
console.log('  Condition: Excellent (Good Condition)');

const iphoneQuote = calculateQuote({
  modelId: 'iphone-17-pro-max',
  storage: '256GB',
  carrier: 'unlocked',
  condition: 'excellent',
  issues: [],
  accessories: { charger: false, box: false }
});

if (iphoneQuote.error) {
  console.log('  ❌ Error:', iphoneQuote.error);
} else {
  console.log('  ✅ Quote successful:');
  console.log('    Our offer: $' + iphoneQuote.usdPrice);
  console.log('    SOL price:', iphoneQuote.solPrice + ' SOL');
  console.log('    Wholesale: $' + iphoneQuote.wholesalePrice);
  console.log('    Margin:', iphoneQuote.marginPercent);
  console.log('    Vendor info:', JSON.stringify(iphoneQuote.vendors));
}

console.log('\n');

// Test Samsung quote
console.log('🤖 Testing Samsung Quote:');
console.log('  Model: Galaxy S25 Ultra 256GB Unlocked');
console.log('  Condition: Good (Cracked Screen)');

const samsungQuote = calculateQuote({
  modelId: 'galaxy-s25-ultra',
  storage: '256GB',
  carrier: 'unlocked',
  condition: 'good',
  issues: [],
  accessories: { charger: true, box: true }
});

if (samsungQuote.error) {
  console.log('  ❌ Error:', samsungQuote.error);
} else {
  console.log('  ✅ Quote successful:');
  console.log('    Our offer: $' + samsungQuote.usdPrice);
  console.log('    SOL price:', samsungQuote.solPrice + ' SOL');
  console.log('    Wholesale: $' + samsungQuote.wholesalePrice);
  console.log('    Margin:', samsungQuote.marginPercent);
  console.log('    Accessories bonus: $' + samsungQuote.breakdown.accessories);
}

console.log('\n');

// Test with issues
console.log('🔧 Testing Quote with Issues:');
console.log('  Model: iPhone 16 Pro Max 256GB Unlocked');
console.log('  Condition: Good');
console.log('  Issues: Cracked camera lens, Back crack');

const issueQuote = calculateQuote({
  modelId: 'iphone-16-pro-max',
  storage: '256GB',
  carrier: 'unlocked',
  condition: 'good',
  issues: ['cracked_camera_lens', 'back_crack'],
  accessories: {}
});

if (issueQuote.error) {
  console.log('  ❌ Error:', issueQuote.error);
} else {
  console.log('  ✅ Quote successful:');
  console.log('    Base price: $' + issueQuote.breakdown.ourPrice);
  console.log('    Deductions: -$' + issueQuote.breakdown.deductions);
  console.log('    Final offer: $' + issueQuote.usdPrice);
}

console.log('\n');

// Show available models summary
console.log('📋 Available Models:');
const models = getAllModels();
console.log('  iPhones:', models.iphone.length);
console.log('  Samsung:', models.samsung.length);

console.log('\n========================================');
console.log('TEST COMPLETE');
console.log('========================================');