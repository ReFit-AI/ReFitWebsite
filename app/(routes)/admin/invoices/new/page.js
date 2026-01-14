'use client'

// Force dynamic rendering (no prerender)
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  FileText,
  Package,
  User,
  Trash2,
  Save,
  ArrowLeft,
  Calculator,
  AlertCircle
} from 'lucide-react'

const ADMIN_WALLET = process.env.ADMIN_WALLET

function NewInvoiceContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { publicKey, connected } = useWallet()

  const [items, setItems] = useState([])
  const [buyer, setBuyer] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  })
  const [invoiceDetails, setInvoiceDetails] = useState({
    notes: '',
    paymentTerms: 'Net 30',
    shippingMethod: 'Standard Shipping'
  })
  const [loading, setLoading] = useState(false)
  const [selectedBuyer, setSelectedBuyer] = useState(null)
  const [buyers, setBuyers] = useState([])

  // Load items from URL params
  useEffect(() => {
    const itemsParam = searchParams.get('items')
    if (itemsParam) {
      try {
        const decodedItems = JSON.parse(decodeURIComponent(itemsParam))
        // Add default selling price
        const itemsWithPrice = decodedItems.map(item => ({
          ...item,
          selling_price: item.price_paid * 1.15 // Default 15% markup
        }))
        setItems(itemsWithPrice)
      } catch (error) {
        console.error('Failed to parse items:', error)
      }
    }

    // Load buyers list
    fetchBuyers()
  }, [searchParams])

  async function fetchBuyers() {
    try {
      const response = await fetch('/api/admin/buyers')
      const data = await response.json()
      if (data.success) {
        setBuyers(data.buyers || [])
      }
    } catch (error) {
      console.error('Failed to fetch buyers:', error)
    }
  }

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.selling_price || 0), 0)
    return { subtotal }
  }

  const { subtotal } = calculateTotals()

  // Update item price
  const updateItemPrice = (itemId, newPrice) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, selling_price: parseFloat(newPrice) || 0 } : item
    ))
  }

  // Remove item from invoice
  const removeItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Select existing buyer
  const handleSelectBuyer = (buyerId) => {
    const selected = buyers.find(b => b.id === buyerId)
    if (selected) {
      setSelectedBuyer(selected)
      setBuyer({
        name: selected.name,
        company: selected.company || '',
        email: selected.email,
        phone: selected.phone || '',
        address: selected.address || '',
        city: selected.city || '',
        state: selected.state || '',
        zip: selected.zip || '',
        country: selected.country || 'US'
      })
    }
  }

  // Create invoice
  const handleCreateInvoice = async () => {
    if (!buyer.name || !buyer.email) {
      alert('Please provide buyer name and email')
      return
    }

    if (items.length === 0) {
      alert('Please add items to the invoice')
      return
    }

    setLoading(true)

    try {
      // Create or update buyer
      let buyerId = selectedBuyer?.id

      if (!buyerId) {
        // Create new buyer - ensure all fields are present
        const newBuyerData = {
          name: buyer.name,
          email: buyer.email,
          phone: buyer.phone || null,
          company: buyer.company || null,
          address: buyer.address || null,
          city: buyer.city || null,
          state: buyer.state || null,
          zip: buyer.zip || null,
          country: buyer.country || 'US'
        }

        const buyerResponse = await fetch('/api/admin/buyers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: publicKey.toString(),
            buyer: newBuyerData
          })
        })

        const buyerData = await buyerResponse.json()
        if (!buyerData.success) {
          throw new Error(buyerData.error || 'Failed to create buyer')
        }
        buyerId = buyerData.buyer.id
      }

      // Create invoice
      const invoiceResponse = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          invoice: {
            buyer_id: buyerId,
            items: items.map(item => ({
              inventory_id: item.id,
              model: item.model,
              imei: item.imei,
              price: item.selling_price,
              cost: item.price_paid
            })),
            subtotal,
            total: subtotal, // Add tax calculation if needed
            notes: invoiceDetails.notes,
            payment_terms: invoiceDetails.paymentTerms,
            shipping_method: invoiceDetails.shippingMethod
          }
        })
      })

      const invoiceData = await invoiceResponse.json()

      if (!invoiceData.success) {
        throw new Error(invoiceData.error || 'Failed to create invoice')
      }

      // Update inventory items to mark as sold
      for (const item of items) {
        await fetch('/api/admin/inventory', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: publicKey.toString(),
            id: item.id,
            updates: {
              status: 'sold',
              price_sold: item.selling_price,
              sold_at: new Date().toISOString()
            }
          })
        })
      }

      alert(`Invoice ${invoiceData.invoice.invoice_number} created successfully!`)
      // Redirect to the invoice details page
      router.push(`/admin/invoices/${invoiceData.invoice.id}`)
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert(`Failed to create invoice: ${error.message}`)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-400" />
                <h1 className="text-3xl font-bold">Create Invoice</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Items & Buyer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Section */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-400" />
                Items
              </h2>

              {items.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No items added. Go to inventory to select items.
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.model}</div>
                          <div className="text-sm text-gray-400">
                            IMEI: {item.imei} | Battery: {item.battery_health}%
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <label className="text-xs text-gray-400">Selling Price</label>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400">$</span>
                              <input
                                type="number"
                                value={item.selling_price || ''}
                                onChange={(e) => updateItemPrice(item.id, e.target.value)}
                                className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-right"
                                step="0.01"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 hover:bg-gray-700 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buyer Section */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Buyer Information
              </h2>

              {/* Existing Buyers Dropdown */}
              {buyers.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Select Existing Buyer
                  </label>
                  <select
                    value={selectedBuyer?.id || ''}
                    onChange={(e) => handleSelectBuyer(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                  >
                    <option value="">-- New Buyer --</option>
                    {buyers.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.company ? `(${b.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={buyer.name}
                    onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={buyer.company}
                    onChange={(e) => setBuyer({ ...buyer, company: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={buyer.email}
                    onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={buyer.phone}
                    onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={buyer.address}
                    onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={buyer.city}
                    onChange={(e) => setBuyer({ ...buyer, city: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                    placeholder="Los Angeles"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={buyer.state}
                    onChange={(e) => setBuyer({ ...buyer, state: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                    placeholder="CA"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={buyer.zip}
                    onChange={(e) => setBuyer({ ...buyer, zip: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                    placeholder="90001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Country
                  </label>
                  <select
                    value={buyer.country}
                    onChange={(e) => setBuyer({ ...buyer, country: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="MX">Mexico</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold mb-4">Additional Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={invoiceDetails.paymentTerms}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, paymentTerms: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                  >
                    <option>Due on Receipt</option>
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 45</option>
                    <option>Net 60</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={invoiceDetails.notes}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, notes: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Additional notes for the invoice..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-400" />
                Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Items</span>
                  <span>{items.length}</span>
                </div>

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCreateInvoice}
                disabled={loading || items.length === 0 || !buyer.name || !buyer.email}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>Loading...</>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Invoice
                  </>
                )}
              </button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Invoice will be generated and items will be marked as sold
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <NewInvoiceContent />
    </Suspense>
  )
}