import { NextResponse } from 'next/server';
import { calculateQuote, buildModelIndex, searchModels } from '@/lib/pricing-engine-v3';

export async function POST(request) {
  try {
    const { model, condition, carrier, storage, issues = [], accessories = {} } = await request.json();

    if (!model || !condition) {
      return NextResponse.json(
        { success: false, error: 'Model and condition are required' },
        { status: 400 }
      );
    }

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
      issues: issues || [],
      accessories: accessories || { charger: false, box: false }
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
      quoteId: crypto.randomUUID(),
      model,
      condition,
      carrier,
      storage,
      quoteUSD: quote.usdPrice,
      quoteSOL: parseFloat(quoteSOL.toFixed(4)),
      solPrice,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Quote generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    );
  }
}