// Production User Profile Service with Supabase
import { supabase } from '../lib/supabase';
import { linkWalletWithFallback } from '../lib/auth-helper';

const normalizeAddressForDb = (address = {}) => {
  const isDefault = address.is_default ?? address.isDefault ?? false;

  return {
    name: address.name?.trim() || null,
    street1: address.street1?.trim() || null,
    street2: address.street2?.trim() || '',
    city: address.city?.trim() || null,
    state: address.state || null,
    zip: address.zip?.toString().trim() || null,
    country: address.country || 'US',
    phone: address.phone?.trim() || null,
    email: address.email?.trim() || null,
    is_default: isDefault,
  };
};

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return user.id;
      }
    } catch (authError) {
      console.log('Auth user not found, trying wallet context');
    }
    
    // Check if we have a wallet address in context
    const walletAddress = supabase?.rest?.headers?.['X-Wallet-Address'];
    if (walletAddress) {
      try {
        // Try to get profile by wallet address
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('wallet_address', walletAddress);
        
        const profile = profiles && profiles.length > 0 ? profiles[0] : null;
        
        if (!error && profile) {
          return profile.id;
        }
      } catch (profileError) {
        console.log('Profile not found for wallet:', walletAddress);
      }
    }
    
    throw new Error('Not authenticated - no user ID available');
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
      
      // Ensure profile exists in profiles table
      if (user.id && !user.id.startsWith('mock-')) {
        // First check if profile exists (use maybeSingle to avoid 406 errors)
        const { data: existingProfiles, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('wallet_address', walletAddress);
        
        const existingProfile = existingProfiles && existingProfiles.length > 0 ? existingProfiles[0] : null;
        
        if (!existingProfile && !fetchError) {
          // Profile doesn't exist, create it
          // First, try without specifying ID (let database generate it)
          let profileData = {
            wallet_address: walletAddress,
            email: user.email || `${walletAddress.toLowerCase()}@shoprefit.com`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          let { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single();
          
          // If that fails with a constraint error, try to fetch existing
          if (createError && (createError.code === '23505' || createError.message?.includes('duplicate key'))) {
            // Unique constraint violation - profile already exists, fetch it
            const { data: retryProfiles, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('wallet_address', walletAddress);
            
            const retryProfile = retryProfiles && retryProfiles.length > 0 ? retryProfiles[0] : null;
            
            if (!retryError && retryProfile) {
              newProfile = retryProfile;
              createError = null;
              console.log('Profile already exists, using existing:', retryProfile.id);
            }
          } else if (createError && createError.code === '23502' && user.id && user.id.length === 36) {
            // Not-null constraint - ID might be required
            profileData.id = user.id;
            const { data: retryProfile, error: retryError } = await supabase
              .from('profiles')
              .insert(profileData)
              .select()
              .single();
            
            if (!retryError) {
              newProfile = retryProfile;
              createError = null;
            } else {
              createError = retryError;
            }
          }
          
          if (createError) {
            console.error('Failed to create profile:', 
              createError.message || 'Unknown error',
              {
                message: createError.message,
                code: createError.code,
                details: createError.details,
                hint: createError.hint,
                walletAddress,
                userId: user.id,
                fullError: JSON.stringify(createError)
              });
            // Continue anyway with basic user data
            this.currentUser = {
              id: user.id,
              wallet_address: walletAddress,
              email: user.email || `${walletAddress.toLowerCase()}@shoprefit.com`,
              created_at: new Date().toISOString(),
            };
          } else {
            this.currentUser = newProfile;
          }
        } else if (existingProfile) {
          // Profile exists, use it
          this.currentUser = existingProfile;
        }
        
        // Fallback to basic user data if no profile
        if (!this.currentUser) {
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
      
      // Set the wallet context for RLS
      if (supabase) {
        // Set config for RLS policies
        try {
          const { error: rpcError } = await supabase.rpc('set_wallet_context', { 
            wallet_address: walletAddress 
          });
          
          if (rpcError) {
            // RPC might not exist yet, that's OK
            console.log('set_wallet_context not available:', rpcError.message || 'RPC function not found');
          }
        } catch (err) {
          // RPC call failed, that's OK for now
          console.log('set_wallet_context error:', err.message || 'RPC not configured');
        }
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

  // Link wallet to Supabase user (legacy method - deprecated)
  async linkWalletToUser(walletAddress) {
    // This method is deprecated - just return a mock user
    // The real authentication happens via linkWalletWithFallback
    return {
      user: {
        id: `wallet-${walletAddress}`,
        email: `${walletAddress.toLowerCase()}@shoprefit.com`,
        user_metadata: { wallet_address: walletAddress }
      },
      isNew: false
    };
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
      // Silently handle table not existing (users table is optional)
      if (error?.code === '42P01' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
        return null;
      }

      // Only log error if it's not from a liquidity pool page
      const isLPPage = typeof window !== 'undefined' &&
        (window.location.pathname.includes('/stake') ||
         window.location.pathname.includes('/admin') ||
         window.location.pathname.includes('/dashboard') ||
         window.location.pathname.includes('/stats'));

      // Only log real errors in development
      if (!isLPPage && process.env.NODE_ENV === 'development') {
        const hasError = error?.message || error?.code || error?.details;
        if (hasError) {
          console.warn('Profile fetch failed (non-critical):', error?.message || error?.code);
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
      if (!userId) return [];

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      // Don't log authentication errors - it's expected when wallet-only
      if (error.message === 'Not authenticated') {
        return [];
      }
      if (process.env.NODE_ENV === 'development') {
        console.warn('Get addresses error:', error.message || error);
      }
      return [];
    }
  }

  // Add shipping address
  async addShippingAddress(address) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      const userId = await this.getCurrentUserId();
      const normalized = normalizeAddressForDb(address);

      // If marking as default, unset other defaults
      if (normalized.is_default) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .insert({
          ...normalized,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, address: data };
    } catch (error) {
      console.error('Add address error:', error.message || 'Unknown error', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return { success: false, error: error.message || 'Failed to add address' };
    }
  }

  // Update shipping address
  async updateShippingAddress(addressId, updates) {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    
    try {
      const userId = await this.getCurrentUserId();
      const normalized = normalizeAddressForDb(updates);
      const updatePayload = Object.fromEntries(
        Object.entries(normalized).filter(([key]) => {
          const camelKey = key === 'is_default' ? 'isDefault' : key;
          return Object.prototype.hasOwnProperty.call(updates, key) ||
                 Object.prototype.hasOwnProperty.call(updates, camelKey);
        })
      );

      // If marking as default, unset other defaults
      if (updatePayload.is_default) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .update(updatePayload)
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
