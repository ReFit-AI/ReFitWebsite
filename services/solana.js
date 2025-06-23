import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token'

// Initialize connection to Solana
export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
)

// Platform wallet address (treasury)
export const PLATFORM_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_PLATFORM_WALLET || '11111111111111111111111111111111'
)

// Create a buyback order on-chain
export async function createBuybackOrder(wallet, orderData) {
  try {
    const { publicKey, signTransaction } = wallet
    
    // In production, this would interact with a smart contract
    // For now, we'll create a simple transaction
    const transaction = new Transaction()
    
    // Add a memo instruction with order data
    const memoData = JSON.stringify({
      type: 'BUYBACK_ORDER',
      device: orderData.device,
      price: orderData.price,
      timestamp: Date.now()
    })
    
    // For demo purposes, we'll just create a small transfer
    // In production, this would lock funds in an escrow contract
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: PLATFORM_WALLET,
        lamports: 0.001 * LAMPORTS_PER_SOL // Small fee for order creation
      })
    )
    
    // Set recent blockhash and fee payer
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = publicKey
    
    // Sign and send transaction
    const signed = await signTransaction(transaction)
    const txid = await connection.sendRawTransaction(signed.serialize())
    
    // Wait for confirmation
    await connection.confirmTransaction(txid, 'confirmed')
    
    return {
      success: true,
      signature: txid,
      orderId: txid.substring(0, 8) // Use first 8 chars as order ID
    }
  } catch (error) {
    console.error('Error creating buyback order:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Process payment for a completed buyback
export async function processBuybackPayment(wallet, orderId, amountInSol) {
  try {
    const { publicKey, signTransaction } = wallet
    
    // Create payment transaction
    const transaction = new Transaction()
    
    // In production, this would be triggered by the smart contract
    // after device verification
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: PLATFORM_WALLET,
        toPubkey: publicKey,
        lamports: amountInSol * LAMPORTS_PER_SOL
      })
    )
    
    // This would normally be signed by the platform's wallet
    // For demo, we'll simulate the payment confirmation
    console.log(`Payment of ${amountInSol} SOL would be sent for order ${orderId}`)
    
    return {
      success: true,
      message: 'Payment processed successfully',
      amount: amountInSol
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Get user's buyback orders from blockchain
export async function getUserOrders(walletAddress) {
  try {
    // In production, this would query the smart contract
    // For demo, return mock data
    return [
      {
        id: 'ORD' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        device: 'iPhone 15 Pro - 256GB',
        price: 900,
        solPrice: 6.0,
        status: 'pending-shipment',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        walletAddress: walletAddress
      }
    ]
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

// Estimate SOL price for USD amount
export async function estimateSolPrice(usdAmount) {
  try {
    // In production, use a price oracle or DEX
    // For demo, use a fixed rate
    const SOL_PRICE_USD = 150 // $150 per SOL
    return usdAmount / SOL_PRICE_USD
  } catch (error) {
    console.error('Error estimating SOL price:', error)
    return 0
  }
}

// Verify wallet ownership
export async function verifyWalletOwnership(wallet, message) {
  try {
    const { publicKey, signMessage } = wallet
    
    if (!signMessage) {
      throw new Error('Wallet does not support message signing')
    }
    
    const encodedMessage = new TextEncoder().encode(message)
    const signature = await signMessage(encodedMessage)
    
    // In production, verify the signature on the backend
    return {
      success: true,
      signature: signature,
      publicKey: publicKey.toString()
    }
  } catch (error) {
    console.error('Error verifying wallet:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
