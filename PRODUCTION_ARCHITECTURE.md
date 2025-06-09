# ReFit Production Architecture Plan

## Executive Summary
Scaling ReFit to millions of users requires a robust backend infrastructure with proper data persistence, queue management, and third-party integrations. This document outlines the production architecture and implementation roadmap.

## Technology Stack

### Database: Supabase
**Why Supabase:**
- PostgreSQL with automatic REST APIs
- Real-time subscriptions for order updates
- Built-in authentication (can integrate with Solana wallets)
- Row Level Security (RLS) for data isolation
- Automatic backups and point-in-time recovery
- Scales to millions of rows easily
- $25/mo for starter, scales with usage

### Shipping Provider: Shippo
**Why Shippo:**
- Best-in-class multi-carrier API
- Supports USPS, FedEx, UPS, DHL (crucial for flexibility)
- Pre-negotiated rates (20-90% off retail)
- Return label generation (essential for buyback)
- Address validation included
- Tracking webhooks for real-time updates
- Insurance and signature options
- $0.05 per label + carrier costs

### Backend: Next.js with Vercel
**Why Next.js/Vercel:**
- API routes for backend logic
- Edge functions for low latency
- Automatic scaling
- Built-in caching
- Easy deployment
- WebSocket support via Pusher/Ably

### Queue System: Upstash Redis + BullMQ
**Why Upstash:**
- Serverless Redis (pay per request)
- Global replication
- Built-in rate limiting
- Perfect for job queues

## Database Schema

```sql
-- Users table (extends Solana wallet)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping addresses
CREATE TABLE shipping_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  street1 TEXT NOT NULL,
  street2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT DEFAULT 'US',
  phone TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_validated BOOLEAN DEFAULT FALSE,
  validation_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL, -- Human readable: ORD-2024-000001
  user_id UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'awaiting_shipment', 'shipped', 'received', 'inspecting', 'completed', 'cancelled')),
  
  -- Device details
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  device_condition TEXT NOT NULL,
  device_details JSONB,
  
  -- Pricing
  quoted_price_usd DECIMAL(10,2) NOT NULL,
  quoted_price_sol DECIMAL(10,4) NOT NULL,
  final_price_usd DECIMAL(10,2),
  final_price_sol DECIMAL(10,4),
  
  -- Shipping
  shipping_address_id UUID REFERENCES shipping_addresses(id),
  shipping_rate_id TEXT,
  shipping_carrier TEXT,
  shipping_service TEXT,
  shipping_cost DECIMAL(10,2),
  tracking_number TEXT,
  label_url TEXT,
  
  -- Blockchain
  escrow_pubkey TEXT,
  payment_tx_signature TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Order status history
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping events (from webhooks)
CREATE TABLE shipping_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  carrier_status TEXT,
  location TEXT,
  description TEXT,
  raw_data JSONB,
  occurred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses" ON shipping_addresses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
```

## API Architecture

### Core Endpoints

```typescript
// Next.js API Routes Structure
/api/
  /auth/
    - /connect-wallet    # Link Solana wallet to Supabase user
    - /verify-email      # Email verification flow
  
  /shipping/
    - /addresses         # CRUD shipping addresses
    - /validate-address  # Validate via Shippo
    - /rates            # Get shipping rates
    - /purchase-label   # Purchase & store label
    
  /orders/
    - /create           # Create order with device info
    - /[id]            # Get order details
    - /[id]/ship       # Mark as shipped
    - /[id]/tracking   # Get tracking info
    
  /webhooks/
    - /shippo          # Tracking updates
    - /stripe          # Payment webhooks (future)
```

### Implementation Example

```typescript
// /api/shipping/purchase-label.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import Shippo from 'shippo';
import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';

const shippo = Shippo(process.env.SHIPPO_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const labelQueue = new Queue('shipping-labels', { connection: redis });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, rateId } = req.body;
  const userId = await getUserFromToken(req);

  try {
    // Verify order belongs to user
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Add to queue for async processing
    await labelQueue.add('purchase-label', {
      orderId,
      rateId,
      userId
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    // Update order status
    await supabase
      .from('orders')
      .update({ 
        status: 'processing_shipment',
        shipping_rate_id: rateId 
      })
      .eq('id', orderId);

    res.status(200).json({ 
      success: true, 
      message: 'Label purchase queued' 
    });
  } catch (error) {
    console.error('Label purchase error:', error);
    res.status(500).json({ error: 'Failed to process label' });
  }
}
```

## Scaling Considerations

### 1. Caching Strategy
- Redis for session management
- CDN for shipping labels (Cloudflare R2)
- API response caching with stale-while-revalidate

### 2. Queue Management
```typescript
// Label generation worker
labelQueue.process(async (job) => {
  const { orderId, rateId } = job.data;
  
  // Purchase from Shippo
  const transaction = await shippo.transaction.create({
    rate: rateId,
    label_file_type: 'PDF',
    async: false
  });
  
  // Upload to CDN
  const labelUrl = await uploadToCDN(transaction.label_url);
  
  // Update database
  await supabase.from('orders').update({
    status: 'awaiting_shipment',
    tracking_number: transaction.tracking_number,
    label_url: labelUrl,
    shipping_carrier: transaction.carrier
  }).eq('id', orderId);
  
  // Send email notification
  await emailQueue.add('shipment-ready', { orderId });
});
```

### 3. Rate Limiting
- API: 100 requests/minute per user
- Label generation: 10 labels/minute per user
- Address validation: 50/day per user

### 4. Monitoring & Observability
- Sentry for error tracking
- Datadog/New Relic for APM
- Pager Duty for incident management
- Custom dashboards for order metrics

### 5. Security
- API keys in environment variables
- Webhook signature validation
- Rate limiting per IP and user
- Input sanitization
- SQL injection prevention via Supabase

## Cost Projections

### At 10,000 orders/month:
- Supabase: $25/month
- Shippo: ~$500/month (labels)
- Vercel: $20/month
- Upstash Redis: ~$10/month
- **Total: ~$555/month**

### At 100,000 orders/month:
- Supabase: $599/month (Pro)
- Shippo: ~$5,000/month
- Vercel: $150/month
- Upstash Redis: ~$100/month
- CDN: ~$50/month
- **Total: ~$5,899/month**

### At 1,000,000 orders/month:
- Supabase: Custom (~$2,500/month)
- Shippo: ~$50,000/month (volume discounts)
- Vercel: Enterprise (~$2,000/month)
- Redis Cluster: ~$500/month
- CDN: ~$500/month
- **Total: ~$55,500/month**

## Implementation Roadmap

### Phase 1: Database & Auth (Week 1)
- [ ] Set up Supabase project
- [ ] Create database schema
- [ ] Implement wallet authentication
- [ ] Set up RLS policies

### Phase 2: Core APIs (Week 2)
- [ ] Shipping address CRUD
- [ ] Order creation flow
- [ ] Shippo integration
- [ ] Basic queue system

### Phase 3: Advanced Features (Week 3)
- [ ] Webhook handlers
- [ ] Email notifications
- [ ] Real-time tracking updates
- [ ] Admin dashboard

### Phase 4: Scale & Optimize (Week 4)
- [ ] Load testing
- [ ] Caching implementation
- [ ] Monitoring setup
- [ ] Security audit

## Migration Strategy

1. **Data Migration**
   - Export LocalStorage data to JSON
   - Create migration script
   - Batch import to Supabase

2. **Feature Flags**
   - Gradual rollout by wallet address
   - A/B testing new features
   - Quick rollback capability

3. **Backward Compatibility**
   - Keep mock services for development
   - Dual-write during transition
   - Deprecation warnings

## Conclusion

This architecture provides a solid foundation for scaling ReFit to millions of users while maintaining performance, reliability, and cost-effectiveness. The modular design allows for incremental improvements and easy debugging.

Next steps:
1. Set up Supabase project
2. Create `.env.local` with API keys
3. Implement core database models
4. Build API routes incrementally
