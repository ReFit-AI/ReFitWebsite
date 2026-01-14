# ReFit Marketplace Deployment Guide

## Overview

This guide walks through deploying the complete ReFit Marketplace system with escrow smart contracts, compressed NFTs, and OpenBook V2 integration.

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    ReFit Marketplace                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Escrow     │  │  Compressed  │  │   OpenBook   │  │
│  │  Contract    │  │     NFTs     │  │      V2      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ↓                  ↓                 ↓          │
│  ┌────────────────────────────────────────────────┐    │
│  │           ReFit Marketplace SDK                │    │
│  └────────────────────────────────────────────────┘    │
│                          ↓                             │
│  ┌────────────────────────────────────────────────┐    │
│  │            Next.js Frontend                     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Solana CLI Tools**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
   solana --version
   ```

2. **Anchor Framework**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   anchor --version
   ```

3. **Node.js Dependencies**
   ```bash
   npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token
   npm install @metaplex-foundation/mpl-bubblegum @metaplex-foundation/mpl-token-metadata
   npm install @openbook-dex/openbook-v2-client
   ```

## Step 1: Deploy Smart Contracts

### 1.1 Build the Marketplace Contract

```bash
cd contracts
anchor build
```

### 1.2 Get Program IDs

```bash
solana-keygen new -o target/deploy/refit_marketplace-keypair.json
solana address -k target/deploy/refit_marketplace-keypair.json
```

Update the program ID in `contracts/programs/marketplace/src/lib.rs`:
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

### 1.3 Deploy to Devnet

```bash
# Configure for devnet
solana config set --url https://api.devnet.solana.com

# Airdrop SOL for deployment
solana airdrop 2

# Deploy the program
anchor deploy --provider.cluster devnet
```

### 1.4 Verify Deployment

```bash
solana program show YOUR_PROGRAM_ID
```

## Step 2: Initialize Compressed NFT Collection

### 2.1 Create Initialization Script

Create `scripts/initialize-collection.js`:

```javascript
import { Connection, Keypair } from '@solana/web3.js';
import PhoneNFTManager from '../lib/phone-nft-manager.js';
import fs from 'fs';

// Load wallet
const walletKey = JSON.parse(fs.readFileSync('/path/to/wallet.json'));
const wallet = Keypair.fromSecretKey(new Uint8Array(walletKey));

// Initialize connection
const connection = new Connection('https://api.devnet.solana.com');

// Create NFT manager
const nftManager = new PhoneNFTManager(connection, wallet, 'devnet');

// Initialize collection
const collection = await nftManager.initializePhoneCollection({
  collectionName: 'ReFit Verified Phones',
  collectionSymbol: 'RPHONE',
  collectionUri: 'https://arweave.net/refit-collection-metadata',
});

console.log('Collection initialized:', collection);

// Save collection info
fs.writeFileSync(
  'collection-config.json',
  JSON.stringify(collection, null, 2)
);
```

### 2.2 Run Initialization

```bash
node scripts/initialize-collection.js
```

## Step 3: Initialize OpenBook Markets

### 3.1 Create Market Initialization Script

Create `scripts/initialize-markets.js`:

```javascript
import { Connection, Keypair } from '@solana/web3.js';
import OpenBookIntegration from '../lib/openbook-integration.js';
import fs from 'fs';

// Load wallet and collection config
const walletKey = JSON.parse(fs.readFileSync('/path/to/wallet.json'));
const wallet = Keypair.fromSecretKey(new Uint8Array(walletKey));
const collection = JSON.parse(fs.readFileSync('collection-config.json'));

// Initialize connection
const connection = new Connection('https://api.devnet.solana.com');

// Create OpenBook integration
const openbook = new OpenBookIntegration(connection, wallet);

// Phone models to initialize
const phoneModels = [
  'iPhone-15-Pro-Max',
  'iPhone-14-Pro',
  'Samsung-Galaxy-S24-Ultra',
  'Google-Pixel-8-Pro',
];

const markets = {};

for (const model of phoneModels) {
  try {
    const marketPubkey = await openbook.initializePhoneMarket(
      model,
      collection.treeAddress
    );
    markets[model] = marketPubkey.toString();
    console.log(`Market created for ${model}: ${marketPubkey.toString()}`);
  } catch (error) {
    console.error(`Failed to create market for ${model}:`, error);
  }
}

// Save market configuration
fs.writeFileSync(
  'markets-config.json',
  JSON.stringify(markets, null, 2)
);
```

### 3.2 Run Market Initialization

```bash
node scripts/initialize-markets.js
```

## Step 4: Update Environment Variables

Update `.env.local`:

```bash
# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com

# Program IDs
NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID=YOUR_PROGRAM_ID
NEXT_PUBLIC_OPENBOOK_PROGRAM_ID=opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb

# NFT Collection
NEXT_PUBLIC_NFT_COLLECTION_ADDRESS=YOUR_COLLECTION_ADDRESS
NEXT_PUBLIC_NFT_TREE_ADDRESS=YOUR_TREE_ADDRESS

# Markets (from markets-config.json)
NEXT_PUBLIC_IPHONE_15_MARKET=MARKET_ADDRESS
NEXT_PUBLIC_IPHONE_14_MARKET=MARKET_ADDRESS
# ... add other markets

# Existing ReFit config
NEXT_PUBLIC_SUPABASE_URL=your_existing_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_existing_key
SUPABASE_SERVICE_ROLE_KEY=your_existing_service_key
```

## Step 5: Database Updates

### 5.1 Add Marketplace Tables

Create `supabase/migrations/20250124_marketplace.sql`:

```sql
-- Marketplace listings table
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT UNIQUE NOT NULL,
  seller_wallet TEXT NOT NULL,
  phone_id UUID REFERENCES inventory(id),
  nft_asset_id TEXT,
  orderbook_order_id TEXT,
  price_usdc DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace orders table
CREATE TABLE marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  listing_id TEXT REFERENCES marketplace_listings(listing_id),
  buyer_wallet TEXT NOT NULL,
  seller_wallet TEXT NOT NULL,
  amount_usdc DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  carrier TEXT,
  escrow_tx_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_seller ON marketplace_listings(seller_wallet);
CREATE INDEX idx_marketplace_orders_buyer ON marketplace_orders(buyer_wallet);
CREATE INDEX idx_marketplace_orders_status ON marketplace_orders(status);
```

### 5.2 Run Migration

```bash
npx supabase db push
```

## Step 6: Test the System

### 6.1 Create Test Script

Create `scripts/test-marketplace.js`:

```javascript
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import ReFitMarketplaceSDK from '../lib/refit-marketplace-sdk.js';

async function testMarketplace() {
  // Setup
  const connection = new Connection('https://api.devnet.solana.com');
  const seller = Keypair.generate();
  const buyer = Keypair.generate();

  // Airdrop SOL for testing
  await connection.requestAirdrop(seller.publicKey, 2 * LAMPORTS_PER_SOL);
  await connection.requestAirdrop(buyer.publicKey, 2 * LAMPORTS_PER_SOL);

  // Wait for confirmation
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Initialize SDK for seller
  const sellerSDK = new ReFitMarketplaceSDK({
    connection,
    wallet: seller,
    environment: 'devnet',
  });

  // Create a listing
  console.log('Creating listing...');
  const listing = await sellerSDK.createListing({
    phoneData: {
      model: 'iPhone 15 Pro Max',
      brand: 'Apple',
      storage: '256GB',
      condition: 'Excellent',
      imei: '354891234567890',
      batteryHealth: 94,
      carrierStatus: 'Unlocked',
      issues: [],
    },
    priceUsdc: 850,
  });
  console.log('Listing created:', listing.listingId);

  // Initialize SDK for buyer
  const buyerSDK = new ReFitMarketplaceSDK({
    connection,
    wallet: buyer,
    environment: 'devnet',
  });

  // Initiate purchase
  console.log('Initiating purchase...');
  const order = await buyerSDK.initiatePurchase({
    listingId: listing.listingId,
  });
  console.log('Order created:', order.orderId);

  // Seller confirms shipment
  console.log('Confirming shipment...');
  await sellerSDK.confirmShipment({
    orderId: order.orderId,
    trackingNumber: 'TEST123456',
    carrier: 'UPS',
  });

  // Buyer confirms delivery
  console.log('Confirming delivery...');
  await buyerSDK.confirmDelivery({
    orderId: order.orderId,
  });

  console.log('Test completed successfully!');
}

testMarketplace().catch(console.error);
```

### 6.2 Run Test

```bash
node scripts/test-marketplace.js
```

## Step 7: Frontend Integration

### 7.1 Update Navigation

Add marketplace link to your navigation component:

```jsx
// components/Navigation.jsx
<Link href="/marketplace">
  <a className="nav-link">Marketplace</a>
</Link>
```

### 7.2 Test Frontend

```bash
npm run dev
# Navigate to http://localhost:3000/marketplace
```

## Step 8: Production Deployment

### 8.1 Deploy to Mainnet

```bash
# Configure for mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Deploy contracts
anchor deploy --provider.cluster mainnet

# Update environment variables for mainnet
```

### 8.2 Vercel Deployment

```bash
# Add environment variables in Vercel dashboard
# Deploy
vercel --prod
```

## Monitoring & Maintenance

### Check Program Logs

```bash
solana logs YOUR_PROGRAM_ID --url devnet
```

### Monitor Transactions

```javascript
// Add to your monitoring script
const signature = await connection.getSignaturesForAddress(
  programId,
  { limit: 10 }
);
console.log('Recent transactions:', signatures);
```

### Error Handling

Common issues and solutions:

1. **Insufficient SOL**: Ensure wallets have enough SOL for transactions
2. **Program errors**: Check program logs for detailed error messages
3. **RPC limits**: Use a dedicated RPC endpoint for production

## Security Checklist

- [ ] Audit smart contracts
- [ ] Use multisig for admin operations
- [ ] Implement rate limiting
- [ ] Add monitoring alerts
- [ ] Regular security reviews
- [ ] Backup private keys securely
- [ ] Use environment variables for sensitive data
- [ ] Implement proper error handling
- [ ] Add transaction retry logic
- [ ] Monitor for suspicious activity

## Testing Checklist

- [ ] Unit tests for smart contracts
- [ ] Integration tests for SDK
- [ ] End-to-end tests for full flow
- [ ] Load testing for orderbook
- [ ] Security testing for escrow
- [ ] UI/UX testing on different devices

## Support

For issues or questions:
- Smart Contract Issues: Check Anchor documentation
- OpenBook Integration: Refer to OpenBook V2 docs
- NFT Issues: Check Metaplex documentation
- General Issues: Open a GitHub issue

## Next Steps

1. **Add more phone models** to the orderbook
2. **Implement dispute resolution UI**
3. **Add analytics dashboard**
4. **Integrate with existing inventory system**
5. **Add mobile app support**
6. **Implement governance token**

---

**Congratulations!** You now have a fully functional decentralized marketplace for phones with escrow, NFTs, and orderbook functionality.