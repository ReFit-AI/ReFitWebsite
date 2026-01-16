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

    // Handle errors or rejected quotes
    if (quote.error) {
      return NextResponse.json(
        { success: false, error: quote.error },
        { status: 400 }
      );
    }

    // Handle rejected quotes (unprofitable devices)
    if (quote.rejected) {
      return NextResponse.json({
        success: false,
        rejected: true,
        reason: quote.reason,
        message: quote.message
      }, { status: 200 }); // 200 because it's a valid response, just no offer
    }

    // Try to get current SOL price (optional - USDC is primary)
    let solPrice = null;
    let quoteSOL = null;
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
        next: { revalidate: 60 } // Cache for 60 seconds
      });
      const data = await response.json();
      if (data?.solana?.usd) {
        solPrice = data.solana.usd;
        quoteSOL = parseFloat((quote.usdPrice / solPrice).toFixed(4));
      }
    } catch (error) {
      console.warn('SOL price unavailable, USDC only:', error.message);
    }

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
      usdPrice: quote.usdPrice, // USDC is primary (naming matches signing lib)
      solPrice: quoteSOL, // May be null when SOL price unavailable
      expiresAt
    };

    // SECURITY: Sign the quote to prevent tampering
    const { signature } = signQuote(quoteData);

    // Build response - USDC primary, SOL optional
    const response = {
      success: true,
      // Primary quote in USDC
      quoteId,
      quoteUSDC: quote.usdPrice,
      usdcPrice: quote.usdPrice,
      // SOL quote (only if price available)
      ...(quoteSOL && { quoteSOL, solPrice }),
      // Quote details
      model,
      condition,
      carrier,
      storage,
      grade: quote.supplierGrade,
      // Timing
      expiresAt,
      createdAt,
      // Breakdown for transparency
      breakdown: {
        wholesalePrice: quote.wholesalePrice,
        margin: quote.marginPercent,
        deductions: quote.breakdown?.deductions || 0,
        finalPrice: quote.usdPrice
      },
      // SECURITY: Signature for verification
      signature
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: sanitizeError(error, 'Failed to generate quote') },
      { status: 500 }
    );
  }
}