'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Package, Clock, CheckCircle, Truck, Eye, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import orderService from '@/services/orderService.supabase'
import TrackingStatus from '@/components/TrackingStatus'
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet'

export default function OrdersPage() {
  const { connected, publicKey } = useUnifiedWallet()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showTracking, setShowTracking] = useState(false)
  // const userProfileService = getUserProfileService() // Removed - not used

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      // Use the order service to get real orders
      const result = await orderService.getOrdersByWallet(publicKey.toString())
      
      if (result.success) {
        if (result.orders && result.orders.length > 0) {
          // Map Supabase order structure to UI structure
          const mappedOrders = result.orders.map(order => ({
            id: order.id,
            device: `${order.device_brand} ${order.device_model}${order.device_storage ? ` - ${order.device_storage}` : ''}`,
            brand: order.device_brand,
            model: order.device_model,
            condition: order.device_condition,
            price: order.quote_usd,
            solPrice: order.quote_sol,
            status: order.status.replace('_', '-'), // Convert pending_shipment to pending-shipment
            createdAt: order.created_at,
            shippingLabel: order.label_url,
            trackingNumber: order.tracking_number,
            carrier: order.carrier,
            shippingAddress: order.shipping_address,
            paymentTxHash: order.payment_tx_hash,
            completedAt: order.completed_at
          }))
          setOrders(mappedOrders)
        } else {
          // No orders found - show empty state
          setOrders([])
        }
      } else {
        // Even on error, show empty state rather than spinning forever
        console.log('Orders fetch failed:', result.error)
        setOrders([])
        // Only show error toast if it's not a "no profile" error
        if (!result.error?.includes('Not authenticated')) {
          toast.error('Unable to load orders. Please try again.')
        }
      }
    } catch (error) {
      console.error('Load orders error:', error)
      setOrders([]) // Show empty state on error
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  useEffect(() => {
    if (connected && publicKey) {
      loadOrders()
    } else {
      setLoading(false)
    }
  }, [connected, publicKey, loadOrders])

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending-shipment':
        return { color: 'text-yellow-500', icon: Clock, label: 'Pending Shipment' }
      case 'shipped':
        return { color: 'text-blue-500', icon: Truck, label: 'Shipped' }
      case 'received':
        return { color: 'text-purple-500', icon: Package, label: 'Received' }
      case 'completed':
        return { color: 'text-green-500', icon: CheckCircle, label: 'Completed' }
      default:
        return { color: 'text-gray-500', icon: Clock, label: 'Unknown' }
    }
  }

  const handleViewTracking = (order) => {
    setSelectedOrder(order)
    setShowTracking(true)
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your orders</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Package className="w-12 h-12 text-solana-purple" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">My Orders</h1>
            <p className="text-xl text-gray-400">Track your device buyback orders</p>
          </motion.div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-16"
            >
              <Package className="w-24 h-24 mx-auto mb-6 text-gray-600" />
              <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
              <p className="text-gray-400 mb-8">Start by selling your first device</p>
              <a
                href="/sell"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-solana-purple to-solana-green text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Sell a Device
              </a>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {orders.map((order, index) => {
                const statusInfo = getStatusInfo(order.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-semibold mr-3">{order.device}</h3>
                          <span className={`inline-flex items-center ${statusInfo.color}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {statusInfo.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">Order ID</span>
                            <p className="font-mono">{order.id}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Price</span>
                            <p>${order.price} ({order.solPrice} SOL)</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Created</span>
                            <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Condition</span>
                            <p>{order.condition}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          {order.status === 'pending-shipment' && order.shippingLabel && (
                            <a
                              href={order.shippingLabel}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-solana-purple text-white rounded hover:bg-opacity-90 transition-colors"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Label
                            </a>
                          )}
                          
                          {(order.status === 'shipped' || order.status === 'received') && order.trackingNumber && (
                            <button
                              onClick={() => handleViewTracking(order)}
                              className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Track Package
                            </button>
                          )}
                          
                          {order.status === 'completed' && order.paymentTxHash && (
                            <a
                              href={`https://explorer.solana.com/tx/${order.paymentTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-solana-green text-black rounded hover:bg-opacity-90 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              View Payment
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Tracking Modal */}
          {showTracking && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 rounded-lg p-6 max-w-lg w-full"
              >
                <h3 className="text-xl font-semibold mb-4">Package Tracking</h3>
                <TrackingStatus 
                  trackingNumber={selectedOrder.trackingNumber}
                  carrier={selectedOrder.carrier}
                />
                <button
                  onClick={() => setShowTracking(false)}
                  className="mt-6 w-full py-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
  )
}
