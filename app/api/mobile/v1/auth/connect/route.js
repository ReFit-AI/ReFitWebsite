import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { supabaseAdmin } from '@/lib/supabase-server';
import { verifySignature, generateSessionToken, createSessionMetadata } from '@/lib/solana-auth';
import { mobileAuthConnectSchema, validateInput } from '@/lib/validation';
import { rateLimitEndpoint } from '@/lib/rate-limit-upstash';

export async function POST(request) {
  // Apply rate limiting
  const rateLimitResult = await rateLimitEndpoint.auth(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.message },
      { status: 429, headers: rateLimitResult.headers }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateInput(body, mobileAuthConnectSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, errors: validation.errors },
        { status: 400 }
      );
    }
    
    const { publicKey, signature, message } = validation.data;

    // Verify the public key format
    try {
      new PublicKey(publicKey);
    } catch {
      return NextResponse.json(
        { error: 'Invalid public key format' },
        { status: 400 }
      );
    }
    
    // Extract nonce from message (if present)
    const nonceMatch = message.match(/Nonce: ([a-f0-9-]+)/i);
    const nonce = nonceMatch ? nonceMatch[1] : null;
    
    // Verify the signature (now async)
    const verificationResult = await verifySignature(publicKey, signature, message, nonce);
    if (!verificationResult.valid) {
      return NextResponse.json(
        { error: verificationResult.error || 'Invalid signature' },
        { status: 401 }
      );
    }

    // Generate a secure session token
    const { token, hashedToken } = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours (shorter for security)
    
    // Create session metadata
    const metadata = createSessionMetadata(request);

    // Store session in Supabase
    // Use the admin client for server-side operations
    const { error } = await supabaseAdmin
      .from('mobile_sessions')
      .insert({
        session_token: hashedToken, // Store hashed token
        wallet_address: publicKey,
        expires_at: expiresAt,
        device_info: metadata.user_agent,
        ip_address: metadata.ip_address,
        device_type: metadata.device_type,
        browser: metadata.browser,
        last_used: new Date().toISOString()
      });

    if (error) {
      console.error('Session creation error:', process.env.NODE_ENV === 'development' ? error : error.message);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionToken: token, // Send raw token to client
      expiresAt,
      walletAddress: publicKey
    });
  } catch (error) {
    console.error('Auth connect error:', process.env.NODE_ENV === 'development' ? error : error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}