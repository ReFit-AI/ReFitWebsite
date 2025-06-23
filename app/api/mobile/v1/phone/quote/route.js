import { NextResponse } from 'next/server';
// import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Same phone database as models endpoint
const PHONE_DATABASE = {
  'iPhone 16 Pro Max': { 
    basePrice: 1199, 
    conditions: {
      excellent: 0.85,
      good: 0.70,
      fair: 0.55,
      broken: 0.30
    }
  },
  'iPhone 16 Pro': { 
    basePrice: 999, 
    conditions: {
      excellent: 0.85,
      good: 0.70,
      fair: 0.55,
      broken: 0.30
    }
  },
  'iPhone 16': { 
    basePrice: 799, 
    conditions: {
      excellent: 0.80,
      good: 0.65,
      fair: 0.50,
      broken: 0.25
    }
  },
  'iPhone 15 Pro Max': { 
    basePrice: 999, 
    conditions: {
      excellent: 0.80,
      good: 0.65,
      fair: 0.50,
      broken: 0.25
    }
  },
  'iPhone 15 Pro': { 
    basePrice: 899, 
    conditions: {
      excellent: 0.80,
      good: 0.65,
      fair: 0.50,
      broken: 0.25
    }
  },
  'iPhone 15': { 
    basePrice: 699, 
    conditions: {
      excellent: 0.75,
      good: 0.60,
      fair: 0.45,
      broken: 0.20
    }
  },
  'Samsung Galaxy S24 Ultra': { 
    basePrice: 1299, 
    conditions: {
      excellent: 0.80,
      good: 0.65,
      fair: 0.50,
      broken: 0.25
    }
  },
  'Samsung Galaxy S24+': { 
    basePrice: 999, 
    conditions: {
      excellent: 0.75,
      good: 0.60,
      fair: 0.45,
      broken: 0.20
    }
  },
  'Samsung Galaxy S24': { 
    basePrice: 799, 
    conditions: {
      excellent: 0.75,
      good: 0.60,
      fair: 0.45,
      broken: 0.20
    }
  },
  'Google Pixel 9 Pro XL': { 
    basePrice: 1099, 
    conditions: {
      excellent: 0.75,
      good: 0.60,
      fair: 0.45,
      broken: 0.20
    }
  },
  'Google Pixel 9 Pro': { 
    basePrice: 999, 
    conditions: {
      excellent: 0.75,
      good: 0.60,
      fair: 0.45,
      broken: 0.20
    }
  },
  'Google Pixel 9': { 
    basePrice: 799, 
    conditions: {
      excellent: 0.70,
      good: 0.55,
      fair: 0.40,
      broken: 0.15
    }
  }
};

export async function POST(request) {
  try {
    const { model, condition, carrier, storage } = await request.json();

    if (!model || !condition) {
      return NextResponse.json(
        { error: 'Model and condition are required' },
        { status: 400 }
      );
    }

    const phoneData = PHONE_DATABASE[model];
    if (!phoneData) {
      return NextResponse.json(
        { error: 'Invalid phone model' },
        { status: 400 }
      );
    }

    const conditionMultiplier = phoneData.conditions[condition];
    if (!conditionMultiplier) {
      return NextResponse.json(
        { error: 'Invalid condition' },
        { status: 400 }
      );
    }

    // Calculate base quote
    let quoteUSD = phoneData.basePrice * conditionMultiplier;

    // Apply carrier adjustment
    if (carrier === 'unlocked') {
      quoteUSD *= 1.1; // 10% bonus for unlocked phones
    }

    // Apply storage adjustment
    if (storage === '256GB') {
      quoteUSD *= 1.05;
    } else if (storage === '512GB') {
      quoteUSD *= 1.1;
    } else if (storage === '1TB') {
      quoteUSD *= 1.15;
    }

    // Round to nearest dollar
    quoteUSD = Math.round(quoteUSD);

    // Get current SOL price
    let solPrice = 150; // Default fallback
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      solPrice = data.solana.usd;
    } catch (error) {
      console.error('Failed to fetch SOL price:', error);
    }

    const quoteSOL = quoteUSD / solPrice;

    return NextResponse.json({
      quoteId: crypto.randomUUID(),
      model,
      condition,
      carrier,
      storage,
      quoteUSD,
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