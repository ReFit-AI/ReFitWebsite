'use client'

import { Package, DollarSign, Eye } from 'lucide-react'

/**
 * OrdersTable Component
 * Clean, reusable table for displaying orders
 */
export default function OrdersTable({
  orders,
  onMarkReceived,
  onInspect,
  onPayUser,
  onViewDetails,
  isProcessing = false
}) {
  const getStatusBadge = (status) => {
    const styles = {
      pending_shipment: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      received: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      inspected: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    }

    const labels = {
      pending_shipment: 'Pending Shipment',
      shipped: 'Shipped',
      received: 'Received',
      inspected: 'Inspected',
      completed: 'Completed',
      rejected: 'Rejected',
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending_shipment}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No orders found</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">Order ID</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">Device</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">IMEI</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">Condition</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">Amount</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">Status</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">Created</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="p-4">
                  <div className="font-mono text-sm">{order.id.slice(0, 8)}...</div>
                </td>
                <td className="p-4">
                  <div className="font-medium">{order.device_brand} {order.device_model}</div>
                  <div className="text-sm text-gray-400">{order.device_storage}</div>
                </td>
                <td className="p-4">
                  <div className="font-mono text-sm">{order.device_imei || 'N/A'}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm capitalize">{order.device_condition}</div>
                </td>
                <td className="p-4">
                  <div className="font-semibold">${order.quote_usd}</div>
                </td>
                <td className="p-4">
                  {getStatusBadge(order.status)}
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {/* Dynamic action buttons based on status */}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => onMarkReceived(order.id)}
                        disabled={isProcessing}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-sm transition-colors"
                      >
                        Mark Received
                      </button>
                    )}

                    {order.status === 'received' && (
                      <button
                        onClick={() => onInspect(order)}
                        disabled={isProcessing}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm transition-colors"
                      >
                        Inspect
                      </button>
                    )}

                    {order.status === 'inspected' && order.inspection_approved && (
                      <button
                        onClick={() => onPayUser(order.id, order.quote_usd)}
                        disabled={isProcessing}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded text-sm flex items-center gap-1 transition-colors"
                      >
                        <DollarSign size={14} />
                        Pay ${order.quote_usd}
                      </button>
                    )}

                    <button
                      onClick={() => onViewDetails(order.id)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}