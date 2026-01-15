// Shipping Service - integrates with shipping providers
// Using Shippo as example (https://goshippo.com/docs/intro/)

import axios from 'axios';

// Prioritise server-side key then public key
const SHIPPO_API_KEY =
  process.env.NEXT_PUBLIC_SHIPPO_API_KEY ||
  process.env.NEXT_PUBLIC_PUBLIC_SHIPPO_API_KEY ||
  'shippo_test_key';
const SHIPPO_BASE_URL = 'https://api.goshippo.com';

class ShippingService {
  constructor() {
    this.client = axios.create({
      baseURL: SHIPPO_BASE_URL,
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Validate an address
  async validateAddress(address) {
    try {
      const response = await this.client.post('/addresses/', {
        ...address,
        validate: true
      });
      return {
        success: true,
        data: response.data,
        isValid: response.data.validation_results?.is_valid || false
      };
    } catch (error) {
      console.error('Address validation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get shipping rates for a package
  async getRates(fromAddress, toAddress, parcel) {
    try {
      // Create shipment
      const shipment = await this.client.post('/shipments/', {
        address_from: fromAddress,
        address_to: toAddress,
        parcels: [parcel],
        async: false
      });

      // Get rates
      const rates = shipment.data.rates;
      
      // Sort by price
      const sortedRates = rates.sort((a, b) => 
        parseFloat(a.amount) - parseFloat(b.amount)
      );

      return {
        success: true,
        rates: sortedRates.map(rate => ({
          carrier: rate.provider,
          service: rate.servicelevel.name,
          price: parseFloat(rate.amount),
          currency: rate.currency,
          estimatedDays: rate.estimated_days,
          rateId: rate.object_id
        }))
      };
    } catch (error) {
      console.error('Get rates error:', error);
      return { success: false, error: error.message };
    }
  }

  // Purchase a shipping label
  async purchaseLabel(rateId) {
    try {
      const transaction = await this.client.post('/transactions/', {
        rate: rateId,
        label_file_type: 'PDF',
        async: false
      });

      if (transaction.data.status === 'SUCCESS') {
        return {
          success: true,
          label: {
            trackingNumber: transaction.data.tracking_number,
            labelUrl: transaction.data.label_url,
            trackingUrl: transaction.data.tracking_url_provider,
            carrier: transaction.data.carrier_account,
            cost: transaction.data.rate
          }
        };
      } else {
        throw new Error(transaction.data.messages?.join(', ') || 'Label purchase failed');
      }
    } catch (error) {
      console.error('Purchase label error:', error);
      return { success: false, error: error.message };
    }
  }

  // Track a shipment
  async trackShipment(carrier, trackingNumber) {
    try {
      const tracking = await this.client.get(
        `/tracks/${carrier}/${trackingNumber}`
      );

      return {
        success: true,
        tracking: {
          status: tracking.data.tracking_status,
          location: tracking.data.location,
          estimatedDelivery: tracking.data.eta,
          history: tracking.data.tracking_history
        }
      };
    } catch (error) {
      console.error('Tracking error:', error);
      return { success: false, error: error.message };
    }
  }

  // Standard parcel sizes for phones
  static getPhoneParcel() {
    return {
      length: 7,      // inches
      width: 4,       // inches
      height: 2,      // inches
      distance_unit: 'in',
      weight: 20,     // 1 lb 4 oz = 20 ounces (includes packaging)
      mass_unit: 'oz'
    };
  }

  // ReFit warehouse address
  static getWarehouseAddress() {
    return {
      name: 'Shop Refit, LLC',
      company: 'Shop Refit',
      street1: '4931 Anclote Dr',
      city: 'Johns Creek',
      state: 'GA',
      zip: '30022',
      country: 'US',
      phone: '470-555-0100',
      email: 'warehouse@shoprefit.com'
    };
  }
}

// Mock implementation for development
class MockShippingService extends ShippingService {
  async validateAddress(address) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: { ...address, validation_results: { is_valid: true } },
      isValid: true
    };
  }

  async getRates(fromAddress, toAddress, parcel) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      rates: [
        {
          carrier: 'USPS',
          service: 'Priority Mail',
          price: 8.45,
          currency: 'USD',
          estimatedDays: 3,
          rateId: 'rate_' + Math.random().toString(36).substr(2, 9)
        },
        {
          carrier: 'USPS',
          service: 'Priority Mail Express',
          price: 28.75,
          currency: 'USD',
          estimatedDays: 1,
          rateId: 'rate_' + Math.random().toString(36).substr(2, 9)
        },
        {
          carrier: 'FedEx',
          service: '2 Day',
          price: 15.99,
          currency: 'USD',
          estimatedDays: 2,
          rateId: 'rate_' + Math.random().toString(36).substr(2, 9)
        },
        {
          carrier: 'UPS',
          service: 'Ground',
          price: 12.50,
          currency: 'USD',
          estimatedDays: 5,
          rateId: 'rate_' + Math.random().toString(36).substr(2, 9)
        }
      ]
    };
  }

  async purchaseLabel(rateId) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const trackingNumber = '1Z' + Math.random().toString(36).substr(2, 15).toUpperCase();
    
    return {
      success: true,
      label: {
        trackingNumber,
        labelUrl: `https://www.shoprefit.com/labels/${trackingNumber}.pdf`,
        trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`,
        carrier: 'USPS',
        cost: 8.45
      }
    };
  }

  async trackShipment(trackingNumber) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Simulate different tracking statuses based on tracking number
    const statuses = ['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Create events based on status
    const events = {};
    const statusIndex = statuses.indexOf(randomStatus);
    
    for (let i = 0; i <= statusIndex; i++) {
      events[statuses[i]] = new Date(Date.now() - (statusIndex - i) * 24 * 60 * 60 * 1000);
    }
    
    return {
      success: true,
      tracking: {
        status: randomStatus,
        location: 'San Francisco, CA',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        events,
        notes: randomStatus === 'out_for_delivery' 
          ? 'Package is out for delivery today' 
          : randomStatus === 'delivered'
          ? 'Package was left at front door'
          : null
      }
    };
  }
}

// Export service classes instead of instances so consumers can instantiate
export { ShippingService, MockShippingService };

// Default export for backward compatibility
export default MockShippingService;
