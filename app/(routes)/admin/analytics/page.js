'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Activity,
  Percent,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()
  const { isAdmin, authLoading } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchAnalytics()
    }
  }, [authLoading, isAdmin])

  async function fetchAnalytics() {
    try {
      const response = await fetch('/api/admin/analytics')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Connecting wallet...</p>
        </div>
      </div>
    )
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const StatCard = ({ icon: Icon, label, value, change, prefix = '', suffix = '', large = false }) => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-400 font-medium">{label}</p>
        <p className={`${large ? 'text-4xl' : 'text-2xl'} font-semibold tracking-tight`}>
          {prefix}{value}{suffix}
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Analytics</h1>
              <p className="text-gray-400">Real-time business metrics</p>
            </div>
            <button
              onClick={() => router.push('/admin/inventory')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-medium"
            >
              Back to Inventory
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={stats?.totalRevenue.toLocaleString()}
            prefix="$"
            large
          />
          <StatCard
            icon={TrendingUp}
            label="Gross Profit"
            value={stats?.totalProfit.toLocaleString()}
            prefix="$"
            change={stats?.profitChange}
            large
          />
          <StatCard
            icon={Percent}
            label="Avg Margin"
            value={stats?.avgMargin.toFixed(1)}
            suffix="%"
            large
          />
          <StatCard
            icon={Package}
            label="Units Sold"
            value={stats?.unitsSold}
            large
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={ShoppingCart}
            label="Total Invoices"
            value={stats?.totalInvoices}
          />
          <StatCard
            icon={Activity}
            label="Active Inventory"
            value={stats?.activeInventory}
          />
          <StatCard
            icon={Calendar}
            label="This Month"
            value={stats?.thisMonthRevenue.toLocaleString()}
            prefix="$"
          />
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-6">Revenue Breakdown</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Total Sales</span>
                <span className="text-lg font-semibold">${stats?.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Total Cost</span>
                <span className="text-lg font-semibold text-red-400">${stats?.totalCost.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Gross Profit</span>
                <span className="text-lg font-semibold text-green-400">${stats?.totalProfit.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-400">Margin</span>
                <span className="text-lg font-semibold text-purple-400">{stats?.avgMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-6">Inventory Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">Sold</span>
                </div>
                <span className="text-lg font-semibold">{stats?.soldUnits}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-400">In Stock</span>
                </div>
                <span className="text-lg font-semibold">{stats?.inStockUnits}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-400">Pending</span>
                </div>
                <span className="text-lg font-semibold">{stats?.pendingUnits}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-400">Total Units</span>
                <span className="text-lg font-semibold">{stats?.totalUnits}</span>
              </div>
            </div>
          </div>

          {/* Top Models */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-6">Top Models</h2>
            <div className="space-y-3">
              {stats?.topModels?.slice(0, 5).map((model, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium">{model.model}</span>
                      <span className="text-xs text-gray-500">{model.count} units</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        style={{ width: `${(model.count / stats.totalUnits) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-4 text-sm font-semibold">${model.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="py-3 border-b border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Avg Sale Price</span>
                  <span className="text-lg font-semibold">${stats?.avgSalePrice.toFixed(0)}</span>
                </div>
              </div>
              <div className="py-3 border-b border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Avg Cost</span>
                  <span className="text-lg font-semibold">${stats?.avgCost.toFixed(0)}</span>
                </div>
              </div>
              <div className="py-3 border-b border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Avg Profit per Unit</span>
                  <span className="text-lg font-semibold text-green-400">${stats?.avgProfitPerUnit.toFixed(0)}</span>
                </div>
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Inventory Turnover</span>
                  <span className="text-lg font-semibold">{stats?.inventoryTurnover.toFixed(1)}x</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Note */}
        <div className="mt-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Business Health</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {stats?.soldUnits > 0
                  ? `Processing ${stats.soldUnits} units with an average ${stats.avgMargin.toFixed(1)}% margin. ${stats.totalProfit > 0 ? `Strong profit of $${stats.totalProfit.toLocaleString()}.` : 'Continue optimizing costs.'} ${stats.activeInventory > 0 ? `${stats.activeInventory} units ready to sell.` : 'Inventory fully deployed.'}`
                  : 'Start adding inventory to see analytics.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
