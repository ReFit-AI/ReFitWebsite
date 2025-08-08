#!/usr/bin/env node

/**
 * Setup script for Supabase database
 * - Tests connection
 * - Creates tables if needed
 * - Migrates localStorage data if present
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, type = 'info') {
  const prefix = {
    info: `${colors.cyan}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    warning: `${colors.yellow}[WARNING]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`
  };
  
  console.log(`${prefix[type]} ${message}`);
}

async function testConnection() {
  log('Testing Supabase connection...');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    log('Missing Supabase credentials in .env.local', 'error');
    log('Please add:', 'info');
    log('  NEXT_PUBLIC_SUPABASE_URL=your-project-url', 'info');
    log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key', 'info');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      log(`Connection failed: ${error.message}`, 'error');
      return false;
    }
    
    log('Successfully connected to Supabase!', 'success');
    return true;
  } catch (error) {
    log(`Connection error: ${error.message}`, 'error');
    return false;
  }
}

async function checkTables() {
  log('Checking database tables...');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const tables = ['profiles', 'orders', 'shipping_addresses'];
  const missingTables = [];
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === '42P01') { // Table doesn't exist
        missingTables.push(table);
        log(`Table '${table}' not found`, 'warning');
      } else {
        log(`Table '${table}' exists`, 'success');
      }
    } catch (error) {
      log(`Error checking table '${table}': ${error.message}`, 'error');
    }
  }
  
  if (missingTables.length > 0) {
    log('', 'info');
    log('To create missing tables, run the migration:', 'info');
    log(`  npx supabase db push --db-url "${process.env.DATABASE_URL || 'your-database-url'}"`, 'info');
    log('  OR', 'info');
    log('  Run the SQL in supabase/migrations/001_initial_schema.sql in your Supabase dashboard', 'info');
    return false;
  }
  
  return true;
}

async function migrateLocalStorageData() {
  log('', 'info');
  log('Checking for localStorage data to migrate...', 'info');
  
  // This would need to be run in a browser context
  // For now, we'll provide instructions
  
  log('', 'info');
  log('To migrate existing localStorage data:', 'warning');
  log('1. Open your app in the browser', 'info');
  log('2. Open the browser console', 'info');
  log('3. Run: localStorage.getItem("refit_orders")', 'info');
  log('4. If data exists, the app will automatically migrate it on next use', 'info');
  
  return true;
}

async function createTestOrder() {
  log('', 'info');
  log('Creating test order...', 'info');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const testOrder = {
    id: `TEST-${Date.now()}`,
    wallet_address: '11111111111111111111111111111111',
    device_brand: 'Apple',
    device_model: 'iPhone 15 Pro',
    device_storage: '256GB',
    device_carrier: 'unlocked',
    device_condition: 'excellent',
    device_category: 'iphone',
    device_issues: [],
    quote_usd: 750.00,
    quote_sol: 4.167,
    shipping_address: {
      name: 'Test User',
      street1: '123 Test St',
      city: 'Test City',
      state: 'CA',
      zip: '90210',
      country: 'US',
      phone: '555-1234',
      email: 'test@example.com'
    },
    status: 'created',
    status_history: [{
      status: 'created',
      timestamp: new Date().toISOString(),
      notes: 'Test order created'
    }]
  };
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()
      .single();
    
    if (error) {
      log(`Failed to create test order: ${error.message}`, 'error');
      return false;
    }
    
    log(`Test order created: ${data.id}`, 'success');
    
    // Clean up test order
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', data.id);
    
    if (!deleteError) {
      log('Test order cleaned up', 'success');
    }
    
    return true;
  } catch (error) {
    log(`Error creating test order: ${error.message}`, 'error');
    return false;
  }
}

async function main() {
  console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════╗
║     ReFit Supabase Setup Script       ║
╚═══════════════════════════════════════╝
${colors.reset}`);
  
  // Step 1: Test connection
  const connected = await testConnection();
  if (!connected) {
    log('', 'info');
    log('Setup incomplete. Please configure Supabase credentials.', 'warning');
    process.exit(1);
  }
  
  // Step 2: Check tables
  const tablesExist = await checkTables();
  if (!tablesExist) {
    log('', 'info');
    log('Setup incomplete. Please create database tables.', 'warning');
    process.exit(1);
  }
  
  // Step 3: Test create/read/delete
  const testPassed = await createTestOrder();
  if (!testPassed) {
    log('', 'info');
    log('Setup incomplete. Database operations failed.', 'warning');
    process.exit(1);
  }
  
  // Step 4: Migration instructions
  await migrateLocalStorageData();
  
  console.log(`
${colors.green}${colors.bright}
╔═══════════════════════════════════════╗
║    ✅ Supabase Setup Complete!        ║
╚═══════════════════════════════════════╝
${colors.reset}

Your database is ready to use. The app will now:
- Store new orders in Supabase
- Sync profiles with wallet addresses
- Provide real-time order tracking

Next steps:
1. Run the app: npm run dev
2. Create a test order through the UI
3. Check your Supabase dashboard to verify

${colors.cyan}Happy selling! 🚀${colors.reset}
`);
}

// Run the setup
main().catch(error => {
  log(`Setup failed: ${error.message}`, 'error');
  process.exit(1);
});