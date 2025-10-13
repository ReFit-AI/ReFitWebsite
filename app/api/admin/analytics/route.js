import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for admin operations
const getSupabase = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

export async function GET() {
  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured'
    }, { status: 500 });
  }
  try {
    // Get all inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (inventoryError) throw inventoryError;

    // Get all invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (invoicesError) throw invoicesError;

    // Calculate metrics
    const totalUnits = inventory?.length || 0;
    const soldUnits = inventory?.filter(i => i.status === 'sold').length || 0;
    const inStockUnits = inventory?.filter(i => i.status === 'in_stock').length || 0;
    const pendingUnits = inventory?.filter(i => i.status === 'pending').length || 0;

    // Revenue & profit calculations
    const soldItems = inventory?.filter(i => i.status === 'sold') || [];
    const totalRevenue = soldItems.reduce((sum, i) => sum + (i.price_sold || 0), 0);
    const totalCost = soldItems.reduce((sum, i) => sum + (i.price_paid || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Average values
    const avgSalePrice = soldUnits > 0 ? totalRevenue / soldUnits : 0;
    const avgCost = soldUnits > 0 ? totalCost / soldUnits : 0;
    const avgProfitPerUnit = soldUnits > 0 ? totalProfit / soldUnits : 0;

    // This month calculations
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthRevenue = soldItems
      .filter(i => i.sold_at && new Date(i.sold_at) >= thisMonthStart)
      .reduce((sum, i) => sum + (i.price_sold || 0), 0);

    // Top models by revenue
    const modelStats = {};
    soldItems.forEach(item => {
      const model = item.model || 'Unknown';
      if (!modelStats[model]) {
        modelStats[model] = { count: 0, revenue: 0 };
      }
      modelStats[model].count++;
      modelStats[model].revenue += (item.price_sold || 0);
    });

    const topModels = Object.entries(modelStats)
      .map(([model, stats]) => ({ model, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Inventory turnover (units sold / average inventory)
    const inventoryTurnover = totalUnits > 0 ? soldUnits / (totalUnits / 2) : 0;

    const stats = {
      // Key metrics
      totalRevenue,
      totalCost,
      totalProfit,
      avgMargin,
      unitsSold: soldUnits,

      // Inventory
      totalUnits,
      soldUnits,
      inStockUnits,
      pendingUnits,
      activeInventory: inStockUnits,

      // Invoices
      totalInvoices: invoices?.length || 0,

      // Averages
      avgSalePrice,
      avgCost,
      avgProfitPerUnit,

      // Time-based
      thisMonthRevenue,

      // Analysis
      topModels,
      inventoryTurnover,

      // Dummy change values (would calculate from historical data)
      profitChange: 0,
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
