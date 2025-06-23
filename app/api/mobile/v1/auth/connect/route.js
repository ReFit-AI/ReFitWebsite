import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { publicKey, signature, message } = await request.json();

    if (!publicKey || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the signature
    try {
      new PublicKey(publicKey);
      // TODO: Implement signature verification with @solana/web3.js
      // For now, we'll trust the mobile wallet adapter
    } catch {
      return NextResponse.json(
        { error: 'Invalid public key' },
        { status: 400 }
      );
    }

    // Generate a session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store session in Supabase
    // Use the imported supabase client
    const { error } = await supabase
      .from('mobile_sessions')
      .insert({
        session_token: sessionToken,
        wallet_address: publicKey,
        expires_at: expiresAt,
        device_info: request.headers.get('user-agent')
      });

    if (error) {
      console.error('Session creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionToken,
      expiresAt,
      walletAddress: publicKey
    });
  } catch (error) {
    console.error('Auth connect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}