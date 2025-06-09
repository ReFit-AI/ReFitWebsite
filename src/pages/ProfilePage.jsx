import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { 
  User, MapPin, Package, Mail, Bell, Shield, 
  Plus, Edit2, Trash2, Check, X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import userProfileService from '../services/userProfile';
import ShippingAddressForm from '../components/ShippingAddressForm';

const ProfilePage = () => {
  const { publicKey, connected } = useWallet();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (connected && publicKey) {
      loadUserData();
    }
  }, [connected, publicKey]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const walletAddress = publicKey.toString();
      
      // Load all user data
      const [profileResult, addressesResult, ordersResult, prefsResult] = await Promise.all([
        userProfileService.getProfile(walletAddress),
        userProfileService.getShippingAddresses(walletAddress),
        userProfileService.getOrderHistory(walletAddress),
        userProfileService.getPreferences(walletAddress)
      ]);

      setProfile(profileResult.profile || { walletAddress });
      setAddresses(addressesResult.addresses || []);
      setOrders(ordersResult.orders || []);
      setPreferences(prefsResult.preferences);
    } catch (error) {
      console.error('Load user data error:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (addressData) => {
    try {
      const walletAddress = publicKey.toString();
      
      if (editingAddress) {
        // Update existing address
        const updatedAddresses = addresses.map(addr => 
          addr.id === editingAddress.id ? { ...addr, ...addressData } : addr
        );
        setAddresses(updatedAddresses);
        
        // Save to profile
        await userProfileService.saveProfile(walletAddress, {
          ...profile,
          shippingAddresses: updatedAddresses
        });
        
        toast.success('Address updated successfully');
      } else {
        // Add new address
        const result = await userProfileService.saveShippingAddress(
          walletAddress,
          addressData,
          addressData.isDefault
        );
        
        if (result.success) {
          await loadUserData(); // Reload to get updated addresses
          toast.success('Address added successfully');
        }
      }
      
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Save address error:', error);
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const walletAddress = publicKey.toString();
      const result = await userProfileService.deleteShippingAddress(walletAddress, addressId);
      
      if (result.success) {
        setAddresses(addresses.filter(addr => addr.id !== addressId));
        toast.success('Address deleted');
      }
    } catch (error) {
      console.error('Delete address error:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleUpdatePreferences = async (key, value) => {
    try {
      const walletAddress = publicKey.toString();
      const updatedPrefs = {
        ...preferences,
        [key]: { ...preferences[key], ...value }
      };
      
      const result = await userProfileService.updatePreferences(walletAddress, updatedPrefs);
      
      if (result.success) {
        setPreferences(updatedPrefs);
        toast.success('Preferences updated');
      }
    } catch (error) {
      console.error('Update preferences error:', error);
      toast.error('Failed to update preferences');
    }
  };

  const handleLinkEmail = async () => {
    const email = prompt('Enter your email address:');
    if (!email) return;
    
    try {
      const walletAddress = publicKey.toString();
      const result = await userProfileService.linkEmail(walletAddress, email);
      
      if (result.success) {
        await loadUserData();
        toast.success('Email linked successfully');
      }
    } catch (error) {
      console.error('Link email error:', error);
      toast.error('Failed to link email');
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account settings and shipping addresses</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'addresses', label: 'Addresses', icon: MapPin },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'preferences', label: 'Preferences', icon: Bell }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Wallet Info */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold mb-4">Wallet Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Wallet Address</label>
                    <p className="font-mono text-sm">{publicKey.toString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Member Since</label>
                    <p>{new Date(profile?.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Address
                </h3>
                {profile?.email ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p>{profile.email}</p>
                      {!profile.emailVerified && (
                        <p className="text-sm text-yellow-400 mt-1">Unverified</p>
                      )}
                    </div>
                    <button className="text-purple-400 hover:text-purple-300">
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLinkEmail}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    + Add email address
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              {/* Add Address Button */}
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="w-full bg-gray-900 rounded-2xl p-6 border border-dashed border-gray-700 hover:border-purple-500 transition-colors group"
                >
                  <Plus className="w-8 h-8 text-gray-600 group-hover:text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-400 group-hover:text-white">Add New Address</p>
                </button>
              )}

              {/* Address Form */}
              {showAddressForm && (
                <ShippingAddressForm
                  initialAddress={editingAddress}
                  onSave={handleSaveAddress}
                  onCancel={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                  }}
                />
              )}

              {/* Address List */}
              {addresses.map(address => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{address.name}</h4>
                        {address.isDefault && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {address.street1}<br />
                        {address.street2 && <>{address.street2}<br /></>}
                        {address.city}, {address.state} {address.zip}<br />
                        {address.phone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingAddress(address);
                          setShowAddressForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="p-2 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
                  <p className="text-gray-400">Your order history will appear here</p>
                </div>
              ) : (
                orders.map(order => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">Order #{order.id}</h4>
                        <p className="text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400'
                          : order.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>Device: {order.device}</p>
                      <p>Amount: ${order.amount} ({order.solAmount} SOL)</p>
                      {order.trackingNumber && (
                        <p>Tracking: {order.trackingNumber}</p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && preferences && (
            <div className="space-y-6">
              {/* Notifications */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  {Object.entries(preferences.notifications).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleUpdatePreferences('notifications', {
                          [key]: e.target.checked
                        })}
                        className="w-4 h-4 rounded border-gray-700 bg-black/50 text-purple-500 focus:ring-purple-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Privacy */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy
                </h3>
                <div className="space-y-4">
                  {Object.entries(preferences.privacy).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleUpdatePreferences('privacy', {
                          [key]: e.target.checked
                        })}
                        className="w-4 h-4 rounded border-gray-700 bg-black/50 text-purple-500 focus:ring-purple-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
