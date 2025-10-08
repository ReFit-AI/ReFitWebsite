// Squads Multisig Integration
// This manages the secure vault for LP deposits

export const SQUADS_CONFIG = {
  // Squads vault address (you'll create this at app.squads.so)
  vaultAddress: process.env.NEXT_PUBLIC_SQUADS_VAULT || 'YOUR_SQUADS_VAULT_ADDRESS',

  // USDC mint on Solana
  usdcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',

  // Minimum deposit
  minDeposit: 1000,

  // Treasury config
  treasury: {
    // Platform operations wallet (for buying phones)
    operationsWallet: process.env.NEXT_PUBLIC_OPS_WALLET || 'YOUR_OPS_WALLET',

    // Weekly distribution settings
    distributionDay: 1, // Monday
    distributionHour: 12, // Noon UTC
  }
}

// Helper to format vault address for display
export function formatVaultAddress(address = SQUADS_CONFIG.vaultAddress) {
  if (!address || address === 'YOUR_SQUADS_VAULT_ADDRESS') {
    return 'Not configured'
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Instructions for setting up Squads
export const SQUADS_SETUP_GUIDE = `
1. Go to https://app.squads.so
2. Create new Squad with these settings:
   - Name: "ReFit LP Vault"
   - Threshold: 2/3 signatures
   - Members:
     - Your main wallet
     - Backup wallet
     - Cold storage wallet (optional)
3. Copy the vault address
4. Add to .env.local:
   NEXT_PUBLIC_SQUADS_VAULT=<your_vault_address>
   NEXT_PUBLIC_OPS_WALLET=<operations_wallet>
5. The vault will receive all USDC deposits
6. Weekly distributions will be processed from this vault
`