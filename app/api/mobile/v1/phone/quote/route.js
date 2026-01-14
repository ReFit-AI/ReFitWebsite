import { NextResponse } from 'next/server';
import { calculateQuote } from '@/lib/pricing-engine';
import { signQuote } from '@/lib/quote-signing';
import { mobileQuoteSchema, sanitizeError } from '@/lib/validation';
import { randomUUID } from 'crypto';
import { rateLimitEndpoint } from '@/lib/rate-limit-upstash';

export async function POST(request) {
  try {
    // Rate limiting for quote endpoint
    const rateLimitResult = await rateLimitEndpoint.quote(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.message || 'Too many requests' },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const body = await request.json();

    // Validate input with Zod
    const validationResult = mobileQuoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
        },
        { status: 400 }
      );
    }

    const { model, condition, carrier, storage, issues } = validationResult.data;

    // Convert model name to modelId format (lowercase, hyphenated)
    const modelId = model.toLowerCase().replace(/\s+/g, '-');

    // Map mobile app conditions to pricing engine conditions
    // The pricing engine expects: excellent, good, fair
    // We also support: poor (maps to fair)
    let engineCondition = condition.toLowerCase();
    if (engineCondition === 'poor' || engineCondition === 'broken') {
      engineCondition = 'fair'; // Map poor/broken to fair (grade D)
    }

    // Call the pricing engine
    const quote = calculateQuote({
      modelId,
      storage: storage || '128GB',
      carrier: carrier?.toLowerCase() || 'unlocked',
      condition: engineCondition,
      issues: issues || []
    });

    if (quote.error) {
      return NextResponse.json(
        { success: false, error: quote.error },
        { status: 400 }
      );
    }

    // Get current SOL price
    let solPrice = 180; // Default fallback (matches pricing engine)
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      if (data?.solana?.usd) {
        solPrice = data.solana.usd;
      }
    } catch (error) {
      console.error('Failed to fetch SOL price:', error);
    }

    const quoteSOL = quote.usdPrice / solPrice;

    // Generate quote data for signing
    const quoteId = randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
    const createdAt = new Date().toISOString();

    // Prepare quote data for HMAC signing
    const quoteData = {
      quoteId,
      modelId,
      storage: storage || '128GB',
      carrier: carrier?.toLowerCase() || 'unlocked',
      condition: engineCondition,
      usdPrice: quote.usdPrice,
      solPrice: parseFloat(quoteSOL.toFixed(4)),
      expiresAt
    };

    // SECURITY: Sign the quote to prevent tampering
    const { signature } = signQuote(quoteData);

    // Return both old and new format for compatibility
    return NextResponse.json({
      // New format (what pricing engine returns)
      success: true,
      data: {
        quote: quote.usdPrice,
        solPrice: parseFloat(quoteSOL.toFixed(4)),
        grade: quote.breakdown?.grade || engineCondition,
        basePrice: quote.breakdown?.basePrice || quote.usdPrice,
        marginPercent: parseInt(quote.margin) || 15,
        message: `Quote valid for 10 minutes`,
        breakdown: quote.breakdown
      },
      // Old format for backward compatibility
      quoteId,
      model,
      condition,
      carrier,
      storage,
      quoteUSD: quote.usdPrice,
      quoteSOL: parseFloat(quoteSOL.toFixed(4)),
      solPrice,
      expiresAt,
      createdAt,
      // SECURITY: Include signature for verification
      signature
    });
  } catch (error) {
    return NextResponse.json(
      { error: sanitizeError(error, 'Failed to generate quote') },
      { status: 500 }
    );
  }
}