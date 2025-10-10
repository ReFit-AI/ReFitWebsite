// Import inventory from CSV to Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse CSV line
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

// Import inventory
async function importInventory() {
  try {
    const csvPath = path.join(__dirname, '../data/private/Copy of RF_9-13-2025_StockList - Sheet1.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    // Skip header and empty lines
    const dataLines = lines.slice(1).filter(line => {
      const values = parseCSVLine(line);
      return values[0] && values[0] !== '' && values[1] && values[1] !== '';
    });

    console.log(`Found ${dataLines.length} inventory records to import`);

    const records = dataLines.map(line => {
      const [model, imei, pricePaid, priceSold, notes, batteryHealth, seller] = parseCSVLine(line);

      const pricePaidNum = parseFloat(pricePaid) || 0;
      const priceSoldNum = parseFloat(priceSold) || 0;
      const batteryHealthNum = batteryHealth ? parseInt(batteryHealth) : null;

      // Determine status
      let status = 'in_stock';
      if (notes && notes.toLowerCase().includes('returned')) {
        status = 'returned';
      } else if (priceSoldNum > 0) {
        status = 'sold';
      }

      // Determine condition from model name
      let condition = 'Used';
      if (model.includes('NIB')) {
        condition = 'New in Box';
      } else if (model.includes('-CB') || notes?.toLowerCase().includes('cracked')) {
        condition = 'Cracked';
      }

      return {
        model: model.replace(/-CB$/, ''), // Remove -CB suffix from model
        imei: imei,
        price_paid: pricePaidNum,
        price_sold: priceSoldNum > 0 ? priceSoldNum : null,
        battery_health: batteryHealthNum,
        condition: condition,
        notes: notes || null,
        seller: seller || null,
        status: status,
        sold_at: priceSoldNum > 0 ? new Date().toISOString() : null,
        purchased_at: new Date('2025-09-13').toISOString() // From filename
      };
    });

    console.log('Sample record:', records[0]);
    console.log('\nImporting records...');

    // Insert in batches
    const batchSize = 10;
    let imported = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('inventory')
        .upsert(batch, {
          onConflict: 'imei',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`Error importing batch ${i / batchSize + 1}:`, error);
      } else {
        imported += batch.length;
        console.log(`Imported ${imported}/${records.length} records`);
      }
    }

    console.log('\n✅ Import complete!');

    // Show stats
    const { data: stats } = await supabase
      .from('inventory_stats')
      .select('*')
      .single();

    if (stats) {
      console.log('\nInventory Stats:');
      console.log(`  Active Inventory: ${stats.active_inventory_count} units`);
      console.log(`  Capital Deployed: $${parseFloat(stats.capital_deployed).toFixed(2)}`);
      console.log(`  Total Sales: ${stats.total_sales_count} units`);
      console.log(`  Total Revenue: $${parseFloat(stats.total_revenue).toFixed(2)}`);
      console.log(`  Total Profit: $${parseFloat(stats.total_profit).toFixed(2)}`);
      console.log(`  Avg Margin: ${parseFloat(stats.avg_margin_percent).toFixed(2)}%`);
    }

  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importInventory();
