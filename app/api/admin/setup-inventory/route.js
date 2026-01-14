import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_WALLET = process.env.ADMIN_WALLET;

// POST - Setup inventory tables and import CSV data
export async function POST(request) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    // Verify admin
    if (walletAddress !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create service role client (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase service role key' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Sample inventory data from CSV
    const inventoryData = [
      { model: 'i15P-UNL-128GB-B', imei: '350914843349026', price_paid: 363.71, price_sold: 390, notes: 'cracked back lense cover', battery_health: null, seller: 'korgil0', status: 'sold' },
      { model: 'i14PM-UNL-256GB-B', imei: '353791986942461', price_paid: 450, price_sold: 495, notes: null, battery_health: null, seller: 'edesc-2030', status: 'sold' },
      { model: 'i4PM-UNL-128GB-B', imei: '3532243149991265', price_paid: 417, price_sold: 455, notes: null, battery_health: null, seller: 'kareclayto-4', status: 'sold' },
      { model: 'i15PM-VZ-256GB-B', imei: '351581977099831', price_paid: 461.45, price_sold: 460, notes: null, battery_health: null, seller: 'mmpawnshop', status: 'sold' },
      { model: 'i14PM-UNL-128GB-B', imei: '355086754551976', price_paid: 400, price_sold: 455, notes: null, battery_health: null, seller: 'kiaparts2013', status: 'sold' },
      { model: 'i15PR-BST-128GB-NIB', imei: '353431652231382', price_paid: 400, price_sold: 430, notes: null, battery_health: null, seller: 'surplus22', status: 'sold' },
      { model: 'i15PR-BST-128GB-NIB', imei: '353629300857967', price_paid: 340, price_sold: 430, notes: null, battery_health: null, seller: 'surplus23', status: 'sold' },
      { model: 'i15PR-BST-128GB-NIB', imei: '353629300948675', price_paid: 340, price_sold: 430, notes: null, battery_health: null, seller: 'surplus24', status: 'sold' },
      { model: 'i15PR-BST-128GB-NIB', imei: '353431651169492', price_paid: 340, price_sold: 430, notes: null, battery_health: null, seller: 'surplus25', status: 'sold' },
      { model: 'i15PR-BST-128GB-NIB', imei: '353431658788567', price_paid: 340, price_sold: 430, notes: null, battery_health: null, seller: 'surplus26', status: 'sold' },
      { model: 'i15PR-BST-128GB-NIB', imei: '353864163518691', price_paid: 340, price_sold: 430, notes: null, battery_health: null, seller: 'surplus27', status: 'sold' },
      { model: 'i13PM-UNL-128GB-B', imei: '355387496485113', price_paid: 257.01, price_sold: 300, notes: null, battery_health: null, seller: 'vasquez-trading-company', status: 'sold' },
      { model: 'i13PM-UNL-128GB-B', imei: '35744788925036', price_paid: 256, price_sold: 280, notes: 'cracked back/asurion', battery_health: 86, seller: 'newlifesales123', status: 'sold' },
      { model: 'i15P-UNL-1TB-D', imei: '352400478291582', price_paid: 0, price_sold: 0, notes: 'Returned', battery_health: 88, seller: null, status: 'returned' },
      { model: 'i15PR-BST-128GB-NIB', imei: '353431655903045', price_paid: 340, price_sold: 430, notes: null, battery_health: null, seller: 'surplus25', status: 'sold' },
      { model: 'i15PR-BST-128GB-NIB', imei: '353431656152782', price_paid: 340, price_sold: 430, notes: null, battery_health: null, seller: 'surplus26', status: 'sold' },
      { model: 'i15PR-BST-128GB-NIB', imei: '353629301094016', price_paid: 340, price_sold: 430, notes: null, battery_health: null, seller: 'surplus27', status: 'sold' },
      { model: 'i15PR-BST-128GB-NIB', imei: '353864163079967', price_paid: 340, price_sold: 430, notes: null, battery_health: null, seller: 'surplus28', status: 'sold' },
      { model: 'i15PR-BST-128GB-NIB', imei: '353629300919882', price_paid: 340, price_sold: 430, notes: null, battery_health: null, seller: 'surplus29', status: 'sold' },
      { model: 'i15PR-TM-128GB-C', imei: '355407367560065', price_paid: 279.61, price_sold: 320, notes: null, battery_health: null, seller: 'tojac-5153', status: 'sold' },
      { model: 'i16Pro-UNL-256GB-B', imei: '350922052113181', price_paid: 609.7, price_sold: 650, notes: null, battery_health: null, seller: null, status: 'sold' },
      { model: 'i14PM-UNL-128GB-B+', imei: '357397707984109', price_paid: 410.82, price_sold: 445, notes: null, battery_health: null, seller: null, status: 'sold' },
      { model: 'i14-UNL-128GB-B', imei: '358250499003159', price_paid: 200, price_sold: 230, notes: null, battery_health: null, seller: null, status: 'sold' },
      { model: 'i14+-UNL-128GB-B+', imei: '356752981859594', price_paid: 270, price_sold: 290, notes: null, battery_health: null, seller: null, status: 'sold' },
      { model: 'i15PRM-Spec-256GB-B', imei: '351503400244495', price_paid: 388.34, price_sold: 445, notes: null, battery_health: null, seller: 'brucsimmon-57', status: 'sold' },
      { model: 'i14PM-UNL-256GB-B', imei: '353360942256810', price_paid: 397.84, price_sold: 430, notes: 'degraded battery message', battery_health: null, seller: '911herrera', status: 'sold' },
      { model: 'i15PM-ATT-256GB-B', imei: '351661828021463', price_paid: 407.01, price_sold: 440, notes: null, battery_health: null, seller: 'jennifercuello', status: 'sold' },
      { model: 'i13P-UNL-256GB-B', imei: '359349733107906', price_paid: 285, price_sold: 325, notes: null, battery_health: 82, seller: 'rafmic93', status: 'sold' },
      { model: 'i14PM-UNL-256GB-B', imei: '353885660052462', price_paid: 407.01, price_sold: 485, notes: null, battery_health: 81, seller: 'er.bqstore', status: 'sold' },
    ];

    // Determine condition based on model and notes
    const itemsToInsert = inventoryData.map(item => {
      let condition = 'Used';
      if (item.model.includes('NIB')) {
        condition = 'New in Box';
      } else if (item.notes?.toLowerCase().includes('cracked')) {
        condition = 'Cracked';
      }

      return {
        model: item.model.replace(/-CB$/, ''),
        imei: item.imei,
        price_paid: item.price_paid,
        price_sold: item.price_sold > 0 ? item.price_sold : null,
        battery_health: item.battery_health,
        condition,
        notes: item.notes,
        seller: item.seller,
        status: item.status,
        purchased_at: '2024-09-13T12:00:00Z',
        sold_at: item.status === 'sold' ? '2024-10-01T12:00:00Z' : null
      };
    });

    // Insert data
    const { data, error } = await supabase
      .from('inventory')
      .upsert(itemsToInsert, {
        onConflict: 'imei',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('Error importing inventory:', error);
      throw error;
    }

    // Get stats
    const { data: allInventory } = await supabase
      .from('inventory')
      .select('*');

    const stats = {
      imported: data?.length || 0,
      total: allInventory?.length || 0,
      inStock: allInventory?.filter(i => i.status === 'in_stock').length || 0,
      sold: allInventory?.filter(i => i.status === 'sold').length || 0
    };

    return NextResponse.json({
      success: true,
      message: 'Inventory imported successfully',
      stats
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
