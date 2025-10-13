'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  FileText,
  Package,
  DollarSign,
  User,
  Printer,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Truck,
  Download,
  FileSpreadsheet,
  Plus
} from 'lucide-react'
import { downloadInvoicePDF, downloadInvoiceExcel } from '@/lib/invoiceExport'

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET

export default function InvoiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { publicKey, connected } = useWallet()

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingLabel, setGeneratingLabel] = useState(false)
  const [shippingRates, setShippingRates] = useState([])
  const [selectedRate, setSelectedRate] = useState(null)
  const [showRateSelection, setShowRateSelection] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [editingShipping, setEditingShipping] = useState(false)
  const [shippingData, setShippingData] = useState({
    tracking_number: '',
    carrier: '',
    cost: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchInvoiceDetails()
    }
  }, [params.id])

  async function fetchInvoiceDetails() {
    try {
      const response = await fetch(`/api/admin/invoices?id=${params.id}`)
      const data = await response.json()

      if (data.success && data.invoice) {
        setInvoice(data.invoice)
      } else {
        alert('Invoice not found')
        router.push('/admin/invoices')
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error)
      alert('Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  async function fetchShippingRates() {
    if (!invoice?.buyer) return

    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: invoice.items?.length * 0.5, // 0.5 lbs per phone estimate
          zip: invoice.buyer.zip || '90001' // Default LA zip
        })
      })

      const data = await response.json()
      if (data.success && data.rates) {
        setShippingRates(data.rates)
        setShowRateSelection(true)
      }
    } catch (error) {
      console.error('Failed to fetch rates:', error)
      alert('Failed to get shipping rates')
    }
  }

  async function generateShippingLabel() {
    if (!selectedRate && !invoice.shipping_label_url) {
      // If no label exists, get rates first
      await fetchShippingRates()
      return
    }

    setGeneratingLabel(true)

    try {
      const response = await fetch(`/api/admin/invoices/${params.id}/label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          carrierAccount: selectedRate?.carrier_account,
          serviceLevel: selectedRate?.service_level_name
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Shipping label created! Tracking: ${data.label.tracking_number}`)
        // Refresh invoice to show new shipping info
        fetchInvoiceDetails()
        setShowRateSelection(false)
      } else {
        alert(`Failed to generate label: ${data.error}`)
      }
    } catch (error) {
      console.error('Label generation error:', error)
      alert('Failed to generate shipping label')
    } finally {
      setGeneratingLabel(false)
    }
  }

  async function markAsPaid() {
    if (!confirm('Mark this invoice as paid?')) return

    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          id: invoice.id,
          updates: { status: 'paid' }
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Invoice marked as paid!')
        fetchInvoiceDetails()
      } else {
        alert('Failed to update invoice')
      }
    } catch (error) {
      console.error('Failed to mark as paid:', error)
      alert('Failed to update invoice')
    }
  }

  async function updateItemPrice(itemId, newPrice) {
    try {
      const response = await fetch('/api/admin/invoices/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          itemId,
          price: parseFloat(newPrice)
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Item price updated!')
        setEditingItem(null)
        fetchInvoiceDetails()
      } else {
        alert('Failed to update price')
      }
    } catch (error) {
      console.error('Failed to update price:', error)
      alert('Failed to update price')
    }
  }

  async function addShippingManually() {
    if (!shippingData.tracking_number || !shippingData.carrier || !shippingData.cost) {
      alert('Please fill in all shipping fields')
      return
    }

    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          id: invoice.id,
          updates: {
            tracking_number: shippingData.tracking_number,
            shipping_carrier: shippingData.carrier,
            shipping_cost: parseFloat(shippingData.cost),
            status: 'sent',
            shipped_at: new Date().toISOString()
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Shipping information added!')
        setEditingShipping(false)
        fetchInvoiceDetails()
      } else {
        alert('Failed to add shipping info')
      }
    } catch (error) {
      console.error('Failed to add shipping:', error)
      alert('Failed to add shipping info')
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  function getStatusColor(status) {
    switch (status) {
      case 'paid':
        return 'text-green-400 bg-green-900/30'
      case 'shipped':
        return 'text-blue-400 bg-blue-900/30'
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/30'
      default:
        return 'text-gray-400 bg-gray-900/30'
    }
  }

  // Check auth
  if (connected && publicKey?.toString() !== ADMIN_WALLET) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl mb-2">Admin Access Required</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl mb-2">Invoice not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/admin/invoices')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Invoices
              </button>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-400" />
                <h1 className="text-3xl font-bold">Invoice {invoice.invoice_number}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => downloadInvoicePDF(invoice)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                PDF
              </button>

              <button
                onClick={() => downloadInvoiceExcel(invoice)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Excel
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>

              {!invoice.shipping_label_url ? (
                <button
                  onClick={generateShippingLabel}
                  disabled={generatingLabel}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Truck className="w-5 h-5" />
                  {generatingLabel ? 'Generating...' : 'Generate Label'}
                </button>
              ) : (
                <a
                  href={invoice.shipping_label_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Label
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Buyer Information */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Buyer Information
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <p className="font-medium">{invoice.buyers?.name || invoice.buyer_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Company:</span>
                  <p className="font-medium">{invoice.buyers?.company || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <p className="font-medium">{invoice.buyers?.email || invoice.buyer_email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Phone:</span>
                  <p className="font-medium">{invoice.buyers?.phone || invoice.buyer_phone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Address:</span>
                  <p className="font-medium">
                    {(invoice.buyers?.address || invoice.buyer_address) ? (
                      <>
                        {invoice.buyers?.address || invoice.buyer_address}<br />
                        {(invoice.buyers?.city || invoice.buyer_city) && `${invoice.buyers?.city || invoice.buyer_city}, `}
                        {invoice.buyers?.state || invoice.buyer_state} {invoice.buyers?.zip || invoice.buyer_zip}
                        {(invoice.buyers?.country || invoice.buyer_country) && (invoice.buyers?.country || invoice.buyer_country) !== 'US' && ` ${invoice.buyers?.country || invoice.buyer_country}`}
                      </>
                    ) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-400" />
                Items
              </h2>
              <div className="space-y-3">
                {(invoice.invoice_items || invoice.items || []).map((item, index) => (
                  <div key={item.id || index} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{item.model}</div>
                        <div className="text-sm text-gray-400">
                          IMEI: {item.imei}
                        </div>
                      </div>
                      <div className="text-right">
                        {editingItem === item.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={item.price}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateItemPrice(item.id, e.target.value)
                                } else if (e.key === 'Escape') {
                                  setEditingItem(null)
                                }
                              }}
                              className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => setEditingItem(null)}
                              className="text-xs text-gray-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold">
                              ${item.price?.toFixed(2) || '0.00'}
                            </div>
                            <button
                              onClick={() => setEditingItem(item.id)}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-400" />
                  Shipping Information
                </h2>
                {!invoice.tracking_number && !editingShipping && (
                  <button
                    onClick={() => setEditingShipping(true)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Shipping
                  </button>
                )}
              </div>

              {editingShipping ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Tracking Number</label>
                    <input
                      type="text"
                      value={shippingData.tracking_number}
                      onChange={(e) => setShippingData({ ...shippingData, tracking_number: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                      placeholder="1Z999AA10123456784"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Carrier</label>
                    <input
                      type="text"
                      value={shippingData.carrier}
                      onChange={(e) => setShippingData({ ...shippingData, carrier: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                      placeholder="UPS, USPS, FedEx"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Shipping Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={shippingData.cost}
                      onChange={(e) => setShippingData({ ...shippingData, cost: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addShippingManually}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                    >
                      Save Shipping Info
                    </button>
                    <button
                      onClick={() => setEditingShipping(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : invoice.tracking_number ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Carrier:</span>
                    <p className="font-medium">{invoice.shipping_carrier || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Tracking:</span>
                    <p className="font-medium font-mono">{invoice.tracking_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Shipping Cost:</span>
                    <p className="font-medium">${invoice.shipping_cost?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Shipped At:</span>
                    <p className="font-medium">{formatDate(invoice.shipped_at)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No shipping information yet</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>${invoice.subtotal?.toFixed(2) || '0.00'}</span>
                </div>

                {invoice.shipping_cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span>${invoice.shipping_cost.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-800 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${invoice.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span>{formatDate(invoice.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Terms</span>
                    <span>{invoice.payment_terms || 'Net 30'}</span>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="border-t border-gray-800 pt-3">
                    <p className="text-sm text-gray-400 mb-1">Notes:</p>
                    <p className="text-sm">{invoice.notes}</p>
                  </div>
                )}

                {/* Mark as Paid Button */}
                {invoice.status !== 'paid' && (
                  <div className="border-t border-gray-800 pt-3">
                    <button
                      onClick={markAsPaid}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark as Paid
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Selection Modal */}
      {showRateSelection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Select Shipping Service</h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {shippingRates.map((rate, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedRate(rate)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedRate?.id === rate.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{rate.carrier} - {rate.service}</p>
                      <p className="text-sm text-gray-400">
                        Delivery: {rate.estimated_days} business days
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${rate.amount}</p>
                      {rate.cheapest && (
                        <span className="text-xs text-green-400">Cheapest</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRateSelection(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateShippingLabel}
                disabled={!selectedRate || generatingLabel}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all disabled:opacity-50"
              >
                {generatingLabel ? 'Generating...' : 'Generate Label'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}