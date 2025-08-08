// Production configuration
export const config = {
  // Feature flags - All enabled for production
  features: {
    useSupabase: true, // Always use real Supabase
    useShippo: true,   // Always use real Shippo
    useRealPayments: true, // Always use real payments
    enableWebhooks: true,  // Always enable webhooks
  },

  // API endpoints
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL || '/api/webhooks',
  },

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Shippo
  shippo: {
    apiKey: process.env.SHIPPO_API_KEY,
    testMode: false, // Always use production mode
  },

  // Solana
  solana: {
    rpcHost: process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || 'https://api.mainnet-beta.solana.com',
    escrowProgramId: process.env.NEXT_PUBLIC_ESCROW_PROGRAM_ID,
    commitment: 'confirmed',
  },

  // App
  app: {
    name: 'ReFit',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://refit.trade',
    supportEmail: 'support@refit.trade',
  },
};

// Helper to check if we're in production mode
export const isProduction = () => {
  return true; // Always production
};

// Helper to get the appropriate service - Always return production service
export const getService = (mockService, productionService) => {
  if (!productionService) {
    console.error('Production service not available, falling back to mock');
    return mockService;
  }
  return productionService;
};
