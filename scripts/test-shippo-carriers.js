#!/usr/bin/env node

/**
 * Test what carriers are actually available for US shipping
 * Shippo provides some carriers by default without explicit connection
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testAvailableCarriers() {
  console.log('📦 Testing Available Shipping Carriers\n');
  console.log('========================================\n');

  const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;

  if (!SHIPPO_API_KEY) {
    console.log('❌ SHIPPO_API_KEY not found');
    process.exit(1);
  }

  try {
    // Create a test shipment to see what rates are available
    console.log('Creating test shipment for US domestic shipping...\n');

    const shipmentData = {
      address_from: {
        name: 'ReFit Warehouse',
        street1: '123 Warehouse St',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'US'
      },
      address_to: {
        name: 'Test Customer',
        street1: '456 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US'
      },
      parcels: [{
        length: '7',
        width: '5',
        height: '2',
        distance_unit: 'in',
        weight: '1',
        mass_unit: 'lb'
      }],
      async: false  // Get rates immediately
    };

    const response = await axios.post(
      'https://api.goshippo.com/shipments/',
      shipmentData,
      {
        headers: {
          'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const rates = response.data.rates || [];

    console.log(`✅ Found ${rates.length} shipping rate(s) available!\n`);

    if (rates.length > 0) {
      // Group rates by carrier
      const carrierRates = {};

      rates.forEach(rate => {
        const carrier = rate.provider;
        if (!carrierRates[carrier]) {
          carrierRates[carrier] = [];
        }
        carrierRates[carrier].push({
          service: rate.servicelevel.name,
          price: `$${rate.amount}`,
          days: rate.estimated_days || 'N/A',
          token: rate.servicelevel.token
        });
      });

      console.log('📬 Available Carriers and Services:\n');
      console.log('─'.repeat(50));

      Object.keys(carrierRates).sort().forEach(carrier => {
        console.log(`\n${carrier.toUpperCase()}`);
        carrierRates[carrier].forEach(rate => {
          console.log(`  - ${rate.service}`);
          console.log(`    Price: ${rate.price} | Transit: ${rate.days} days`);
        });
      });

      // Show cheapest and fastest options
      const cheapest = rates.reduce((min, rate) =>
        parseFloat(rate.amount) < parseFloat(min.amount) ? rate : min
      );

      const fastest = rates.reduce((fast, rate) =>
        (rate.estimated_days || 999) < (fast.estimated_days || 999) ? rate : fast
      );

      console.log('\n' + '═'.repeat(50));
      console.log('\n💰 Best Options:');
      console.log(`\nCheapest: ${cheapest.provider} - ${cheapest.servicelevel.name}`);
      console.log(`  Price: $${cheapest.amount}`);
      console.log(`  Transit: ${cheapest.estimated_days || 'N/A'} days`);

      console.log(`\nFastest: ${fastest.provider} - ${fastest.servicelevel.name}`);
      console.log(`  Price: $${fastest.amount}`);
      console.log(`  Transit: ${fastest.estimated_days || 'N/A'} days`);

    } else {
      console.log('❌ No rates available. You may need to:');
      console.log('1. Connect US carriers in Shippo dashboard');
      console.log('2. Check your Shippo account status');
      console.log('3. Verify billing is set up');
    }

    // Also check what carrier accounts are connected
    console.log('\n' + '═'.repeat(50));
    console.log('\n🔌 Connected Carrier Accounts:\n');

    const carriersResponse = await axios.get(
      'https://api.goshippo.com/carrier_accounts/',
      {
        headers: {
          'Authorization': `ShippoToken ${SHIPPO_API_KEY}`
        }
      }
    );

    const accounts = carriersResponse.data.results || [];

    if (accounts.length > 0) {
      accounts.forEach(account => {
        const isActive = account.active ? '✅' : '❌';
        console.log(`${isActive} ${account.carrier.toUpperCase()}: ${account.account_id}`);
      });
    } else {
      console.log('No carrier accounts explicitly connected.');
    }

    console.log('\n' + '═'.repeat(50));
    console.log('\n📝 Summary:\n');

    if (rates.length > 0) {
      const usCarriers = ['USPS', 'FedEx', 'UPS'];
      const availableUSCarriers = Object.keys(carrierRates)
        .filter(c => usCarriers.includes(c));

      if (availableUSCarriers.length > 0) {
        console.log('✅ US shipping is available via:', availableUSCarriers.join(', '));
        console.log('\n🎉 You can ship within the US without additional setup!');
        console.log('\nShippo provides access to USPS rates by default.');
        console.log('You only need to fund your Shippo account to purchase labels.');
      } else {
        console.log('⚠️  No US carriers found in available rates.');
      }
    } else {
      console.log('❌ No shipping rates available. Setup required.');
    }

  } catch (error) {
    console.log('❌ Test failed!\n');

    if (error.response) {
      console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

// Run the test
testAvailableCarriers().catch(console.error);