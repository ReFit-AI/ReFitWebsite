'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import {
  Package,
  Plus,
  Upload,
  Edit,
  Trash2,
  Save,
  X,
  Download
} from 'lucide-react'

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET

export default function AdminInventoryPage() {
  const { publicKey, connected } = useWallet()
  const router = useRouter()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [uploadingCSV, setUploadingCSV] = useState(false)

  useEffect(() => {
    if (!connected || !publicKey) {
      router.push('/stake')
      return
    }

    if (publicKey.toString() !== ADMIN_WALLET) {
      router.push('/stake')
      return
    }

    fetchInventory()
  }, [connected, publicKey, router])

  async function fetchInventory() {
    try {
      const response = await fetch('/api/admin/inventory')
      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setInventory(data.inventory || [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddItem(item) {
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          item
        })
      })

      if (!response.ok) throw new Error('Failed to add item')

      await fetchInventory()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Failed to add item')
    }
  }

  async function handleUpdateItem(id, updates) {
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          id,
          updates
        })
      })

      if (!response.ok) throw new Error('Failed to update item')

      await fetchInventory()
      setEditingItem(null)
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item')
    }
  }

  async function handleDeleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          id
        })
      })

      if (!response.ok) throw new Error('Failed to delete item')

      await fetchInventory()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  async function handleCSVUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCSV(true)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())

      // Skip header
      const dataLines = lines.slice(1).filter(line => {
        const values = line.split(',')
        return values[0] && values[1]
      })

      const items = dataLines.map(line => {
        const [model, imei, pricePaid, priceSold, notes, batteryHealth, seller] = line.split(',')

        const pricePaidNum = parseFloat(pricePaid) || 0
        const priceSoldNum = parseFloat(priceSold) || 0

        let status = 'in_stock'
        if (notes && notes.toLowerCase().includes('returned')) {
          status = 'returned'
        } else if (priceSoldNum > 0) {
          status = 'sold'
        }

        let condition = 'Used'
        if (model.includes('NIB')) {
          condition = 'New in Box'
        } else if (model.includes('-CB') || notes?.toLowerCase().includes('cracked')) {
          condition = 'Cracked'
        }

        return {
          model: model.replace(/-CB$/, '').trim(),
          imei: imei.trim(),
          price_paid: pricePaidNum,
          price_sold: priceSoldNum > 0 ? priceSoldNum : null,
          battery_health: batteryHealth ? parseInt(batteryHealth) : null,
          condition,
          notes: notes || null,
          seller: seller || null,
          status
        }
      })

      // Upload items
      const response = await fetch('/api/admin/inventory/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          items
        })
      })

      if (!response.ok) throw new Error('Failed to upload CSV')

      await fetchInventory()
      alert(`Successfully imported ${items.length} items`)
    } catch (error) {
      console.error('Error uploading CSV:', error)
      alert('Failed to upload CSV')
    } finally {
      setUploadingCSV(false)
      e.target.value = ''
    }
  }

  function exportToCSV() {
    const headers = ['Model', 'IMEI', 'Price Paid', 'Price Sold', 'Notes', 'BH', 'Seller']
    const rows = inventory.map(item => [
      item.model,
      item.imei,
      item.price_paid,
      item.price_sold || '',
      item.notes || '',
      item.battery_health || '',
      item.seller || ''
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-8 h-8 text-green-400" />
                <h1 className="text-3xl font-bold">Inventory Management</h1>
              </div>
              <p className="text-gray-400">
                Manage phone inventory, track sales, and generate invoices
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>

              <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                {uploadingCSV ? 'Uploading...' : 'Import CSV'}
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  disabled={uploadingCSV}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">IMEI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Profit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {inventory.map((item) => (
                  <InventoryRow
                    key={item.id}
                    item={item}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => handleDeleteItem(item.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <ItemModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddItem}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <ItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updates) => handleUpdateItem(editingItem.id, updates)}
        />
      )}
    </div>
  )
}

function InventoryRow({ item, onEdit, onDelete }) {
  const profit = item.price_sold ? item.price_sold - item.price_paid : 0

  return (
    <tr className="hover:bg-gray-800/50">
      <td className="px-6 py-4">
        <div className="font-medium">{item.model}</div>
        {item.condition && (
          <div className="text-xs text-gray-500">{item.condition}</div>
        )}
      </td>
      <td className="px-6 py-4 font-mono text-sm text-gray-400">{item.imei}</td>
      <td className="px-6 py-4 font-medium">${item.price_paid.toFixed(2)}</td>
      <td className="px-6 py-4">
        {item.price_sold ? (
          <span className="text-green-400">${item.price_sold.toFixed(2)}</span>
        ) : (
          <span className="text-gray-600">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        {item.price_sold ? (
          <span className={profit > 0 ? 'text-green-400' : 'text-red-400'}>
            ${profit.toFixed(0)}
          </span>
        ) : (
          <span className="text-gray-600">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.status === 'sold' ? 'bg-green-400/10 text-green-400' :
          item.status === 'in_stock' ? 'bg-blue-400/10 text-blue-400' :
          'bg-red-400/10 text-red-400'
        }`}>
          {item.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <Edit className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function ItemModal({ item, onClose, onSave }) {
  const [formData, setFormData] = useState({
    model: item?.model || '',
    imei: item?.imei || '',
    price_paid: item?.price_paid || '',
    price_sold: item?.price_sold || '',
    battery_health: item?.battery_health || '',
    condition: item?.condition || 'Used',
    notes: item?.notes || '',
    seller: item?.seller || '',
    status: item?.status || 'in_stock',
    shipping_cost_in: item?.shipping_cost_in || '',
    shipping_cost_out: item?.shipping_cost_out || '',
    tracking_number: item?.tracking_number || '',
    shipping_carrier: item?.shipping_carrier || ''
  })

  function handleSubmit(e) {
    e.preventDefault()

    const data = {
      ...formData,
      price_paid: parseFloat(formData.price_paid) || 0,
      price_sold: formData.price_sold ? parseFloat(formData.price_sold) : null,
      battery_health: formData.battery_health ? parseInt(formData.battery_health) : null,
      shipping_cost_in: formData.shipping_cost_in ? parseFloat(formData.shipping_cost_in) : 0,
      shipping_cost_out: formData.shipping_cost_out ? parseFloat(formData.shipping_cost_out) : 0
    }

    onSave(data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">{item ? 'Edit Item' : 'Add Item'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Model</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">IMEI</label>
              <input
                type="text"
                required
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Price Paid</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price_paid}
                onChange={(e) => setFormData({ ...formData, price_paid: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Price Sold</label>
              <input
                type="number"
                step="0.01"
                value={formData.price_sold}
                onChange={(e) => setFormData({ ...formData, price_sold: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option>Used</option>
                <option>New in Box</option>
                <option>Cracked</option>
                <option>Refurbished</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Battery %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.battery_health}
                onChange={(e) => setFormData({ ...formData, battery_health: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="in_stock">In Stock</option>
                <option value="sold">Sold</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Seller</label>
            <input
              type="text"
              value={formData.seller}
              onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          {/* Shipping Costs */}
          <div className="border-t border-gray-700 pt-4 mt-2">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Shipping Costs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Inbound Shipping ($)
                  <span className="text-xs text-gray-500 ml-1">(cost to receive)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.shipping_cost_in}
                  onChange={(e) => setFormData({ ...formData, shipping_cost_in: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Outbound Shipping ($)
                  <span className="text-xs text-gray-500 ml-1">(cost to ship)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.shipping_cost_out}
                  onChange={(e) => setFormData({ ...formData, shipping_cost_out: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={formData.tracking_number}
                  onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                  placeholder="1Z999AA10123456784"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Carrier</label>
                <select
                  value={formData.shipping_carrier}
                  onChange={(e) => setFormData({ ...formData, shipping_carrier: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select carrier...</option>
                  <option value="USPS">USPS</option>
                  <option value="UPS">UPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save
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
