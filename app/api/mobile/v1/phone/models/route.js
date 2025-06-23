import { NextResponse } from 'next/server';

// Phone models database - same as used in the main app
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

export async function GET() {
  try {
    // Transform the data for mobile app consumption
    const models = Object.entries(PHONE_DATABASE).map(([model, data]) => ({
      model,
      basePrice: data.basePrice,
      conditions: Object.entries(data.conditions).map(([condition, multiplier]) => ({
        condition,
        multiplier,
        estimatedPrice: Math.round(data.basePrice * multiplier)
      }))
    }));

    return NextResponse.json({
      models,
      lastUpdated: new Date().toISOString(),
      currency: 'USD'
    });
  } catch (error) {
    console.error('Phone models error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phone models' },
      { status: 500 }
    );
  }
}