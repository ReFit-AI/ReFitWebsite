#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load pricing data
const ktIphoneData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/private/kt-pricing-parsed.json'), 'utf8')
);
const ktAndroidData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/private/kt-android-parsed.json'), 'utf8')
);

// Homepage devices to check
const homepageDevices = [
  { name: 'iPhone 15 Pro', displayPrice: 960, storage: '256GB' },
  { name: 'iPhone 14 Pro', displayPrice: 720, storage: '256GB' },
  { name: 'Samsung Galaxy S24', displayPrice: 680, storage: '256GB' },
  { name: 'iPhone 13 Pro', displayPrice: 560, storage: '256GB' },
  { name: 'Pixel 8 Pro', displayPrice: 520, storage: '256GB' },
  { name: 'iPhone 12 Pro', displayPrice: 440, storage: '256GB' },
];

console.log('🔍 Verifying Homepage Prices vs Actual Pricing Engine\n');
console.log('=' .repeat(70));

// Our pricing formula: 95% of Grade B (excellent condition)
const EXCELLENT_MARGIN = 0.95;

homepageDevices.forEach(device => {
  console.log(`\n📱 ${device.name} (${device.storage}):`);
  
  // Try to find in iPhone data
  let found = false;
  let actualPrice = 0;
  
  // Search iPhone data
  const iphoneMatch = ktIphoneData.iphones?.find(d => 
    d.model.toUpperCase().includes(device.name.toUpperCase().replace('IPHONE ', '')) &&
    d.storage === device.storage &&
    d.lock_status === 'Unlocked'
  );
  
  if (iphoneMatch) {
    actualPrice = Math.round(iphoneMatch.prices.B * EXCELLENT_MARGIN);
    found = true;
    console.log(`   KT Grade B: $${iphoneMatch.prices.B}`);
    console.log(`   Our Price (95%): $${actualPrice}`);
  }
  
  // Search Android data
  if (!found && device.name.includes('Galaxy')) {
    const androidMatch = ktAndroidData.androids?.find(d => 
      d.model.toUpperCase().includes('S24') && 
      d.storage === device.storage &&
      d.lock_status === 'Unlocked'
    );
    
    if (androidMatch) {
      actualPrice = Math.round(androidMatch.prices.B * EXCELLENT_MARGIN);
      found = true;
      console.log(`   KT Grade B: $${androidMatch.prices.B}`);
      console.log(`   Our Price (95%): $${actualPrice}`);
    }
  }
  
  // Check if Pixel (not in our data)
  if (device.name.includes('Pixel')) {
    console.log(`   ⚠️  Pixel phones not in KT data - using estimate`);
    actualPrice = device.displayPrice; // Keep current price as estimate
    found = true;
  }
  
  if (!found) {
    console.log(`   ❌ Not found in pricing data`);
  } else {
    const difference = device.displayPrice - actualPrice;
    if (Math.abs(difference) > 10) {
      console.log(`   ⚠️  Homepage shows: $${device.displayPrice}`);
      console.log(`   ⚠️  Should be: $${actualPrice}`);
      console.log(`   ⚠️  Difference: $${difference > 0 ? '+' : ''}${difference}`);
    } else {
      console.log(`   ✅ Homepage price ($${device.displayPrice}) is correct`);
    }
  }
});

console.log('\n' + '=' .repeat(70));
console.log('\n📊 RECOMMENDED HOMEPAGE PRICES:\n');

// Calculate correct prices
const corrections = [];

// iPhone 15 Pro
const iphone15Pro = ktIphoneData.iphones?.find(d => 
  d.model === 'iPhone 15 PRO' && d.storage === '256GB' && d.lock_status === 'Unlocked'
);
if (iphone15Pro) {
  corrections.push({ 
    name: 'iPhone 15 Pro', 
    price: Math.round(iphone15Pro.prices.B * EXCELLENT_MARGIN) 
  });
}

// iPhone 14 Pro
const iphone14Pro = ktIphoneData.iphones?.find(d => 
  d.model === 'iPhone 14 PRO' && d.storage === '256GB' && d.lock_status === 'Unlocked'
);
if (iphone14Pro) {
  corrections.push({ 
    name: 'iPhone 14 Pro', 
    price: Math.round(iphone14Pro.prices.B * EXCELLENT_MARGIN) 
  });
}

// Samsung Galaxy S24
const galaxyS24 = ktAndroidData.androids?.find(d => 
  d.model === 'GALAXY S24' && d.storage === '256GB' && d.lock_status === 'Unlocked'
);
if (galaxyS24) {
  corrections.push({ 
    name: 'Samsung Galaxy S24', 
    price: Math.round(galaxyS24.prices.B * EXCELLENT_MARGIN) 
  });
}

// iPhone 13 Pro
const iphone13Pro = ktIphoneData.iphones?.find(d => 
  d.model === 'iPhone 13 PRO' && d.storage === '256GB' && d.lock_status === 'Unlocked'
);
if (iphone13Pro) {
  corrections.push({ 
    name: 'iPhone 13 Pro', 
    price: Math.round(iphone13Pro.prices.B * EXCELLENT_MARGIN) 
  });
}

// iPhone 12 Pro
const iphone12Pro = ktIphoneData.iphones?.find(d => 
  d.model === 'iPhone 12 PRO' && d.storage === '256GB' && d.lock_status === 'Unlocked'
);
if (iphone12Pro) {
  corrections.push({ 
    name: 'iPhone 12 Pro', 
    price: Math.round(iphone12Pro.prices.B * EXCELLENT_MARGIN) 
  });
}

// Add newest models
const iphone16ProMax = ktIphoneData.iphones?.find(d => 
  d.model === 'iPhone 16 PRO MAX' && d.storage === '256GB' && d.lock_status === 'Unlocked'
);
if (iphone16ProMax) {
  corrections.push({ 
    name: 'iPhone 16 Pro Max', 
    price: Math.round(iphone16ProMax.prices.B * EXCELLENT_MARGIN) 
  });
}

console.log('Updated device list for homepage:');
corrections.forEach(device => {
  console.log(`  { name: '${device.name}', price: ${device.price}, trend: 'up' },`);
});

console.log('\n✅ Use these prices to update app/page.js');