#!/usr/bin/env node

/**
 * Test that shipping rates API returns only UPS options
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testUPSRates() {
  console.log('📦 Testing UPS-Only Shipping Rates\n');
  console.log('========================================\n');

  const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;

  if (!SHIPPO_API_KEY) {
    console.log('❌ SHIPPO_API_KEY not found');
    process.exit(1);
  }

  try {
    // Create test shipment to see filtered rates
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
      async: false
    };

    console.log('Getting rates from Shippo API...\n');

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

    const allRates = response.data.rates || [];

    console.log(`📋 Total rates from Shippo: ${allRates.length}\n`);

    // Show all available rates
    const ratesByCarrier = {};
    allRates.forEach(rate => {
      if (!ratesByCarrier[rate.provider]) {
        ratesByCarrier[rate.provider] = [];
      }
      ratesByCarrier[rate.provider].push({
        service: rate.servicelevel.name,
        price: parseFloat(rate.amount),
        days: rate.estimated_days
      });
    });

    console.log('All Available Rates:\n');
    Object.keys(ratesByCarrier).forEach(carrier => {
      console.log(`${carrier}:`);
      ratesByCarrier[carrier].forEach(rate => {
        console.log(`  - ${rate.service}: $${rate.price.toFixed(2)} (${rate.days || 'N/A'} days)`);
      });
      console.log();
    });

    // Now filter like our API does
    console.log('─'.repeat(50));
    console.log('\n🎯 After UPS-Only Filter (What Users Will See):\n');

    const filteredRates = allRates.filter(rate => {
      if (!rate.amount || !rate.servicelevel || !rate.servicelevel.name) return false;

      // Only UPS
      if (rate.provider !== 'UPS') return false;

      const serviceName = rate.servicelevel.name.toLowerCase();
      const allowedServices = ['ground', 'ground saver', '3 day select', '2nd day air'];

      return allowedServices.some(service => serviceName.includes(service));
    });

    // Sort and limit like our API
    const finalRates = filteredRates
      .sort((a, b) => {
        if (parseFloat(a.amount) !== parseFloat(b.amount)) {
          return parseFloat(a.amount) - parseFloat(b.amount);
        }
        return (a.estimated_days || 999) - (b.estimated_days || 999);
      })
      .slice(0, 3);

    if (finalRates.length > 0) {
      console.log(`✅ Found ${finalRates.length} UPS option(s):\n`);
      finalRates.forEach((rate, index) => {
        console.log(`Option ${index + 1}:`);
        console.log(`  Service: ${rate.servicelevel.name}`);
        console.log(`  Price: $${rate.amount} (shown as FREE to user)`);
        console.log(`  Transit: ${rate.estimated_days || 'N/A'} days\n`);
      });
    } else {
      console.log('❌ No UPS rates found after filtering!');
      console.log('Check if UPS services are available for this route.');
    }

    // Summary
    console.log('─'.repeat(50));
    console.log('\n📊 Summary:\n');
    console.log(`• Removed: ${allRates.filter(r => r.provider === 'USPS').length} USPS options`);
    console.log(`• Removed: ${allRates.filter(r => r.provider === 'UPS' && r.servicelevel.name.toLowerCase().includes('next day')).length} expensive UPS Next Day options`);
    console.log(`• Showing: ${finalRates.length} UPS options to users`);
    console.log(`• User pays: $0 (FREE shipping)`);
    console.log(`• You pay: $${finalRates[0]?.amount || 'N/A'} - $${finalRates[finalRates.length-1]?.amount || 'N/A'}`);

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
testUPSRates().catch(console.error);