// Check if RPC functions exist in database
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
    .map(line => {
      const [key, ...values] = line.split('=')
      return [key.trim(), values.join('=').replace(/"/g, '').trim()]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function checkFunctions() {
  console.log('🔍 Checking RPC functions in database...\n')

  // Test 1: claim_early_bonus_slot
  console.log('1️⃣  Testing claim_early_bonus_slot...')
  try {
    const { data, error } = await supabase.rpc('claim_early_bonus_slot')
    if (error) {
      console.log('   ❌ Function not found or error:', error.message)
      console.log('   Creating function...')
      return false
    } else {
      console.log('   ✅ Function exists and works')
      console.log('   Result:', data)
    }
  } catch (err) {
    console.log('   ❌ Error:', err.message)
    return false
  }

  // Test 2: update_pool_on_deposit
  console.log('\n2️⃣  Testing update_pool_on_deposit...')
  try {
    // Test with dummy values
    const { data, error } = await supabase.rpc('update_pool_on_deposit', {
      deposit_amount: 0,
      is_new_depositor: false
    })
    if (error) {
      console.log('   ❌ Function not found or error:', error.message)
      return false
    } else {
      console.log('   ✅ Function exists')
    }
  } catch (err) {
    console.log('   ❌ Error:', err.message)
    return false
  }

  // Test 3: get_pool_stats
  console.log('\n3️⃣  Testing get_pool_stats...')
  try {
    const { data, error } = await supabase.rpc('get_pool_stats')
    if (error) {
      console.log('   ❌ Function not found or error:', error.message)
      return false
    } else {
      console.log('   ✅ Function exists')
      console.log('   Pool stats:', data)
    }
  } catch (err) {
    console.log('   ❌ Error:', err.message)
    return false
  }

  return true
}

checkFunctions().then(success => {
  if (!success) {
    console.log('\n⚠️  Some functions are missing!')
    console.log('Run the migrations again in Supabase dashboard')
  } else {
    console.log('\n✅ All functions working!')
  }
})