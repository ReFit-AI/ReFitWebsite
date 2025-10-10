/**
 * Check if migrations were applied to production Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkMigrations() {
  console.log('Checking production Supabase migrations...\n');
  
  // 1. Check if mobile_sessions table exists
  console.log('1. Checking mobile_sessions table...');
  const { data: mobileCheck, error: mobileError } = await supabase
    .from('mobile_sessions')
    .select('id')
    .limit(1);
  
  if (mobileError?.code === '42P01') {
    console.log('   ❌ mobile_sessions table DOES NOT EXIST');
    console.log('   → You need to run 002_mobile_sessions.sql\n');
  } else if (mobileError) {
    console.log('   ⚠️  Table exists but RLS might be blocking access');
    console.log('   → This is expected if RLS is working correctly\n');
  } else {
    console.log('   ✅ mobile_sessions table exists\n');
  }
  
  // 2. Try to query profiles without authentication
  console.log('2. Testing RLS policies on profiles...');
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);
  
  if (!profileError && (!profileData || profileData.length === 0)) {
    console.log('   ✅ RLS is blocking unauthorized access (good!)\n');
  } else if (profileData && profileData.length > 0) {
    console.log('   ❌ RLS might be too permissive - data returned without auth');
    console.log('   → You need to run 003_fix_rls_policies.sql\n');
  }
  
  // 3. Check orders table RLS
  console.log('3. Testing RLS policies on orders...');
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('id')
    .limit(1);
  
  if (!orderError && (!orderData || orderData.length === 0)) {
    console.log('   ✅ RLS is blocking unauthorized access (good!)\n');
  } else if (orderData && orderData.length > 0) {
    console.log('   ❌ RLS might be too permissive - data returned without auth');
    console.log('   → You need to run 003_fix_rls_policies.sql\n');
  }
  
  console.log('='.repeat(50));
  console.log('\nSUMMARY:');
  console.log('If you see any ❌ above, run the corresponding migration in Supabase SQL Editor.');
  console.log('If you only see ✅ and ⚠️, your migrations are applied correctly!');
}

checkMigrations().catch(console.error);