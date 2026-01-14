'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { toast } from 'react-hot-toast'
import { RefreshCw, AlertCircle, Search } from 'lucide-react'

// Clean component imports
import InspectionModal from '@/components/admin/InspectionModal'
import OrdersTable from '@/components/admin/OrdersTable'
import OrdersStats from '@/components/admin/OrdersStats'

/**
 * Admin Orders Dashboard
 * Simplified and secure order management
 *
 * Security:
 * - Server-side admin validation
 * - Rate-limited payment execution
 * - IMEI tracking for fraud prevention
 */
export default function AdminOrdersPage() {
  const router = useRouter()
  const { isAdmin, authLoading, publicKey } = useAdminAuth()
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showInspectionModal, setShowInspectionModal] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchOrders()
    }
  }, [authLoading, isAdmin, filterStatus])

  async function fetchOrders() {
    try {
      setLoading(true)
      const statusParam = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const response = await fetch(`/api/admin/orders${statusParam}`, {
        headers: {
          'x-admin-wallet': publicKey?.toString() || ''
        }
      })

      if (!response.ok) throw new Error('Failed to fetch orders')

      const data = await response.json()
      setOrders(data.orders || [])
      setStats(data.stats || {})
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkReceived(orderId) {
    if (!confirm('Mark this device as received at warehouse?')) return

    try {
      setProcessingAction(true)
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-wallet': publicKey.toString()
        },
        body: JSON.stringify({
          orderId,
          action: 'mark_received'
        })
      })

      if (!response.ok) throw new Error('Failed to update order')

      toast.success('Device marked as received')
      fetchOrders()
    } catch (error) {
      console.error('Error marking received:', error)
      toast.error('Failed to mark as received')
    } finally {
      setProcessingAction(false)
    }
  }

  async function handleInspect(order) {
    setSelectedOrder(order)
    setShowInspectionModal(true)
  }

  async function submitInspection(orderId, inspectionData) {
    try {
      setProcessingAction(true)
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-wallet': publicKey.toString()
        },
        body: JSON.stringify({
          orderId,
          action: 'mark_inspected',
          data: inspectionData
        })
      })

      if (!response.ok) throw new Error('Failed to update order')

      toast.success('Inspection completed')
      setShowInspectionModal(false)
      setSelectedOrder(null)
      fetchOrders()
    } catch (error) {
      console.error('Error submitting inspection:', error)
      toast.error('Failed to submit inspection')
    } finally {
      setProcessingAction(false)
    }
  }

  async function handlePayUser(orderId, amount) {
    if (!confirm(`Send $${amount} USDC payment to user?`)) return

    try {
      setProcessingAction(true)
      const loadingToast = toast.loading('Processing payment...')

      const response = await fetch('/api/admin/orders/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-wallet': publicKey.toString()
        },
        body: JSON.stringify({ orderId })
      })

      const data = await response.json()

      toast.dismiss(loadingToast)

      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          const retryAfter = data.retryAfter || 60
          toast.error(`Too many payment attempts. Please wait ${retryAfter} seconds.`)
          return
        }
        throw new Error(data.error || 'Payment failed')
      }

      toast.success(`Payment sent! TX: ${data.payment.signature.slice(0, 8)}...`)

      // Open explorer link in new tab
      if (data.payment.explorerUrl) {
        window.open(data.payment.explorerUrl, '_blank')
      }

      fetchOrders()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Failed to process payment')
    } finally {
      setProcessingAction(false)
    }
  }

  function handleViewDetails(orderId) {
    router.push(`/admin/orders/${orderId}`)
  }

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        order.id.toLowerCase().includes(query) ||
        order.device_model?.toLowerCase().includes(query) ||
        order.device_imei?.toLowerCase().includes(query) ||
        order.wallet_address?.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Auth check
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400">Admin access required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Trade-In Orders</h1>
            <p className="text-gray-400">Manage incoming device orders</p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Dashboard */}
        <OrdersStats stats={stats} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by order ID, IMEI, or wallet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending_shipment">Pending Shipment</option>
            <option value="shipped">Shipped</option>
            <option value="received">Received</option>
            <option value="inspected">Inspected</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading orders...</p>
          </div>
        ) : (
          <OrdersTable
            orders={filteredOrders}
            onMarkReceived={handleMarkReceived}
            onInspect={handleInspect}
            onPayUser={handlePayUser}
            onViewDetails={handleViewDetails}
            isProcessing={processingAction}
          />
        )}

        {/* Inspection Modal */}
        {showInspectionModal && selectedOrder && (
          <InspectionModal
            order={selectedOrder}
            onSubmit={submitInspection}
            onClose={() => {
              setShowInspectionModal(false)
              setSelectedOrder(null)
            }}
            isProcessing={processingAction}
          />
        )}
      </div>
    </div>
  )
}