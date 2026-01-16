// Production Shipping Service with Shippo Integration
import { Shippo } from 'shippo';
import { supabase } from '../lib/supabase';

const shippo = new Shippo(process.env.SHIPPO_API_KEY || '');

class ProductionShippingService {
  constructor() {
    this.shippo = shippo;
  }

  // Validate an address
  async validateAddress(address) {
    try {
      const validation = await this.shippo.address.create({
        name: address.name,
        street1: address.street1,
        street2: address.street2 || '',
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country || 'US',
        phone: address.phone || '',
        validate: true,
        async: false
      });

      // Store validation result in database
      if (address.id) {
        await supabase
          .from('shipping_addresses')
          .update({
            is_validated: validation.validation_results.is_valid,
            validation_data: validation.validation_results
          })
          .eq('id', address.id);
      }

      return {
        success: validation.validation_results.is_valid,
        address: {
          ...address,
          street1: validation.street1,
          city: validation.city,
          state: validation.state,
          zip: validation.zip,
        },
        messages: validation.validation_results.messages || []
      };
    } catch (error) {
      console.error('Address validation error:', error);
      return { 
        success: false, 
        error: error.message,
        messages: ['Failed to validate address']
      };
    }
  }

  // Get shipping rates for a package
  async getRates(fromAddressId, toAddress) {
    try {
      // Get warehouse address from database or use default
      const { data: warehouse } = await supabase
        .from('warehouse_addresses')
        .select('*')
        .eq('is_active', true)
        .single();

      const fromAddress = warehouse || this.getDefaultWarehouseAddress();

      // Create shipment
      const shipment = await this.shippo.shipment.create({
        address_from: {
          name: fromAddress.name,
          street1: fromAddress.street1,
          city: fromAddress.city,
          state: fromAddress.state,
          zip: fromAddress.zip,
          country: 'US',
          phone: fromAddress.phone
        },
        address_to: {
          name: toAddress.name,
          street1: toAddress.street1,
          street2: toAddress.street2 || '',
          city: toAddress.city,
          state: toAddress.state,
          zip: toAddress.zip,
          country: toAddress.country || 'US',
          phone: toAddress.phone || ''
        },
        parcels: [this.getPhoneParcel()],
        async: false
      });

      // Filter and format rates
      const rates = shipment.rates
        .filter(rate => rate.amount && rate.servicelevel)
        .map(rate => ({
          carrier: rate.provider,
          service: rate.servicelevel.name,
          price: parseFloat(rate.amount),
          currency: rate.currency,
          estimatedDays: rate.estimated_days || rate.days || 5,
          rateId: rate.object_id,
          attributes: rate.attributes || []
        }))
        .sort((a, b) => a.price - b.price);

      return {
        success: true,
        rates
      };
    } catch (error) {
      console.error('Get rates error:', error);
      return { 
        success: false, 
        error: error.message,
        rates: []
      };
    }
  }

  // Purchase a shipping label
  async purchaseLabel(orderId, rateId) {
    try {
      // Get order details
      const { data: order } = await supabase
        .from('orders')
        .select('*, shipping_addresses(*)')
        .eq('id', orderId)
        .single();

      if (!order) {
        throw new Error('Order not found');
      }

      // Create transaction
      const transaction = await this.shippo.transaction.create({
        rate: rateId,
        label_file_type: 'PDF',
        async: false
      });

      if (transaction.status !== 'SUCCESS') {
        throw new Error(transaction.messages?.join(', ') || 'Label purchase failed');
      }

      // Update order with shipping info
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'awaiting_shipment',
          tracking_number: transaction.tracking_number,
          label_url: transaction.label_url,
          shipping_carrier: transaction.carrier_account,
          shipping_cost: parseFloat(transaction.rate),
          shipped_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Add to status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          status: 'awaiting_shipment',
          notes: `Shipping label created. Tracking: ${transaction.tracking_number}`,
          metadata: {
            carrier: transaction.carrier_account,
            tracking_number: transaction.tracking_number,
            label_url: transaction.label_url
          }
        });

      return {
        success: true,
        label: {
          trackingNumber: transaction.tracking_number,
          labelUrl: transaction.label_url,
          trackingUrl: transaction.tracking_url_provider,
          carrier: transaction.carrier_account,
          cost: transaction.rate
        }
      };
    } catch (error) {
      console.error('Purchase label error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Track a shipment
  async trackShipment(trackingNumber) {
    try {
      // Get carrier from order
      const { data: order } = await supabase
        .from('orders')
        .select('shipping_carrier')
        .eq('tracking_number', trackingNumber)
        .single();

      const carrier = order?.shipping_carrier || 'shippo';

      // Get tracking info from Shippo
      const tracking = await this.shippo.track.get_status(carrier, trackingNumber);

      // Map Shippo status to our status
      const statusMap = {
        'PRE_TRANSIT': 'created',
        'TRANSIT': 'in_transit',
        'DELIVERED': 'delivered',
        'RETURNED': 'returned',
        'FAILURE': 'failed'
      };

      const status = statusMap[tracking.tracking_status?.status] || 'unknown';

      // Get events from database (updated by webhooks)
      const { data: events } = await supabase
        .from('shipping_events')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .order('occurred_at', { ascending: false });

      // Format events for UI
      const formattedEvents = {};
      const eventTypeMap = {
        'label_created': 'created',
        'picked_up': 'picked_up',
        'in_transit': 'in_transit',
        'out_for_delivery': 'out_for_delivery',
        'delivered': 'delivered'
      };

      events?.forEach(event => {
        const eventType = eventTypeMap[event.event_type];
        if (eventType && !formattedEvents[eventType]) {
          formattedEvents[eventType] = new Date(event.occurred_at);
        }
      });

      return {
        success: true,
        tracking: {
          status,
          location: tracking.location?.city ? 
            `${tracking.location.city}, ${tracking.location.state}` : 
            'Unknown',
          estimatedDelivery: tracking.eta,
          events: formattedEvents,
          notes: tracking.tracking_status?.status_details || null
        }
      };
    } catch (error) {
      console.error('Tracking error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Standard parcel size for phones
  getPhoneParcel() {
    return {
      length: '7',
      width: '4',
      height: '2',
      distance_unit: 'in',
      weight: '1',
      mass_unit: 'lb'
    };
  }

  // Default warehouse address
  getDefaultWarehouseAddress() {
    return {
      name: 'ShopRefit',
      street1: '10945 State Bridge RD',
      street2: '401-257',
      city: 'Alpharetta',
      state: 'GA',
      zip: '30022',
      country: 'US',
      phone: '470-555-0100'
    };
  }

  // Handle Shippo webhooks
  async handleWebhook(event, signature) {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(event, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const data = JSON.parse(event);

      // Store shipping event
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('tracking_number', data.tracking_number)
        .single();

      if (order) {
        await supabase
          .from('shipping_events')
          .insert({
            order_id: order.id,
            tracking_number: data.tracking_number,
            event_type: data.event,
            carrier_status: data.tracking_status?.status,
            location: data.location ? 
              `${data.location.city}, ${data.location.state}` : null,
            description: data.tracking_status?.status_details,
            raw_data: data,
            occurred_at: data.occurred_at || new Date().toISOString()
          });

        // Update order status if delivered
        if (data.tracking_status?.status === 'DELIVERED') {
          await supabase
            .from('orders')
            .update({
              status: 'received',
              received_at: new Date().toISOString()
            })
            .eq('id', order.id);

          await supabase
            .from('order_status_history')
            .insert({
              order_id: order.id,
              status: 'received',
              notes: 'Package delivered successfully'
            });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    // Implement Shippo webhook signature verification
    // https://goshippo.com/docs/webhooks/#webhook-signature-verification
    const crypto = require('crypto');
    const webhookSecret = process.env.SHIPPO_WEBHOOK_SECRET;
    
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');
    
    return calculatedSignature === signature;
  }
}

export default ProductionShippingService;
