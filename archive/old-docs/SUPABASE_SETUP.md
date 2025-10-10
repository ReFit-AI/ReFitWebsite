# 🗄️ Supabase Setup Guide

## Quick Start

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Save your project URL and anon key

### 2. Configure Environment Variables
Create `.env.local` file in the root directory:
```bash
cp .env.local.example .env.local
```

Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Database Migration
1. Go to Supabase Dashboard > SQL Editor
2. Copy the contents of `/supabase/migrations/001_initial_schema.sql`
3. Run the SQL to create tables

### 4. Test the Connection
```bash
npm run dev
```
Check the console - you should see "Supabase connected" if everything is working.

## Database Schema

### Tables Created:
- **profiles** - User profiles linked to wallet addresses
- **orders** - Complete order tracking
- **shipping_addresses** - Saved shipping addresses

### Key Features:
- Row Level Security (RLS) enabled
- Users can only see their own data
- Automatic timestamp updates
- Profile stats tracking

## How It Works

### Order Creation Flow:
1. User completes quote form
2. Order saved to Supabase with status "pending_shipment"
3. Linked to user's profile via wallet address
4. Order ID returned for tracking

### Data Access:
```javascript
// The app automatically uses Supabase if configured
// Falls back to localStorage if not configured
import orderService from '@/services/orderService.supabase'

// Create order
const order = await orderService.createOrder({...})

// Get user's orders
const orders = await orderService.getOrdersByWallet(walletAddress)
```

## Security

### Row Level Security (RLS):
- Each user can only access their own data
- Wallet address used as identifier
- No cross-user data access possible

### Best Practices:
1. Never expose service role key (keep it server-side only)
2. Use anon key for client-side operations
3. Validate all inputs server-side
4. Use prepared statements (Supabase handles this)

## Monitoring

### Supabase Dashboard:
- View real-time data in Table Editor
- Monitor API usage in Reports
- Check logs for errors
- Set up email alerts for issues

### Useful Queries:
```sql
-- Get today's orders
SELECT * FROM orders 
WHERE created_at >= CURRENT_DATE
ORDER BY created_at DESC;

-- Get order stats by status
SELECT status, COUNT(*) as count 
FROM orders 
GROUP BY status;

-- Find top users
SELECT wallet_address, COUNT(*) as order_count, SUM(quote_usd) as total_value
FROM orders
GROUP BY wallet_address
ORDER BY total_value DESC
LIMIT 10;
```

## Troubleshooting

### Common Issues:

1. **"Supabase environment variables not set"**
   - Check `.env.local` file exists
   - Restart Next.js server after adding env vars

2. **"Permission denied" errors**
   - Check RLS policies are correct
   - Ensure wallet address is being passed

3. **Orders not showing**
   - Check browser console for errors
   - Verify Supabase connection
   - Check Table Editor in Supabase Dashboard

## Production Checklist

- [ ] Enable email confirmations
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Enable audit logs
- [ ] Set up monitoring alerts
- [ ] Review and tighten RLS policies
- [ ] Enable SSL enforcement
- [ ] Set up database replicas for scaling

## Support

- [Supabase Docs](https://supabase.com/docs)
- [Discord Community](https://discord.supabase.com)
- Check `/supabase/migrations/` for schema updates