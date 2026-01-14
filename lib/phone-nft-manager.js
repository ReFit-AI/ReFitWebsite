/**
 * Phone NFT Manager using Metaplex Compressed NFTs (Bubblegum)
 * Each phone is represented as a compressed NFT for cost-effective digital product passports
 */

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import BN from 'bn.js';
// Mock Metaplex imports for demo
// In production, these would be real imports:
// import { ... } from '@metaplex-foundation/mpl-bubblegum';
// import { ... } from '@solana/spl-account-compression';

// Mock program IDs for demo
const SPL_ACCOUNT_COMPRESSION_PROGRAM_ID = new PublicKey('cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK');
const SPL_NOOP_PROGRAM_ID = new PublicKey('noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV');
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Mock Bubblegum functions for demo
const createTree = () => ({ instruction: null });
const mintV1 = () => ({ instruction: null });
const transfer = () => ({ instruction: null });
const burn = () => ({ instruction: null });
const getAssetWithProof = async () => ({ root: '', dataHash: '', creatorHash: '', leafId: 0, proof: [] });
const createAllocTreeIx = async () => ({ instruction: null });

// Mock enums
const TokenProgramVersion = { Original: 0 };
const TokenStandard = { NonFungible: 0 };

// Configuration
const MERKLE_TREE_HEIGHT = 14; // 2^14 = 16,384 phones max per tree
const MERKLE_TREE_BUFFER_SIZE = 64; // Buffer for concurrent updates
const CANOPY_DEPTH = 10; // Optimization for proof verification

// Cost: ~0.02 SOL to create tree, <$0.001 per phone NFT

export class PhoneNFTManager {
  constructor(connection, wallet, environment = 'devnet') {
    this.connection = connection;
    this.wallet = wallet;
    this.environment = environment;
    this.treeAuthority = null;
    this.merkleTree = null;
    this.collectionMint = null;
  }

  /**
   * Initialize a new Merkle tree for phone NFTs
   * This needs to be done once to set up the collection
   */
  async initializePhoneCollection({
    collectionName = 'ReFit Phone Collection',
    collectionSymbol = 'RPHONE',
    collectionUri = 'https://arweave.net/refit-collection-metadata',
  }) {
    console.log('Initializing phone NFT collection...');

    // Generate keypair for the merkle tree
    const merkleTreeKeypair = Keypair.generate();
    this.merkleTree = merkleTreeKeypair.publicKey;

    // Derive tree authority PDA
    [this.treeAuthority] = PublicKey.findProgramAddressSync(
      [this.merkleTree.toBuffer()],
      new PublicKey('BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY') // Bubblegum program
    );

    // Calculate space and cost for the tree
    const maxDepthSizePair = {
      maxDepth: MERKLE_TREE_HEIGHT,
      maxBufferSize: MERKLE_TREE_BUFFER_SIZE,
    };

    const canopyDepth = CANOPY_DEPTH;

    // Get the space required for the tree (mock calculation for demo)
    // In production, this would use the actual getSpace method
    const space = 1000000; // Mock space value

    // Get minimum balance for rent exemption
    const lamports = await this.connection.getMinimumBalanceForRentExemption(space);

    console.log(`Tree setup cost: ${lamports / 1e9} SOL`);

    // Create the merkle tree account
    const allocTreeIx = await createAllocTreeIx(
      this.connection,
      this.merkleTree,
      this.wallet.publicKey,
      maxDepthSizePair,
      canopyDepth
    );

    // Create the tree config
    const createTreeIx = createTree(
      {
        merkleTree: this.merkleTree,
        treeAuthority: this.treeAuthority,
        treeCreator: this.wallet.publicKey,
        payer: this.wallet.publicKey,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      },
      {
        maxDepth: MERKLE_TREE_HEIGHT,
        maxBufferSize: MERKLE_TREE_BUFFER_SIZE,
        public: false, // Only authorized minters
      }
    );

    // Build and send transaction
    const tx = new Transaction().add(allocTreeIx).add(createTreeIx);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      tx,
      [this.wallet, merkleTreeKeypair],
      {
        commitment: 'confirmed',
        skipPreflight: true,
      }
    );

    console.log(`Phone collection initialized!`);
    console.log(`Tree Address: ${this.merkleTree.toString()}`);
    console.log(`Transaction: ${signature}`);

    // Store collection info
    this.collectionInfo = {
      name: collectionName,
      symbol: collectionSymbol,
      uri: collectionUri,
      treeAddress: this.merkleTree.toString(),
      treeAuthority: this.treeAuthority.toString(),
    };

    return this.collectionInfo;
  }

  /**
   * Mint a compressed NFT for a phone
   */
  async mintPhoneNFT({
    phoneData,
    owner = this.wallet.publicKey,
  }) {
    if (!this.merkleTree) {
      throw new Error('Collection not initialized. Call initializePhoneCollection first.');
    }

    // Create metadata for the phone
    const metadata = this.createPhoneMetadata(phoneData);

    // Mint the compressed NFT
    const mintIx = mintV1(
      {
        merkleTree: this.merkleTree,
        treeAuthority: this.treeAuthority,
        treeDelegate: this.wallet.publicKey,
        payer: this.wallet.publicKey,
        leafDelegate: owner, // Phone owner
        leafOwner: owner,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        logWrapper: SPL_NOOP_PROGRAM_ID,
      },
      {
        message: metadata,
      }
    );

    const tx = new Transaction().add(mintIx);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      tx,
      [this.wallet],
      {
        commitment: 'confirmed',
        skipPreflight: true,
      }
    );

    console.log(`Phone NFT minted!`);
    console.log(`Owner: ${owner.toString()}`);
    console.log(`Transaction: ${signature}`);

    // Get the asset ID (leaf index in the tree)
    const assetId = await this.getLatestAssetId();

    return {
      assetId,
      owner: owner.toString(),
      metadata,
      signature,
      tree: this.merkleTree.toString(),
    };
  }

  /**
   * Create metadata for a phone NFT
   */
  createPhoneMetadata(phoneData) {
    const {
      model,
      brand,
      storage,
      condition,
      imei,
      batteryHealth,
      issues = [],
      images = [],
      priceHistory = [],
    } = phoneData;

    // Create attributes array
    const attributes = [
      { trait_type: 'Brand', value: brand },
      { trait_type: 'Model', value: model },
      { trait_type: 'Storage', value: storage },
      { trait_type: 'Condition', value: condition },
      { trait_type: 'IMEI', value: imei },
      { trait_type: 'Battery Health', value: `${batteryHealth}%` },
      { trait_type: 'Issue Count', value: issues.length.toString() },
    ];

    // Add individual issues as traits
    issues.forEach((issue, index) => {
      attributes.push({
        trait_type: `Issue ${index + 1}`,
        value: issue,
      });
    });

    // Create the metadata object
    const metadata = {
      name: `${brand} ${model} - ${imei.slice(-4)}`,
      symbol: 'RPHONE',
      uri: this.uploadMetadataToIPFS({
        name: `${brand} ${model}`,
        description: `Digital Product Passport for ${brand} ${model}. IMEI: ${imei}. Condition: ${condition}. This NFT represents ownership and authenticity of the physical phone.`,
        image: images[0] || 'https://arweave.net/default-phone-image',
        attributes,
        properties: {
          files: images.map((url, i) => ({
            uri: url,
            type: 'image/png',
            name: `Image ${i + 1}`,
          })),
          category: 'Physical Good',
          creators: [
            {
              address: this.wallet.publicKey.toString(),
              share: 100,
            },
          ],
        },
        // Extended metadata for physical goods
        extensions: {
          physical_good: {
            imei,
            serial_number: imei,
            manufacturer: brand,
            model_number: model,
            condition_report: {
              overall: condition,
              battery_health: batteryHealth,
              issues,
              last_updated: new Date().toISOString(),
            },
            price_history: priceHistory,
            authentication: {
              verified: true,
              verifier: 'ReFit Marketplace',
              verification_date: new Date().toISOString(),
            },
          },
        },
      }),
      sellerFeeBasisPoints: 100, // 1% royalty
      primarySaleHappened: false,
      isMutable: true, // Can update condition, price, etc.
      editionNonce: null,
      tokenStandard: TokenStandard.NonFungible,
      collection: {
        verified: false,
        key: this.collectionMint || PublicKey.default,
      },
      uses: null,
      tokenProgramVersion: TokenProgramVersion.Original,
      creators: [
        {
          address: this.wallet.publicKey,
          verified: false,
          share: 100,
        },
      ],
    };

    return metadata;
  }

  /**
   * Transfer a phone NFT to a new owner
   */
  async transferPhoneNFT({
    assetId,
    currentOwner,
    newOwner,
  }) {
    // Get the asset with proof
    const assetWithProof = await getAssetWithProof(
      this.connection,
      new PublicKey(assetId)
    );

    // Create transfer instruction
    const transferIx = transfer(
      {
        merkleTree: this.merkleTree,
        treeAuthority: this.treeAuthority,
        leafOwner: new PublicKey(currentOwner),
        leafDelegate: new PublicKey(currentOwner),
        newLeafOwner: new PublicKey(newOwner),
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      },
      {
        root: assetWithProof.root,
        dataHash: assetWithProof.dataHash,
        creatorHash: assetWithProof.creatorHash,
        nonce: assetWithProof.leafId,
        index: assetWithProof.leafId,
      },
      assetWithProof.proof
    );

    const tx = new Transaction().add(transferIx);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      tx,
      [this.wallet],
      {
        commitment: 'confirmed',
        skipPreflight: true,
      }
    );

    console.log(`Phone NFT transferred!`);
    console.log(`From: ${currentOwner}`);
    console.log(`To: ${newOwner}`);
    console.log(`Transaction: ${signature}`);

    return signature;
  }

  /**
   * Burn a phone NFT (when phone is removed from circulation)
   */
  async burnPhoneNFT({
    assetId,
    owner,
  }) {
    const assetWithProof = await getAssetWithProof(
      this.connection,
      new PublicKey(assetId)
    );

    const burnIx = burn(
      {
        merkleTree: this.merkleTree,
        treeAuthority: this.treeAuthority,
        leafOwner: new PublicKey(owner),
        leafDelegate: new PublicKey(owner),
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      },
      {
        root: assetWithProof.root,
        dataHash: assetWithProof.dataHash,
        creatorHash: assetWithProof.creatorHash,
        nonce: assetWithProof.leafId,
        index: assetWithProof.leafId,
      },
      assetWithProof.proof
    );

    const tx = new Transaction().add(burnIx);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      tx,
      [this.wallet],
      {
        commitment: 'confirmed',
        skipPreflight: true,
      }
    );

    console.log(`Phone NFT burned: ${signature}`);
    return signature;
  }

  /**
   * Get phone NFT details
   */
  async getPhoneNFT(assetId) {
    try {
      const asset = await getAssetWithProof(
        this.connection,
        new PublicKey(assetId)
      );

      return {
        assetId: assetId.toString(),
        owner: asset.owner.toString(),
        metadata: asset.metadata,
        compressed: true,
        tree: this.merkleTree.toString(),
      };
    } catch (error) {
      console.error('Failed to get phone NFT:', error);
      return null;
    }
  }

  /**
   * Get all phone NFTs owned by a wallet
   */
  async getPhonesByOwner(owner) {
    // In production, you'd query an indexer like Helius or Triton
    // For now, this is a placeholder
    console.log(`Fetching phones owned by ${owner}`);

    // This would typically use the Digital Asset Standard (DAS) API
    const response = await fetch(`${this.getRPCEndpoint()}/das/getAssetsByOwner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'refit-phones',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: owner.toString(),
          page: 1,
          limit: 100,
          displayOptions: {
            showFungible: false,
            showNativeBalance: false,
          },
        },
      }),
    });

    const { result } = await response.json();

    // Filter for phone NFTs from our collection
    const phones = result.items.filter(
      item => item.compression.tree === this.merkleTree?.toString()
    );

    return phones;
  }

  /**
   * Update phone NFT metadata (e.g., condition changes)
   */
  async updatePhoneMetadata({
    assetId,
    updates,
  }) {
    // Note: In compressed NFTs, updates require special handling
    // You'd typically burn and re-mint, or use a separate metadata account

    console.log(`Updating metadata for phone ${assetId}`);

    // Implementation would depend on your specific needs
    // Could maintain a separate on-chain account for mutable data
    // Or use an off-chain database with on-chain references

    return {
      assetId,
      updates,
      timestamp: new Date().toISOString(),
    };
  }

  // ===== Helper Functions =====

  async getLatestAssetId() {
    // Get the current leaf count from the tree
    const treeAccount = await this.connection.getAccountInfo(this.merkleTree);

    // Parse the tree data to get leaf count
    // This is simplified - actual implementation would decode the account data
    const leafCount = 0; // Placeholder

    return leafCount;
  }

  uploadMetadataToIPFS(metadata) {
    // In production, upload to Arweave or IPFS
    // For now, return a placeholder URI
    const metadataJson = JSON.stringify(metadata);
    const hash = Buffer.from(metadataJson).toString('base64').slice(0, 10);
    return `https://arweave.net/${hash}`;
  }

  getRPCEndpoint() {
    const endpoints = {
      mainnet: 'https://api.mainnet-beta.solana.com',
      devnet: 'https://api.devnet.solana.com',
      testnet: 'https://api.testnet.solana.com',
    };
    return endpoints[this.environment] || endpoints.devnet;
  }
}

// ===== Example Usage =====

// Example Usage:
//
// // Initialize connection and wallet
// const connection = new Connection('https://api.devnet.solana.com');
// const wallet = Keypair.fromSecretKey(secretKeyArray); // your secret key
//
// // Create NFT manager
// const nftManager = new PhoneNFTManager(connection, wallet, 'devnet');
//
// // Initialize collection (do this once)
// const collection = await nftManager.initializePhoneCollection({
//   collectionName: 'ReFit Verified Phones',
//   collectionSymbol: 'RPHONE',
// });
//
// // Mint a phone NFT
// const phoneNFT = await nftManager.mintPhoneNFT({
//   phoneData: {
//     model: 'iPhone 15 Pro Max',
//     brand: 'Apple',
//     storage: '256GB',
//     condition: 'Excellent',
//     imei: '354891234567890',
//     batteryHealth: 94,
//     issues: [],
//     images: [
//       'https://arweave.net/iphone-front',
//       'https://arweave.net/iphone-back',
//     ],
//     priceHistory: [
//       { date: '2024-01-15', price: 850, currency: 'USDC' },
//     ],
//   },
//   owner: buyerWallet.publicKey,
// });
//
// console.log('Phone NFT created:', phoneNFT);
//
// // Transfer phone NFT when sold
// await nftManager.transferPhoneNFT({
//   assetId: phoneNFT.assetId,
//   currentOwner: sellerWallet.publicKey,
//   newOwner: buyerWallet.publicKey,
// });
//
// // Get all phones owned by a wallet
// const myPhones = await nftManager.getPhonesByOwner(wallet.publicKey);
// console.log('My phones:', myPhones);

export default PhoneNFTManager;