// Health check endpoint for monitoring
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const checks = {
    api: 'ok',
    database: 'unknown',
    redis: 'unknown',
    shippo: 'unknown',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  };

  // Check Supabase connection
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single();
      
      checks.database = error ? 'error' : 'ok';
    } catch (error) {
      checks.database = 'error';
    }
  }

  // Check Redis connection
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
        }
      });
      
      checks.redis = response.ok ? 'ok' : 'error';
    } catch (error) {
      checks.redis = 'error';
    }
  }

  // Check Shippo API
  if (process.env.SHIPPO_API_KEY) {
    try {
      const response = await fetch('https://api.goshippo.com/carrier_accounts', {
        headers: {
          'Authorization': `ShippoToken ${process.env.SHIPPO_API_KEY}`,
          'Shippo-API-Version': '2018-02-08'
        }
      });
      
      checks.shippo = response.ok ? 'ok' : 'error';
    } catch (error) {
      checks.shippo = 'error';
    }
  }

  // Overall health status
  const hasErrors = Object.values(checks).includes('error');
  const status = hasErrors ? 503 : 200;
  checks.status = hasErrors ? 'unhealthy' : 'healthy';

  res.status(status).json(checks);
}
