# Solana Buyback Platform

A minimalist phone buyback platform built on Solana blockchain, inspired by Gazelle.com with Apple's design philosophy and Jack Dorsey's simplicity principles.

## 🌟 Features

- **Instant Quotes**: Get immediate pricing for your devices powered by smart contracts
- **Blockchain Integration**: All transactions recorded on Solana for transparency
- **Dark Mode Design**: Beautiful, minimalist interface with dark mode by default
- **Wallet Integration**: Support for Phantom, Solflare, and Backpack wallets
- **Order Tracking**: Track your device shipments and payments

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Solana wallet (Phantom, Solflare, or Backpack)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd solana-buyback
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🏗️ Architecture

### Frontend Stack
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing

### Solana Integration
- **@solana/web3.js** - Solana blockchain interaction
- **@solana/wallet-adapter** - Wallet connection management
- **Devnet** - Currently configured for Solana devnet

### Project Structure
```
solana-buyback/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # Solana integration services
│   ├── contexts/      # React contexts (wallet)
│   ├── utils/         # Utility functions
│   └── hooks/         # Custom React hooks
├── contracts/         # Solana smart contracts (Rust)
└── docs/             # Additional documentation
```

## 🔗 Solana Integration

### Current Implementation
- Wallet connection via Solana wallet adapter
- Basic transaction creation for buyback orders
- Mock orderbook integration (ready for Openbook)

### Smart Contract Integration (Planned)
```javascript
// Example: Creating a buyback order
const order = await program.methods
  .createBuybackOrder(deviceData, priceInLamports)
  .accounts({
    user: wallet.publicKey,
    orderAccount: orderPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Orderbook Integration
The platform is designed to integrate with Solana's Openbook (formerly Serum) for:
- Dynamic pricing based on market conditions
- Automated order matching
- Liquidity provision

## 🎨 Design Philosophy

### Minimalism First
- Clean, distraction-free interface
- Focus on essential functionality
- Smooth animations and transitions

### Dark Mode Default
- Reduces eye strain
- Modern, elegant appearance
- Consistent with Solana branding

### Typography & Spacing
- SF Pro font family (Apple system font)
- Generous whitespace
- Clear visual hierarchy

## 🚦 Development Roadmap

### Phase 1: MVP Launch ✅
- [x] Basic UI/UX implementation
- [x] Wallet integration
- [x] Phone submission form
- [x] Price quote system
- [x] Order tracking

### Phase 2: Smart Contract Integration 🚧
- [ ] Deploy buyback smart contract
- [ ] Implement escrow functionality
- [ ] Add payment processing
- [ ] Device verification workflow

### Phase 3: Orderbook Integration 📋
- [ ] Integrate with Openbook
- [ ] Dynamic pricing algorithm
- [ ] Market maker functionality
- [ ] Liquidity pools

### Phase 4: P2P Marketplace 🔮
- [ ] User-to-user trading
- [ ] Auction functionality
- [ ] Reputation system
- [ ] Global expansion

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Solana RPC endpoint (optional, defaults to devnet)
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com

# Platform wallet address for receiving devices
REACT_APP_PLATFORM_WALLET=YourWalletAddressHere

# API endpoints (when backend is implemented)
REACT_APP_API_URL=http://localhost:3001
```

### Network Configuration
To switch between networks, update the `network` variable in `src/contexts/WalletContext.jsx`:

```javascript
const network = 'devnet'; // Options: 'devnet', 'testnet', 'mainnet-beta'
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint
```

## 📦 Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by Gazelle.com's business model
- Design philosophy from Steve Jobs and Jack Dorsey
- Built on Solana's high-performance blockchain
- Community feedback and contributions

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Join our Discord community
- Email: support@solanabuyback.com

---

Built with ❤️ on Solana
