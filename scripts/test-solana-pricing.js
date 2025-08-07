#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Solana pricing data
const solanaPricing = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/saga-pricing.json'), 'utf8')
);

console.log('🟣 Testing Solana Saga Pricing\n');
console.log('=' .repeat(60));

// Show current pricing structure
const saga = solanaPricing.solana_phones[0];
console.log('\n📱 Solana Saga (512GB):');
console.log(`  Working: $${saga.prices.working}`);
console.log(`  Broken:  $${saga.prices.broken}`);

// Test the pricing calculations
console.log('\n💰 Customer Buyback Prices:');
console.log('  Working condition: $150');
console.log('  Broken/For Parts:  $50');

console.log('\n📊 Profit Margins:');
console.log(`  Average resale: $${saga.market_data.avg_resale}`);
console.log(`  Resale range: $${saga.market_data.resale_range}`);
console.log(`  Working profit: $${saga.market_data.avg_resale - saga.prices.working} (${Math.round((saga.market_data.avg_resale - saga.prices.working) / saga.prices.working * 100)}% margin)`);

console.log('\n✅ Quote Flow:');
console.log('  1. User selects Solana tab');
console.log('  2. Picks Solana Saga model');
console.log('  3. Storage auto-selected (512GB)');
console.log('  4. Picks Working or Broken condition');
console.log('  5. No complex grading - simple!');

console.log('\n🎯 Bonus Upside:');
console.log('  - Sealed units sell for $1200-1600');
console.log('  - Genesis editions command premium');
console.log('  - All bonus profit with no complexity!');