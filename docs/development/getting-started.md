# Getting Started with ReFit Development

This guide will help you set up your local development environment for the ReFit platform.

## Prerequisites

- Node.js 18+ and npm
- Git
- A Solana wallet (Phantom, Solflare, etc.)
- Code editor (VS Code recommended)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/jbrace02/ReFit.git
cd ReFit
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your development settings. For local development, you can use:

```env
# Supabase (use local or development project)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_DEV_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_DEV_ANON_KEY

# Shippo (use test mode)
SHIPPO_API_KEY=shippo_test_YOUR_TEST_KEY

# Solana (use devnet)
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com

# Development settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Development Workflow

### Project Structure

```
refit/
├── app/                    # Next.js App Router pages
│   ├── (routes)/          # Public routes
│   ├── api/               # API endpoints
│   └── auth/              # Auth callbacks
├── components/            # React components
├── contexts/             # React contexts
├── services/             # Business logic
├── lib/                  # Utilities
├── public/               # Static assets
└── contracts/            # Solana programs
```

### Key Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run tests (when configured)

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style

3. Test your changes locally

4. Commit with descriptive messages:
   ```bash
   git add .
   git commit -m "feat: add device condition selector"
   ```

5. Push and create a pull request

## Local Development Tips

### Using Mock Services

For development without external services, the app includes mock implementations:

1. **Mock Shipping Service**: Simulates Shippo API responses
2. **Mock User Profile**: Uses localStorage instead of Supabase
3. **Devnet Solana**: Uses Solana devnet for transactions

### Testing Wallet Integration

1. Install a Solana wallet browser extension
2. Switch to Devnet in wallet settings
3. Get devnet SOL from [faucet](https://faucet.solana.com)
4. Connect wallet in the app

### API Development

API routes are in `app/api/`. Each route exports HTTP method handlers:

```javascript
// app/api/example/route.js
export async function GET(request) {
  return Response.json({ message: 'Hello' })
}

export async function POST(request) {
  const body = await request.json()
  // Process request
  return Response.json({ success: true })
}
```

### Component Development

Components use React 19 and Tailwind CSS:

```jsx
// components/ExampleComponent.jsx
export default function ExampleComponent({ title }) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
  )
}
```

## Troubleshooting

### Common Issues

1. **Port 3000 in use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   # Or use different port
   npm run dev -- -p 3001
   ```

2. **Module not found errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules .next
   npm install
   ```

3. **Environment variable issues**
   - Ensure variables starting with `NEXT_PUBLIC_` are available client-side
   - Restart dev server after changing `.env.local`

4. **Wallet connection issues**
   - Check wallet is on correct network (devnet for development)
   - Ensure wallet extension is unlocked

## Next Steps

- Review the [Architecture Documentation](../architecture/backend.md)
- Explore the [API Documentation](../../app/api/mobile/v1/README.md)
- Join our Discord for development discussions

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Developer Docs](https://docs.solana.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)