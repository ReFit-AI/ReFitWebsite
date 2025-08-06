/**
 * Environment Variable Validation
 * Ensures all required environment variables are set
 */

const requiredEnvVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous key',
  
  // Only check service role key on server
  ...(typeof window === 'undefined' && {
    SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key',
  }),
};

const optionalEnvVars = {
  // Shippo
  SHIPPO_API_KEY: 'Shippo API key for shipping',
  NEXT_PUBLIC_SHIPPO_API_KEY: 'Public Shippo API key',
  
  // Solana
  NEXT_PUBLIC_SOLANA_RPC_HOST: 'Solana RPC endpoint',
  NEXT_PUBLIC_ESCROW_PROGRAM_ID: 'Escrow program ID',
  
  // App
  NEXT_PUBLIC_APP_URL: 'Application URL',
};

export function validateEnv() {
  const missingVars = [];
  const warnings = [];
  
  // Check required variables
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      missingVars.push(`  ❌ ${key}: ${description}`);
    }
  }
  
  // Check optional variables (warnings only)
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      warnings.push(`  ⚠️  ${key}: ${description}`);
    }
  }
  
  // Throw error if required vars are missing
  if (missingVars.length > 0) {
    console.error('\n🚨 Missing required environment variables:\n');
    console.error(missingVars.join('\n'));
    console.error('\n📝 Check .env.example for guidance\n');
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables');
    }
  }
  
  // Show warnings for optional vars
  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('\n⚠️  Missing optional environment variables:\n');
    console.warn(warnings.join('\n'));
    console.warn('\n');
  }
  
  return true;
}

// Auto-validate on import (server-side only)
if (typeof window === 'undefined') {
  validateEnv();
}