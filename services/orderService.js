/**
 * Order Service - Manages order creation, tracking, and lifecycle
 * Integrates with user profiles and wallet addresses
 */

import { getUserProfileService } from '@/services';

class OrderService {
  constructor() {
    this.storageKey = 'refit_orders';
  }

  /**
   * Create a new order with all necessary tracking data
   */
  async createOrder({
    walletAddress,
    phoneData,
    priceQuote,
    shippingAddress,
    shippingRate,
    shippingLabel
  }) {
    try {
      // Generate unique order ID
      const orderId = this.generateOrderId();
      
      // Create order object with all tracking info
      const order = {
        id: orderId,
        walletAddress,
        
        // Device information
        device: {
          brand: phoneData.brand,
          model: phoneData.model,
          storage: phoneData.storage,
          carrier: phoneData.carrier,
          condition: phoneData.condition,
          issues: phoneData.issues || [],
          category: phoneData.category
        },
        
        // Pricing information
        pricing: {
          usdPrice: priceQuote.usdPrice,
          solPrice: priceQuote.solPrice,
          breakdown: priceQuote.breakdown
        },
        
        // Shipping information
        shipping: {
          address: shippingAddress,
          rate: shippingRate,
          label: shippingLabel,
          trackingNumber: shippingLabel?.trackingNumber,
          carrier: shippingLabel?.carrier,
          labelUrl: shippingLabel?.labelUrl
        },
        
        // Order status tracking
        status: 'pending_shipment',
        statusHistory: [{
          status: 'created',
          timestamp: new Date().toISOString(),
          notes: 'Order created, shipping label generated'
        }],
        
        // Timestamps
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Payment tracking (to be updated when payment is made)
        payment: {
          status: 'pending',
          method: 'SOL',
          amount: priceQuote.solPrice,
          txHash: null,
          paidAt: null
        }
      };
      
      // Save to localStorage (in production, this would be a database)
      await this.saveOrderToStorage(order);
      
      // Also save to user profile for quick access
      const userProfileService = getUserProfileService();
      await userProfileService.saveOrder(walletAddress, order);
      
      return {
        success: true,
        order,
        orderId
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
   * Update order status
   */
  async updateOrderStatus(orderId, newStatus, notes = '') {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Update status
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      
      // Add to status history
      order.statusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        notes
      });
      
      // Save updated order
      await this.saveOrderToStorage(order);
      
      return {
        success: true,
        order
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
   * Get order by ID
   */
  async getOrder(orderId) {
    try {
      const orders = this.getAllOrdersFromStorage();
      return orders[orderId] || null;
    } catch (error) {
      console.error('Get order error:', error);
      return null;
    }
  }
  
  /**
   * Get all orders for a wallet address
   */
  async getOrdersByWallet(walletAddress) {
    try {
      const orders = this.getAllOrdersFromStorage();
      const walletOrders = Object.values(orders).filter(
        order => order.walletAddress === walletAddress
      );
      
      // Sort by creation date, newest first
      walletOrders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      return {
        success: true,
        orders: walletOrders
      };
    } catch (error) {
      console.error('Get orders by wallet error:', error);
      return {
        success: false,
        error: error.message,
        orders: []
      };
    }
  }
  
  /**
   * Update payment information when SOL is sent
   */
  async updatePaymentStatus(orderId, txHash, amount) {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Update payment info
      order.payment = {
        status: 'completed',
        method: 'SOL',
        amount,
        txHash,
        paidAt: new Date().toISOString()
      };
      
      // Update order status
      order.status = 'payment_complete';
      order.updatedAt = new Date().toISOString();
      
      // Add to status history
      order.statusHistory.push({
        status: 'payment_complete',
        timestamp: new Date().toISOString(),
        notes: `Payment of ${amount} SOL received. TX: ${txHash}`
      });
      
      // Save updated order
      await this.saveOrderToStorage(order);
      
      return {
        success: true,
        order
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
   * Generate unique order ID
   */
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }
  
  /**
   * Storage helpers (in production, these would be database operations)
   */
  getAllOrdersFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Get orders from storage error:', error);
      return {};
    }
  }
  
  async saveOrderToStorage(order) {
    try {
      const orders = this.getAllOrdersFromStorage();
      orders[order.id] = order;
      localStorage.setItem(this.storageKey, JSON.stringify(orders));
      return true;
    } catch (error) {
      console.error('Save order to storage error:', error);
      return false;
    }
  }
  
  /**
   * Get order statistics for a wallet
   */
  async getOrderStats(walletAddress) {
    try {
      const result = await this.getOrdersByWallet(walletAddress);
      if (!result.success) {
        return {
          success: false,
          stats: null
        };
      }
      
      const orders = result.orders;
      
      const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending_shipment').length,
        shippedOrders: orders.filter(o => o.status === 'shipped').length,
        completedOrders: orders.filter(o => o.status === 'payment_complete').length,
        totalEarnings: orders
          .filter(o => o.payment?.status === 'completed')
          .reduce((sum, o) => sum + (o.pricing?.usdPrice || 0), 0),
        totalSolEarned: orders
          .filter(o => o.payment?.status === 'completed')
          .reduce((sum, o) => sum + (o.payment?.amount || 0), 0)
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
}

// Export singleton instance
const orderService = new OrderService();
export default orderService;