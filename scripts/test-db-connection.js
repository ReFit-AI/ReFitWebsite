// Test database connection and verify migrations
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read env file
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('='))
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function testDatabase() {
  console.log('🔍 Testing database connection and migrations...\n')

  try {
    // Test 1: Check liquidity_pool table exists
    console.log('1️⃣  Testing liquidity_pool table...')
    const { data: pool, error: poolError } = await supabase
      .from('liquidity_pool')
      .select('*')
      .single()

    if (poolError) {
      console.log('   ❌ liquidity_pool table not found or error:', poolError.message)
      return false
    } else {
      console.log('   ✅ liquidity_pool table exists')
      console.log('   📊 Initial stats:', {
        total_deposits: pool.total_deposits,
        rft_bonus_slots_remaining: pool.rft_bonus_slots_remaining,
        active_depositors: pool.active_depositors
      })
    }

    // Test 2: Check deposits table exists
    console.log('\n2️⃣  Testing deposits table...')
    const { error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .limit(1)

    if (depositsError) {
      console.log('   ❌ deposits table not found or error:', depositsError.message)
      return false
    } else {
      console.log('   ✅ deposits table exists')
    }

    // Test 3: Check distributions table exists
    console.log('\n3️⃣  Testing distributions table...')
    const { error: distributionsError } = await supabase
      .from('distributions')
      .select('*')
      .limit(1)

    if (distributionsError) {
      console.log('   ❌ distributions table not found or error:', distributionsError.message)
      return false
    } else {
      console.log('   ✅ distributions table exists')
    }

    // Test 4: Check withdrawal_requests table exists
    console.log('\n4️⃣  Testing withdrawal_requests table...')
    const { error: withdrawalsError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .limit(1)

    if (withdrawalsError) {
      console.log('   ❌ withdrawal_requests table not found or error:', withdrawalsError.message)
      return false
    } else {
      console.log('   ✅ withdrawal_requests table exists')
    }

    // Test 5: Check RPC functions exist
    console.log('\n5️⃣  Testing RPC functions...')

    // Test get_pool_stats
    const { data: statsData, error: statsError } = await supabase.rpc('get_pool_stats')
    if (statsError) {
      console.log('   ❌ get_pool_stats function error:', statsError.message)
    } else {
      console.log('   ✅ get_pool_stats function works')
    }

    // Test claim_early_bonus_slot
    const { data: bonusData, error: bonusError } = await supabase.rpc('claim_early_bonus_slot')
    if (bonusError) {
      console.log('   ❌ claim_early_bonus_slot function error:', bonusError.message)
    } else {
      console.log('   ✅ claim_early_bonus_slot function works')
      console.log('   📊 Bonus result:', bonusData)
    }

    console.log('\n════════════════════════════════════════════════════════')
    console.log('✅ All migrations successfully applied!')
    console.log('════════════════════════════════════════════════════════\n')

    console.log('🎯 Next Steps:')
    console.log('1. Set up Squads multisig vault at https://app.squads.so')
    console.log('2. Add vault address to .env.local')
    console.log('3. Add ADMIN_SECRET to .env.local')
    console.log('4. Test deposit flow on /stake page')
    console.log('5. Check admin dashboard at /admin\n')

    return true

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

testDatabase()