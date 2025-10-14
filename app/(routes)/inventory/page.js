'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Activity,
  Search
} from 'lucide-react'

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, in_stock, sold
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        setError('Database not configured. Please check environment variables.')
        setLoading(false)
        return
      }

      // Fetch inventory
      const { data: inventoryData, error: invError } = await supabase
        .from('inventory')
        .select('*')
        .order('purchased_at', { ascending: false })

      if (invError) {
        // Check if table doesn't exist
        if (invError.message.includes('table') || invError.code === 'PGRST204') {
          setError('Database not set up yet. Admin needs to run setup.')
          setLoading(false)
          return
        }
        throw invError
      }

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('inventory_stats')
        .select('*')
        .single()

      if (statsError && !statsError.message.includes('view')) {
        throw statsError
      }

      setInventory(inventoryData || [])
      setStats(statsData)
      setError(null)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setError(error.message || 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter
    const matchesSearch = !searchTerm ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.imei.includes(searchTerm)

    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Inventory System Not Set Up</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <a
            href="/admin/setup"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
          >
            Go to Setup
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold">Live Inventory</h1>
          </div>
          <p className="text-gray-400 max-w-2xl">
            Real-time transparency. See exactly where pool capital is deployed - every phone, every margin, every flip.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={ShoppingCart}
              label="Active Inventory"
              value={stats.active_inventory_count}
              subtitle={`$${parseFloat(stats.capital_deployed).toFixed(0)} deployed`}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Sales"
              value={stats.total_sales_count}
              subtitle={`$${parseFloat(stats.total_revenue).toFixed(0)} revenue`}
              color="green"
            />
            <StatCard
              icon={DollarSign}
              label="Total Profit"
              value={`$${parseFloat(stats.net_profit || 0).toFixed(0)}`}
              subtitle={`${parseFloat(stats.avg_net_margin_percent || 0).toFixed(1)}% avg margin`}
              color="purple"
            />
            <StatCard
              icon={Activity}
              label="Avg Profit/Unit"
              value={`$${parseFloat(stats.avg_net_profit_per_unit || 0).toFixed(0)}`}
              subtitle="Per phone sold"
              color="orange"
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by model or IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="All"
              count={inventory.length}
            />
            <FilterButton
              active={filter === 'in_stock'}
              onClick={() => setFilter('in_stock')}
              label="In Stock"
              count={inventory.filter(i => i.status === 'in_stock').length}
            />
            <FilterButton
              active={filter === 'sold'}
              onClick={() => setFilter('sold')}
              label="Sold"
              count={inventory.filter(i => i.status === 'sold').length}
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    IMEI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Margin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Battery
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredInventory.map((item) => (
                  <InventoryRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>

            {filteredInventory.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No inventory found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, subtitle, color }) {
  const colors = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20'
  }

  return (
    <div className={`bg-gray-900 border rounded-lg p-4 ${colors[color].split(' ')[2]}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colors[color].split(' ')[1]}`}>
          <Icon className={`w-5 h-5 ${colors[color].split(' ')[0]}`} />
        </div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  )
}

function FilterButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-green-400 text-black'
          : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
      }`}
    >
      {label} ({count})
    </button>
  )
}

function InventoryRow({ item }) {
  const shippingIn = parseFloat(item.shipping_cost_in || 0)
  const shippingOut = parseFloat(item.shipping_cost_out || 0)
  const totalShipping = shippingIn + shippingOut

  const netProfit = item.price_sold ? item.price_sold - item.price_paid - totalShipping : 0

  const totalCost = item.price_paid + totalShipping
  const marginPercent = item.price_sold && totalCost > 0
    ? (netProfit / totalCost * 100)
    : 0

  const statusColors = {
    in_stock: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    sold: 'bg-green-400/10 text-green-400 border-green-400/20',
    returned: 'bg-red-400/10 text-red-400 border-red-400/20'
  }

  return (
    <tr className="hover:bg-gray-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium">{item.model}</div>
        {item.condition && (
          <div className="text-xs text-gray-500">{item.condition}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-400">
        {item.imei}
      </td>
      <td className="px-6 py-4 whitespace-nowrap font-medium">
        ${item.price_paid.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap font-medium">
        {item.price_sold ? (
          <span className="text-green-400">${item.price_sold.toFixed(2)}</span>
        ) : (
          <span className="text-gray-600">-</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {item.price_sold ? (
          <div>
            <div className="flex items-center gap-2">
              <span className={netProfit > 0 ? 'text-green-400 font-medium' : 'text-red-400'}>
                ${netProfit.toFixed(0)}
              </span>
              <span className="text-xs text-gray-500">
                ({marginPercent.toFixed(1)}%)
              </span>
            </div>
            {totalShipping > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                -${totalShipping.toFixed(2)} shipping
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-600">-</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[item.status]}`}>
          {item.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
        {item.battery_health ? `${item.battery_health}%` : '-'}
      </td>
    </tr>
  )
}
