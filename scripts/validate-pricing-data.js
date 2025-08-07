#!/usr/bin/env node

/**
 * Validate supplier pricing JSONs for duplicates and price anomalies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const load = (rel) => JSON.parse(fs.readFileSync(path.join(__dirname, rel), 'utf8'));

const iphones = load('../data/supplier-pricing-iphones.json').iphones || [];
const androids = load('../data/supplier-pricing-androids.json').androids || [];

function validate(devices, label) {
  console.log(`\n=== ${label.toUpperCase()} DATA VALIDATION ===`);
  const seen = new Map(); // key: model|storage|lock
  const anomalies = [];
  const grades = ['A', 'B+', 'B', 'C', 'D'];

  devices.forEach((d, idx) => {
    const key = `${d.model}|${d.storage}|${d.lock_status}`;
    const prices = d.prices || {};

    // Basic structure checks
    if (!d.model || !d.storage || !d.lock_status) {
      anomalies.push({ type: 'missing_fields', index: idx, device: d });
    }

    // Monotonic price expectations: A >= B+ >= B >= C >= D
    let last = Infinity;
    for (const g of grades) {
      if (prices[g] != null) {
        if (prices[g] > last + 1e-6) {
          anomalies.push({ type: 'non_monotonic', key, grade: g, prices });
          break;
        }
        last = prices[g];
      }
    }

    // Duplicates
    if (seen.has(key)) {
      seen.get(key).push(idx);
    } else {
      seen.set(key, [idx]);
    }
  });

  // Report duplicates
  const dups = [...seen.entries()].filter(([, arr]) => arr.length > 1);
  if (dups.length) {
    console.log(`\n⚠️  Found ${dups.length} duplicate variant keys (model|storage|lock):`);
    dups.slice(0, 20).forEach(([k, arr]) => console.log(` - ${k} -> entries: ${arr.join(', ')}`));
    if (dups.length > 20) console.log(` ... and ${dups.length - 20} more`);
  } else {
    console.log('\n✅ No duplicate variant keys found');
  }

  // Report anomalies
  if (anomalies.length) {
    console.log(`\n⚠️  Found ${anomalies.length} pricing anomalies:`);
    anomalies.slice(0, 30).forEach(a => console.log(` - ${a.type}: ${a.key || ''}`));
    if (anomalies.length > 30) console.log(` ... and ${anomalies.length - 30} more`);
  } else {
    console.log('\n✅ No pricing anomalies detected');
  }
}

validate(iphones, 'iPhones');
validate(androids, 'Androids');

console.log('\nValidation complete.');

