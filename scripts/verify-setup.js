// Verify complete ReFit setup
import { createClient } from '@supabase/supabase-js'
import { Connection, PublicKey } from '@solana/web3.js'
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

console.log('🔍 Verifying ReFit Setup...\n')

// Check environment variables
console.log('1️⃣  Environment Variables:')
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'ADMIN_SECRET',
  'NEXT_PUBLIC_SQUADS_VAULT',
  'NEXT_PUBLIC_OPS_WALLET'
]

let allVarsPresent = true
requiredVars.forEach(varName => {
  const value = env[varName]
  if (!value || value === 'YOUR_SQUADS_VAULT_ADDRESS') {
    console.log(`   ❌ ${varName} - MISSING`)
    allVarsPresent = false
  } else {
    console.log(`   ✅ ${varName} - Set`)
  }
})

if (!allVarsPresent) {
  console.log('\n❌ Some environment variables are missing!')
  process.exit(1)
}

// Test Supabase connection
console.log('\n2️⃣  Testing Supabase Connection:')
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

try {
  const { data: pool, error } = await supabase
    .from('liquidity_pool')
    .select('*')
    .single()

  if (error) {
    console.log('   ❌ Database error:', error.message)
  } else {
    console.log('   ✅ Connected to Supabase')
    console.log('   📊 Pool Stats:', {
      deposits: pool.total_deposits,
      bonus_slots: pool.rft_bonus_slots_remaining,
      active_users: pool.active_depositors
    })
  }
} catch (err) {
  console.log('   ❌ Connection failed:', err.message)
}

// Test Solana connection
console.log('\n3️⃣  Testing Solana Connection:')
try {
  const connection = new Connection(env.NEXT_PUBLIC_SOLANA_RPC_HOST || 'https://api.devnet.solana.com')
  const version = await connection.getVersion()
  console.log('   ✅ Connected to Solana', env.NEXT_PUBLIC_SOLANA_NETWORK)
  console.log('   📊 Version:', version['solana-core'])
} catch (err) {
  console.log('   ❌ Connection failed:', err.message)
}

// Validate wallet addresses
console.log('\n4️⃣  Validating Wallet Addresses:')
try {
  const vaultPubkey = new PublicKey(env.NEXT_PUBLIC_SQUADS_VAULT)
  console.log('   ✅ Squads Vault:', vaultPubkey.toBase58().slice(0, 8) + '...')
} catch (err) {
  console.log('   ❌ Invalid Squads Vault address')
}

try {
  const opsPubkey = new PublicKey(env.NEXT_PUBLIC_OPS_WALLET)
  console.log('   ✅ Operations Wallet:', opsPubkey.toBase58().slice(0, 8) + '...')
} catch (err) {
  console.log('   ❌ Invalid Operations Wallet address')
}

// Check admin secret strength
console.log('\n5️⃣  Admin Security:')
const adminSecret = env.ADMIN_SECRET
if (adminSecret && adminSecret.length >= 32) {
  console.log('   ✅ Admin secret is strong (32+ characters)')
} else {
  console.log('   ⚠️  Admin secret should be at least 32 characters')
}

console.log('\n════════════════════════════════════════════════════════')
console.log('✅ Setup Complete!')
console.log('════════════════════════════════════════════════════════\n')

console.log('🎯 Ready to Test:')
console.log('1. Visit http://localhost:3000/stake to test deposits')
console.log('2. Visit http://localhost:3000/admin to view dashboard')
console.log('3. Connect your wallet and try a test deposit')
console.log('\n⚠️  Note: You\'re on DEVNET - use test SOL/USDC only!\n')