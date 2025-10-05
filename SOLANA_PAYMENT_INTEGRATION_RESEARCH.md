# Deep Research Prompt: Solana Payment Integration for Phone Buyback Platform

## Context
You are implementing Solana payment integration for ReFit, a phone buyback platform that:
- Accepts used phones from customers
- Provides instant price quotes
- Ships prepaid labels to customers
- Pays customers in SOL after device inspection
- Currently has everything working EXCEPT actual payment processing

## Research Requirements

### 1. Payment Architecture Decision
Research and recommend the best approach:

**Option A: Direct Wallet-to-Wallet Transfers**
- Customer ships phone → Admin inspects → Admin manually sends SOL from platform wallet
- Pros/cons, security implications, regulatory considerations

**Option B: Escrow Smart Contract**
- Funds held in escrow → Released after inspection approval
- Research existing Solana escrow programs (e.g., Metaplex Auction House, custom programs)
- Consider upgrade authority, program verification, audit requirements

**Option C: Solana Pay Integration**
- Use Solana Pay for payment processing
- Research transfer requests, payment links, QR codes
- Consider partial payments, refunds, disputes

**Option D: Multi-signature Treasury**
- Platform funds in multi-sig wallet (e.g., Squads Protocol)
- Research approval workflows, integration complexity

### 2. Security Best Practices
Deep dive into:

**Transaction Security**
- How to verify on-chain transactions are legitimate
- Preventing double-spending or replay attacks
- Handling failed/stuck transactions
- Rate limiting payment requests
- Monitoring for suspicious activity

**Key Management**
- Hot wallet vs cold wallet strategies for platform funds
- Key rotation procedures
- Hardware wallet integration (Ledger, etc.)
- Secure key storage in production (AWS KMS, HashiCorp Vault, etc.)

**Amount Verification**
- Preventing price manipulation between quote and payment
- Handling SOL price volatility
- Decimal precision and rounding errors
- Maximum/minimum payment thresholds

### 3. Implementation Architecture

**Backend Requirements**
- Transaction monitoring service
- Webhook/websocket for confirmations
- Database schema for payment records
- Reconciliation system

**Frontend Integration**
- Payment status UI/UX
- Transaction confirmation display
- Error handling and retry logic
- Wallet connection state management

**RPC Infrastructure**
- Public vs private RPC endpoints
- Rate limiting and quota management
- Fallback RPC providers
- GenesysGo, Helius, QuickNode comparison

### 4. Compliance & Legal

**Regulatory Considerations**
- KYC/AML requirements for crypto payments
- Tax reporting obligations
- State money transmitter licenses
- Terms of service requirements

**Audit Trail**
- What to log for compliance
- Data retention requirements
- Customer payment receipts
- Dispute resolution process

### 5. Edge Cases & Error Handling

**Common Scenarios**
- Customer provides wrong wallet address
- Network congestion/high fees
- SOL price drops significantly between quote and payment
- Partial device rejection (phone works but different model)
- Customer disputes after payment

**Technical Failures**
- RPC node failures
- Transaction timeout handling
- Wallet signature rejection
- Insufficient platform funds
- Database/API inconsistencies

### 6. Testing Strategy

**Test Environment**
- Devnet vs testnet vs mainnet-beta
- Airdrop/faucet integration for testing
- Mock wallet testing
- Load testing payment flows

**Test Cases**
- Happy path payment flow
- Payment failure scenarios
- Concurrent payment processing
- Wallet disconnection during payment
- Admin approval/rejection flows

### 7. Monitoring & Analytics

**Key Metrics**
- Payment success rate
- Average confirmation time
- Failed transaction reasons
- Platform wallet balance alerts
- Cost per transaction

**Alerting**
- Low platform balance
- Failed payments
- Suspicious activity
- High value transactions
- Multiple failed attempts

### 8. Code Examples Needed

Research and provide production-ready examples for:
- Transaction creation and signing
- SPL token support (USDC option?)
- Memo/reference attachment
- Priority fees for faster confirmation
- Transaction status checking
- Webhook signature verification
- Balance monitoring
- Fee calculation

### 9. Cost Analysis

**Fee Structure**
- Solana transaction fees
- Priority fees strategy
- RPC costs
- Infrastructure costs
- Comparison with traditional payment methods

### 10. Future Considerations

**Scaling**
- Handling 100+ payments per day
- Batch payment processing
- Automated reconciliation

**Features**
- USDC/USDT stablecoin option
- Multiple wallet support
- Payment scheduling
- Instant payments vs batched
- International payments

## Deliverables Needed

1. **Recommended architecture** with clear justification
2. **Security checklist** for production deployment
3. **Complete code implementation** for chosen approach
4. **Testing guide** with specific test cases
5. **Deployment runbook** with step-by-step instructions
6. **Monitoring setup** with alerts and dashboards
7. **Compliance documentation** for legal review
8. **Cost projections** for different volume scenarios

## Additional Context to Consider

- Platform currently quotes prices in both USD and SOL
- Customers ship phones before receiving payment
- Admin inspection happens 2-3 days after shipping
- Need to handle price volatility during this period
- Platform should never lose money on accepted devices
- Must maintain customer trust with reliable payments
- Consider offering USDC as stable alternative
- Mobile app integration planned for future

## Questions to Answer

1. Should we build custom escrow or use existing solutions?
2. How do we handle SOL price volatility?
3. What's the minimum viable payment system vs ideal?
4. How do we prevent payment fraud?
5. Should we support SPL tokens (USDC)?
6. How do we handle international customers?
7. What happens if platform wallet is compromised?
8. How do we scale to 1000+ transactions per day?
9. Should payments be instant or batched?
10. How do we handle tax reporting?

---

Use this prompt to conduct thorough research and provide a comprehensive implementation plan with production-ready code that prioritizes security, reliability, and user experienc]

# Comprehensive Solana Payment System Implementation Plan for Phone Buyback Platform

## Executive Summary

After extensive research and analysis, I recommend implementing a **hybrid architecture combining Solana Pay with custom escrow smart contracts**, using **USDC as the primary payment method** to eliminate SOL price volatility during your 2-3 day inspection period. This solution will cost approximately **$150,000-200,000 to implement** with **$500-2,000 monthly operational costs**, delivering **95-99% cost savings** compared to traditional payment methods.

## 1. Recommended Architecture with Justification

### Architecture Decision: Hybrid Escrow + Solana Pay

**Core Components:**
- **Solana Pay** for customer payment interface (QR codes, wallet connections)
- **Custom Escrow Smart Contract** for 2-3 day inspection period
- **USDC Stablecoin** as primary payment method
- **Squads Protocol** for multi-signature treasury management
- **Helius RPC** (primary) + QuickNode (backup) for blockchain access

**Justification:**
- **Escrow Necessity**: Your 2-3 day inspection period requires funds to be held securely while allowing conditional release based on inspection results
- **USDC Choice**: Eliminates SOL's ~15-30% weekly volatility risk during inspection period
- **Solana Pay**: Provides seamless UX with QR codes and wallet integration, already used by major brands
- **Custom Contract**: Existing escrow solutions don't handle partial rejections or price adjustments specific to phone buybacks

### System Architecture Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Customer  │────▶│  Solana Pay  │────▶│  Escrow Smart   │
│   Wallet    │     │   Interface  │     │    Contract     │
└─────────────┘     └──────────────┘     └─────────────────┘
                            │                      │
                            ▼                      ▼
                    ┌──────────────┐     ┌─────────────────┐
                    │   Backend    │────▶│   PostgreSQL    │
                    │   Services   │     │    Database     │
                    └──────────────┘     └─────────────────┘
                            │
                    ┌───────▼──────┐
                    │  Admin Panel │
                    │  (Inspection) │
                    └──────────────┘
```

## 2. Security Checklist for Production Deployment

### Pre-Launch Security Requirements
- [ ] **Smart Contract Audit** by OtterSec or Cyfrin ($30-50k)
- [ ] **Penetration Testing** of all systems
- [ ] **Hardware Wallet Setup** (Ledger for cold storage)
- [ ] **Multi-signature Treasury** via Squads Protocol (3-of-5 signers)
- [ ] **HashiCorp Vault** for key management
- [ ] **Rate Limiting** implementation (100 requests/minute per IP)
- [ ] **DDoS Protection** via Cloudflare
- [ ] **SSL/TLS Certificates** for all endpoints
- [ ] **SOC 2 Type II** compliance audit initiated

### Operational Security
- [ ] **Hot Wallet Limits**: Maximum 2-3 days of transaction volume
- [ ] **Cold Storage**: 90% of funds in hardware wallets
- [ ] **Key Rotation**: Monthly for hot wallets, quarterly for cold
- [ ] **Access Control**: Role-based with 2FA mandatory
- [ ] **Audit Logging**: All transactions and admin actions logged
- [ ] **Incident Response Plan** documented and tested
- [ ] **Security Monitoring**: 24/7 alerting via PagerDuty
- [ ] **Backup Recovery**: Tested monthly with <15 minute RTO

### Transaction Security
- [ ] **Double-spend Prevention**: Check signature cache
- [ ] **Replay Attack Protection**: Use recent blockhashes
- [ ] **Priority Fee Strategy**: Dynamic based on network congestion
- [ ] **Transaction Confirmation**: Wait for "finalized" status
- [ ] **Webhook Verification**: HMAC signatures on all webhooks
- [ ] **Oracle Integration**: Dual oracles (Pyth + Switchboard)

## 3. Complete Code Implementation

### Escrow Smart Contract (Anchor/Rust)

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("BuyBk5dFGhjKVKPLAGNrYBNZgowf8RGeZzB2fPCSbw6");

#[program]
pub mod phone_buyback_escrow {
    use super::*;

    pub fn initialize_buyback(
        ctx: Context<InitializeBuyback>,
        phone_id: String,
        amount_usdc: u64,
        inspection_deadline: i64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        escrow.seller = ctx.accounts.seller.key();
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.phone_id = phone_id;
        escrow.amount = amount_usdc;
        escrow.inspection_deadline = inspection_deadline;
        escrow.status = EscrowStatus::AwaitingDevice;
        escrow.bump = *ctx.bumps.get("escrow").unwrap();
        
        // Transfer USDC from platform to escrow
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_usdc.to_account_info(),
                    to: ctx.accounts.escrow_usdc.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            amount_usdc,
        )?;
        
        Ok(())
    }

    pub fn confirm_device_received(
        ctx: Context<UpdateEscrow>,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == EscrowStatus::AwaitingDevice, ErrorCode::InvalidStatus);
        
        escrow.status = EscrowStatus::UnderInspection;
        escrow.inspection_started = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    pub fn complete_inspection(
        ctx: Context<CompleteInspection>,
        approved: bool,
        adjusted_amount: Option<u64>,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        let clock = Clock::get()?;
        
        require!(
            escrow.status == EscrowStatus::UnderInspection,
            ErrorCode::InvalidStatus
        );
        require!(
            clock.unix_timestamp <= escrow.inspection_deadline,
            ErrorCode::InspectionDeadlinePassed
        );
        
        if approved {
            let final_amount = adjusted_amount.unwrap_or(escrow.amount);
            
            // Release funds to seller
            let seeds = &[
                b"escrow",
                escrow.seller.as_ref(),
                escrow.phone_id.as_bytes(),
                &[escrow.bump],
            ];
            let signer = &[&seeds[..]];
            
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.escrow_usdc.to_account_info(),
                        to: ctx.accounts.seller_usdc.to_account_info(),
                        authority: escrow.to_account_info(),
                    },
                    signer,
                ),
                final_amount,
            )?;
            
            escrow.status = EscrowStatus::Completed;
        } else {
            escrow.status = EscrowStatus::Rejected;
        }
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(phone_id: String)]
pub struct InitializeBuyback<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    /// CHECK: Seller account
    pub seller: AccountInfo<'info>,
    
    #[account(
        init,
        payer = buyer,
        space = 8 + Escrow::LEN,
        seeds = [b"escrow", seller.key().as_ref(), phone_id.as_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(mut)]
    pub buyer_usdc: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_usdc: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Escrow {
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub phone_id: String,
    pub amount: u64,
    pub status: EscrowStatus,
    pub inspection_deadline: i64,
    pub inspection_started: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    AwaitingDevice,
    UnderInspection,
    Completed,
    Rejected,
    Disputed,
}
```

### Backend Implementation (TypeScript)

```typescript
// src/services/PaymentService.ts
import { 
  Connection, 
  PublicKey, 
  Transaction,
  SystemProgram,
  Keypair
} from '@solana/web3.js';
import { 
  createTransferInstruction,
  getAssociatedTokenAddress 
} from '@solana/spl-token';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { createQR, encodeURL, validateTransfer } from '@solana/pay';
import BN from 'bn.js';

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_KEY}`;

export class PaymentService {
  private connection: Connection;
  private program: Program;
  private treasury: Keypair;

  constructor() {
    this.connection = new Connection(HELIUS_RPC, {
      commitment: 'confirmed',
      wsEndpoint: HELIUS_RPC.replace('https', 'wss')
    });
    
    // Initialize Anchor program
    const provider = new AnchorProvider(
      this.connection,
      null, // Will be set per transaction
      { commitment: 'confirmed' }
    );
    this.program = new Program(IDL, PROGRAM_ID, provider);
  }

  async createBuybackQuote(
    phoneModel: string,
    condition: string,
    estimatedValue: number
  ): Promise<BuybackQuote> {
    const quoteId = generateQuoteId();
    const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutes
    
    // Store quote in database
    await db.quotes.create({
      id: quoteId,
      phoneModel,
      condition,
      amountUsdc: estimatedValue,
      expiresAt,
      status: 'pending'
    });

    // Generate Solana Pay URL
    const paymentUrl = encodeURL({
      recipient: this.treasury.publicKey,
      amount: new BN(estimatedValue * 1e6), // USDC has 6 decimals
      splToken: USDC_MINT,
      reference: new PublicKey(quoteId),
      label: 'Phone Buyback Payment',
      message: `Payment for ${phoneModel}`,
      memo: quoteId
    });

    // Generate QR code
    const qrCode = createQR(paymentUrl);
    
    return {
      quoteId,
      amount: estimatedValue,
      paymentUrl: paymentUrl.toString(),
      qrCode: await qrCode.getRawData('png'),
      expiresAt
    };
  }

  async initializeEscrow(
    quoteId: string,
    sellerWallet: PublicKey
  ): Promise<string> {
    const quote = await db.quotes.findOne({ id: quoteId });
    if (!quote) throw new Error('Quote not found');
    
    const phoneId = generatePhoneId();
    const inspectionDeadline = Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60); // 3 days
    
    const [escrowPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('escrow'),
        sellerWallet.toBuffer(),
        Buffer.from(phoneId)
      ],
      this.program.programId
    );

    const escrowUsdc = await getAssociatedTokenAddress(
      USDC_MINT,
      escrowPDA,
      true
    );

    const tx = await this.program.methods
      .initializeBuyback(
        phoneId,
        new BN(quote.amountUsdc * 1e6),
        new BN(inspectionDeadline)
      )
      .accounts({
        buyer: this.treasury.publicKey,
        seller: sellerWallet,
        escrow: escrowPDA,
        buyerUsdc: await getAssociatedTokenAddress(USDC_MINT, this.treasury.publicKey),
        escrowUsdc,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .signers([this.treasury])
      .rpc();

    // Update database
    await db.escrows.create({
      phoneId,
      quoteId,
      sellerWallet: sellerWallet.toString(),
      escrowAddress: escrowPDA.toString(),
      amount: quote.amountUsdc,
      status: 'awaiting_device',
      transactionSignature: tx
    });

    return tx;
  }

  async monitorPayment(reference: PublicKey): Promise<PaymentStatus> {
    // Set up websocket subscription
    const subscriptionId = this.connection.onAccountChange(
      reference,
      async (accountInfo) => {
        // Payment detected
        const signature = await this.findTransactionByReference(reference);
        if (signature) {
          await this.processPaymentConfirmation(signature);
        }
      },
      'confirmed'
    );

    // Also poll for confirmation (backup to websocket)
    const interval = setInterval(async () => {
      try {
        const found = await validateTransfer(
          this.connection,
          signature,
          {
            recipient: this.treasury.publicKey,
            amount: expectedAmount,
            splToken: USDC_MINT
          }
        );
        
        if (found) {
          clearInterval(interval);
          this.connection.removeAccountChangeListener(subscriptionId);
          await this.processPaymentConfirmation(signature);
        }
      } catch (error) {
        console.error('Payment validation error:', error);
      }
    }, 5000); // Check every 5 seconds

    return { status: 'monitoring', reference: reference.toString() };
  }

  async completeInspection(
    phoneId: string,
    approved: boolean,
    adjustedAmount?: number
  ): Promise<string> {
    const escrow = await db.escrows.findOne({ phoneId });
    if (!escrow) throw new Error('Escrow not found');

    const [escrowPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('escrow'),
        new PublicKey(escrow.sellerWallet).toBuffer(),
        Buffer.from(phoneId)
      ],
      this.program.programId
    );

    const sellerUsdc = await getAssociatedTokenAddress(
      USDC_MINT,
      new PublicKey(escrow.sellerWallet)
    );

    const tx = await this.program.methods
      .completeInspection(
        approved,
        adjustedAmount ? new BN(adjustedAmount * 1e6) : null
      )
      .accounts({
        inspector: this.treasury.publicKey,
        escrow: escrowPDA,
        escrowUsdc: await getAssociatedTokenAddress(USDC_MINT, escrowPDA, true),
        sellerUsdc,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .signers([this.treasury])
      .rpc();

    // Update database
    await db.escrows.update(
      { phoneId },
      {
        status: approved ? 'completed' : 'rejected',
        completionTx: tx,
        finalAmount: adjustedAmount || escrow.amount
      }
    );

    // Send notification to seller
    await this.notifySeller(escrow.sellerWallet, approved, adjustedAmount);

    return tx;
  }

  private async processPaymentConfirmation(signature: string) {
    const tx = await this.connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    if (!tx) throw new Error('Transaction not found');

    // Extract payment details
    const { amount, sender, recipient } = this.parseTransaction(tx);

    // Update database
    await db.payments.create({
      signature,
      sender: sender.toString(),
      recipient: recipient.toString(),
      amount,
      status: 'confirmed',
      blockTime: tx.blockTime,
      slot: tx.slot
    });

    // Trigger next steps in buyback flow
    await this.queue.add('process-buyback', { signature, amount, sender });
  }
}
```

### Frontend Implementation (React)

```typescript
// src/components/PaymentFlow.tsx
import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createQR, encodeURL } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import QRCode from 'qrcode.react';

export const PaymentFlow: React.FC<{ phoneDetails: PhoneDetails }> = ({ phoneDetails }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [qrCode, setQrCode] = useState<string>('');

  const generateQuote = async () => {
    setPaymentStatus('generating');
    
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...phoneDetails,
          walletAddress: publicKey?.toString()
        })
      });

      const quote = await response.json();
      setQuote(quote);
      
      // Generate QR code for Solana Pay
      const url = encodeURL({
        recipient: new PublicKey(quote.recipient),
        amount: quote.amount,
        splToken: new PublicKey(quote.tokenMint),
        reference: new PublicKey(quote.reference),
        label: 'Phone Buyback',
        message: `Selling ${phoneDetails.model}`
      });

      const qr = createQR(url.toString());
      setQrCode(await qr.getRawData('png'));
      setPaymentStatus('ready');
    } catch (error) {
      console.error('Quote generation failed:', error);
      setPaymentStatus('error');
    }
  };

  const initializePayment = async () => {
    if (!publicKey || !quote) return;
    
    setPaymentStatus('processing');

    try {
      // Create escrow on backend
      const response = await fetch('/api/escrow/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote.id,
          sellerWallet: publicKey.toString()
        })
      });

      const { transactionBase64 } = await response.json();
      
      // Deserialize and sign transaction
      const transaction = Transaction.from(Buffer.from(transactionBase64, 'base64'));
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      setPaymentStatus('confirmed');
      
      // Poll for escrow status
      pollEscrowStatus(quote.id);
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('failed');
    }
  };

  const pollEscrowStatus = async (quoteId: string) => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/escrow/status/${quoteId}`);
      const { status } = await response.json();
      
      if (status === 'completed' || status === 'rejected') {
        clearInterval(interval);
        setPaymentStatus(status);
      }
    }, 5000);
  };

  return (
    <div className="payment-flow">
      <h2>Sell Your {phoneDetails.model}</h2>
      
      {!publicKey ? (
        <div className="wallet-connect">
          <p>Connect your wallet to get started</p>
          <WalletMultiButton />
        </div>
      ) : (
        <>
          {!quote && (
            <button onClick={generateQuote} disabled={paymentStatus === 'generating'}>
              Get Instant Quote
            </button>
          )}

          {quote && paymentStatus === 'ready' && (
            <div className="quote-display">
              <h3>Your Quote: ${quote.amount} USDC</h3>
              <p>Valid for: {Math.floor(quote.expiresIn / 60)} minutes</p>
              
              <div className="payment-options">
                <div className="qr-payment">
                  <h4>Scan to Pay</h4>
                  <QRCode value={qrCode} size={256} />
                </div>
                
                <div className="divider">OR</div>
                
                <button onClick={initializePayment} className="pay-button">
                  Pay with Connected Wallet
                </button>
              </div>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="processing">
              <div className="spinner" />
              <p>Processing your payment...</p>
            </div>
          )}

          {paymentStatus === 'confirmed' && (
            <div className="success">
              <h3>✓ Payment Received!</h3>
              <p>Ship your phone to:</p>
              <address>
                Phone Buyback Center<br />
                123 Main St<br />
                San Francisco, CA 94102
              </address>
              <p>Tracking: {quote.trackingNumber}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

## 4. Testing Guide with Specific Test Cases

### Test Environment Setup

```javascript
// test/setup.ts
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, mintTo } from '@solana/spl-token';

export const setupTestEnvironment = async () => {
  const connection = new Connection('http://localhost:8899', 'confirmed');
  
  // Create test wallets
  const platform = Keypair.generate();
  const seller = Keypair.generate();
  const buyer = Keypair.generate();
  
  // Airdrop SOL
  await connection.requestAirdrop(platform.publicKey, 10 * LAMPORTS_PER_SOL);
  await connection.requestAirdrop(seller.publicKey, 1 * LAMPORTS_PER_SOL);
  
  // Create test USDC mint
  const usdcMint = await createMint(
    connection,
    platform,
    platform.publicKey,
    null,
    6 // USDC has 6 decimals
  );
  
  // Mint test USDC
  await mintTo(
    connection,
    platform,
    usdcMint,
    platformTokenAccount,
    platform,
    1000000 * 1e6 // 1M USDC
  );
  
  return { connection, platform, seller, buyer, usdcMint };
};
```

### Critical Test Cases

```javascript
// test/payment.test.ts
describe('Phone Buyback Payment System', () => {
  let env: TestEnvironment;
  
  beforeEach(async () => {
    env = await setupTestEnvironment();
  });

  describe('Escrow Creation', () => {
    it('should create escrow with correct parameters', async () => {
      const phoneId = 'IPHONE14-001';
      const amount = 500 * 1e6; // $500 USDC
      
      const tx = await program.methods
        .initializeBuyback(phoneId, new BN(amount), new BN(Date.now() + 259200))
        .accounts({
          buyer: env.platform.publicKey,
          seller: env.seller.publicKey,
          // ... other accounts
        })
        .signers([env.platform])
        .rpc();
      
      const escrow = await program.account.escrow.fetch(escrowPDA);
      
      expect(escrow.amount.toNumber()).toBe(amount);
      expect(escrow.status).toEqual({ awaitingDevice: {} });
      expect(escrow.seller.toString()).toBe(env.seller.publicKey.toString());
    });

    it('should handle insufficient funds gracefully', async () => {
      const amount = 10000000 * 1e6; // More than available
      
      await expect(
        program.methods.initializeBuyback(/*...*/)
      ).rejects.toThrow('Insufficient funds');
    });
  });

  describe('Price Volatility', () => {
    it('should reject payment if price moves >10%', async () => {
      const initialQuote = await generateQuote({ model: 'iPhone 14', condition: 'good' });
      
      // Simulate 15% price drop
      await mockOracle.setPrice('SOL/USD', 51); // Down from $60
      
      await expect(
        processPayment(initialQuote)
      ).rejects.toThrow('PRICE_DEVIATION_EXCEEDED');
    });

    it('should handle USDC payments without volatility issues', async () => {
      const quote = await generateUSDCQuote({ model: 'iPhone 14' });
      
      // Wait 3 days (inspection period)
      await advanceTime(3 * 24 * 60 * 60);
      
      const result = await processPayment(quote);
      expect(result.status).toBe('success');
      expect(result.amount).toBe(quote.amount); // No price change
    });
  });

  describe('Network Failures', () => {
    it('should retry failed transactions with exponential backoff', async () => {
      let attempts = 0;
      
      // Mock RPC to fail first 2 attempts
      jest.spyOn(connection, 'sendTransaction').mockImplementation(async () => {
        attempts++;
        if (attempts <= 2) throw new Error('Network error');
        return 'successful-signature';
      });
      
      const result = await sendTransactionWithRetry(transaction);
      
      expect(attempts).toBe(3);
      expect(result).toBe('successful-signature');
    });

    it('should failover to backup RPC on primary failure', async () => {
      const primaryRPC = new Connection('https://primary.com');
      const backupRPC = new Connection('https://backup.com');
      
      jest.spyOn(primaryRPC, 'getLatestBlockhash').mockRejectedValue(new Error('RPC down'));
      jest.spyOn(backupRPC, 'getLatestBlockhash').mockResolvedValue({ blockhash: 'abc123' });
      
      const service = new PaymentService([primaryRPC, backupRPC]);
      const blockhash = await service.getBlockhash();
      
      expect(blockhash).toBe('abc123');
    });
  });

  describe('Concurrent Transactions', () => {
    it('should handle 100 simultaneous buybacks without conflicts', async () => {
      const promises = Array(100).fill(0).map((_, i) => 
        createBuyback({
          phoneId: `PHONE-${i}`,
          amount: 100 + i,
          seller: Keypair.generate().publicKey
        })
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled');
      
      expect(successful.length).toBeGreaterThan(95); // >95% success rate
    });
  });

  describe('Edge Cases', () => {
    it('should handle wrong wallet address format', async () => {
      await expect(
        createPayment({ recipient: 'invalid-address' })
      ).rejects.toThrow('Invalid Solana address');
    });

    it('should handle partial device rejection', async () => {
      const escrow = await createEscrow({ amount: 500 });
      
      // Inspect and adjust price
      const result = await completeInspection({
        escrowId: escrow.id,
        approved: true,
        adjustedAmount: 400 // $100 reduction
      });
      
      expect(result.finalAmount).toBe(400);
      expect(result.status).toBe('completed');
    });

    it('should handle inspection deadline expiry', async () => {
      const escrow = await createEscrow({ 
        amount: 500,
        inspectionDeadline: Date.now() + 1000 // 1 second
      });
      
      await sleep(2000); // Wait past deadline
      
      await expect(
        completeInspection({ escrowId: escrow.id })
      ).rejects.toThrow('Inspection deadline passed');
    });
  });

  describe('Security', () => {
    it('should prevent double-spending', async () => {
      const payment = await createPayment({ amount: 100 });
      
      // Try to spend same transaction twice
      await processPayment(payment);
      
      await expect(
        processPayment(payment)
      ).rejects.toThrow('Transaction already processed');
    });

    it('should validate webhook signatures', async () => {
      const payload = { event: 'payment_confirmed' };
      const invalidSignature = 'wrong-signature';
      
      const result = await processWebhook(payload, invalidSignature);
      
      expect(result.status).toBe(401);
      expect(result.message).toBe('Invalid signature');
    });
  });
});
```

## 5. Deployment Runbook

### Step-by-Step Deployment Instructions

```bash
# PHASE 1: Environment Preparation (Day 1)

## 1.1 Infrastructure Setup
git clone https://github.com/your-org/phone-buyback-payment
cd phone-buyback-payment

## 1.2 Install Dependencies
npm install
npm run build

## 1.3 Environment Configuration
cp .env.example .env.production
# Edit .env.production with:
# - SOLANA_NETWORK=mainnet-beta
# - HELIUS_API_KEY=your-key
# - QUICKNODE_API_KEY=backup-key
# - DATABASE_URL=postgresql://...
# - REDIS_URL=redis://...

## 1.4 Database Setup
npm run db:migrate
npm run db:seed:production

# PHASE 2: Smart Contract Deployment (Day 2)

## 2.1 Build and Test Contract
cd programs/phone-buyback-escrow
anchor build
anchor test

## 2.2 Deploy to Mainnet
anchor deploy --provider.cluster mainnet
# Save the Program ID: BuyBk5dFGhjKVKPLAGNrYBNZgowf8RGeZzB2fPCSbw6

## 2.3 Verify Deployment
solana program show BuyBk5dFGhjKVKPLAGNrYBNZgowf8RGeZzB2fPCSbw6

## 2.4 Initialize Program State
npm run init:program -- --network mainnet

# PHASE 3: Backend Deployment (Day 3)

## 3.1 Docker Build
docker build -t phone-buyback-api:latest .
docker tag phone-buyback-api:latest your-registry/phone-buyback-api:latest
docker push your-registry/phone-buyback-api:latest

## 3.2 Kubernetes Deployment
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

## 3.3 Health Check
kubectl get pods -n phone-buyback
kubectl logs -n phone-buyback deployment/api

## 3.4 Database Migrations
kubectl exec -n phone-buyback deployment/api -- npm run db:migrate:production

# PHASE 4: Frontend Deployment (Day 4)

## 4.1 Build Frontend
cd frontend
npm run build
npm run test:e2e

## 4.2 Deploy to CDN
aws s3 sync build/ s3://phone-buyback-frontend --delete
aws cloudfront create-invalidation --distribution-id ABCD1234 --paths "/*"

## 4.3 DNS Configuration
# Point your domain to CloudFront distribution
# Add SSL certificate via AWS Certificate Manager

# PHASE 5: Monitoring Setup (Day 5)

## 5.1 Prometheus Configuration
kubectl apply -f monitoring/prometheus-config.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml

## 5.2 Grafana Setup
kubectl apply -f monitoring/grafana-deployment.yaml
# Import dashboards from monitoring/dashboards/

## 5.3 Alerting Rules
kubectl apply -f monitoring/alerting-rules.yaml

## 5.4 PagerDuty Integration
kubectl create secret generic pagerduty-key --from-literal=key=YOUR_KEY

# PHASE 6: Security Hardening (Day 6)

## 6.1 Network Policies
kubectl apply -f security/network-policies.yaml

## 6.2 Rate Limiting
kubectl apply -f security/rate-limiting.yaml

## 6.3 WAF Rules
aws wafv2 create-web-acl --name phone-buyback --scope CLOUDFRONT ...

## 6.4 Secrets Rotation
kubectl rollout restart deployment/api -n phone-buyback

# PHASE 7: Testing & Validation (Day 7)

## 7.1 Smoke Tests
npm run test:smoke -- --env production

## 7.2 Load Testing
npm run test:load -- --users 100 --duration 300

## 7.3 Security Scan
npm audit
docker scan phone-buyback-api:latest

## 7.4 Monitoring Validation
# Verify all metrics appearing in Grafana
# Test alert firing and PagerDuty integration

# PHASE 8: Go-Live (Day 8)

## 8.1 Final Checklist
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Runbooks documented
- [ ] Team trained

## 8.2 Feature Flag Activation
curl -X POST https://api.yourdomain.com/admin/features \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"feature": "solana_payments", "enabled": true, "percentage": 10}'

## 8.3 Traffic Ramp-Up
# Day 1: 10% of traffic
# Day 3: 25% of traffic
# Day 5: 50% of traffic
# Day 7: 100% of traffic

## 8.4 Post-Launch Monitoring
# Monitor for 24 hours after each traffic increase
# Check error rates, performance metrics, user feedback
```

### Rollback Procedure

```bash
# EMERGENCY ROLLBACK PROCEDURE

## Option 1: Feature Flag (Immediate - 30 seconds)
curl -X POST https://api.yourdomain.com/admin/features \
  -d '{"feature": "solana_payments", "enabled": false}'

## Option 2: Blue-Green Switch (Fast - 2 minutes)
kubectl set image deployment/api api=your-registry/phone-buyback-api:previous -n phone-buyback
kubectl rollout status deployment/api -n phone-buyback

## Option 3: Full Rollback (Complete - 10 minutes)
git checkout tags/v1.0.0
./deploy.sh --emergency --skip-tests

## Post-Rollback
1. Notify team via Slack
2. Create incident report
3. Preserve logs for analysis
4. Schedule post-mortem
```

## 6. Monitoring Setup

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Phone Buyback Payment System",
    "panels": [
      {
        "title": "Payment Success Rate",
        "targets": [{
          "expr": "sum(rate(payments_success[5m])) / sum(rate(payments_total[5m])) * 100"
        }],
        "alert": {
          "conditions": [{
            "evaluator": { "params": [95], "type": "lt" },
            "operator": { "type": "and" }
          }]
        }
      },
      {
        "title": "Transaction Confirmation Time",
        "targets": [{
          "expr": "histogram_quantile(0.95, rate(transaction_confirmation_seconds_bucket[5m]))"
        }]
      },
      {
        "title": "Wallet Balance",
        "targets": [{
          "expr": "solana_wallet_balance_sol{wallet=\"hot\"}"
        }],
        "alert": {
          "conditions": [{
            "evaluator": { "params": [100], "type": "lt" }
          }]
        }
      },
      {
        "title": "Escrow Status Distribution",
        "targets": [{
          "expr": "sum by (status) (escrow_status_total)"
        }]
      }
    ]
  }
}
```

### Alert Configuration

```yaml
# monitoring/alerts.yaml
groups:
  - name: payment_alerts
    interval: 30s
    rules:
      - alert: HighPaymentFailureRate
        expr: |
          (sum(rate(payments_failed[5m])) / sum(rate(payments_total[5m]))) > 0.05
        for: 5m
        labels:
          severity: critical
          team: payments
        annotations:
          summary: "High payment failure rate: {{ $value | humanizePercentage }}"
          description: "Payment failure rate is above 5% for the last 5 minutes"
      
      - alert: LowWalletBalance
        expr: solana_wallet_balance_sol{wallet="hot"} < 100
        for: 1m
        labels:
          severity: warning
          team: finance
        annotations:
          summary: "Low hot wallet balance: {{ $value }} SOL"
          description: "Hot wallet balance is below 100 SOL threshold"
      
      - alert: SolanaNetworkIssues
        expr: solana_network_slot_height - solana_network_slot_height offset 1m < 60
        for: 5m
        labels:
          severity: critical
          team: infrastructure
        annotations:
          summary: "Solana network may be experiencing issues"
          description: "Slot height hasn't increased normally in 5 minutes"
      
      - alert: HighTransactionCosts
        expr: |
          avg(transaction_fee_lamports) > 100000
        for: 10m
        labels:
          severity: warning
          team: finance
        annotations:
          summary: "Transaction fees are unusually high"
          description: "Average transaction fee is {{ $value }} lamports"
```

## 7. Compliance Documentation

### Regulatory Compliance Checklist

**Federal Requirements:**
- [ ] **FinCEN MSB Registration** (Form 107) - File within 180 days
- [ ] **BSA Compliance Program** documented and implemented
- [ ] **AML Policy** with risk assessment and controls
- [ ] **Travel Rule** compliance for transactions ≥$3,000
- [ ] **SAR Filing** procedures for suspicious activities
- [ ] **CTR Filing** for cash transactions >$10,000

**State Licensing (Priority States):**
- [ ] **New York**: BitLicense application ($5,000 fee)
- [ ] **California**: Money Transmitter License
- [ ] **Texas**: Money Services License
- [ ] **Florida**: Money Transmitter License

**Tax Compliance:**
- [ ] **Form 1099-DA** implementation for 2025
- [ ] **Cost basis tracking** system
- [ ] **W-8BEN** collection for international customers
- [ ] **Sales tax** calculation by jurisdiction

**Data Protection:**
- [ ] **CCPA** compliance for California residents
- [ ] **Data retention policy** (7 years for financial records)
- [ ] **Privacy policy** with crypto-specific disclosures
- [ ] **Incident response plan** for data breaches

**Documentation Required:**
- [ ] Corporate formation documents
- [ ] Financial statements (2 years)
- [ ] Background checks for principals
- [ ] Compliance officer designation
- [ ] Surety bond (varies by state, typically $25,000-$1,000,000)
- [ ] Cybersecurity insurance policy
- [ ] Business continuity plan

### Estimated Compliance Costs
- Initial licensing: $50,000-150,000
- Annual compliance: $60,000-120,000
- Legal counsel: $25,000-50,000
- Audit and testing: $20,000-40,000

## 8. Cost Projections

### Implementation Costs

| Component | Cost Range | Timeline |
|-----------|------------|----------|
| Smart Contract Development | $30,000-50,000 | 2-3 weeks |
| Backend Development | $40,000-60,000 | 3-4 weeks |
| Frontend Development | $20,000-30,000 | 2-3 weeks |
| Security Audit | $30,000-50,000 | 1-2 weeks |
| Infrastructure Setup | $10,000-15,000 | 1 week |
| Compliance Setup | $50,000-100,000 | 4-6 weeks |
| **Total Implementation** | **$180,000-305,000** | **8-12 weeks** |

### Operational Costs by Volume

| Daily Volume | Transaction Fees | RPC Services | Infrastructure | Compliance | Total Monthly |
|--------------|-----------------|--------------|----------------|------------|---------------|
| 100 tx | $84 | $0 (free tier) | $100 | $500 | **$684** |
| 300 tx | $252 | $49 | $200 | $1,000 | **$1,501** |
| 500 tx | $420 | $49 | $300 | $2,000 | **$2,769** |
| 1000 tx | $840 | $499 | $500 | $3,000 | **$4,839** |
| 2000 tx | $1,680 | $999 | $1,000 | $5,000 | **$8,679** |

### ROI Analysis

**Assuming $150 average transaction value:**

| Volume | Traditional Costs (PayPal 2.9%) | Solana Costs | Monthly Savings | Annual ROI |
|--------|--------------------------------|--------------|-----------------|------------|
| 100/day | $13,050 | $684 | $12,366 | **1,808%** |
| 500/day | $65,250 | $2,769 | $62,481 | **2,256%** |
| 1000/day | $130,500 | $4,839 | $125,661 | **2,596%** |

### Break-Even Analysis
- **vs PayPal**: Immediate savings on first transaction
- **vs ACH**: Break-even at ~50 transactions/day
- **vs Wire**: Massive savings on any volume

## Implementation Timeline

### Week 1-2: Foundation
- Set up development environment
- Deploy basic smart contract
- Initialize backend services
- Create wallet infrastructure

### Week 3-4: Core Development
- Complete escrow functionality
- Implement payment processing
- Build admin dashboard
- Integrate monitoring

### Week 5-6: Security & Testing
- Security audit
- Comprehensive testing
- Bug fixes and optimization
- Documentation

### Week 7-8: Compliance & Launch Prep
- Complete regulatory filings
- KYC/AML implementation
- Staff training
- Soft launch preparation

### Week 9-10: Soft Launch
- 10% traffic rollout
- Monitor and optimize
- Gather feedback
- Fix critical issues

### Week 11-12: Full Launch
- Gradual traffic increase
- Marketing launch
- Continuous monitoring
- Feature iterations

## Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| SOL Price Volatility | High | High | Use USDC exclusively |
| Network Congestion | Medium | Medium | Multi-RPC setup, priority fees |
| Smart Contract Bug | Low | Critical | Professional audit, bug bounty |
| Regulatory Change | Medium | High | Proactive compliance, legal counsel |
| Low Adoption | Medium | Medium | Education, incentives, smooth UX |
| Wallet Compromise | Low | Critical | Hardware wallets, multi-sig |
| RPC Failure | Medium | High | Multiple providers, failover |

## Success Metrics

**Technical KPIs:**
- Payment success rate >99.5%
- Confirmation time <30 seconds
- System uptime >99.9%
- Zero security incidents

**Business KPIs:**
- Customer acquisition cost <$10
- Transaction volume growth >20% monthly
- Customer satisfaction >85%
- Payment cost savings >90%

**Compliance KPIs:**
- 100% KYC completion rate
- Zero regulatory violations
- Audit pass rate 100%
- SAR filing within deadlines

## Conclusion

This comprehensive implementation plan provides everything needed to launch a secure, compliant, and scalable Solana payment system for your phone buyback platform. The recommended architecture using USDC-based escrow eliminates volatility risk while providing 95-99% cost savings compared to traditional payment methods.

**Immediate Next Steps:**
1. Approve budget allocation ($200-300k total)
2. Assemble development team
3. Begin FinCEN MSB registration
4. Start smart contract development
5. Initiate security audit booking

The system can be operational within 8-12 weeks, processing your first transactions at a fraction of traditional costs while providing superior speed and global reach. The architecture scales efficiently from 100 to 1000+ daily transactions with minimal operational overhead.

ecommended MVP: Direct Wallet-to-Wallet with Manual Admin Approval

  Why This Approach:

  - Fastest to implement - No smart contracts, just basic Solana transfers
  - Minimal complexity - Uses existing Solana web3.js, no custom programs
  - Full control - Admin manually reviews and approves each payment
  - Easy to pivot - Can upgrade to escrow/smart contracts later without breaking changes

  Simple Implementation:

  1. Platform hot wallet - Single Solana wallet for outgoing payments (keep minimal funds)
  2. Admin dashboard - Button to "Approve & Send Payment" after inspection
  3. Basic verification - Check wallet address format, confirm amount, get admin signature
  4. Transaction tracking - Store tx signatures in database, show status to customer

  Security Minimums:

  - Daily funding limits - Only keep ~10-20 payments worth of SOL in hot wallet
  - Admin authentication - Require 2FA for payment approval
  - Amount validation - Lock quoted price in database, verify before sending
  - Rate limiting - Max payments per hour to prevent drain if compromised

  What to Defer:

  - Smart contracts/escrow (add when volume justifies it)
  - Automated payments (keep manual while testing product-market fit)
  - Multi-sig wallets (add when handling larger amounts)
  - USDC support (start SOL-only, add stablecoins based on customer feedback)

  Quick Wins:

  - Use Helius/QuickNode free tier for RPC (reliable, no setup)
  - Implement Solana Pay QR codes for easy wallet address collection
  - Add simple webhook to confirm transactions reached customer

  This gets you live in days, not weeks, and lets you validate the business model before over-engineering
  the payment infrastructure.