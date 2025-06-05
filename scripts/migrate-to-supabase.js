// Script to migrate localStorage data to Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateUserData() {
  console.log('Starting data migration to Supabase...');
  
  try {
    // Get all localStorage data
    const localStorageData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('refit_user_')) {
        localStorageData[key] = JSON.parse(localStorage.getItem(key));
      }
    }

    console.log(`Found ${Object.keys(localStorageData).length} user profiles to migrate`);

    // Migrate each user
    for (const [key, userData] of Object.entries(localStorageData)) {
      const walletAddress = key.replace('refit_user_', '');
      console.log(`Migrating user: ${walletAddress}`);

      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: `${walletAddress}@refit.io`,
          password: walletAddress,
        });

        if (authError && !authError.message.includes('already registered')) {
          throw authError;
        }

        const userId = authData?.user?.id;

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', walletAddress)
          .single();

        if (!existingUser) {
          // Create user record
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: userId,
              wallet_address: walletAddress,
              email: userData.email || null,
              notification_preferences: {
                email: true,
                order_updates: true,
                marketing: false
              }
            });

          if (userError) {
            console.error(`Failed to create user ${walletAddress}:`, userError);
            continue;
          }
        }

        // Migrate shipping addresses
        if (userData.shippingAddresses?.length > 0) {
          console.log(`  Migrating ${userData.shippingAddresses.length} shipping addresses`);
          
          for (const address of userData.shippingAddresses) {
            const { error: addressError } = await supabase
              .from('shipping_addresses')
              .insert({
                user_id: userId || existingUser.id,
                name: address.name,
                street1: address.street1,
                street2: address.street2,
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: address.country || 'US',
                phone: address.phone,
                is_default: address.isDefault || false,
                is_validated: address.validated || false
              });

            if (addressError) {
              console.error(`  Failed to migrate address:`, addressError);
            }
          }
        }

        // Migrate orders
        if (userData.orders?.length > 0) {
          console.log(`  Migrating ${userData.orders.length} orders`);
          
          for (const order of userData.orders) {
            // Get or create order number
            const orderNumber = order.orderNumber || `LEGACY-${order.id}`;
            
            const { error: orderError } = await supabase
              .from('orders')
              .insert({
                order_number: orderNumber,
                user_id: userId || existingUser.id,
                status: order.status,
                device_brand: order.device?.brand || 'Unknown',
                device_model: order.device?.model || 'Unknown',
                device_condition: order.device?.condition || 'Unknown',
                device_details: order.device,
                quoted_price_usd: order.quotedPrice?.usd || 0,
                quoted_price_sol: order.quotedPrice?.sol || 0,
                final_price_usd: order.finalPrice?.usd,
                final_price_sol: order.finalPrice?.sol,
                sol_price_at_quote: order.solPriceAtQuote,
                tracking_number: order.trackingNumber,
                label_url: order.labelUrl,
                shipping_carrier: order.shipping?.carrier,
                shipping_service: order.shipping?.service,
                shipping_cost: order.shipping?.cost,
                escrow_pubkey: order.escrowPubkey,
                payment_tx_signature: order.paymentTxSignature,
                created_at: order.createdAt || new Date(order.timestamp || Date.now()).toISOString(),
                shipped_at: order.shippedAt,
                received_at: order.receivedAt,
                completed_at: order.completedAt
              });

            if (orderError) {
              console.error(`  Failed to migrate order ${orderNumber}:`, orderError);
            }
          }
        }

        console.log(`✓ Successfully migrated user: ${walletAddress}`);
      } catch (error) {
        console.error(`✗ Failed to migrate user ${walletAddress}:`, error);
      }
    }

    console.log('\nMigration completed!');
    console.log('Note: This script should be run in the browser console where localStorage data exists.');
    
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Export for use in browser console
window.migrateToSupabase = migrateUserData;

console.log('Migration script loaded. Run window.migrateToSupabase() to start migration.');
