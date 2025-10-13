'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import {
  FileText,
  Plus,
  Download,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  FileDown,
  FileSpreadsheet,
  Trash2
} from 'lucide-react'
import { downloadInvoicePDF, downloadInvoiceExcel } from '@/lib/invoiceExport'

export default function AdminInvoicesPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  const { isAdmin, authLoading, publicKey } = useAdminAuth()
  const [invoices, setInvoices] = useState([])
  const [inventory, setInventory] = useState([])
  const [fromAddress, setFromAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (!authLoading && isAdmin) {
      setLoading(false)
      fetchData()
    }
  }, [authLoading, isAdmin])

  async function fetchData() {
    try {
      const [invoicesRes, inventoryRes, settingsRes] = await Promise.all([
        fetch('/api/admin/invoices'),
        fetch('/api/admin/inventory'),
        fetch('/api/admin/settings?key=shipping_from_address')
      ])

      const [invoicesData, inventoryData, settingsData] = await Promise.all([
        invoicesRes.json(),
        inventoryRes.json(),
        settingsRes.json()
      ])

      console.log('Fetched invoices:', invoicesData)

      if (!invoicesData.success) {
        console.error('Failed to fetch invoices:', invoicesData.error)
      }

      setInvoices(invoicesData.invoices || [])
      setInventory(inventoryData.inventory?.filter(i => i.status === 'in_stock') || [])
      setFromAddress(settingsData.setting?.value || null)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateInvoice(invoiceData) {
    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          invoice: invoiceData
        })
      })

      if (!response.ok) throw new Error('Failed to create invoice')

      await fetchData()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice')
    }
  }

  async function handleUpdateStatus(id, status) {
    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          id,
          updates: { status }
        })
      })

      if (!response.ok) throw new Error('Failed to update invoice')

      await fetchData()
    } catch (error) {
      console.error('Error updating invoice:', error)
      alert('Failed to update invoice')
    }
  }

  async function handleDeleteInvoice(invoiceId) {
    if (!confirm('Are you sure you want to delete this invoice? This will restore inventory items to in_stock status.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          id: invoiceId
        })
      })

      if (!response.ok) throw new Error('Failed to delete')

      alert('Invoice deleted successfully')
      await fetchData()
    } catch (error) {
      console.error('Error deleting invoice:', error)
      alert('Failed to delete invoice')
    }
  }

  async function handleCreateLabel(invoice) {
    if (!confirm(`Create shipping label for ${invoice.invoice_number}?\n\nThis will:\n- Generate Shippo label\n- Charge shipping cost\n- Update all ${invoice.invoice_items?.length} phones`)) {
      return
    }

    try {
      // Validate buyer address
      if (!invoice.buyer_address_line1 || !invoice.buyer_city || !invoice.buyer_state || !invoice.buyer_zip) {
        alert('Missing buyer shipping address! Please edit the invoice to add complete address.')
        return
      }

      // Use from address from settings or fallback to default
      const fromAddressData = fromAddress || {
        name: "ReFit",
        street1: "123 Main St",
        city: "Your City",
        state: "CA",
        zip: "12345",
        country: "US"
      }

      if (!fromAddressData.street1 || !fromAddressData.city) {
        alert('From address not configured! Please set it in settings.')
        return
      }

      // Use structured address from invoice
      const toAddress = {
        name: invoice.buyer_name || "Buyer",
        street1: invoice.buyer_address_line1,
        street2: invoice.buyer_address_line2 || "",
        city: invoice.buyer_city,
        state: invoice.buyer_state,
        zip: invoice.buyer_zip,
        country: invoice.buyer_country || "US",
        phone: invoice.buyer_phone || "",
        email: invoice.buyer_email || ""
      }

      const response = await fetch('/api/admin/invoices/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          invoiceId: invoice.id,
          fromAddress: fromAddressData,
          toAddress
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      // Success! Download the label
      if (data.label?.label_url) {
        window.open(data.label.label_url, '_blank')
      }

      alert(`✅ Label created!\n\nCost: $${data.label.cost.toFixed(2)}\nCost per phone: $${data.label.cost_per_item.toFixed(2)}\nTracking: ${data.label.tracking_number}`)

      await fetchData()
    } catch (error) {
      console.error('Error creating label:', error)
      alert(`Failed to create label: ${error.message}`)
    }
  }

  function handleDownloadPDF(invoice) {
    downloadInvoicePDF(invoice)
  }

  function handleDownloadExcel(invoice) {
    downloadInvoiceExcel(invoice)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">{authLoading ? 'Connecting wallet...' : 'Loading invoices...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-green-400" />
                <h1 className="text-3xl font-bold">Invoices</h1>
              </div>
              <p className="text-gray-400">
                Create and manage sales invoices
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={{
                ...invoice,
                invoice_items: invoice.invoice_items || [],
                buyer: invoice.buyer || invoice.buyers || null
              }}
              onUpdateStatus={handleUpdateStatus}
              onDownloadPDF={handleDownloadPDF}
              onDownloadExcel={handleDownloadExcel}
              onCreateLabel={handleCreateLabel}
              onDelete={handleDeleteInvoice}
            />
          ))}

          {invoices.length === 0 && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">No invoices yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          inventory={inventory}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateInvoice}
        />
      )}
    </div>
  )
}

function InvoiceCard({ invoice, onUpdateStatus, onDownloadPDF, onDownloadExcel, onCreateLabel, onDelete }) {
  const [creatingLabel, setCreatingLabel] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  const statusConfig = {
    pending: { icon: Clock, color: 'yellow', label: 'Pending' },
    draft: { icon: Clock, color: 'gray', label: 'Draft' },
    finalized: { icon: CheckCircle, color: 'purple', label: 'Finalized' },
    sent: { icon: Send, color: 'blue', label: 'Sent' },
    paid: { icon: CheckCircle, color: 'green', label: 'Paid' },
    shipped: { icon: Truck, color: 'indigo', label: 'Shipped' },
    cancelled: { icon: XCircle, color: 'red', label: 'Cancelled' }
  }

  const config = statusConfig[invoice.status] || statusConfig.pending
  const StatusIcon = config?.icon || Clock

  async function handleCreateLabel() {
    setCreatingLabel(true)
    try {
      await onCreateLabel(invoice)
    } finally {
      setCreatingLabel(false)
    }
  }

  const router = useRouter()

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold cursor-pointer hover:text-blue-400 transition-colors"
                onClick={() => router.push(`/admin/invoices/${invoice.id}`)}>{invoice.invoice_number}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-${config.color}-400/10 text-${config.color}-400 border border-${config.color}-400/20`}>
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            {new Date(invoice.created_at).toLocaleDateString()}
            {invoice.due_date && ` • Due ${new Date(invoice.due_date).toLocaleDateString()}`}
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold">
            ${parseFloat(invoice.total || invoice.total_amount || invoice.subtotal || 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">{invoice.invoice_items?.length || 0} items</div>
        </div>
      </div>

      {(invoice.buyer_name || invoice.buyer?.name) && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="text-sm font-medium">
            {invoice.buyer?.name || invoice.buyer_name}
          </div>
          {(invoice.buyer?.email || invoice.buyer_email) && (
            <div className="text-xs text-gray-400">
              {invoice.buyer?.email || invoice.buyer_email}
            </div>
          )}
        </div>
      )}

      {/* Items */}
      {invoice.invoice_items && invoice.invoice_items.length > 0 && (
        <div className="mb-4 space-y-2">
          {invoice.invoice_items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-400">{item.model} ({item.imei})</span>
              <span className="font-medium">${parseFloat(item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Shipping Info (if label created) */}
      {invoice.tracking_number && (
        <div className="mb-4 p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Shipped</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Tracking:</span>
              <a
                href={invoice.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline font-mono"
              >
                {invoice.tracking_number}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Carrier:</span>
              <span className="text-white">{invoice.shipping_carrier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cost:</span>
              <span className="text-white">${parseFloat(invoice.shipping_cost || 0).toFixed(2)}</span>
            </div>
            {invoice.label_url && (
              <div className="pt-2">
                <a
                  href={invoice.label_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Re-download Label
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-800">
        {/* View Details */}
        <button
          onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <FileText className="w-4 h-4" />
          View Details
        </button>

        {/* Download Menu */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>

          {showDownloadMenu && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-10">
              <button
                onClick={() => {
                  onDownloadPDF(invoice)
                  setShowDownloadMenu(false)
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                PDF Invoice
              </button>
              <button
                onClick={() => {
                  onDownloadExcel(invoice)
                  setShowDownloadMenu(false)
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-700 flex items-center gap-2 transition-colors border-t border-gray-700"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel Spreadsheet
              </button>
            </div>
          )}
        </div>

        {/* Draft: Show Finalize button */}
        {invoice.status === 'draft' && (
          <button
            onClick={() => {
              if (confirm('Finalize this invoice? You can then create a shipping label.')) {
                onUpdateStatus(invoice.id, 'finalized')
              }
            }}
            className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Finalize
          </button>
        )}

        {/* Finalized without label: Show Create Label button */}
        {invoice.status === 'finalized' && !invoice.tracking_number && (
          <button
            onClick={() => handleCreateLabel(invoice)}
            disabled={creatingLabel}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {creatingLabel ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Creating...
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                Create Label
              </>
            )}
          </button>
        )}

        {/* Sent (after label created): Show Mark Paid button */}
        {invoice.status === 'sent' && (
          <button
            onClick={() => onUpdateStatus(invoice.id, 'paid')}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Mark Paid
          </button>
        )}

        {/* Delete button - always visible */}
        <button
          onClick={() => onDelete(invoice.id)}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  )
}

function CreateInvoiceModal({ inventory, onClose, onCreate }) {
  const { publicKey } = useWallet()
  const [buyers, setBuyers] = useState([])
  const [showBuyerDropdown, setShowBuyerDropdown] = useState(false)
  const [saveBuyer, setSaveBuyer] = useState(false)
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    buyer_address_line1: '',
    buyer_address_line2: '',
    buyer_city: '',
    buyer_state: '',
    buyer_zip: '',
    buyer_country: 'US',
    notes: '',
    status: 'draft',
    items: []
  })

  // Fetch buyers on mount
  useEffect(() => {
    async function fetchBuyers() {
      try {
        const res = await fetch('/api/admin/buyers')
        const data = await res.json()
        if (data.success) {
          setBuyers(data.buyers || [])
        }
      } catch (error) {
        console.error('Error fetching buyers:', error)
      }
    }
    fetchBuyers()
  }, [])

  function addItem(item) {
    setFormData({
      ...formData,
      items: [...formData.items, {
        inventory_id: item.id,
        model: item.model,
        imei: item.imei,
        price: item.price_paid * 1.15 // Default 15% markup
      }]
    })
  }

  function removeItem(index) {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  function updateItemPrice(index, price) {
    const newItems = [...formData.items]
    newItems[index].price = parseFloat(price) || 0
    setFormData({ ...formData, items: newItems })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (formData.items.length === 0) {
      alert('Please add at least one item')
      return
    }

    // Save buyer if checkbox is checked
    if (saveBuyer && formData.buyer_name) {
      try {
        await fetch('/api/admin/buyers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: publicKey.toString(),
            buyer: {
              name: formData.buyer_name,
              email: formData.buyer_email || null,
              phone: formData.buyer_phone || null,
              address_line1: formData.buyer_address_line1,
              address_line2: formData.buyer_address_line2 || null,
              city: formData.buyer_city,
              state: formData.buyer_state,
              zip: formData.buyer_zip,
              country: formData.buyer_country || 'US'
            }
          })
        })
      } catch (error) {
        console.error('Error saving buyer:', error)
      }
    }

    onCreate(formData)
  }

  function selectBuyer(buyer) {
    setFormData({
      ...formData,
      buyer_name: buyer.name,
      buyer_email: buyer.email || '',
      buyer_phone: buyer.phone || '',
      buyer_address_line1: buyer.address_line1 || '',
      buyer_address_line2: buyer.address_line2 || '',
      buyer_city: buyer.city || '',
      buyer_state: buyer.state || '',
      buyer_zip: buyer.zip || '',
      buyer_country: buyer.country || 'US'
    })
    setShowBuyerDropdown(false)
  }

  // Filter buyers based on name input
  const filteredBuyers = buyers.filter(b =>
    b.name.toLowerCase().includes(formData.buyer_name.toLowerCase())
  )

  const total = formData.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0)
  const selectedIds = new Set(formData.items.map(i => i.inventory_id))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">Create Invoice</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Buyer Info */}
            <div>
              <h3 className="font-medium mb-3">Buyer Information</h3>
              <div className="space-y-3">
                {/* Buyer Name with Autocomplete */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buyer Name (start typing to search saved buyers)"
                    value={formData.buyer_name}
                    onChange={(e) => {
                      setFormData({ ...formData, buyer_name: e.target.value })
                      setShowBuyerDropdown(e.target.value.length > 0 && filteredBuyers.length > 0)
                    }}
                    onFocus={() => setShowBuyerDropdown(formData.buyer_name.length > 0 && filteredBuyers.length > 0)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />

                  {/* Buyer Dropdown */}
                  {showBuyerDropdown && filteredBuyers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-10">
                      {filteredBuyers.slice(0, 5).map((buyer) => (
                        <button
                          key={buyer.id}
                          type="button"
                          onClick={() => selectBuyer(buyer)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors"
                        >
                          <div className="font-medium">{buyer.name}</div>
                          {buyer.email && (
                            <div className="text-xs text-gray-400">{buyer.email}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.buyer_email}
                    onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.buyer_phone}
                    onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Address Line 1*"
                  value={formData.buyer_address_line1}
                  onChange={(e) => setFormData({ ...formData, buyer_address_line1: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (optional)"
                  value={formData.buyer_address_line2}
                  onChange={(e) => setFormData({ ...formData, buyer_address_line2: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />

                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City*"
                    value={formData.buyer_city}
                    onChange={(e) => setFormData({ ...formData, buyer_city: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State*"
                    value={formData.buyer_state}
                    onChange={(e) => setFormData({ ...formData, buyer_state: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    maxLength="2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ZIP*"
                    value={formData.buyer_zip}
                    onChange={(e) => setFormData({ ...formData, buyer_zip: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>

                {/* Save Buyer Checkbox */}
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveBuyer}
                    onChange={(e) => setSaveBuyer(e.target.checked)}
                    className="rounded bg-gray-700 border-gray-600"
                  />
                  Save this buyer for future invoices
                </label>
              </div>
            </div>

            {/* Selected Items */}
            {formData.items.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Invoice Items</h3>
                <div className="space-y-2">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-gray-800 p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.model}</div>
                        <div className="text-xs text-gray-400">{item.imei}</div>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItemPrice(idx, e.target.value)}
                        className="w-32 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <div className="text-right text-xl font-bold pt-2 border-t border-gray-700">
                    Total: ${total.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Available Inventory */}
            <div>
              <h3 className="font-medium mb-3">Add Items from Inventory</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {inventory.filter(item => !selectedIds.has(item.id)).map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                    <div>
                      <div className="font-medium">{item.model}</div>
                      <div className="text-xs text-gray-400">{item.imei} • Paid ${item.price_paid.toFixed(0)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addItem(item)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="font-medium mb-3">Notes</h3>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white resize-none"
                placeholder="Internal notes..."
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-800 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Create Invoice
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
