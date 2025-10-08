// Run Supabase migrations programmatically
// Usage: node scripts/run-migrations.js

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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigrations() {
  console.log('🚀 Running liquidity pool migrations...\n')

  try {
    // Read the combined migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', 'combined_liquidity_pool.sql')
    const sql = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded')
    console.log('⚠️  Note: This requires ADMIN access to run DDL statements\n')
    console.log('════════════════════════════════════════════════════════')
    console.log('This script cannot run migrations with the anon key.')
    console.log('You need to run the SQL manually in the Supabase dashboard.')
    console.log('════════════════════════════════════════════════════════\n')

    console.log('📋 Instructions:')
    console.log('1. Go to: https://supabase.com/dashboard/project/kxtuwewckwqpveaupkwv/sql/new')
    console.log('2. Copy the contents of: supabase/migrations/combined_liquidity_pool.sql')
    console.log('3. Paste into the SQL editor')
    console.log('4. Click "Run"\n')

    console.log('📝 Preview of migration (first 500 chars):')
    console.log('─'.repeat(60))
    console.log(sql.substring(0, 500) + '...')
    console.log('─'.repeat(60))

    console.log('\n✅ Migration file is ready at:')
    console.log('   supabase/migrations/combined_liquidity_pool.sql')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

runMigrations()