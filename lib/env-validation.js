/**
 * Environment Variable Validation
 * Ensures all required environment variables are set
 */

const requiredEnvVars = {
  // Public variables (client-side)
  public: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SOLANA_NETWORK',
    'NEXT_PUBLIC_SOLANA_RPC_HOST',
  ],
  // Server-only variables
  server: [
    'SUPABASE_SERVICE_ROLE_KEY',
    // Add these when ready to use:
    // 'SHIPPO_API_KEY',
    // 'SHIPPO_WEBHOOK_SECRET',
    // 'JWT_SECRET',
  ],
};

/**
 * Validates that all required environment variables are set
 * @param {'development' | 'production'} environment
 * @throws {Error} if any required variables are missing
 */
export function validateEnv(environment = process.env.NODE_ENV) {
  const missing = [];
  const isServer = typeof window === 'undefined';

  // Check public variables (always required)
  requiredEnvVars.public.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check server variables (only on server)
  if (isServer) {
    requiredEnvVars.server.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });
  }

  // In production, fail hard on missing variables
  if (missing.length > 0) {
    const message = `Missing required environment variables:\n${missing.join('\n')}`;
    
    if (environment === 'production') {
      throw new Error(message);
    } else {
      console.warn(`⚠️  ${message}`);
    }
  }

  // Validate format of certain variables
  if (isServer && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY.length < 40) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY appears to be invalid (too short)');
    }
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return true;
}

// Auto-validate on import in production
if (process.env.NODE_ENV === 'production') {
  validateEnv('production');
}