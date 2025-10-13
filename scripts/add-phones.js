// Script to add phones to inventory
const ADMIN_WALLET = '7dvcw3CJ4YnzFfU3EKqkU5X4qV34tFqDvtuRBRzijemn';

const phones = [
  {
    model: 'i13P-UNL-256GB-B',
    imei: '359349733107906',
    price_paid: 285.00,
    price_sold: null,
    battery_health: 82,
    condition: 'Used',
    notes: 'Sold to: KT',
    seller: 'rafmic93',
    status: 'in_stock'
  },
  {
    model: 'i14PM-UNL-256GB-B',
    imei: '353885660052462',
    price_paid: 407.01,
    price_sold: null,
    battery_health: 81,
    condition: 'Used',
    notes: 'Sold to: SA',
    seller: 'er.bqstore',
    status: 'in_stock'
  }
];

async function addPhones() {
  for (const phone of phones) {
    try {
      const response = await fetch('http://localhost:3000/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: ADMIN_WALLET,
          item: phone
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Added ${phone.model} - IMEI: ${phone.imei}`);
      } else {
        console.log(`❌ Failed to add ${phone.model}: ${data.error}`);
      }
    } catch (error) {
      console.error(`❌ Error adding ${phone.model}:`, error.message);
    }
  }
}

addPhones().then(() => {
  console.log('✨ Done adding phones!');
});