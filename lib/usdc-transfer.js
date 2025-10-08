// USDC Transfer Helper for Production
// Replace mock SOL transfers with real USDC SPL token transfers

import {
  Transaction,
  PublicKey,
  SystemProgram
} from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token'

// USDC Mint addresses
export const USDC_MINT = {
  mainnet: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  devnet: new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')
}

// Get the correct USDC mint based on environment
export function getUsdcMint() {
  return process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta'
    ? USDC_MINT.mainnet
    : USDC_MINT.devnet
}

/**
 * Create a USDC transfer transaction
 * @param {Connection} connection - Solana connection
 * @param {PublicKey} fromWallet - Sender's wallet public key
 * @param {PublicKey} toVault - Recipient vault public key
 * @param {number} amountUsdc - Amount in USDC (e.g., 1000 for $1000)
 * @returns {Promise<Transaction>} The unsigned transaction
 */
export async function createUsdcTransfer(connection, fromWallet, toVault, amountUsdc) {
  const usdcMint = getUsdcMint()

  // USDC has 6 decimals
  const amountLamports = Math.floor(amountUsdc * 1_000_000)

  // Get associated token accounts
  const fromTokenAccount = await getAssociatedTokenAddress(
    usdcMint,
    fromWallet
  )

  const toTokenAccount = await getAssociatedTokenAddress(
    usdcMint,
    toVault
  )

  // Check if vault's token account exists
  const toAccountInfo = await connection.getAccountInfo(toTokenAccount)

  const transaction = new Transaction()

  // If vault doesn't have a USDC token account, create it first
  if (!toAccountInfo) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        fromWallet, // Payer
        toTokenAccount, // Associated token account
        toVault, // Owner
        usdcMint // Mint
      )
    )
  }

  // Add transfer instruction
  transaction.add(
    createTransferInstruction(
      fromTokenAccount, // Source
      toTokenAccount, // Destination
      fromWallet, // Owner
      amountLamports, // Amount
      [], // Multisig signers (empty for regular transfer)
      TOKEN_PROGRAM_ID
    )
  )

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
  transaction.recentBlockhash = blockhash
  transaction.feePayer = fromWallet

  return { transaction, blockhash, lastValidBlockHeight }
}

/**
 * Verify a USDC transfer transaction
 * @param {Connection} connection - Solana connection
 * @param {string} txSignature - Transaction signature
 * @param {PublicKey} expectedVault - Expected recipient vault
 * @param {number} expectedAmount - Expected amount in USDC
 * @returns {Promise<{verified: boolean, error?: string}>}
 */
export async function verifyUsdcTransfer(connection, txSignature, expectedVault, expectedAmount) {
  try {
    // Fetch transaction details
    const tx = await connection.getTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    })

    if (!tx) {
      return { verified: false, error: 'Transaction not found' }
    }

    if (tx.meta?.err) {
      return { verified: false, error: 'Transaction failed' }
    }

    // Get USDC mint and expected token account
    const usdcMint = getUsdcMint()
    const expectedTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      expectedVault
    )

    // Parse token balances to verify transfer
    const postTokenBalances = tx.meta?.postTokenBalances || []
    const preTokenBalances = tx.meta?.preTokenBalances || []

    // Find the vault's token account in post balances
    const vaultPostBalance = postTokenBalances.find(
      b => b.owner === expectedVault.toBase58()
    )
    const vaultPreBalance = preTokenBalances.find(
      b => b.owner === expectedVault.toBase58()
    )

    if (!vaultPostBalance) {
      return { verified: false, error: 'Vault not found in transaction' }
    }

    // Calculate amount transferred (post - pre)
    const preAmount = vaultPreBalance?.uiTokenAmount?.uiAmount || 0
    const postAmount = vaultPostBalance?.uiTokenAmount?.uiAmount || 0
    const transferredAmount = postAmount - preAmount

    // Verify amount matches (with small tolerance for rounding)
    const tolerance = 0.01 // $0.01 tolerance
    if (Math.abs(transferredAmount - expectedAmount) > tolerance) {
      return {
        verified: false,
        error: `Amount mismatch: expected ${expectedAmount}, got ${transferredAmount}`
      }
    }

    return { verified: true }
  } catch (error) {
    console.error('Verification error:', error)
    return { verified: false, error: error.message }
  }
}

/**
 * Check user's USDC balance
 * @param {Connection} connection - Solana connection
 * @param {PublicKey} wallet - User's wallet public key
 * @returns {Promise<number>} USDC balance
 */
export async function getUsdcBalance(connection, wallet) {
  try {
    const usdcMint = getUsdcMint()
    const tokenAccount = await getAssociatedTokenAddress(usdcMint, wallet)

    const balance = await connection.getTokenAccountBalance(tokenAccount)
    return balance.value.uiAmount || 0
  } catch (error) {
    console.error('Balance check error:', error)
    return 0
  }
}

// Usage example (commented out):
/*
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

const { connection } = useConnection()
const { publicKey, signTransaction } = useWallet()

// Create transfer
const { transaction, blockhash, lastValidBlockHeight } = await createUsdcTransfer(
  connection,
  publicKey,
  vaultPublicKey,
  1000 // $1000 USDC
)

// Sign and send
const signed = await signTransaction(transaction)
const txid = await connection.sendRawTransaction(signed.serialize())

// Confirm
await connection.confirmTransaction({ signature: txid, blockhash, lastValidBlockHeight })

// Verify
const { verified, error } = await verifyUsdcTransfer(connection, txid, vaultPublicKey, 1000)
*/