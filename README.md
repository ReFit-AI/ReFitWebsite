# ReFit - Phone Trade-in & Liquidity Pool Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://refit-website.vercel.app)
[![Status](https://img.shields.io/badge/Status-Live-success)](https://refit-website.vercel.app)

ReFit is a Solana-based platform combining phone trade-in services with a staking liquidity pool. Users earn 2% weekly yields while the platform generates revenue through phone arbitrage.

## 🚀 Features

### Public
- **Phone Trade-in**: Instant SOL/USDC payouts for used phones
- **Liquidity Pool**: Earn 2% weekly returns (104% APY)
- **Live Transparency**: Public inventory with real-time margins
- **Weekly Distributions**: Automated yields every Monday

### Admin
- **Inventory Management**: Track phones with IMEI, pricing, margins
- **Invoice System**: Buyer management with Shippo shipping integration
- **Profit Reports**: Excel exports for accounting and taxes
- **Buyer Database**: Secure encrypted customer storage

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, Framer Motion
- **Blockchain**: Solana Web3.js, Squads Protocol (multisig)
- **Database**: Supabase (PostgreSQL with RLS)
- **Shipping**: Shippo API
- **Exports**: jsPDF, xlsx

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Solana CLI (for smart contract development)
- Rust (for smart contract development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jbrace02/ReFit.git
cd ReFit
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
refit/
├── app/                    # Next.js App Router
├── components/             # React components
├── contexts/              # React contexts
├── services/              # Business logic
├── contracts/             # Solana smart contracts
├── mobile/                # React Native mobile app
└── public/                # Static assets
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

This is a private, proprietary project. All rights reserved.