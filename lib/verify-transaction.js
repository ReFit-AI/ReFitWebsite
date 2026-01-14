import { Connection, PublicKey } from '@solana/web3.js';

/**
 * SECURE transaction verification
 * Prevents fake deposits - the #1 attack vector
 *
 * CRITICAL: Verifies funds went to YOUR vault, not just any transfer
 */
export async function verifyTransaction(txSignature, expectedAmount, senderWallet) {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com',
    'confirmed'
  );

  // CRITICAL: Your vault address (where funds must be sent)
  const VAULT_ADDRESS = process.env.NEXT_PUBLIC_SQUADS_VAULT || process.env.NEXT_PUBLIC_OPS_WALLET;

  if (!VAULT_ADDRESS) {
    throw new Error('Vault address not configured - set NEXT_PUBLIC_SQUADS_VAULT in .env.local');
  }

  try {
    // 1. Get the transaction
    const tx = await connection.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0
    });

    if (!tx) {
      throw new Error('Transaction not found on chain');
    }

    // 2. Check transaction success
    if (tx.meta?.err) {
      throw new Error('Transaction failed on chain');
    }

    // 3. Check it's confirmed (not pending)
    if (!tx.slot) {
      throw new Error('Transaction not yet confirmed');
    }

    // 4. Find USDC transfers TO YOUR VAULT
    const USDC_DEVNET = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
    const USDC_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

    let foundVaultTransfer = false;
    let transferAmount = 0;
    let transferredToVault = false;

    // Check all instructions for token transfers
    for (const ix of tx.transaction.message.instructions) {
      if (ix.parsed && (ix.parsed.type === 'transfer' || ix.parsed.type === 'transferChecked')) {
        const info = ix.parsed.info;

        // CRITICAL: Verify recipient is your vault
        const destination = info.destination || info.account;

        // Check if transfer went to your vault
        if (destination && destination.toString().includes(VAULT_ADDRESS)) {
          transferredToVault = true;

          // Verify it's USDC (check mint if available)
          const mint = info.mint;
          if (mint && mint !== USDC_DEVNET && mint !== USDC_MAINNET) {
            continue; // Skip non-USDC transfers
          }

          // Get amount
          if (info.tokenAmount?.uiAmount) {
            transferAmount = info.tokenAmount.uiAmount;
            foundVaultTransfer = true;
          } else if (info.amount) {
            transferAmount = typeof info.amount === 'string'
              ? parseInt(info.amount) / 1000000
              : info.amount;
            foundVaultTransfer = true;
          }
        }
      }
    }

    // 5. CRITICAL: Must have transferred to vault
    if (!transferredToVault) {
      throw new Error('No transfer to vault address found. Funds did not reach platform.');
    }

    if (!foundVaultTransfer) {
      throw new Error('No valid USDC transfer found in transaction');
    }

    // 6. Amount validation
    if (transferAmount < expectedAmount * 0.99) { // Allow 1% slippage
      throw new Error(`Amount mismatch: expected ${expectedAmount}, got ${transferAmount}`);
    }

    // 7. Verify sender signed the transaction
    const signers = tx.transaction.message.accountKeys
      .filter(k => k.signer)
      .map(k => k.pubkey.toString());

    if (!signers.includes(senderWallet)) {
      throw new Error('Wallet did not sign this transaction');
    }

    console.log(`✅ Transaction verified: ${txSignature.slice(0, 8)}...`);
    console.log(`   Amount: ${transferAmount} USDC`);
    console.log(`   To vault: ${VAULT_ADDRESS.slice(0, 8)}...`);
    console.log(`   From: ${senderWallet.slice(0, 8)}...`);

    return {
      verified: true,
      amount: transferAmount,
      signature: txSignature,
      vaultAddress: VAULT_ADDRESS
    };

  } catch (error) {
    console.error('❌ Transaction verification failed:', error.message);
    throw error;
  }
}