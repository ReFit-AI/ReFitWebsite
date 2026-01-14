/**
 * USDC Payout Utility
 * Sends USDC payments to users for completed trade-ins
 */

import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';

// USDC Mint addresses
const USDC_DEVNET = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
const USDC_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

/**
 * Send USDC payment to user for completed trade-in
 * @param {Object} params - Payment parameters
 * @param {string} params.toWallet - User's wallet address (recipient)
 * @param {number} params.amountUSD - Amount in USD (will be converted to USDC with 6 decimals)
 * @param {string} params.orderId - Order ID for logging
 * @returns {Promise<{success: boolean, signature?: string, error?: string}>}
 */
export async function sendUSDCPayout({ toWallet, amountUSD, orderId }) {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || 'https://api.devnet.solana.com';

  // Determine USDC mint based on network
  const usdcMint = network === 'mainnet-beta' ? USDC_MAINNET : USDC_DEVNET;

  console.log(`💰 Initiating USDC payout for order ${orderId}`);
  console.log(`   Network: ${network}`);
  console.log(`   Amount: $${amountUSD}`);
  console.log(`   To: ${toWallet.slice(0, 8)}...`);

  try {
    // 1. Load platform wallet (same as vault wallet)
    const platformWalletSecret = process.env.PLATFORM_WALLET_SECRET;
    if (!platformWalletSecret) {
      throw new Error('PLATFORM_WALLET_SECRET not configured');
    }

    const connection = new Connection(rpcUrl, 'confirmed');
    const platformWallet = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(platformWalletSecret))
    );

    console.log(`   From vault: ${platformWallet.publicKey.toString().slice(0, 8)}...`);

    // 2. Convert USD to USDC lamports (6 decimals)
    const usdcAmount = Math.floor(amountUSD * 1_000_000); // $100 -> 100,000,000

    if (usdcAmount <= 0) {
      throw new Error('Invalid payment amount');
    }

    // 3. Get token accounts
    const recipientPubkey = new PublicKey(toWallet);

    const fromTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      platformWallet.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      recipientPubkey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log(`   From ATA: ${fromTokenAccount.toString().slice(0, 8)}...`);
    console.log(`   To ATA: ${toTokenAccount.toString().slice(0, 8)}...`);

    // 4. Check if recipient has USDC token account, create if needed
    let needsATA = false;
    try {
      await getAccount(connection, toTokenAccount);
      console.log(`   ✓ Recipient has USDC token account`);
    } catch (error) {
      needsATA = true;
      console.log(`   Creating USDC token account for recipient...`);
    }

    // 5. Build transaction
    const transaction = new Transaction();

    // Create ATA if needed (platform pays for this)
    if (needsATA) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          platformWallet.publicKey, // payer
          toTokenAccount, // ata
          recipientPubkey, // owner
          usdcMint, // mint
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        fromTokenAccount, // from
        toTokenAccount, // to
        platformWallet.publicKey, // owner
        usdcAmount, // amount
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // 6. Get recent blockhash and set fee payer
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = platformWallet.publicKey;

    // 7. Sign and send transaction
    console.log(`   Signing transaction...`);
    transaction.sign(platformWallet);

    console.log(`   Sending transaction...`);
    const signature = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });

    console.log(`   Transaction sent: ${signature}`);

    // 8. Confirm transaction
    console.log(`   Confirming transaction...`);
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      'confirmed'
    );

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log(`   ✅ Payment confirmed!`);
    console.log(`   Signature: ${signature}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${signature}?cluster=${network}`);

    return {
      success: true,
      signature,
      amount: amountUSD,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${network}`,
    };

  } catch (error) {
    console.error(`   ❌ Payment failed:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check platform wallet USDC balance
 * @returns {Promise<{success: boolean, balance?: number, error?: string}>}
 */
export async function getPlatformUSDCBalance() {
  try {
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || 'https://api.devnet.solana.com';
    const usdcMint = network === 'mainnet-beta' ? USDC_MAINNET : USDC_DEVNET;

    const platformWalletSecret = process.env.PLATFORM_WALLET_SECRET;
    if (!platformWalletSecret) {
      throw new Error('PLATFORM_WALLET_SECRET not configured');
    }

    const connection = new Connection(rpcUrl, 'confirmed');
    const platformWallet = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(platformWalletSecret))
    );

    const tokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      platformWallet.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const accountInfo = await getAccount(connection, tokenAccount);
    const balance = Number(accountInfo.amount) / 1_000_000; // Convert to USD

    return {
      success: true,
      balance,
      address: platformWallet.publicKey.toString(),
    };

  } catch (error) {
    console.error('Failed to get platform balance:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  sendUSDCPayout,
  getPlatformUSDCBalance,
};
