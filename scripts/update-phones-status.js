// Script to update phone status to in_stock
const ADMIN_WALLET = '7dvcw3CJ4YnzFfU3EKqkU5X4qV34tFqDvtuRBRzijemn';

const phonesToUpdate = [
  {
    id: '16ee0082-ce16-4e1d-8551-667957cf5ce8',
    model: 'i13P-UNL-256GB-B',
    imei: '359349733107906'
  },
  {
    id: 'bda2d80d-704e-44c2-bb6c-1af985b07bbb',
    model: 'i14PM-UNL-256GB-B',
    imei: '353885660052462'
  }
];

async function updatePhoneStatus() {
  for (const phone of phonesToUpdate) {
    try {
      const response = await fetch('http://localhost:3000/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: ADMIN_WALLET,
          id: phone.id,
          updates: {
            status: 'in_stock',
            price_sold: null,
            sold_at: null
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Updated ${phone.model} (${phone.imei}) to in_stock`);
      } else {
        console.log(`❌ Failed to update ${phone.model}: ${data.error}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${phone.model}:`, error.message);
    }
  }
}

updatePhoneStatus().then(() => {
  console.log('✨ Done updating phone status!');
});