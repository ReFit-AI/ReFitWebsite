#!/usr/bin/env node

/**
 * Profit Margin Analysis
 * Compares our buyback prices to KT wholesale prices
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load KT pricing data
const supplierPricingData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/supplier-pricing-iphones.json'), 'utf8')
);

console.log('💰 PROFIT MARGIN ANALYSIS\n');
console.log('=' .repeat(80));

// Our pricing strategy
const OUR_MARGINS = {
  'excellent': { ktGrade: 'B', margin: 0.95 },  // We pay 95% of B
  'good': { ktGrade: 'C', margin: 0.95 },       // We pay 95% of C
  'fair': { ktGrade: 'D', margin: 0.90 },       // We pay 90% of D
};

// Analyze top models
const topModels = [
  'iPhone 16 PRO MAX',
  'iPhone 16 PRO',
  'iPhone 15 PRO MAX',
  'iPhone 15 PRO',
  'iPhone 14 PRO MAX',
  'iPhone 14 PRO',
  'iPhone 13 PRO MAX'
];

let totalProfitExcellent = 0;
let totalProfitGood = 0;
let totalProfitFair = 0;
let modelCount = 0;

console.log('\n📱 PROFIT PER PHONE BY CONDITION:\n');

topModels.forEach(modelName => {
  const devices = supplierPricingData.iphones.filter(d => 
    d.model === modelName && d.lock_status === 'Unlocked'
  );
  
  if (devices.length === 0) return;
  
  console.log(`\n${modelName}:`);
  console.log('-'.repeat(60));
  
  devices.forEach(device => {
    if (!device.prices.B || !device.prices.C || !device.prices.D) return;
    
    // Calculate what we pay vs what KT pays
    const excellentBuyback = device.prices.B * 0.95;
    const goodBuyback = device.prices.C * 0.95;
    const fairBuyback = device.prices.D * 0.90;
    
    // KT will grade these as A/B+/B when they receive them
    // Assume: Excellent → A (best case), Good → B+, Fair → B
    const excellentProfit = device.prices.A - excellentBuyback;
    const goodProfit = device.prices['B+'] - goodBuyback;
    const fairProfit = device.prices.B - fairBuyback;
    
    console.log(`  ${device.storage}:`);
    console.log(`    Excellent: We pay $${excellentBuyback.toFixed(0)}, KT pays $${device.prices.A} → Profit: $${excellentProfit.toFixed(0)}`);
    console.log(`    Good:      We pay $${goodBuyback.toFixed(0)}, KT pays $${device.prices['B+']} → Profit: $${goodProfit.toFixed(0)}`);
    console.log(`    Fair:      We pay $${fairBuyback.toFixed(0)}, KT pays $${device.prices.B} → Profit: $${fairProfit.toFixed(0)}`);
    
    totalProfitExcellent += excellentProfit;
    totalProfitGood += goodProfit;
    totalProfitFair += fairProfit;
    modelCount++;
  });
});

console.log('\n' + '='.repeat(80));
console.log('\n📊 AVERAGE PROFIT MARGINS:\n');

const avgProfitExcellent = totalProfitExcellent / modelCount;
const avgProfitGood = totalProfitGood / modelCount;
const avgProfitFair = totalProfitFair / modelCount;
const overallAvg = (avgProfitExcellent + avgProfitGood + avgProfitFair) / 3;

console.log(`  Excellent Condition: $${avgProfitExcellent.toFixed(0)} per phone`);
console.log(`  Good Condition:      $${avgProfitGood.toFixed(0)} per phone`);
console.log(`  Fair Condition:      $${avgProfitFair.toFixed(0)} per phone`);
console.log(`\n  📈 Overall Average:  $${overallAvg.toFixed(0)} profit per buyback`);

// Calculate profit percentages
console.log('\n💹 PROFIT MARGINS AS PERCENTAGE:\n');

// Sample a typical high-value phone
const samplePhone = supplierPricingData.iphones.find(d => 
  d.model === 'iPhone 16 PRO MAX' && d.storage === '256GB' && d.lock_status === 'Unlocked'
);

if (samplePhone) {
  const excellentBuyback = samplePhone.prices.B * 0.95;
  const goodBuyback = samplePhone.prices.C * 0.95;
  const fairBuyback = samplePhone.prices.D * 0.90;
  
  const excellentMargin = ((samplePhone.prices.A - excellentBuyback) / excellentBuyback * 100);
  const goodMargin = ((samplePhone.prices['B+'] - goodBuyback) / goodBuyback * 100);
  const fairMargin = ((samplePhone.prices.B - fairBuyback) / fairBuyback * 100);
  
  console.log(`  Excellent: ${excellentMargin.toFixed(1)}% profit margin`);
  console.log(`  Good:      ${goodMargin.toFixed(1)}% profit margin`);
  console.log(`  Fair:      ${fairMargin.toFixed(1)}% profit margin`);
}

console.log('\n' + '='.repeat(80));
console.log('\n⚠️  IMPORTANT NOTES:\n');
console.log('  1. These profits assume KT grades phones one level higher than we do');
console.log('  2. Actual profits may vary based on KT\'s grading standards');
console.log('  3. We built in safety margins (5-10%) to avoid disputes');
console.log('  4. Additional costs not included: shipping, processing, customer service');
console.log('  5. Issue deductions (cracked screens, etc.) reduce these margins');

console.log('\n✅ Analysis complete!');