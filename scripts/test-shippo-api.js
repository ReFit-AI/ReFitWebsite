#!/usr/bin/env node

/**
 * Test Shippo API Connection
 * Verifies the API key is working and can connect to Shippo
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testShippoConnection() {
  console.log('🚢 Testing Shippo API Connection\n');
  console.log('========================================\n');

  const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;

  // Check if API key exists
  if (!SHIPPO_API_KEY) {
    console.log('❌ SHIPPO_API_KEY not found in environment variables');
    console.log('Please add to .env.local: SHIPPO_API_KEY=your_key');
    process.exit(1);
  }

  // Check if it's a live or test key
  const isLiveKey = SHIPPO_API_KEY.startsWith('shippo_live_');
  const isTestKey = SHIPPO_API_KEY.startsWith('shippo_test_');

  console.log(`📝 API Key Details:`);
  console.log(`- Type: ${isLiveKey ? '🔴 LIVE/PRODUCTION' : isTestKey ? '🟡 TEST' : '❓ UNKNOWN'}`);
  console.log(`- First 20 chars: ${SHIPPO_API_KEY.substring(0, 20)}...`);
  console.log(`- Length: ${SHIPPO_API_KEY.length} characters\n`);

  if (isLiveKey) {
    console.log('⚠️  WARNING: You are using a LIVE Shippo API key!');
    console.log('   Any labels purchased will charge your account.\n');
  }

  // Test API connection by creating a test address
  console.log('Testing API connection...\n');

  try {
    // Test address validation endpoint
    const response = await axios.post(
      'https://api.goshippo.com/addresses/',
      {
        name: 'Test User',
        street1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'US',
        validate: true
      },
      {
        headers: {
          'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ API Connection Successful!\n');
    console.log('Address Validation Result:');
    console.log(`- Address ID: ${response.data.object_id}`);
    console.log(`- Valid: ${response.data.validation_results?.is_valid ? 'Yes' : 'No'}`);

    if (response.data.validation_results?.messages) {
      console.log(`- Messages:`, response.data.validation_results.messages);
    }

    // Test getting carrier accounts
    console.log('\n📦 Checking Carrier Accounts...\n');

    const carriersResponse = await axios.get(
      'https://api.goshippo.com/carrier_accounts/',
      {
        headers: {
          'Authorization': `ShippoToken ${SHIPPO_API_KEY}`
        }
      }
    );

    const carriers = carriersResponse.data.results || [];

    if (carriers.length > 0) {
      console.log(`Found ${carriers.length} carrier account(s):`);
      carriers.forEach(carrier => {
        console.log(`- ${carrier.carrier}: ${carrier.account_id} (${carrier.test ? 'TEST' : 'LIVE'})`);
      });
    } else {
      console.log('⚠️  No carrier accounts found.');
      console.log('   You may need to connect carriers in Shippo dashboard.');
      console.log('   Visit: https://apps.goshippo.com/settings/carriers');
    }

    console.log('\n========================================');
    console.log('\n🎉 Shippo API is configured and working!');

    if (isLiveKey) {
      console.log('\n📌 Next Steps for Production:');
      console.log('1. Ensure carrier accounts are connected');
      console.log('2. Fund your Shippo account for label purchases');
      console.log('3. Set up webhooks for tracking updates');
    } else if (isTestKey) {
      console.log('\n📌 Using Test Mode:');
      console.log('1. Labels will be free but not actually ship');
      console.log('2. Switch to live key for production');
    }

  } catch (error) {
    console.log('❌ API Connection Failed!\n');

    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);

      if (error.response.status === 401) {
        console.log('\n🔑 Authentication failed. Check your API key.');
      } else if (error.response.status === 402) {
        console.log('\n💳 Payment required. Check your Shippo billing.');
      }
    } else {
      console.log(`Error: ${error.message}`);
    }

    process.exit(1);
  }
}

// Run the test
testShippoConnection().catch(console.error);