// Production User Profile Service with Supabase
import { supabase } from '../lib/supabase';
import { linkWalletWithFallback } from '../lib/auth-helper';

class ProductionUserProfileService {
  constructor() {
    this.currentUser = null;
  }

  // Helper method to get current user ID
  async getCurrentUserId() {
    // First try to use the currentUser from initialization
    if (this.currentUser && this.currentUser.id) {
      return this.currentUser.id;
    }
    
    // Fall back to Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    return user.id;
  }

  // Initialize user profile when wallet connects
  async initializeProfile(walletAddress) {
    try {
      // Use the new auth helper with fallback
      const result = await linkWalletWithFallback(walletAddress);
      
      if (!result || !result.user) {
        throw new Error('Failed to link wallet');
      }
      
      const { user, isNew } = result;
      
      // Get full user profile if we have a real user ID
      if (user.id && !user.id.startsWith('mock-')) {
        const profile = await this.getProfile(user.id);
        if (profile) {
          this.currentUser = profile;
        } else {
          // If profile fetch fails, use basic user data
          this.currentUser = {
            id: user.id,
            wallet_address: walletAddress,
            email: user.email || `${walletAddress}@shoprefit.com`,
            created_at: new Date().toISOString(),
          };
        }
      } else {
        // Use mock user data
        this.currentUser = {
          id: user.id,
          wallet_address: walletAddress,
          email: user.email || `${walletAddress}@shoprefit.com`,
          created_at: new Date().toISOString(),
        };
      }
      
      return {
        success: true,
        user: this.currentUser,
        isNew
      };
    } catch (error) {
      console.error('Initialize profile error:', process.env.NODE_ENV === 'development' ? error : error.message);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock user profile due to error');
        this.currentUser = {
          id: `mock-${walletAddress}`,
          wallet_address: walletAddress,
          email: `${walletAddress}@shoprefit.com`,
          created_at: new Date().toISOString(),
        };
        
        return {
          success: true,
          user: this.currentUser,
          isNew: true,
        };
      }
      
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
          email: `${walletAddress}@shoprefit.com`,
          password: walletAddress,
        });
        
        if (error && error.message.includes('Invalid login')) {
          // User exists but auth doesn't, create auth
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: `${walletAddress}@shoprefit.com`,
            password: walletAddress,
            options: {
              data: {
                wallet_address: walletAddress,
              },
              emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback`,
            },
          });
          
          if (signUpError) throw signUpError;
          return { user: authData.user, isNew: false };
        }
        
        if (error) throw error;
        return { user: data.user, isNew: false };
      }

      // Create new user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: `${walletAddress}@shoprefit.com`,
        password: walletAddress,
        options: {
          data: {
            wallet_address: walletAddress,
          },
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback`,
        },
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
      console.error('Error linking wallet:', process.env.NODE_ENV === 'development' ? error : error.message);
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

      if (error) {
        // Handle case where user doesn't exist yet
        if (error.code === 'PGRST116') {
          if (process.env.NODE_ENV === 'development') {
            console.log('User profile not found in database, will use auth user data');
          }
          return null;
        }
        throw error;
      }

      return user;
    } catch (error) {
      // Only log error if it's not from a liquidity pool page
      const isLPPage = typeof window !== 'undefined' &&
        (window.location.pathname.includes('/stake') ||
         window.location.pathname.includes('/admin') ||
         window.location.pathname.includes('/dashboard') ||
         window.location.pathname.includes('/stats'));

      if (!isLPPage && process.env.NODE_ENV === 'development') {
        // Only log if there's actual error content
        const hasError = error?.message || error?.code || error?.details;
        if (hasError) {
          console.error('Get profile error:', {
            message: error?.message || 'Unknown error',
            code: error?.code,
            details: error?.details,
            hint: error?.hint
          });
        }
      }
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
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
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get addresses error:', process.env.NODE_ENV === 'development' ? error : error.message);
      return [];
    }
  }

  // Add shipping address
  async addShippingAddress(address) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      const userId = await this.getCurrentUserId();

      // If marking as default, unset other defaults
      if (address.is_default) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .insert({
          ...address,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, address: data };
    } catch (error) {
      console.error('Add address error:', process.env.NODE_ENV === 'development' ? error : error.message);
      return { success: false, error: error.message };
    }
  }

  // Update shipping address
  async updateShippingAddress(addressId, updates) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      const userId = await this.getCurrentUserId();

      // If marking as default, unset other defaults
      if (updates.is_default) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .update(updates)
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, address: data };
    } catch (error) {
      console.error('Update address error:', process.env.NODE_ENV === 'development' ? error : error.message);
      return { success: false, error: error.message };
    }
  }

  // Delete shipping address
  async deleteShippingAddress(addressId) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      const userId = await this.getCurrentUserId();

      const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Delete address error:', process.env.NODE_ENV === 'development' ? error : error.message);
      return { success: false, error: error.message };
    }
  }

  // Get orders
  async getOrders() {
    if (!supabase) return [];
    
    try {
      const userId = await this.getCurrentUserId();

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
        .eq('user_id', userId)
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
      const userId = await this.getCurrentUserId();

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
        .eq('user_id', userId)
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
      const userId = await this.getCurrentUserId();

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
        .eq('user_id', userId)
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

  // Get order history for user
  async getOrderHistory(walletAddress) {
    if (!supabase) return { success: false, orders: [] };
    
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: true, orders: [] };
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { 
        success: true, 
        orders: orders || []
      };
    } catch (error) {
      console.error('Get order history error:', error);
      return { success: false, orders: [] };
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
