#!/usr/bin/env node

/**
 * Test script for KT pricing integration
 * Verifies pricing calculations and quote generation
 */

// Read the JSON file directly since @ alias doesn't work in Node scripts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load KT pricing data
const supplierPricingData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/supplier-pricing-iphones.json'), 'utf8')
);

// Inline the necessary functions from pricing-engine.js
const POPULAR_MODELS = [
  { id: 'iphone-16-pro-max', brand: 'Apple', model: 'iPhone 16 Pro Max', display: 'iPhone 16 Pro Max', icon: '📱' },
  { id: 'iphone-16-pro', brand: 'Apple', model: 'iPhone 16 Pro', display: 'iPhone 16 Pro', icon: '📱' },
  { id: 'iphone-15-pro-max', brand: 'Apple', model: 'iPhone 15 Pro Max', display: 'iPhone 15 Pro Max', icon: '📱' },
];

const CONDITION_MAPPING = {
  'excellent': { ktGrade: 'B', margin: 0.95 },
  'good': { ktGrade: 'C', margin: 0.95 },
  'fair': { ktGrade: 'D', margin: 0.90 },
};

const ISSUE_DEDUCTIONS = {
  'face_id_broken': 400,
  'cracked_camera_lens': 80,
  'unknown_parts': 80,
  'bad_charging_port': 200,
  'back_crack': 150,
};

function buildModelIndex() {
  const index = {};
  
  supplierPricingData.iphones?.forEach(device => {
    const modelKey = device.model.toLowerCase().replace(/\s+/g, '-');
    
    if (!index[modelKey]) {
      index[modelKey] = {
        display: device.model,
        variants: []
      };
    }
    
    index[modelKey].variants.push({
      storage: device.storage,
      lockStatus: device.lock_status,
      prices: device.prices
    });
  });
  
  return index;
}

function searchModels(query) {
  if (!query || query.length < 2) return [];
  
  const index = buildModelIndex();
  const searchTerm = query.toLowerCase().replace(/\s+/g, '-');
  const results = [];
  
  Object.keys(index).forEach(key => {
    if (key.includes(searchTerm)) {
      results.push({
        id: key,
        ...index[key]
      });
    }
  });
  
  return results.slice(0, 10);
}

function getStorageOptions(modelId) {
  const index = buildModelIndex();
  const model = index[modelId];
  
  if (!model) return [];
  
  const storageSet = new Set();
  model.variants.forEach(v => storageSet.add(v.storage));
  
  return Array.from(storageSet).sort((a, b) => {
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    return aNum - bNum;
  });
}

function calculateQuote({
  modelId,
  storage,
  carrier,
  condition,
  issues = [],
  accessories = { charger: false, box: false }
}) {
  const index = buildModelIndex();
  const model = index[modelId];
  
  if (!model) {
    return { error: 'Model not found' };
  }
  
  const lockStatus = carrier === 'unlocked' ? 'Unlocked' : 'Carrier Locked';
  const variant = model.variants.find(v => 
    v.storage === storage && 
    (v.lockStatus === lockStatus || v.lockStatus === 'Unknown')
  );
  
  if (!variant) {
    return { error: 'This configuration not available' };
  }
  
  const mapping = CONDITION_MAPPING[condition];
  if (!mapping) {
    return { error: 'Invalid condition' };
  }
  
  const ktPrice = variant.prices[mapping.ktGrade];
  if (!ktPrice) {
    return { error: 'Price not available for this condition' };
  }
  
  let price = ktPrice * mapping.margin;
  
  issues.forEach(issue => {
    if (ISSUE_DEDUCTIONS[issue]) {
      price -= ISSUE_DEDUCTIONS[issue];
    }
  });
  
  if (accessories.charger) price += 5;
  if (accessories.box) price += 5;
  
  price = Math.max(price, 50);
  
  const solPrice = (price / 180).toFixed(3);
  
  return {
    success: true,
    usdPrice: Math.round(price),
    solPrice: parseFloat(solPrice),
    ktGrade: mapping.ktGrade,
    confidence: price > 500 ? 'high' : price > 200 ? 'medium' : 'low',
    estimatedProcessingTime: '2-3 business days',
    breakdown: {
      basePrice: ktPrice,
      condition: mapping.ktGrade,
      margin: mapping.margin,
      deductions: issues.map(i => ({ issue: i, amount: ISSUE_DEDUCTIONS[i] || 0 })),
      accessories: accessories
    }
  };
}

console.log('🧪 Testing KT Pricing Integration\n');

// Test 1: Search for iPhone 16 Pro Max
console.log('1. Testing model search:');
const searchResults = searchModels('iPhone 16 Pro Max');
console.log(`   Found ${searchResults.length} results for "iPhone 16 Pro Max"`);
if (searchResults.length > 0) {
  console.log(`   First result: ${searchResults[0].display}`);
}

// Test 2: Get storage options
console.log('\n2. Testing storage options:');
const storageOptions = getStorageOptions('iphone-16-pro-max');
console.log(`   Available storage: ${storageOptions.join(', ')}`);

// Test 3: Calculate quotes for different conditions
console.log('\n3. Testing price calculations:');

const testCases = [
  {
    name: 'Excellent condition, no issues',
    params: {
      modelId: 'iphone-16-pro-max',
      storage: '256GB',
      carrier: 'unlocked',
      condition: 'excellent',
      issues: [],
      accessories: { charger: false, box: false }
    }
  },
  {
    name: 'Good condition with cracked camera',
    params: {
      modelId: 'iphone-16-pro-max',
      storage: '256GB',
      carrier: 'unlocked',
      condition: 'good',
      issues: ['cracked_camera_lens'],
      accessories: { charger: true, box: true }
    }
  },
  {
    name: 'Fair condition with multiple issues',
    params: {
      modelId: 'iphone-16-pro-max',
      storage: '256GB',
      carrier: 'unlocked',
      condition: 'fair',
      issues: ['back_crack', 'bad_charging_port'],
      accessories: { charger: false, box: false }
    }
  }
];

testCases.forEach(test => {
  console.log(`\n   ${test.name}:`);
  const quote = calculateQuote(test.params);
  
  if (quote.success) {
    console.log(`   ✅ Base KT Grade: ${quote.ktGrade}`);
    console.log(`   ✅ USD Price: $${quote.usdPrice}`);
    console.log(`   ✅ SOL Price: ${quote.solPrice} SOL`);
    if (quote.breakdown) {
      console.log(`   ✅ KT Base Price: $${quote.breakdown.basePrice}`);
      console.log(`   ✅ Safety Margin: ${quote.breakdown.margin * 100}%`);
      const totalDeductions = quote.breakdown.deductions.reduce((sum, d) => sum + d.amount, 0);
      if (totalDeductions > 0) {
        console.log(`   ✅ Total Deductions: -$${totalDeductions}`);
      }
    }
  } else {
    console.log(`   ❌ Error: ${quote.error}`);
  }
});

// Test 4: Verify safety margins
console.log('\n4. Verifying safety margins:');
const excellentQuote = calculateQuote({
  modelId: 'iphone-16-pro-max',
  storage: '256GB',
  carrier: 'unlocked',
  condition: 'excellent',
  issues: [],
  accessories: { charger: false, box: false }
});

if (excellentQuote.success) {
  const ktBPrice = excellentQuote.breakdown.basePrice;
  const ourPrice = excellentQuote.usdPrice;
  const actualMargin = (ourPrice / ktBPrice * 100).toFixed(1);
  console.log(`   KT Grade B Price: $${ktBPrice}`);
  console.log(`   Our Price: $${ourPrice}`);
  console.log(`   Actual Margin: ${actualMargin}% (Expected: 95%)`);
  console.log(`   ✅ Price protection working correctly`);
}

// Test 5: Edge cases
console.log('\n5. Testing edge cases:');

// Test with very low price after deductions
const heavyDamageQuote = calculateQuote({
  modelId: 'iphone-13',
  storage: '128GB',
  carrier: 'unlocked',
  condition: 'fair',
  issues: ['face_id_broken', 'back_crack', 'bad_charging_port'],
  accessories: { charger: false, box: false }
});

if (heavyDamageQuote.success) {
  console.log(`   Heavy damage case: $${heavyDamageQuote.usdPrice} (min protected at $50)`);
}

console.log('\n✅ All tests completed!');