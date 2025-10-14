import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Public inventory stats (aggregated only, no details)
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          stats: {
            totalPhones: 0,
            successfulFlips: 0,
            message: 'Stats temporarily unavailable'
          }
        },
        { status: 200 } // Return 200 to avoid error on client
      );
    }

    const { data, error } = await supabase
      .from('inventory')
      .select('status');

    if (error) {
      console.error('Error fetching inventory stats:', error);
      // Return safe defaults instead of error
      return NextResponse.json({
        success: true,
        stats: {
          totalPhones: 0,
          successfulFlips: 0,
          message: 'Building inventory'
        }
      });
    }

    // Only return high-level counts, no financial details
    const inStock = data?.filter(i => i.status === 'in_stock').length || 0;
    const sold = data?.filter(i => i.status === 'sold').length || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalPhones: inStock + sold,
        successfulFlips: sold,
        activeInventory: inStock,
        message: inStock > 0 ? 'Capital actively deployed' : 'Sourcing inventory'
      }
    });
  } catch (error) {
    console.error('Error in inventory stats:', error);
    return NextResponse.json({
      success: true,
      stats: {
        totalPhones: 0,
        successfulFlips: 0,
        message: 'Stats coming soon'
      }
    });
  }
}