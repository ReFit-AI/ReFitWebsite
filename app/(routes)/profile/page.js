'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { 
  User, MapPin, Bell, 
  Plus, Edit2, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import userProfileService from '@/services/userProfile';
import ShippingAddressForm from '@/components/ShippingAddressForm';

export default function ProfilePage() {
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
  }, [connected, publicKey, loadUserData]);

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const walletAddress = publicKey.toString();
      
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
  }, [publicKey]);

  const handleSaveAddress = async (addressData) => {
    try {
      const walletAddress = publicKey.toString();
      
      if (editingAddress) {
        const updatedAddresses = addresses.map(addr => 
          addr.id === editingAddress.id ? { ...addr, ...addressData } : addr
        );
        setAddresses(updatedAddresses);
        
        await userProfileService.saveProfile(walletAddress, {
          ...profile,
          shippingAddresses: updatedAddresses
        });
        
        toast.success('Address updated successfully');
      } else {
        const result = await userProfileService.saveShippingAddress(
          walletAddress,
          addressData,
          addressData.isDefault
        );
        
        if (result.success) {
          await loadUserData();
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
        await loadUserData();
        toast.success('Address deleted successfully');
      }
    } catch (error) {
      console.error('Delete address error:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleUpdatePreferences = async (newPreferences) => {
    try {
      const walletAddress = publicKey.toString();
      const result = await userProfileService.savePreferences(walletAddress, newPreferences);
      
      if (result.success) {
        setPreferences(newPreferences);
        toast.success('Preferences updated successfully');
      }
    } catch (error) {
      console.error('Update preferences error:', error);
      toast.error('Failed to update preferences');
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <User className="w-12 h-12 text-solana-purple" />
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'preferences', label: 'Preferences', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">My Profile</h1>
            <p className="text-xl text-gray-400">Manage your account settings and preferences</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-900 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-solana-purple to-solana-green text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
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
                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Wallet Address</label>
                      <p className="font-mono text-sm break-all">{publicKey?.toString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Total Orders</label>
                      <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Saved Addresses</label>
                      <p className="text-2xl font-bold">{addresses.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Statistics</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-solana-green">
                        {orders.filter(o => o.status === 'completed').length}
                      </p>
                      <p className="text-sm text-gray-400">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-500">
                        {orders.filter(o => ['pending-shipment', 'shipped'].includes(o.status)).length}
                      </p>
                      <p className="text-sm text-gray-400">In Progress</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                {/* Add Address Button */}
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressForm(true);
                  }}
                  className="w-full py-4 bg-gray-900 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Address
                </button>

                {/* Address Form */}
                {showAddressForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-gray-900 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <ShippingAddressForm
                      initialData={editingAddress}
                      onSave={handleSaveAddress}
                      onCancel={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}
                    />
                  </motion.div>
                )}

                {/* Address List */}
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No saved addresses yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="font-semibold">{address.name}</h3>
                              {address.isDefault && (
                                <span className="ml-2 px-2 py-1 bg-solana-green/20 text-solana-green text-xs rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400">{address.street1}</p>
                            {address.street2 && <p className="text-gray-400">{address.street2}</p>}
                            <p className="text-gray-400">
                              {address.city}, {address.state} {address.zip}
                            </p>
                            {address.phone && <p className="text-gray-400 mt-2">{address.phone}</p>}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingAddress(address);
                                setShowAddressForm(true);
                              }}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium">Order Updates</p>
                      <p className="text-sm text-gray-400">Receive notifications about order status changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences?.orderUpdates ?? true}
                      onChange={(e) => handleUpdatePreferences({
                        ...preferences,
                        orderUpdates: e.target.checked
                      })}
                      className="w-5 h-5 text-solana-purple"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium">Price Alerts</p>
                      <p className="text-sm text-gray-400">Get notified about price changes for devices</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences?.priceAlerts ?? false}
                      onChange={(e) => handleUpdatePreferences({
                        ...preferences,
                        priceAlerts: e.target.checked
                      })}
                      className="w-5 h-5 text-solana-purple"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-400">Receive updates about new features and promotions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences?.marketingEmails ?? false}
                      onChange={(e) => handleUpdatePreferences({
                        ...preferences,
                        marketingEmails: e.target.checked
                      })}
                      className="w-5 h-5 text-solana-purple"
                    />
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
  );
}
