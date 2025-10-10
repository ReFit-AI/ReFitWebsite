#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to redact sensitive data
function redactSensitive(str) {
  if (!str) return 'N/A';
  if (str.length <= 8) return '*'.repeat(str.length);
  return str.substring(0, 4) + '*'.repeat(str.length - 8) + str.substring(str.length - 4);
}

async function checkOrders() {
  console.log('🔍 Checking Supabase for orders...\n');
  console.log('Connected to:', supabaseUrl.replace(/\/\/([^.]+)/, '//***'));
  console.log('=' .repeat(70));

  try {
    // Check profiles table
    console.log('\n📊 Checking profiles table:');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
    } else {
      console.log(`Found ${profiles?.length || 0} profiles`);
      profiles?.forEach((profile, i) => {
        console.log(`\nProfile ${i + 1}:`);
        console.log(`  Wallet: ${redactSensitive(profile.wallet_address)}`);
        console.log(`  Email: ${redactSensitive(profile.email || 'N/A')}`);
        console.log(`  Created: ${new Date(profile.created_at).toLocaleString()}`);
      });
    }

    // Check orders table
    console.log('\n' + '=' .repeat(70));
    console.log('\n📦 Checking orders table:');
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (orderError) {
      console.error('Error fetching orders:', orderError);
    } else {
      console.log(`Found ${orders?.length || 0} orders`);
      
      orders?.forEach((order, i) => {
        console.log(`\n✅ Order ${i + 1}: ${order.id}`);
        console.log(`  Wallet: ${redactSensitive(order.wallet_address)}`);
        console.log(`  Device: ${order.device_brand} ${order.device_model}`);
        console.log(`  Storage: ${order.device_storage || 'N/A'}`);
        console.log(`  Condition: ${order.device_condition}`);
        console.log(`  Quote: $${order.quote_usd} USD / ${order.quote_sol} SOL`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Created: ${new Date(order.created_at).toLocaleString()}`);
        
        if (order.shipping_address) {
          const addr = order.shipping_address;
          console.log(`  Shipping to: ${redactSensitive(addr.name)}`);
          console.log(`    ${redactSensitive(addr.street1)}`);
          if (addr.street2) console.log(`    ${redactSensitive(addr.street2)}`);
          console.log(`    ${addr.city}, ${addr.state} ${addr.zip}`);
        }
      });
    }

    // Check shipping addresses table
    console.log('\n' + '=' .repeat(70));
    console.log('\n📍 Checking shipping addresses table:');
    const { data: addresses, error: addressError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .order('created_at', { ascending: false });

    if (addressError) {
      console.error('Error fetching addresses:', addressError);
    } else {
      console.log(`Found ${addresses?.length || 0} addresses`);
      addresses?.forEach((addr, i) => {
        console.log(`\nAddress ${i + 1}:`);
        console.log(`  Name: ${redactSensitive(addr.name)}`);
        console.log(`  Street: ${redactSensitive(addr.street1)}`);
        console.log(`  City: ${addr.city}, ${addr.state} ${addr.zip}`);
      });
    }

  } catch (error) {
    console.error('Error connecting to Supabase:', error);
  }

  console.log('\n' + '=' .repeat(70));
  console.log('\n✅ Database check complete!');
  console.log('\nIf no orders were found, check:');
  console.log('1. The browser console for any errors during order creation');
  console.log('2. Supabase dashboard at https://supabase.com/dashboard/project/kxtuwewckwqpveaupkwv');
  console.log('3. Make sure the tables were created (run the SQL script in Supabase SQL Editor)');
}

checkOrders();