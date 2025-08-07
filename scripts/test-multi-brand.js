#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load data files
const supplierIphoneData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/supplier-pricing-iphones.json'), 'utf8'));
const supplierAndroidData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/supplier-pricing-androids.json'), 'utf8'));
const sagaData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/saga-pricing.json'), 'utf8'));

console.log('🧪 Testing Multi-Brand Pricing System\n');
console.log('=' .repeat(80));

// Test data summary
console.log('\n📊 DATA SUMMARY:');
console.log(`  iPhones:  ${supplierIphoneData.iphones?.length || 0} configurations`);
console.log(`  Android:  ${supplierAndroidData.androids?.length || 0} configurations`);
console.log(`  Saga:     ${sagaData.saga_phones?.length || 0} configurations`);

// Show sample prices for each category
console.log('\n💰 SAMPLE PRICES BY CATEGORY:\n');

// iPhone sample
console.log('iPhone 16 Pro Max 256GB (Unlocked):');
const iphone16 = supplierIphoneData.iphones?.find(p => 
  p.model === 'iPhone 16 PRO MAX' && p.storage === '256GB' && p.lock_status === 'Unlocked'
);
if (iphone16) {
  console.log(`  Excellent (95% of B): $${(iphone16.prices.B * 0.95).toFixed(0)}`);
  console.log(`  Good (95% of C):      $${(iphone16.prices.C * 0.95).toFixed(0)}`);
  console.log(`  Fair (90% of D):      $${(iphone16.prices.D * 0.90).toFixed(0)}`);
}

// Android sample
console.log('\nGalaxy S25 Ultra 256GB (Unlocked):');
const galaxyS25 = supplierAndroidData.androids?.find(p => 
  p.model === 'GALAXY S25 ULTRA' && p.storage === '256GB' && p.lock_status === 'Unlocked'
);
if (galaxyS25) {
  console.log(`  Excellent (95% of B): $${(galaxyS25.prices.B * 0.95).toFixed(0)}`);
  console.log(`  Good (95% of C):      $${(galaxyS25.prices.C * 0.95).toFixed(0)}`);
  console.log(`  Fair (90% of D):      $${(galaxyS25.prices.D * 0.90).toFixed(0)}`);
}

// Saga sample
console.log('\nSolana Saga 512GB (Unlocked):');
const saga = sagaData.saga_phones?.find(p => 
  p.model === 'Saga' && p.storage === '512GB'
);
if (saga) {
  console.log(`  Excellent (95% of B): $${(saga.prices.B * 0.95).toFixed(0)}`);
  console.log(`  Good (95% of C):      $${(saga.prices.C * 0.95).toFixed(0)}`);
  console.log(`  Fair (90% of D):      $${(saga.prices.D * 0.90).toFixed(0)}`);
}

// Top Android models
console.log('\n🤖 TOP ANDROID MODELS:');
const androidModels = {};
supplierAndroidData.androids?.forEach(device => {
  if (!androidModels[device.model]) {
    androidModels[device.model] = [];
  }
  androidModels[device.model].push(device);
});

Object.keys(androidModels).slice(0, 8).forEach((model, idx) => {
  const variants = androidModels[model];
  const avgPrice = variants.reduce((sum, v) => sum + (v.prices.B || 0), 0) / variants.length;
  console.log(`  ${idx + 1}. ${model} - $${avgPrice.toFixed(0)} avg (${variants.length} variants)`);
});

// Saga phones
console.log('\n🟣 SAGA PHONES:');
sagaData.saga_phones?.forEach((phone, idx) => {
  console.log(`  ${idx + 1}. ${phone.display_name} ${phone.storage} - $${(phone.prices.B * 0.95).toFixed(0)} (excellent)`);
});

console.log('\n✅ Multi-brand system ready!');