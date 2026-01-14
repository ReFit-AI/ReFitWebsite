/**
 * OpenBook V2 Integration for ReFit Marketplace
 * Handles orderbook operations for phone listings
 */

import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import BN from 'bn.js';
// Mock OpenBookV2Client for demo purposes
// import { OpenBookV2Client } from '@openbook-dex/openbook-v2-client';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

// Mock OpenBookV2Client class for testing
class OpenBookV2Client {
  constructor(connection, programId) {
    this.connection = connection;
    this.programId = programId;
  }

  async createMarket(params) {
    // Mock implementation
    return new Transaction();
  }

  async deserializeMarketAccount(marketPubkey) {
    // Mock implementation
    return { marketPubkey };
  }

  async placeOrder(params) {
    // Mock implementation
    return new Transaction();
  }

  async cancelOrder(params) {
    // Mock implementation
    return new Transaction();
  }

  async loadBids(marketPubkey) {
    // Mock implementation
    return [];
  }

  async loadAsks(marketPubkey) {
    // Mock implementation
    return [];
  }

  async findOpenOrdersAccounts(marketPubkey, owner) {
    // Mock implementation
    return [];
  }

  async createOpenOrdersAccount(params) {
    // Mock implementation
    return new Transaction();
  }

  async loadOrdersForOwner(marketPubkey, owner) {
    // Mock implementation
    return [];
  }
}

// OpenBook V2 Program ID (Mainnet)
const OPENBOOK_PROGRAM_ID = new PublicKey('opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb');

// USDC Mint (Mainnet)
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// Market configuration for different phone models
const PHONE_MARKETS = {
  'iPhone-15-Pro-Max': {
    baseMint: null, // Will be phone NFT mint
    quoteMint: USDC_MINT,
    baseLotSize: new BN(1), // 1 phone
    quoteLotSize: new BN(1000000), // 1 USDC (6 decimals)
    makerFee: new BN(0), // 0% maker fee
    takerFee: new BN(100), // 1% taker fee (basis points)
  },
  'iPhone-14-Pro': {
    baseMint: null,
    quoteMint: USDC_MINT,
    baseLotSize: new BN(1),
    quoteLotSize: new BN(1000000),
    makerFee: new BN(0),
    takerFee: new BN(100),
  },
  'Samsung-Galaxy-S24-Ultra': {
    baseMint: null,
    quoteMint: USDC_MINT,
    baseLotSize: new BN(1),
    quoteLotSize: new BN(1000000),
    makerFee: new BN(0),
    takerFee: new BN(100),
  },
};

export class OpenBookIntegration {
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;
    this.client = new OpenBookV2Client(connection, OPENBOOK_PROGRAM_ID);
    this.markets = new Map(); // Cache market instances
  }

  /**
   * Initialize a market for a specific phone model
   * This should be done once per phone model
   */
  async initializePhoneMarket(phoneModel, phoneNftMint) {
    const config = PHONE_MARKETS[phoneModel];
    if (!config) {
      throw new Error(`No market configuration for ${phoneModel}`);
    }

    // Set the base mint to the phone NFT collection mint
    config.baseMint = new PublicKey(phoneNftMint);

    try {
      // Create market account
      const marketKeypair = Keypair.generate();

      // Calculate required space and rent
      const marketSpace = 376832; // OpenBook V2 market account size
      const lamports = await this.connection.getMinimumBalanceForRentExemption(marketSpace);

      // Create the market
      const tx = await this.client.createMarket({
        payer: this.wallet.publicKey,
        market: marketKeypair.publicKey,
        quoteMint: config.quoteMint,
        baseMint: config.baseMint,
        quoteLotSize: config.quoteLotSize,
        baseLotSize: config.baseLotSize,
        makerFee: config.makerFee,
        takerFee: config.takerFee,
        timeExpiry: new BN(0), // No time expiry
        oracleA: null, // No oracle for physical goods
        oracleB: null,
        openOrdersAdmin: null, // No admin restrictions
        consumeEventsAdmin: null,
        closeMarketAdmin: this.wallet.publicKey, // Admin can close market
      });

      await this.sendAndConfirmTransaction(tx);

      console.log(`Market created for ${phoneModel}: ${marketKeypair.publicKey.toString()}`);

      // Cache the market
      this.markets.set(phoneModel, marketKeypair.publicKey);

      return marketKeypair.publicKey;
    } catch (error) {
      console.error(`Failed to initialize market for ${phoneModel}:`, error);
      throw error;
    }
  }

  /**
   * Get or create a market for a phone model
   */
  async getPhoneMarket(phoneModel) {
    // Check cache first
    if (this.markets.has(phoneModel)) {
      return this.markets.get(phoneModel);
    }

    // Try to find existing market
    const markets = await this.findMarketsForPhoneModel(phoneModel);
    if (markets.length > 0) {
      this.markets.set(phoneModel, markets[0].publicKey);
      return markets[0].publicKey;
    }

    // No existing market found
    throw new Error(`No market found for ${phoneModel}. Please initialize first.`);
  }

  /**
   * Find existing markets for a phone model
   */
  async findMarketsForPhoneModel(phoneModel) {
    // In production, you'd store market addresses in a database
    // For now, we'll use a predefined mapping
    const KNOWN_MARKETS = {
      'iPhone-15-Pro-Max': 'MARKET_PUBKEY_HERE',
      'iPhone-14-Pro': 'MARKET_PUBKEY_HERE',
      // Add more as markets are created
    };

    if (KNOWN_MARKETS[phoneModel]) {
      return [{
        publicKey: new PublicKey(KNOWN_MARKETS[phoneModel]),
        phoneModel,
      }];
    }

    return [];
  }

  /**
   * Place a sell order (ask) for a phone
   */
  async placePhoneListing({
    phoneModel,
    phoneNft, // The specific phone NFT
    priceUsdc,
    seller = this.wallet.publicKey,
  }) {
    const marketPubkey = await this.getPhoneMarket(phoneModel);
    const market = await this.client.deserializeMarketAccount(marketPubkey);

    // Create or get open orders account
    const openOrdersAccount = await this.getOrCreateOpenOrders(marketPubkey, seller);

    // Place limit order (ask)
    const tx = await this.client.placeOrder({
      market: marketPubkey,
      marketAuthority: await this.deriveMarketAuthority(marketPubkey),
      openOrdersAccount,
      payer: seller,
      owner: seller,
      side: 'sell',
      price: new BN(priceUsdc),
      size: new BN(1), // 1 phone
      orderType: 'limit',
      clientOrderId: new BN(Date.now()), // Unique order ID
      openOrdersAdmin: null,
      expiryTimestamp: null, // No expiry
      limit: 10, // Max orders to process
    });

    const signature = await this.sendAndConfirmTransaction(tx);

    console.log(`Phone listing placed on orderbook: ${signature}`);

    return {
      signature,
      marketPubkey: marketPubkey.toString(),
      orderId: new BN(Date.now()).toString(),
    };
  }

  /**
   * Place a buy order (bid) for a phone
   */
  async placeBuyOrder({
    phoneModel,
    priceUsdc,
    buyer = this.wallet.publicKey,
  }) {
    const marketPubkey = await this.getPhoneMarket(phoneModel);

    // Create or get open orders account
    const openOrdersAccount = await this.getOrCreateOpenOrders(marketPubkey, buyer);

    // Place limit order (bid)
    const tx = await this.client.placeOrder({
      market: marketPubkey,
      marketAuthority: await this.deriveMarketAuthority(marketPubkey),
      openOrdersAccount,
      payer: buyer,
      owner: buyer,
      side: 'buy',
      price: new BN(priceUsdc),
      size: new BN(1), // 1 phone
      orderType: 'limit',
      clientOrderId: new BN(Date.now()),
      openOrdersAdmin: null,
      expiryTimestamp: null,
      limit: 10,
    });

    const signature = await this.sendAndConfirmTransaction(tx);

    console.log(`Buy order placed on orderbook: ${signature}`);

    return {
      signature,
      marketPubkey: marketPubkey.toString(),
      orderId: new BN(Date.now()).toString(),
    };
  }

  /**
   * Cancel an order
   */
  async cancelOrder({
    marketPubkey,
    orderId,
    owner = this.wallet.publicKey,
  }) {
    const openOrdersAccount = await this.getOpenOrdersAccount(marketPubkey, owner);

    const tx = await this.client.cancelOrder({
      market: new PublicKey(marketPubkey),
      marketAuthority: await this.deriveMarketAuthority(new PublicKey(marketPubkey)),
      openOrdersAccount,
      owner,
      orderId: new BN(orderId),
    });

    const signature = await this.sendAndConfirmTransaction(tx);

    console.log(`Order cancelled: ${signature}`);

    return signature;
  }

  /**
   * Get orderbook for a phone model
   */
  async getOrderbook(phoneModel) {
    try {
      const marketPubkey = await this.getPhoneMarket(phoneModel);
      const market = await this.client.deserializeMarketAccount(marketPubkey);

      // Load orderbook
      const [bids, asks] = await Promise.all([
        this.client.loadBids(marketPubkey),
        this.client.loadAsks(marketPubkey),
      ]);

      // Format orderbook data
      const formatOrders = (orders, side) => {
        return orders.map(order => ({
          price: order.price.toString(),
          size: order.size.toString(),
          side,
          owner: order.owner.toString(),
          orderId: order.orderId.toString(),
        }));
      };

      return {
        phoneModel,
        market: marketPubkey.toString(),
        bids: formatOrders(bids, 'buy'),
        asks: formatOrders(asks, 'sell'),
        spread: asks.length > 0 && bids.length > 0
          ? asks[0].price - bids[0].price
          : null,
      };
    } catch (error) {
      console.error(`Failed to get orderbook for ${phoneModel}:`, error);
      return {
        phoneModel,
        market: null,
        bids: [],
        asks: [],
        spread: null,
        error: error.message,
      };
    }
  }

  /**
   * Get user's open orders
   */
  async getUserOrders(owner = this.wallet.publicKey) {
    const allOrders = [];

    for (const [phoneModel, marketPubkey] of this.markets.entries()) {
      try {
        const openOrdersAccount = await this.getOpenOrdersAccount(marketPubkey, owner);
        if (!openOrdersAccount) continue;

        const orders = await this.client.loadOrdersForOwner(marketPubkey, owner);

        allOrders.push(...orders.map(order => ({
          phoneModel,
          market: marketPubkey.toString(),
          orderId: order.orderId.toString(),
          side: order.side,
          price: order.price.toString(),
          size: order.size.toString(),
          filled: order.filled.toString(),
          timestamp: order.timestamp?.toString(),
        })));
      } catch (error) {
        console.error(`Failed to load orders for ${phoneModel}:`, error);
      }
    }

    return allOrders;
  }

  /**
   * Get market statistics
   */
  async getMarketStats(phoneModel) {
    const marketPubkey = await this.getPhoneMarket(phoneModel);
    const market = await this.client.deserializeMarketAccount(marketPubkey);

    const [bids, asks] = await Promise.all([
      this.client.loadBids(marketPubkey),
      this.client.loadAsks(marketPubkey),
    ]);

    // Calculate statistics
    const bestBid = bids.length > 0 ? bids[0].price : null;
    const bestAsk = asks.length > 0 ? asks[0].price : null;
    const spread = bestAsk && bestBid ? bestAsk.sub(bestBid) : null;
    const midPrice = bestAsk && bestBid
      ? bestAsk.add(bestBid).div(new BN(2))
      : null;

    // Calculate depth
    const bidDepth = bids.reduce((sum, bid) => sum.add(bid.size), new BN(0));
    const askDepth = asks.reduce((sum, ask) => sum.add(ask.size), new BN(0));

    return {
      phoneModel,
      market: marketPubkey.toString(),
      bestBid: bestBid?.toString(),
      bestAsk: bestAsk?.toString(),
      spread: spread?.toString(),
      midPrice: midPrice?.toString(),
      bidDepth: bidDepth.toString(),
      askDepth: askDepth.toString(),
      totalOrders: bids.length + asks.length,
    };
  }

  // ===== Helper Functions =====

  async getOrCreateOpenOrders(marketPubkey, owner) {
    // First check if open orders account exists
    let openOrdersAccount = await this.getOpenOrdersAccount(marketPubkey, owner);

    if (!openOrdersAccount) {
      // Create new open orders account
      const tx = await this.client.createOpenOrdersAccount({
        market: marketPubkey,
        owner,
        payer: owner,
        openOrdersAccount: Keypair.generate().publicKey,
      });

      await this.sendAndConfirmTransaction(tx);
      openOrdersAccount = await this.getOpenOrdersAccount(marketPubkey, owner);
    }

    return openOrdersAccount;
  }

  async getOpenOrdersAccount(marketPubkey, owner) {
    try {
      const accounts = await this.client.findOpenOrdersAccounts(marketPubkey, owner);
      return accounts.length > 0 ? accounts[0] : null;
    } catch {
      return null;
    }
  }

  async deriveMarketAuthority(marketPubkey) {
    const [authority] = await PublicKey.findProgramAddress(
      [marketPubkey.toBuffer()],
      OPENBOOK_PROGRAM_ID
    );
    return authority;
  }

  async sendAndConfirmTransaction(transaction) {
    const signature = await this.connection.sendTransaction(
      transaction,
      [this.wallet],
      { skipPreflight: false }
    );

    await this.connection.confirmTransaction(signature, 'confirmed');
    return signature;
  }
}

// ===== Example Usage =====
//
// // Initialize connection and wallet
// const connection = new Connection('https://api.mainnet-beta.solana.com');
// const wallet = Keypair.fromSecretKey(secretKeyArray); // your secret key
//
// // Create integration instance
// const openbook = new OpenBookIntegration(connection, wallet);
//
// // Initialize market for iPhone 15 Pro Max (do this once)
// const marketPubkey = await openbook.initializePhoneMarket(
//   'iPhone-15-Pro-Max',
//   'PHONE_NFT_COLLECTION_MINT'
// );
//
// // Place a sell order
// const listing = await openbook.placePhoneListing({
//   phoneModel: 'iPhone-15-Pro-Max',
//   phoneNft: 'SPECIFIC_PHONE_NFT_MINT',
//   priceUsdc: 850000000, // $850 USDC (6 decimals)
// });
//
// // Get orderbook
// const orderbook = await openbook.getOrderbook('iPhone-15-Pro-Max');
// console.log('Current orderbook:', orderbook);
//
// // Get market stats
// const stats = await openbook.getMarketStats('iPhone-15-Pro-Max');
// console.log('Market statistics:', stats);

export default OpenBookIntegration;