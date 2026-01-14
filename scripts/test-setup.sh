#!/bin/bash

# ReFit Marketplace Test Setup Script
# This script sets up everything needed to test the marketplace

echo "🚀 ReFit Marketplace Test Setup"
echo "================================"

# Check if Solana is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Installing..."
    sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor not found. Installing..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install latest
    avm use latest
fi

echo "✅ CLI tools ready"

# Set Solana to devnet
echo "📡 Configuring Solana for devnet..."
solana config set --url https://api.devnet.solana.com

# Create test wallets
echo "🔑 Creating test wallets..."

# Admin wallet
if [ ! -f "test-wallets/admin.json" ]; then
    mkdir -p test-wallets
    solana-keygen new -o test-wallets/admin.json --no-bip39-passphrase
fi

# Seller wallet
if [ ! -f "test-wallets/seller.json" ]; then
    solana-keygen new -o test-wallets/seller.json --no-bip39-passphrase
fi

# Buyer wallet
if [ ! -f "test-wallets/buyer.json" ]; then
    solana-keygen new -o test-wallets/buyer.json --no-bip39-passphrase
fi

echo "✅ Test wallets created"

# Get wallet addresses
ADMIN_PUBKEY=$(solana address -k test-wallets/admin.json)
SELLER_PUBKEY=$(solana address -k test-wallets/seller.json)
BUYER_PUBKEY=$(solana address -k test-wallets/buyer.json)

echo "Admin:  $ADMIN_PUBKEY"
echo "Seller: $SELLER_PUBKEY"
echo "Buyer:  $BUYER_PUBKEY"

# Airdrop SOL to test wallets
echo "💰 Airdropping SOL to test wallets..."
solana airdrop 2 $ADMIN_PUBKEY --url devnet
sleep 2
solana airdrop 2 $SELLER_PUBKEY --url devnet
sleep 2
solana airdrop 2 $BUYER_PUBKEY --url devnet

echo "✅ Wallets funded"

# Install Node dependencies
echo "📦 Installing Node dependencies..."
npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token
npm install @metaplex-foundation/mpl-bubblegum
npm install @metaplex-foundation/mpl-token-metadata
npm install @solana/spl-account-compression

echo "✅ Dependencies installed"

# Build smart contracts (if they exist)
if [ -d "contracts" ]; then
    echo "🔨 Building smart contracts..."
    cd contracts

    # Update Anchor.toml for devnet
    cat > Anchor.toml << EOF
[features]
seeds = false
skip-lint = false

[programs.devnet]
refit_marketplace = "MKT1111111111111111111111111111111111111111"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "devnet"
wallet = "../test-wallets/admin.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
EOF

    # Build contracts
    anchor build
    cd ..
    echo "✅ Contracts built"
else
    echo "⚠️  No contracts directory found, skipping build"
fi

# Create test configuration file
echo "📝 Creating test configuration..."
cat > test-config.json << EOF
{
  "network": "devnet",
  "rpcUrl": "https://api.devnet.solana.com",
  "wallets": {
    "admin": "$ADMIN_PUBKEY",
    "seller": "$SELLER_PUBKEY",
    "buyer": "$BUYER_PUBKEY"
  },
  "programIds": {
    "marketplace": "MKT1111111111111111111111111111111111111111",
    "openbook": "opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb"
  },
  "testPhone": {
    "model": "iPhone 15 Pro Max",
    "brand": "Apple",
    "storage": "256GB",
    "condition": "Excellent",
    "imei": "354891234567890",
    "batteryHealth": 94,
    "carrierStatus": "Unlocked",
    "issues": [],
    "price": 850
  }
}
EOF

echo "✅ Test configuration created"

echo ""
echo "========================================="
echo "✨ Test setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Run: npm run test:marketplace"
echo "2. Or run: node scripts/test-marketplace-local.js"
echo "3. Check test wallets have SOL: solana balance -k test-wallets/admin.json"
echo ""
echo "Test wallet addresses saved to test-config.json"