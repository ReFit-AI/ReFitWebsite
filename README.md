# ReFit - Solana-Powered Device Buyback Platform

ReFit is a modern device buyback platform that leverages Solana blockchain technology to provide instant payments and transparent pricing for used phones and electronics.

## Features

- **Instant Quotes**: Get real-time pricing for your devices
- **Solana Payments**: Receive payments directly to your Solana wallet
- **Smart Contract Integration**: Transparent and secure transactions
- **Mobile App**: React Native app for easy device assessment
- **Shipping Integration**: Automated shipping label generation

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Blockchain**: Solana Web3.js, Anchor Framework
- **Mobile**: React Native
- **Backend**: Next.js API Routes, Supabase
- **Shipping**: Shippo API integration

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