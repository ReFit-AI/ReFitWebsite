// User Profile Service - Links wallet addresses to user data
// In production, this would be a backend service with proper database

import { PublicKey } from '@solana/web3.js';

class UserProfileService {
  constructor() {
    // In production, this would be a database
    // For now, using localStorage
    this.storageKey = 'refit_user_profiles';
  }

  // Get all profiles from storage
  _getProfiles() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {};
  }

  // Save profiles to storage
  _saveProfiles(profiles) {
    localStorage.setItem(this.storageKey, JSON.stringify(profiles));
  }

  // Create or update user profile
  async saveProfile(walletAddress, profileData) {
    try {
      const profiles = this._getProfiles();
      
      const profile = {
        walletAddress,
        ...profileData,
        updatedAt: new Date().toISOString(),
        createdAt: profiles[walletAddress]?.createdAt || new Date().toISOString()
      };

      profiles[walletAddress] = profile;
      this._saveProfiles(profiles);

      return { success: true, profile };
    } catch (error) {
      console.error('Save profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user profile by wallet address
  async getProfile(walletAddress) {
    try {
      const profiles = this._getProfiles();
      const profile = profiles[walletAddress];

      if (!profile) {
        return { success: false, error: 'Profile not found' };
      }

      return { success: true, profile };
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Save shipping address for user
  async saveShippingAddress(walletAddress, address, isDefault = false) {
    try {
      const result = await this.getProfile(walletAddress);
      let profile = result.profile || { walletAddress };

      if (!profile.shippingAddresses) {
        profile.shippingAddresses = [];
      }

      // Generate address ID
      const addressId = 'addr_' + Date.now();
      
      // If this is the default address, unset other defaults
      if (isDefault) {
        profile.shippingAddresses.forEach(addr => {
          addr.isDefault = false;
        });
      }

      // Add new address
      profile.shippingAddresses.push({
        id: addressId,
        ...address,
        isDefault,
        createdAt: new Date().toISOString()
      });

      // Save updated profile
      await this.saveProfile(walletAddress, profile);

      return { success: true, addressId };
    } catch (error) {
      console.error('Save shipping address error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's shipping addresses
  async getShippingAddresses(walletAddress) {
    try {
      const result = await this.getProfile(walletAddress);
      
      if (!result.success) {
        return { success: true, addresses: [] };
      }

      const addresses = result.profile.shippingAddresses || [];
      return { success: true, addresses };
    } catch (error) {
      console.error('Get shipping addresses error:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete shipping address
  async deleteShippingAddress(walletAddress, addressId) {
    try {
      const result = await this.getProfile(walletAddress);
      
      if (!result.success || !result.profile.shippingAddresses) {
        return { success: false, error: 'Address not found' };
      }

      result.profile.shippingAddresses = result.profile.shippingAddresses.filter(
        addr => addr.id !== addressId
      );

      await this.saveProfile(walletAddress, result.profile);
      return { success: true };
    } catch (error) {
      console.error('Delete shipping address error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get or create user preferences
  async getPreferences(walletAddress) {
    try {
      const result = await this.getProfile(walletAddress);
      
      const defaultPreferences = {
        notifications: {
          email: true,
          orderUpdates: true,
          priceAlerts: false,
          newsletter: false
        },
        privacy: {
          shareData: false,
          publicProfile: false
        },
        display: {
          currency: 'USD',
          theme: 'dark'
        }
      };

      if (!result.success) {
        return { success: true, preferences: defaultPreferences };
      }

      return { 
        success: true, 
        preferences: result.profile.preferences || defaultPreferences 
      };
    } catch (error) {
      console.error('Get preferences error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user preferences
  async updatePreferences(walletAddress, preferences) {
    try {
      const result = await this.getProfile(walletAddress);
      let profile = result.profile || { walletAddress };

      profile.preferences = {
        ...profile.preferences,
        ...preferences
      };

      await this.saveProfile(walletAddress, profile);
      return { success: true, preferences: profile.preferences };
    } catch (error) {
      console.error('Update preferences error:', error);
      return { success: false, error: error.message };
    }
  }

  // Link email to wallet for notifications
  async linkEmail(walletAddress, email) {
    try {
      const result = await this.getProfile(walletAddress);
      let profile = result.profile || { walletAddress };

      profile.email = email;
      profile.emailVerified = false; // Would trigger verification in production

      await this.saveProfile(walletAddress, profile);
      return { success: true };
    } catch (error) {
      console.error('Link email error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get order history for user
  async getOrderHistory(walletAddress) {
    try {
      // In production, this would query the blockchain and backend
      const orders = JSON.parse(localStorage.getItem(`refit_orders_${walletAddress}`) || '[]');
      
      return { 
        success: true, 
        orders: orders.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
      };
    } catch (error) {
      console.error('Get order history error:', error);
      return { success: false, error: error.message };
    }
  }

  // Save order to history
  async saveOrder(walletAddress, orderData) {
    try {
      const orders = JSON.parse(localStorage.getItem(`refit_orders_${walletAddress}`) || '[]');
      
      const order = {
        id: 'order_' + Date.now(),
        walletAddress,
        ...orderData,
        createdAt: new Date().toISOString()
      };

      orders.push(order);
      localStorage.setItem(`refit_orders_${walletAddress}`, JSON.stringify(orders));

      return { success: true, order };
    } catch (error) {
      console.error('Save order error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user has completed profile
  async isProfileComplete(walletAddress) {
    try {
      const result = await this.getProfile(walletAddress);
      
      if (!result.success) {
        return { success: true, isComplete: false };
      }

      const profile = result.profile;
      const hasShippingAddress = profile.shippingAddresses?.length > 0;
      const hasEmail = !!profile.email;

      return {
        success: true,
        isComplete: hasShippingAddress && hasEmail,
        missing: {
          shippingAddress: !hasShippingAddress,
          email: !hasEmail
        }
      };
    } catch (error) {
      console.error('Check profile complete error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export default new UserProfileService();
