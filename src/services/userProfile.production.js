// Production User Profile Service with Supabase
import { supabase } from '../lib/supabase';

class ProductionUserProfileService {
  constructor() {
    this.currentUser = null;
  }

  // Initialize user profile when wallet connects
  async initializeProfile(walletAddress) {
    if (!supabase) {
      console.warn('Supabase not configured, using mock service');
      return {
        success: false,
        error: 'Supabase not configured'
      };
    }

    try {
      // Link wallet to Supabase user
      const { user, isNew } = await this.linkWalletToUser(walletAddress);
      
      // Get full user profile
      this.currentUser = await this.getProfile(user.id);
      
      return {
        success: true,
        user: this.currentUser,
        isNew
      };
    } catch (error) {
      console.error('Initialize profile error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Link wallet to Supabase user
  async linkWalletToUser(walletAddress) {
    if (!supabase) return null;
    
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingUser) {
        // Sign in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${walletAddress}@refit.io`,
          password: walletAddress,
        });
        
        if (error && error.message.includes('Invalid login')) {
          // User exists but auth doesn't, create auth
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: `${walletAddress}@refit.io`,
            password: walletAddress,
          });
          
          if (signUpError) throw signUpError;
          return { user: authData.user, isNew: false };
        }
        
        if (error) throw error;
        return { user: data.user, isNew: false };
      }

      // Create new user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: `${walletAddress}@refit.io`,
        password: walletAddress,
      });

      if (signUpError) throw signUpError;

      // Create user record
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          wallet_address: walletAddress,
        });

      if (insertError) throw insertError;

      return { user: authData.user, isNew: true };
    } catch (error) {
      console.error('Error linking wallet:', error);
      throw error;
    }
  }

  // Get user profile
  async getProfile(userId) {
    if (!supabase) return null;
    
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return user;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      this.currentUser = data;
      return { success: true, user: data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get shipping addresses
  async getShippingAddresses() {
    if (!supabase) return [];
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get addresses error:', error);
      return [];
    }
  }

  // Add shipping address
  async addShippingAddress(address) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If marking as default, unset other defaults
      if (address.is_default) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .insert({
          ...address,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, address: data };
    } catch (error) {
      console.error('Add address error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update shipping address
  async updateShippingAddress(addressId, updates) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If marking as default, unset other defaults
      if (updates.is_default) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .update(updates)
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, address: data };
    } catch (error) {
      console.error('Update address error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete shipping address
  async deleteShippingAddress(addressId) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Delete address error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get orders
  async getOrders() {
    if (!supabase) return [];
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_addresses (
            name,
            street1,
            street2,
            city,
            state,
            zip
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get orders error:', error);
      return [];
    }
  }

  // Get order by ID
  async getOrder(orderId) {
    if (!supabase) return null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_addresses (*),
          order_status_history (
            status,
            notes,
            created_at
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Get order error:', error);
      return null;
    }
  }

  // Get order tracking
  async getOrderTracking(orderId) {
    if (!supabase) return null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get order and tracking events
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          tracking_number,
          shipping_carrier,
          status,
          shipped_at,
          received_at
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (orderError) throw orderError;

      const { data: events, error: eventsError } = await supabase
        .from('shipping_events')
        .select('*')
        .eq('order_id', orderId)
        .order('occurred_at', { ascending: false });

      if (eventsError) throw eventsError;

      return {
        trackingNumber: order.tracking_number,
        carrier: order.shipping_carrier,
        status: order.status,
        events: events || []
      };
    } catch (error) {
      console.error('Get tracking error:', error);
      return null;
    }
  }

  // Subscribe to order updates
  subscribeToOrderUpdates(orderId, callback) {
    if (!supabase) return null;
    
    const subscription = supabase
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shipping_events',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          callback({ trackingUpdate: payload.new });
        }
      )
      .subscribe();

    return subscription;
  }

  // Unsubscribe from order updates
  unsubscribeFromOrderUpdates(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
  
  // Sign out
  async signOut() {
    if (!supabase) return;
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ProductionUserProfileService;
