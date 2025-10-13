// Script to check invoices in the database
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkInvoices() {
  try {
    console.log('Checking invoices in database...\n');

    // Get all invoices
    const { data: invoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (invoiceError) {
      console.error('Error fetching invoices:', invoiceError);
      return;
    }

    console.log(`Found ${invoices?.length || 0} invoices:\n`);

    if (invoices && invoices.length > 0) {
      invoices.forEach(invoice => {
        console.log('----------------------------');
        console.log(`Invoice #: ${invoice.invoice_number}`);
        console.log(`ID: ${invoice.id}`);
        console.log(`Status: ${invoice.status}`);
        console.log(`Total: $${invoice.total || invoice.total_amount || 0}`);
        console.log(`Buyer ID: ${invoice.buyer_id || 'none'}`);
        console.log(`Created: ${invoice.created_at}`);
        console.log('----------------------------\n');
      });

      // Check invoice items for the latest invoice
      const latestInvoice = invoices[0];
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', latestInvoice.id);

      if (itemsError) {
        console.error('Error fetching invoice items:', itemsError);
      } else {
        console.log(`Items in latest invoice (${latestInvoice.invoice_number}):`);
        items?.forEach(item => {
          console.log(`  - ${item.model} | IMEI: ${item.imei} | Price: $${item.price}`);
        });
      }
    } else {
      console.log('No invoices found in the database.');
    }

    // Also check buyers
    const { data: buyers, error: buyersError } = await supabase
      .from('buyers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (buyers && buyers.length > 0) {
      console.log('\nRecent buyers:');
      buyers.forEach(buyer => {
        console.log(`  - ${buyer.name} (${buyer.email})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkInvoices();