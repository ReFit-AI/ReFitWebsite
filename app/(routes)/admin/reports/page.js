'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  FileText,
  FileSpreadsheet
} from 'lucide-react'

const ADMIN_WALLET = process.env.ADMIN_WALLET

export default function AdminReportsPage() {
  const { publicKey, connected } = useWallet()
  const router = useRouter()
  const [inventory, setInventory] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    if (!connected) return
    if (!publicKey) {
      router.push('/stake')
      return
    }
    if (publicKey.toString() !== ADMIN_WALLET) {
      router.push('/stake')
      return
    }

    setLoading(false)
    fetchData()
  }, [connected, publicKey, router])

  async function fetchData() {
    try {
      const [inventoryRes, invoicesRes] = await Promise.all([
        fetch('/api/admin/inventory'),
        fetch('/api/admin/invoices')
      ])

      const [inventoryData, invoicesData] = await Promise.all([
        inventoryRes.json(),
        invoicesRes.json()
      ])

      setInventory(inventoryData.inventory || [])
      setInvoices(invoicesData.invoices || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Filter data by date range
  const filteredInventory = inventory.filter(item => {
    if (!dateRange.start && !dateRange.end) return true
    const soldDate = item.sold_at ? new Date(item.sold_at) : null
    if (!soldDate) return false

    const start = dateRange.start ? new Date(dateRange.start) : null
    const end = dateRange.end ? new Date(dateRange.end) : null

    if (start && soldDate < start) return false
    if (end && soldDate > end) return false
    return true
  })

  const filteredInvoices = invoices.filter(inv => {
    if (!dateRange.start && !dateRange.end) return true
    const invDate = new Date(inv.created_at)

    const start = dateRange.start ? new Date(dateRange.start) : null
    const end = dateRange.end ? new Date(dateRange.end) : null

    if (start && invDate < start) return false
    if (end && invDate > end) return false
    return true
  })

  // Calculate summary stats
  const soldItems = filteredInventory.filter(i => i.status === 'sold')
  const totalRevenue = soldItems.reduce((sum, i) => sum + parseFloat(i.price_sold || 0), 0)
  const totalCost = soldItems.reduce((sum, i) => sum + parseFloat(i.price_paid || 0), 0)
  const totalShipping = soldItems.reduce((sum, i) =>
    sum + parseFloat(i.shipping_cost_in || 0) + parseFloat(i.shipping_cost_out || 0), 0
  )
  const netProfit = totalRevenue - totalCost - totalShipping
  const netMargin = (totalCost + totalShipping) > 0
    ? (netProfit / (totalCost + totalShipping) * 100)
    : 0

  function exportInventoryReport() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const XLSX = require('xlsx')

    const data = soldItems.map(item => ({
      'Date Sold': item.sold_at ? new Date(item.sold_at).toLocaleDateString() : '',
      'Model': item.model,
      'IMEI': item.imei,
      'Purchase Price': parseFloat(item.price_paid || 0),
      'Sale Price': parseFloat(item.price_sold || 0),
      'Shipping In': parseFloat(item.shipping_cost_in || 0),
      'Shipping Out': parseFloat(item.shipping_cost_out || 0),
      'Total Shipping': parseFloat(item.shipping_cost_in || 0) + parseFloat(item.shipping_cost_out || 0),
      'Gross Profit': parseFloat(item.price_sold || 0) - parseFloat(item.price_paid || 0),
      'Net Profit': parseFloat(item.price_sold || 0) - parseFloat(item.price_paid || 0) - parseFloat(item.shipping_cost_in || 0) - parseFloat(item.shipping_cost_out || 0),
      'Margin %': ((parseFloat(item.price_sold || 0) - parseFloat(item.price_paid || 0) - parseFloat(item.shipping_cost_in || 0) - parseFloat(item.shipping_cost_out || 0)) / (parseFloat(item.price_paid || 0) + parseFloat(item.shipping_cost_in || 0) + parseFloat(item.shipping_cost_out || 0)) * 100).toFixed(2),
      'Seller': item.seller || '',
      'Tracking': item.tracking_number || '',
      'Carrier': item.shipping_carrier || ''
    }))

    // Add summary row
    data.push({
      'Date Sold': 'TOTAL',
      'Model': '',
      'IMEI': '',
      'Purchase Price': totalCost,
      'Sale Price': totalRevenue,
      'Shipping In': '',
      'Shipping Out': '',
      'Total Shipping': totalShipping,
      'Gross Profit': totalRevenue - totalCost,
      'Net Profit': netProfit,
      'Margin %': netMargin.toFixed(2),
      'Seller': '',
      'Tracking': '',
      'Carrier': ''
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 25 }, // Model
      { wch: 18 }, // IMEI
      { wch: 12 }, // Purchase
      { wch: 12 }, // Sale
      { wch: 12 }, // Ship In
      { wch: 12 }, // Ship Out
      { wch: 12 }, // Total Ship
      { wch: 12 }, // Gross
      { wch: 12 }, // Net
      { wch: 10 }, // Margin
      { wch: 15 }, // Seller
      { wch: 15 }, // Tracking
      { wch: 10 }  // Carrier
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Profit Report')

    const filename = dateRange.start || dateRange.end
      ? `inventory-report-${dateRange.start || 'start'}-to-${dateRange.end || 'end'}.xlsx`
      : `inventory-report-all-time.xlsx`

    XLSX.writeFile(wb, filename)
  }

  function exportInvoiceReport() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const XLSX = require('xlsx')

    const data = filteredInvoices.map(inv => ({
      'Invoice #': inv.invoice_number,
      'Date': new Date(inv.created_at).toLocaleDateString(),
      'Status': inv.status.toUpperCase(),
      'Buyer': inv.buyer_name || '',
      'Items Count': inv.invoice_items?.length || 0,
      'Subtotal': parseFloat(inv.total_amount || 0),
      'Shipping': parseFloat(inv.shipping_cost || 0),
      'Total': parseFloat(inv.total_amount || 0) + parseFloat(inv.shipping_cost || 0),
      'Tracking': inv.tracking_number || '',
      'Paid Date': inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : ''
    }))

    // Add summary
    const totalInvoiceAmount = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0)
    const totalInvoiceShipping = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.shipping_cost || 0), 0)

    data.push({
      'Invoice #': 'TOTAL',
      'Date': '',
      'Status': '',
      'Buyer': '',
      'Items Count': filteredInvoices.reduce((sum, inv) => sum + (inv.invoice_items?.length || 0), 0),
      'Subtotal': totalInvoiceAmount,
      'Shipping': totalInvoiceShipping,
      'Total': totalInvoiceAmount + totalInvoiceShipping,
      'Tracking': '',
      'Paid Date': ''
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    ws['!cols'] = [
      { wch: 15 }, // Invoice #
      { wch: 12 }, // Date
      { wch: 12 }, // Status
      { wch: 20 }, // Buyer
      { wch: 10 }, // Items
      { wch: 12 }, // Subtotal
      { wch: 12 }, // Shipping
      { wch: 12 }, // Total
      { wch: 15 }, // Tracking
      { wch: 12 }  // Paid Date
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Invoice Report')

    const filename = dateRange.start || dateRange.end
      ? `invoice-report-${dateRange.start || 'start'}-to-${dateRange.end || 'end'}.xlsx`
      : `invoice-report-all-time.xlsx`

    XLSX.writeFile(wb, filename)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold">Profit Reports</h1>
          </div>
          <p className="text-gray-400">
            Export detailed reports for accounting and tax purposes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Filter */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">Date Range Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setDateRange({ start: '', end: '' })}
                className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>

          {(dateRange.start || dateRange.end) && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                Showing data from {dateRange.start || 'beginning'} to {dateRange.end || 'now'}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Units Sold</span>
            </div>
            <div className="text-3xl font-bold">{soldItems.length}</div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Revenue</span>
            </div>
            <div className="text-3xl font-bold text-green-400">${totalRevenue.toFixed(0)}</div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Net Profit</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">${netProfit.toFixed(0)}</div>
            <div className="text-xs text-gray-500 mt-1">
              ${totalShipping.toFixed(0)} shipping
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Net Margin</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{netMargin.toFixed(1)}%</div>
          </div>
        </div>

        {/* Export Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inventory Report */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold">Inventory Profit Report</h2>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Detailed breakdown of every phone sold with purchase price, sale price, shipping costs, and net profit per unit.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total phones sold:</span>
                <span className="font-medium">{soldItems.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total invested:</span>
                <span className="font-medium">${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total shipping:</span>
                <span className="font-medium">${totalShipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-700 pt-3">
                <span className="text-gray-300 font-medium">Net profit:</span>
                <span className="font-bold text-green-400">${netProfit.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={exportInventoryReport}
              disabled={soldItems.length === 0}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Export Inventory Report
            </button>
          </div>

          {/* Invoice Report */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold">Invoice Summary Report</h2>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Summary of all invoices including totals, shipping costs, status, and payment dates.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total invoices:</span>
                <span className="font-medium">{filteredInvoices.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Paid invoices:</span>
                <span className="font-medium">{filteredInvoices.filter(i => i.status === 'paid').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total amount:</span>
                <span className="font-medium">
                  ${filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-700 pt-3">
                <span className="text-gray-300 font-medium">With shipping:</span>
                <span className="font-bold text-blue-400">
                  ${(filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0) + parseFloat(inv.shipping_cost || 0), 0)).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={exportInvoiceReport}
              disabled={filteredInvoices.length === 0}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Export Invoice Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
