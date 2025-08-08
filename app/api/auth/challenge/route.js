import { NextResponse } from 'next/server';
import { generateAuthChallenge } from '@/lib/solana-auth';
import { rateLimitEndpoint } from '@/lib/rate-limit-upstash';

export async function GET(request) {
  // Apply rate limiting
  const rateLimitResult = await rateLimitEndpoint.auth(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.message },
      { status: 429, headers: rateLimitResult.headers }
    );
  }
  
  try {
    // Generate authentication challenge with nonce (now async)
    const challenge = await generateAuthChallenge();
    
    return NextResponse.json({
      success: true,
      ...challenge
    });
  } catch (error) {
    console.error('Challenge generation error:', process.env.NODE_ENV === 'development' ? error : error.message);
    
    return NextResponse.json(
      { error: 'Failed to generate challenge' },
      { status: 500 }
    );
  }
}