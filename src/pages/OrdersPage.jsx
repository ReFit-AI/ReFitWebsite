import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Package, Clock, CheckCircle, Truck, Eye, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import userProfileService from '../services/userProfile'
import TrackingStatus from '../components/TrackingStatus'

const OrdersPage = () => {
  const { connected, publicKey } = useWallet()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showTracking, setShowTracking] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      loadOrders()
    } else {
      setLoading(false)
    }
  }, [connected, publicKey])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const result = await userProfileService.getOrderHistory(publicKey.toString())
      
      // If no orders in profile, use mock data for demo
      if (result.success && result.orders.length > 0) {
        setOrders(result.orders)
      } else {
        // Mock orders for demo
        setOrders([
          {
            id: 'ORD001',
            device: 'iPhone 15 Pro - 256GB',
            brand: 'Apple',
            model: 'iPhone 15 Pro',
            condition: 'Excellent',
            price: 900,
            solPrice: 6.0,
            status: 'pending-shipment',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            shippingLabel: 'https://shipping.example.com/label/ORD001',
            shippingAddress: {
              name: 'John Doe',
              street1: '123 Main St',
              city: 'San Francisco',
              state: 'CA',
              zip: '94105'
            }
          },
          {
            id: 'ORD002',
            device: 'Solana Saga - 128GB',
            brand: 'Solana',
            model: 'Saga',
            condition: 'Good',
            price: 600,
            solPrice: 4.0,
            status: 'shipped',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            trackingNumber: '1Z999AA10123456784',
            carrier: 'USPS',
            shippingAddress: {
              name: 'John Doe',
              street1: '123 Main St',
              city: 'San Francisco',
              state: 'CA',
              zip: '94105'
            }
          },
          {
            id: 'ORD003',
            device: 'Samsung Galaxy S23 - 512GB',
            brand: 'Samsung',
            model: 'Galaxy S23',
            condition: 'Fair',
            price: 450,
            solPrice: 3.0,
            status: 'completed',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            paymentTxHash: '3xAmPLeTrAnSaCtIoNhAsH...',
            shippingAddress: {
              name: 'John Doe',
              street1: '123 Main St',
              city: 'San Francisco',
              state: 'CA',
              zip: '94105'
            }
          }
        ])
      }
    } catch (error) {
      console.error('Load orders error:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending-shipment':
        return <Clock className="text-yellow-500" />
      case 'shipped':
        return <Truck className="text-blue-500" />
      case 'completed':
        return <CheckCircle className="text-green-500" />
      default:
        return <Package className="text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending-shipment':
        return 'Awaiting Shipment'
      case 'shipped':
        return 'In Transit'
      case 'completed':
        return 'Completed'
      default:
        return 'Processing'
    }
  }

  const handleDownloadLabel = (order) => {
    // In production, this would download the actual shipping label
    toast.success('Shipping label downloaded!')
    console.log('Download label for order:', order.id)
  }

  const handleViewTracking = (order) => {
    setSelectedOrder(order)
    setShowTracking(true)
  }

  if (!connected) {
    return (
      <div className="min-h-screen py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-2xl p-12 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400">
              Please connect your wallet to view your orders
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen py-24">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Your Orders</h1>
            <p className="text-gray-400">Track your device buyback orders</p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Package size={48} className="mx-auto mb-4 text-gray-600" />
              <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
              <p className="text-gray-400">Start by selling your first device</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium">
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{order.device}</h3>
                      <p className="text-sm text-gray-400">
                        Order ID: {order.id} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      {order.status === 'completed' && order.completedAt && (
                        <p className="text-sm text-green-400 mt-1">
                          Completed on {new Date(order.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 md:mt-0 md:text-right">
                      <div className="text-2xl font-bold">${order.price}</div>
                      <div className="text-sm text-gray-400">≈ {order.solPrice} SOL</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    {order.status === 'pending-shipment' && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => handleDownloadLabel(order)}
                          className="btn-primary text-sm flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Shipping Label
                        </button>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="btn-secondary text-sm flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    )}
                    {order.status === 'shipped' && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="text-sm text-gray-400">
                          Tracking: {order.trackingNumber}
                        </p>
                        <button 
                          onClick={() => handleViewTracking(order)}
                          className="text-sm text-solana-green hover:underline flex items-center gap-1"
                        >
                          <Truck className="w-4 h-4" />
                          Track Package
                        </button>
                      </div>
                    )}
                    {order.status === 'completed' && order.paymentTxHash && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                          Payment TX: {order.paymentTxHash.slice(0, 20)}...
                        </p>
                        <a 
                          href={`https://solscan.io/tx/${order.paymentTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-solana-green hover:underline"
                        >
                          View on Solscan
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Shipping Instructions */}
          {orders.some(order => order.status === 'pending-shipment') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Shipping Instructions</h3>
              <ol className="space-y-3 text-sm text-gray-300">
                <li>1. Factory reset your device and remove all personal data</li>
                <li>2. Pack your device securely with protective material</li>
                <li>3. Download and print the prepaid shipping label</li>
                <li>4. Drop off at any authorized shipping location</li>
                <li>5. You'll receive payment once we verify your device</li>
              </ol>
            </motion.div>
          )}
        </motion.div>

        {/* Order Details Modal */}
        {selectedOrder && !showTracking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Order Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-gray-400 mb-1">Device Information</h4>
                  <p className="font-semibold">{selectedOrder.device}</p>
                  <p className="text-sm text-gray-400">
                    Condition: {selectedOrder.condition}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm text-gray-400 mb-1">Shipping From</h4>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress.name}<br />
                    {selectedOrder.shippingAddress.street1}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm text-gray-400 mb-1">Payment Details</h4>
                  <p className="text-lg font-semibold">
                    {selectedOrder.solPrice} SOL (${selectedOrder.price})
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn-secondary w-full mt-6"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Tracking Modal */}
        {showTracking && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowTracking(false)
              setSelectedOrder(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold">Track Your Shipment</h3>
                <p className="text-sm text-gray-400 mt-1">{selectedOrder.device}</p>
              </div>

              <TrackingStatus 
                trackingNumber={selectedOrder.trackingNumber}
                carrier={selectedOrder.carrier}
              />

              <button
                onClick={() => {
                  setShowTracking(false)
                  setSelectedOrder(null)
                }}
                className="btn-secondary w-full mt-6"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
