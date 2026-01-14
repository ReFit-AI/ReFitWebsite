/**
 * ReFit Marketplace SDK
 * Complete SDK for the ReFit phone marketplace with escrow, NFTs, and orderbook
 */

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import BN from 'bn.js';
import bs58 from 'bs58';
// Note: Anchor is not required for the mock implementation
// import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import OpenBookIntegration from './openbook-integration.js';
import PhoneNFTManager from './phone-nft-manager.js';

// Program IDs
const MARKETPLACE_PROGRAM_ID = new PublicKey('MKT1111111111111111111111111111111111111111');
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// IDL for the marketplace program (simplified version)
const MARKETPLACE_IDL = {
  version: '0.1.0',
  name: 'refit_marketplace',
  instructions: [
    {
      name: 'createPhoneListing',
      accounts: [
        { name: 'seller', isMut: true, isSigner: true },
        { name: 'listing', isMut: true, isSigner: false },
        { name: 'escrowAccount', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'rent', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'metadata', type: 'PhoneMetadata' },
        { name: 'priceUsdc', type: 'u64' },
        { name: 'requireStake', type: 'bool' },
      ],
    },
    {
      name: 'initiatePurchase',
      accounts: [
        { name: 'buyer', isMut: true, isSigner: true },
        { name: 'listing', isMut: true, isSigner: false },
        { name: 'escrowOrder', isMut: true, isSigner: false },
        { name: 'buyerTokenAccount', isMut: true, isSigner: false },
        { name: 'escrowTokenAccount', isMut: true, isSigner: false },
        { name: 'usdcMint', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'rent', isMut: false, isSigner: false },
      ],
      args: [{ name: 'listingId', type: '[u8; 32]' }],
    },
    {
      name: 'confirmShipment',
      accounts: [
        { name: 'seller', isMut: true, isSigner: true },
        { name: 'escrowOrder', isMut: true, isSigner: false },
        { name: 'listing', isMut: true, isSigner: false },
      ],
      args: [
        { name: 'orderId', type: '[u8; 32]' },
        { name: 'trackingNumber', type: 'string' },
        { name: 'carrier', type: 'string' },
      ],
    },
    {
      name: 'confirmDelivery',
      accounts: [
        { name: 'buyer', isMut: true, isSigner: true },
        { name: 'escrowOrder', isMut: true, isSigner: false },
        { name: 'listing', isMut: true, isSigner: false },
        { name: 'escrowTokenAccount', isMut: true, isSigner: false },
        { name: 'sellerTokenAccount', isMut: true, isSigner: false },
        { name: 'platformFeeAccount', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'orderId', type: '[u8; 32]' }],
    },
    {
      name: 'openDispute',
      accounts: [
        { name: 'initiator', isMut: true, isSigner: true },
        { name: 'escrowOrder', isMut: true, isSigner: false },
        { name: 'dispute', isMut: true, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'orderId', type: '[u8; 32]' },
        { name: 'reason', type: 'string' },
      ],
    },
  ],
};

export class ReFitMarketplaceSDK {
  constructor({
    connection,
    wallet,
    environment = 'devnet',
    options = {},
  }) {
    this.connection = connection;
    this.wallet = wallet;
    this.environment = environment;

    // Mock program for demo purposes
    this.program = {
      programId: MARKETPLACE_PROGRAM_ID,
      methods: {
        createPhoneListing: () => ({ accounts: () => ({ rpc: async () => 'mock_tx' }) }),
        initiatePurchase: () => ({ accounts: () => ({ rpc: async () => 'mock_tx' }) }),
        confirmShipment: () => ({ accounts: () => ({ rpc: async () => 'mock_tx' }) }),
        confirmDelivery: () => ({ accounts: () => ({ rpc: async () => 'mock_tx' }) }),
        openDispute: () => ({ accounts: () => ({ rpc: async () => 'mock_tx' }) }),
      },
      account: {
        phoneListing: {
          fetch: async () => ({}),
          all: async () => [],
        },
      },
    };

    // Initialize sub-modules
    this.openbook = new OpenBookIntegration(connection, wallet);
    this.nftManager = new PhoneNFTManager(connection, wallet, environment);

    // Cache for frequently used data
    this.cache = {
      listings: new Map(),
      orders: new Map(),
      markets: new Map(),
    };

    // Configuration options
    this.config = {
      autoMintNFT: options.autoMintNFT ?? true,
      autoListOnOrderbook: options.autoListOnOrderbook ?? true,
      platformFeePercent: options.platformFeePercent ?? 1,
      ...options,
    };
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize the marketplace (one-time setup)
   */
  async initialize() {
    console.log('Initializing ReFit Marketplace...');

    // Initialize phone NFT collection
    const collection = await this.nftManager.initializePhoneCollection({
      collectionName: 'ReFit Verified Phones',
      collectionSymbol: 'RPHONE',
    });

    // Initialize markets for popular phone models
    const phoneModels = [
      'iPhone-15-Pro-Max',
      'iPhone-14-Pro',
      'Samsung-Galaxy-S24-Ultra',
      'Google-Pixel-8-Pro',
    ];

    for (const model of phoneModels) {
      try {
        await this.openbook.initializePhoneMarket(
          model,
          collection.treeAddress
        );
        console.log(`Market initialized for ${model}`);
      } catch (error) {
        console.error(`Failed to initialize market for ${model}:`, error);
      }
    }

    return {
      collection,
      markets: phoneModels,
      status: 'initialized',
    };
  }

  // ===== LISTING MANAGEMENT =====

  /**
   * Create a new phone listing
   */
  async createListing({
    phoneData,
    priceUsdc,
    requireStake = false,
  }) {
    try {
      console.log('Creating phone listing...');

      // Step 1: Mint compressed NFT for the phone
      let phoneNFT = null;
      if (this.config.autoMintNFT) {
        phoneNFT = await this.nftManager.mintPhoneNFT({
          phoneData,
          owner: this.wallet.publicKey,
        });
        console.log('Phone NFT minted:', phoneNFT.assetId);
      }

      // Step 2: Create on-chain listing
      const listingId = this.generateListingId();
      const listing = await this.program.methods
        .createPhoneListing(
          {
            model: phoneData.model,
            brand: phoneData.brand,
            storage: phoneData.storage,
            condition: phoneData.condition,
            carrierStatus: phoneData.carrierStatus || 'Unlocked',
            imei: phoneData.imei,
            batteryHealth: phoneData.batteryHealth,
            issues: JSON.stringify(phoneData.issues || []),
            imagesUrl: phoneData.images?.[0] || '',
          },
          new BN(priceUsdc * 1e6), // Convert to USDC with 6 decimals
          requireStake
        )
        .accounts({
          seller: this.wallet.publicKey,
          listing: this.deriveListingPDA(listingId),
          escrowAccount: this.deriveEscrowPDA(listingId),
          systemProgram: SystemProgram.programId,
          rent: new PublicKey('SysvarRent111111111111111111111111111111111'),
        })
        .rpc();

      console.log('Listing created on-chain:', listing);

      // Step 3: List on OpenBook orderbook
      let orderbookListing = null;
      if (this.config.autoListOnOrderbook) {
        const phoneModel = this.normalizePhoneModel(phoneData.model);
        orderbookListing = await this.openbook.placePhoneListing({
          phoneModel,
          phoneNft: phoneNFT?.assetId || listingId,
          priceUsdc: priceUsdc * 1e6,
          seller: this.wallet.publicKey,
        });
        console.log('Listed on orderbook:', orderbookListing.orderId);
      }

      // Cache the listing
      const fullListing = {
        listingId,
        phoneData,
        priceUsdc,
        nftAssetId: phoneNFT?.assetId,
        orderbookOrderId: orderbookListing?.orderId,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      this.cache.listings.set(listingId, fullListing);

      return fullListing;
    } catch (error) {
      console.error('Failed to create listing:', error);
      throw error;
    }
  }

  /**
   * Get a listing by ID
   */
  async getListing(listingId) {
    // Check cache first
    if (this.cache.listings.has(listingId)) {
      return this.cache.listings.get(listingId);
    }

    // Fetch from chain
    const listingPDA = this.deriveListingPDA(listingId);
    const listing = await this.program.account.phoneListing.fetch(listingPDA);

    // Format and cache
    const formattedListing = this.formatListing(listing);
    this.cache.listings.set(listingId, formattedListing);

    return formattedListing;
  }

  /**
   * Get all active listings
   */
  async getActiveListings() {
    const listings = await this.program.account.phoneListing.all([
      {
        memcmp: {
          offset: 8 + 32 + 200, // Offset to status field
          bytes: bs58.encode(Buffer.from([0])), // Active status
        },
      },
    ]);

    return listings.map(({ account, publicKey }) => ({
      publicKey: publicKey.toString(),
      ...this.formatListing(account),
    }));
  }

  /**
   * Cancel a listing
   */
  async cancelListing(listingId, orderbookOrderId) {
    console.log(`Cancelling listing ${listingId}`);

    // Cancel orderbook order if exists
    if (orderbookOrderId) {
      const phoneModel = this.cache.listings.get(listingId)?.phoneData.model;
      if (phoneModel) {
        const marketPubkey = await this.openbook.getPhoneMarket(
          this.normalizePhoneModel(phoneModel)
        );
        await this.openbook.cancelOrder({
          marketPubkey: marketPubkey.toString(),
          orderId: orderbookOrderId,
        });
      }
    }

    // Update listing status on-chain
    // Implementation depends on your contract

    // Update cache
    if (this.cache.listings.has(listingId)) {
      this.cache.listings.get(listingId).status = 'cancelled';
    }

    return { listingId, status: 'cancelled' };
  }

  // ===== PURCHASE FLOW =====

  /**
   * Initiate a purchase
   */
  async initiatePurchase({
    listingId,
    buyerAddress = this.wallet.publicKey,
  }) {
    console.log(`Initiating purchase for listing ${listingId}`);

    const listing = await this.getListing(listingId);

    // Ensure buyer has USDC token account
    const buyerTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      buyerAddress
    );

    const escrowTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      this.deriveEscrowPDA(listingId),
      true // Allow PDA owner
    );

    // Initiate purchase on-chain
    const tx = await this.program.methods
      .initiatePurchase(Buffer.from(listingId))
      .accounts({
        buyer: buyerAddress,
        listing: this.deriveListingPDA(listingId),
        escrowOrder: this.deriveEscrowOrderPDA(listingId, buyerAddress),
        buyerTokenAccount,
        escrowTokenAccount,
        usdcMint: USDC_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: new PublicKey('SysvarRent111111111111111111111111111111111'),
      })
      .rpc();

    console.log('Purchase initiated:', tx);

    // Create order object
    const order = {
      orderId: this.generateOrderId(listingId, buyerAddress),
      listingId,
      buyer: buyerAddress.toString(),
      seller: listing.phoneData.seller,
      amount: listing.priceUsdc,
      status: 'awaiting_shipment',
      createdAt: new Date().toISOString(),
      shippingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Cache the order
    this.cache.orders.set(order.orderId, order);

    return order;
  }

  /**
   * Confirm shipment
   */
  async confirmShipment({
    orderId,
    trackingNumber,
    carrier,
  }) {
    console.log(`Confirming shipment for order ${orderId}`);

    const order = await this.getOrder(orderId);

    const tx = await this.program.methods
      .confirmShipment(
        Buffer.from(orderId),
        trackingNumber,
        carrier
      )
      .accounts({
        seller: this.wallet.publicKey,
        escrowOrder: this.deriveEscrowOrderPDA(order.listingId, new PublicKey(order.buyer)),
        listing: this.deriveListingPDA(order.listingId),
      })
      .rpc();

    console.log('Shipment confirmed:', tx);

    // Update order in cache
    if (this.cache.orders.has(orderId)) {
      const cachedOrder = this.cache.orders.get(orderId);
      cachedOrder.status = 'shipped';
      cachedOrder.trackingInfo = {
        trackingNumber,
        carrier,
        shippedAt: new Date().toISOString(),
      };
    }

    return {
      orderId,
      status: 'shipped',
      trackingNumber,
      carrier,
      transaction: tx,
    };
  }

  /**
   * Confirm delivery and release funds
   */
  async confirmDelivery({
    orderId,
  }) {
    console.log(`Confirming delivery for order ${orderId}`);

    const order = await this.getOrder(orderId);

    const sellerTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      new PublicKey(order.seller)
    );

    const platformFeeAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      new PublicKey('9H6VYFrirtuKm5X1hxjt9s6AQC3PZe6Y4zqtNzUZdpPk') // Platform fee wallet
    );

    const tx = await this.program.methods
      .confirmDelivery(Buffer.from(orderId))
      .accounts({
        buyer: this.wallet.publicKey,
        escrowOrder: this.deriveEscrowOrderPDA(order.listingId, this.wallet.publicKey),
        listing: this.deriveListingPDA(order.listingId),
        escrowTokenAccount: await getAssociatedTokenAddress(
          USDC_MINT,
          this.deriveEscrowPDA(order.listingId),
          true
        ),
        sellerTokenAccount,
        platformFeeAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log('Delivery confirmed, funds released:', tx);

    // Transfer NFT to buyer if it exists
    if (order.nftAssetId) {
      await this.nftManager.transferPhoneNFT({
        assetId: order.nftAssetId,
        currentOwner: order.seller,
        newOwner: order.buyer,
      });
    }

    // Update order in cache
    if (this.cache.orders.has(orderId)) {
      this.cache.orders.get(orderId).status = 'completed';
    }

    return {
      orderId,
      status: 'completed',
      transaction: tx,
    };
  }

  // ===== DISPUTE MANAGEMENT =====

  /**
   * Open a dispute
   */
  async openDispute({
    orderId,
    reason,
  }) {
    console.log(`Opening dispute for order ${orderId}`);

    const order = await this.getOrder(orderId);

    const tx = await this.program.methods
      .openDispute(Buffer.from(orderId), reason)
      .accounts({
        initiator: this.wallet.publicKey,
        escrowOrder: this.deriveEscrowOrderPDA(
          order.listingId,
          new PublicKey(order.buyer)
        ),
        dispute: this.deriveDisputePDA(orderId),
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Dispute opened:', tx);

    return {
      disputeId: this.generateDisputeId(orderId),
      orderId,
      reason,
      status: 'open',
      transaction: tx,
    };
  }

  // ===== ORDERBOOK OPERATIONS =====

  /**
   * Get orderbook for a phone model
   */
  async getOrderbook(phoneModel) {
    const normalizedModel = this.normalizePhoneModel(phoneModel);
    return await this.openbook.getOrderbook(normalizedModel);
  }

  /**
   * Get market statistics
   */
  async getMarketStats(phoneModel) {
    const normalizedModel = this.normalizePhoneModel(phoneModel);
    return await this.openbook.getMarketStats(normalizedModel);
  }

  /**
   * Place a market buy order
   */
  async marketBuy({
    phoneModel,
    maxPriceUsdc,
  }) {
    const orderbook = await this.getOrderbook(phoneModel);

    if (orderbook.asks.length === 0) {
      throw new Error('No sellers available');
    }

    const bestAsk = orderbook.asks[0];

    if (parseFloat(bestAsk.price) > maxPriceUsdc * 1e6) {
      throw new Error(`Best price ${bestAsk.price} exceeds max ${maxPriceUsdc}`);
    }

    // Initiate purchase from the best ask
    return await this.initiatePurchase({
      listingId: bestAsk.listingId, // Assuming listing ID is stored
    });
  }

  // ===== NFT OPERATIONS =====

  /**
   * Get all phones owned by a wallet
   */
  async getOwnedPhones(owner = this.wallet.publicKey) {
    return await this.nftManager.getPhonesByOwner(owner);
  }

  /**
   * Get phone NFT details
   */
  async getPhoneNFT(assetId) {
    return await this.nftManager.getPhoneNFT(assetId);
  }

  // ===== HELPER FUNCTIONS =====

  deriveListingPDA(listingId) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), Buffer.from(listingId)],
      this.program.programId
    );
    return pda;
  }

  deriveEscrowPDA(listingId) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), Buffer.from(listingId)],
      this.program.programId
    );
    return pda;
  }

  deriveEscrowOrderPDA(listingId, buyer) {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('escrow'),
        Buffer.from(listingId),
        buyer.toBuffer(),
      ],
      this.program.programId
    );
    return pda;
  }

  deriveDisputePDA(orderId) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('dispute'), Buffer.from(orderId)],
      this.program.programId
    );
    return pda;
  }

  generateListingId() {
    return `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateOrderId(listingId, buyer) {
    return `order_${listingId}_${buyer.toString().substr(0, 8)}`;
  }

  generateDisputeId(orderId) {
    return `dispute_${orderId}_${Date.now()}`;
  }

  normalizePhoneModel(model) {
    // Convert model name to standardized format for orderbook
    return model.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }

  formatListing(listing) {
    return {
      listingId: listing.listingId.toString(),
      seller: listing.seller.toString(),
      phoneData: {
        model: listing.phoneMetadata.model,
        brand: listing.phoneMetadata.brand,
        storage: listing.phoneMetadata.storage,
        condition: listing.phoneMetadata.condition,
        imei: listing.phoneMetadata.imei,
        batteryHealth: listing.phoneMetadata.batteryHealth,
        issues: JSON.parse(listing.phoneMetadata.issues || '[]'),
      },
      priceUsdc: listing.priceUsdc.toNumber() / 1e6,
      status: this.getListingStatus(listing.status),
      createdAt: new Date(listing.createdAt.toNumber() * 1000).toISOString(),
    };
  }

  getListingStatus(statusEnum) {
    const statuses = ['active', 'pending_escrow', 'shipped', 'sold', 'cancelled'];
    return statuses[statusEnum] || 'unknown';
  }

  async getOrder(orderId) {
    if (this.cache.orders.has(orderId)) {
      return this.cache.orders.get(orderId);
    }

    // Fetch from chain if not in cache
    // Implementation depends on your contract structure

    throw new Error(`Order ${orderId} not found`);
  }
}

// ===== EXAMPLE USAGE =====
//
// import { Connection, Keypair } from '@solana/web3.js';
// import { ReFitMarketplaceSDK } from './refit-marketplace-sdk.js';
//
// // Initialize SDK
// const connection = new Connection('https://api.devnet.solana.com');
// // Load your wallet keypair from a secure location
// const secretKey = new Uint8Array([...]); // your secret key array
// const wallet = Keypair.fromSecretKey(secretKey);
//
// const sdk = new ReFitMarketplaceSDK({
//   connection,
//   wallet,
//   environment: 'devnet',
//   options: {
//     autoMintNFT: true,
//     autoListOnOrderbook: true,
//   },
// });
//
// // Initialize marketplace (one-time)
// await sdk.initialize();
//
// // Create a listing
// const listing = await sdk.createListing({
//   phoneData: {
//     model: 'iPhone 15 Pro Max',
//     brand: 'Apple',
//     storage: '256GB',
//     condition: 'Excellent',
//     imei: '354891234567890',
//     batteryHealth: 94,
//     carrierStatus: 'Unlocked',
//     issues: [],
//     images: ['https://...'],
//   },
//   priceUsdc: 850,
// });
//
// console.log('Listing created:', listing);
//
// // Get orderbook
// const orderbook = await sdk.getOrderbook('iPhone-15-Pro-Max');
// console.log('Orderbook:', orderbook);
//
// // Buyer initiates purchase
// const order = await sdk.initiatePurchase({
//   listingId: listing.listingId,
// });
//
// console.log('Order created:', order);
//
// // Seller confirms shipment
// await sdk.confirmShipment({
//   orderId: order.orderId,
//   trackingNumber: '1Z999AA10123456784',
//   carrier: 'UPS',
// });
//
// // Buyer confirms delivery
// await sdk.confirmDelivery({
//   orderId: order.orderId,
// });
//
// console.log('Transaction complete!');

export default ReFitMarketplaceSDK;