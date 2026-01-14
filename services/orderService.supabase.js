/**
 * Order Service - Supabase Implementation
 * Production-ready order management with real database
 */

import { supabase } from '@/lib/supabase';
import orderServiceLocal from './orderService'; // Fallback to localStorage
import { verifyQuoteComplete } from '@/lib/quote-signing';

class OrderServiceSupabase {
  constructor() {
    this.useSupabase = !!supabase;
  }

  /**
   * Create a new order
   */
  async createOrder({
    walletAddress,
    phoneData,
    priceQuote,
    shippingAddress,
    shippingRate,
    shippingLabel
  }) {
    // Fallback to localStorage if Supabase not configured
    if (!this.useSupabase) {
      return orderServiceLocal.createOrder(arguments[0]);
    }

    try {
      // SECURITY: Verify quote signature if present
      if (priceQuote.signature) {
        const quoteData = {
          quoteId: priceQuote.quoteId,
          modelId: phoneData.model?.toLowerCase().replace(/\s+/g, '-') || '',
          storage: phoneData.storage,
          carrier: phoneData.carrier,
          condition: phoneData.condition,
          usdPrice: priceQuote.usdPrice,
          solPrice: priceQuote.solPrice,
          expiresAt: priceQuote.expiresAt
        };

        const verification = verifyQuoteComplete(quoteData, priceQuote.signature);
        if (!verification.valid) {
          console.error('Quote verification failed:', verification.error);
          throw new Error(verification.error || 'Invalid or expired quote');
        }
      }

      // First, ensure profile exists
      const profile = await this.ensureProfile(walletAddress);
      if (!profile) {
        throw new Error('Failed to create/get profile');
      }

      // Generate order ID
      const orderId = this.generateOrderId();
      
      // Create order object
      const orderData = {
        id: orderId,
        profile_id: profile.id,
        wallet_address: walletAddress,
        
        // Device information
        device_brand: phoneData.brand,
        device_model: phoneData.model,
        device_storage: phoneData.storage,
        device_carrier: phoneData.carrier,
        device_condition: phoneData.condition,
        device_category: phoneData.category,
        device_issues: phoneData.issues || [],
        
        // Pricing
        quote_usd: priceQuote.usdPrice,
        quote_sol: priceQuote.solPrice,
        price_breakdown: priceQuote.breakdown,
        
        // Shipping
        shipping_address: shippingAddress,
        shipping_rate: shippingRate,
        shipping_label: shippingLabel,
        tracking_number: shippingLabel?.trackingNumber,
        carrier: shippingLabel?.carrier,
        label_url: shippingLabel?.labelUrl,
        
        // Status
        status: 'pending_shipment',
        status_history: [{
          status: 'created',
          timestamp: new Date().toISOString(),
          notes: 'Order created, shipping label generated'
        }],
        
        // Payment
        payment_status: 'pending',
        payment_method: 'SOL',
        payment_amount: priceQuote.solPrice
      };
      
      // Insert into database
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      return {
        success: true,
        order: data,
        orderId: data.id
      };
    } catch (error) {
      console.error('Create order error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Ensure profile exists for wallet address
   */
  async ensureProfile(walletAddress) {
    try {
      // Check if profile exists
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ wallet_address: walletAddress }])
          .select()
          .single();
        
        if (createError) {
          console.error('Create profile error:', createError);
          return null;
        }
        
        profile = newProfile;
      } else if (error) {
        console.error('Get profile error:', error);
        return null;
      }
      
      return profile;
    } catch (error) {
      console.error('Ensure profile error:', error);
      return null;
    }
  }
  
  /**
   * Get orders by wallet address
   */
  async getOrdersByWallet(walletAddress) {
    if (!this.useSupabase) {
      return orderServiceLocal.getOrdersByWallet(walletAddress);
    }

    // If Supabase is not properly initialized, fallback to local
    if (!supabase) {
      console.warn('Supabase client not initialized, using local storage');
      return orderServiceLocal.getOrdersByWallet(walletAddress);
    }

    try {
      // Ensure wallet context is set
      if (supabase.rest?.headers) {
        supabase.rest.headers['X-Wallet-Address'] = walletAddress;
      }
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false });
      
      if (error) {
        // Check if it's a network error or RLS error
        if (error.message?.includes('Failed to fetch') || error.code === 'PGRST301') {
          console.warn('Orders fetch failed, likely RLS or network issue:', error.message);
          // Return empty orders instead of throwing
          return {
            success: true,
            orders: []
          };
        }
        
        console.error('Get orders error:', error.message || 'Unknown error', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        // Return empty orders on error instead of throwing
        return {
          success: true,
          orders: []
        };
      }
      
      return {
        success: true,
        orders: orders || []
      };
    } catch (error) {
      // Handle network errors gracefully
      if (error.message?.includes('Failed to fetch')) {
        console.warn('Network error fetching orders, returning empty array');
        return {
          success: true,
          orders: []
        };
      }
      
      console.error('Get orders by wallet error:', error.message || 'Unknown error', {
        message: error.message,
        code: error.code,
        details: error.details,
        walletAddress
      });
      
      // Always return orders array to prevent UI errors
      return {
        success: true,
        orders: []
      };
    }
  }
  
  /**
   * Get order by ID
   */
  async getOrder(orderId) {
    if (!this.useSupabase) {
      return orderServiceLocal.getOrder(orderId);
    }

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) {
        console.error('Get order error:', error);
        return null;
      }
      
      return order;
    } catch (error) {
      console.error('Get order error:', error);
      return null;
    }
  }
  
  /**
   * Update order status
   */
  async updateOrderStatus(orderId, newStatus, notes = '') {
    if (!this.useSupabase) {
      return orderServiceLocal.updateOrderStatus(orderId, newStatus, notes);
    }

    try {
      // Get current order to update status history
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Add to status history
      const statusHistory = order.status_history || [];
      statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        notes
      });
      
      // Update order
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          status_history: statusHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) {
        console.error('Update order status error:', error);
        throw error;
      }
      
      return {
        success: true,
        order: data
      };
    } catch (error) {
      console.error('Update order status error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId, txHash, amount) {
    if (!this.useSupabase) {
      return orderServiceLocal.updatePaymentStatus(orderId, txHash, amount);
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          payment_tx_hash: txHash,
          payment_amount: amount,
          payment_date: new Date().toISOString(),
          status: 'payment_complete',
          completed_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) {
        console.error('Update payment status error:', error);
        throw error;
      }
      
      return {
        success: true,
        order: data
      };
    } catch (error) {
      console.error('Update payment status error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get order statistics
   */
  async getOrderStats(walletAddress) {
    if (!this.useSupabase) {
      return orderServiceLocal.getOrderStats(walletAddress);
    }

    try {
      // Get profile with stats
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // Get order counts by status
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('status, quote_usd, payment_amount')
        .eq('wallet_address', walletAddress);
      
      if (ordersError) {
        throw ordersError;
      }
      
      const stats = {
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter(o => o.status === 'pending_shipment').length || 0,
        shippedOrders: orders?.filter(o => o.status === 'shipped').length || 0,
        completedOrders: orders?.filter(o => o.status === 'payment_complete').length || 0,
        totalEarnings: profile?.total_earned_usd || 0,
        totalSolEarned: profile?.total_earned_sol || 0
      };
      
      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Get order stats error:', error);
      return {
        success: false,
        stats: null
      };
    }
  }
  
  /**
   * Generate unique order ID
   */
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }
}

// Export singleton instance
const orderServiceSupabase = new OrderServiceSupabase();
export default orderServiceSupabase;