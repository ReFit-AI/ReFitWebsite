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

console.log('🔍 Debugging Solana Model ID Issue\n');
console.log('=' .repeat(60));

// Show how the model key is being built
const saga = solanaPricing.solana_phones[0];
console.log('\nSolana pricing data:');
console.log('  Model:', saga.model);
console.log('  Storage:', saga.storage);
console.log('  Display:', saga.display_name);

// Show what the model key would be
const modelKey = `${saga.model}-${saga.storage}`.toLowerCase().replace(/\s+/g, '-');
console.log('\nGenerated model key:', modelKey);

// Show what's being passed from the component
console.log('\nExpected from component:');
console.log('  Model ID from POPULAR_MODELS: saga-512');
console.log('  Storage: 512GB');
console.log('  Carrier: unlocked');

// Check the pricing structure
console.log('\nPricing structure:');
console.log('  Working price:', saga.prices.working);
console.log('  Broken price:', saga.prices.broken);

// Show how it maps to grades
console.log('\nMapped to grade system:');
console.log('  A:', saga.prices.working);
console.log('  B+:', saga.prices.working);
console.log('  B:', saga.prices.working);
console.log('  C:', saga.prices.working * 0.8);
console.log('  D:', saga.prices.broken);