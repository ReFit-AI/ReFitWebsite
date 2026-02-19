'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import {
  ShoppingCart,
  RefreshCw,
  Users,
  History,
  ExternalLink,
  Search,
  Download,
  Edit,
  X,
  Save,
  Check,
  AlertCircle,
  Link2,
  Unlink,
  Mail,
  Package,
  DollarSign,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const TABS = [
  { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'sync-log', label: 'Sync Log', icon: History },
]

const STATUS_OPTIONS = ['All', 'Active', 'Shipped', 'Delivered', 'Cancelled']
const RELATIONSHIP_OPTIONS = ['all', 'new', 'active', 'vip', 'inactive']

export default function EbayHubPage() {
  const { isAdmin, authLoading, publicKey } = useAdminAuth()

  // Connection state
  const [connection, setConnection] = useState({ connected: false, tokenStatus: 'none' })
  const [connectionLoading, setConnectionLoading] = useState(true)
  const [showManualToken, setShowManualToken] = useState(false)
  const [manualAccessToken, setManualAccessToken] = useState('')
  const [manualRefreshToken, setManualRefreshToken] = useState('')
  const [savingToken, setSavingToken] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState('purchases')

  // Purchases state
  const [purchases, setPurchases] = useState([])
  const [purchaseStats, setPurchaseStats] = useState({})
  const [purchaseFilter, setPurchaseFilter] = useState('All')
  const [purchaseSearch, setPurchaseSearch] = useState('')
  const [purchasePage, setPurchasePage] = useState(1)
  const [purchaseTotal, setPurchaseTotal] = useState(0)
  const [purchasesLoading, setPurchasesLoading] = useState(false)

  // Contacts state
  const [contacts, setContacts] = useState([])
  const [contactStats, setContactStats] = useState({})
  const [contactRelFilter, setContactRelFilter] = useState('all')
  const [contactMailingFilter, setContactMailingFilter] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const [contactPage, setContactPage] = useState(1)
  const [contactTotal, setContactTotal] = useState(0)
  const [contactsLoading, setContactsLoading] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  // Sync state
  const [syncLogs, setSyncLogs] = useState([])
  const [syncing, setSyncing] = useState(false)

  // Toasts
  const [toast, setToast] = useState(null)

  const walletStr = publicKey?.toString() || ''

  // Check connection on load
  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchConnectionStatus()
    }
  }, [authLoading, isAdmin]) // eslint-disable-line react-hooks/exhaustive-deps

  // Show connected toast from redirect (check URL params directly to avoid Suspense requirement)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('connected') === 'true') {
      showToast('eBay account connected successfully!', 'success')
    }
    if (params.get('error')) {
      showToast(`Connection failed: ${params.get('error')}`, 'error')
    }
  }, [])

  // Load data when tab changes
  useEffect(() => {
    if (!isAdmin || !connection.connected) return
    if (activeTab === 'purchases') fetchPurchases()
    if (activeTab === 'contacts') fetchContacts()
    if (activeTab === 'sync-log') fetchSyncLogs()
  }, [activeTab, isAdmin, connection.connected]) // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(message, type = 'info') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function fetchConnectionStatus() {
    try {
      setConnectionLoading(true)
      const res = await fetch('/api/admin/ebay/status', {
        headers: { 'x-admin-wallet': walletStr }
      })
      const data = await res.json()
      if (data.success) {
        setConnection(data)
      }
    } catch (err) {
      console.error('Failed to fetch eBay status:', err)
    } finally {
      setConnectionLoading(false)
    }
  }

  async function handleConnect() {
    try {
      const res = await fetch('/api/admin/ebay/auth', {
        headers: { 'x-admin-wallet': walletStr }
      })
      const data = await res.json()
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl
      } else {
        showToast('Failed to get auth URL', 'error')
      }
    } catch (err) {
      showToast('Connection error', 'error')
    }
  }

  async function handleManualToken() {
    if (!manualAccessToken.trim()) {
      showToast('Access token is required', 'error')
      return
    }
    try {
      setSavingToken(true)
      const res = await fetch('/api/admin/ebay/manual-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletStr,
          accessToken: manualAccessToken.trim(),
          refreshToken: manualRefreshToken.trim() || null
        })
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Connected as ${data.data.ebay_username}!`, 'success')
        setShowManualToken(false)
        setManualAccessToken('')
        setManualRefreshToken('')
        fetchConnectionStatus()
      } else {
        showToast(data.error || 'Failed to store token', 'error')
      }
    } catch (err) {
      showToast('Failed to save token', 'error')
    } finally {
      setSavingToken(false)
    }
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect your eBay account? Existing data will be preserved.')) return
    try {
      const res = await fetch('/api/admin/ebay/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletStr })
      })
      const data = await res.json()
      if (data.success) {
        setConnection({ connected: false, tokenStatus: 'none' })
        showToast('eBay account disconnected', 'info')
      }
    } catch (err) {
      showToast('Disconnect failed', 'error')
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/ebay/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletStr })
      })
      const data = await res.json()
      if (data.success) {
        showToast(`Synced! ${data.totalFetched} fetched, ${data.totalCreated} new, ${data.totalUpdated} updated`, 'success')
        fetchPurchases()
        fetchSyncLogs()
      } else {
        showToast(data.error || 'Sync failed', 'error')
      }
    } catch (err) {
      showToast('Sync failed', 'error')
    } finally {
      setSyncing(false)
    }
  }

  async function fetchPurchases() {
    setPurchasesLoading(true)
    try {
      const params = new URLSearchParams({
        page: purchasePage.toString(),
        perPage: '50',
        ...(purchaseFilter !== 'All' ? { status: purchaseFilter } : {}),
        ...(purchaseSearch ? { search: purchaseSearch } : {})
      })
      const res = await fetch(`/api/admin/ebay/purchases?${params}`, {
        headers: { 'x-admin-wallet': walletStr }
      })
      const data = await res.json()
      if (data.success) {
        setPurchases(data.purchases)
        setPurchaseTotal(data.total)
        setPurchaseStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch purchases:', err)
    } finally {
      setPurchasesLoading(false)
    }
  }

  async function fetchContacts() {
    setContactsLoading(true)
    try {
      const params = new URLSearchParams({
        page: contactPage.toString(),
        perPage: '50',
        ...(contactRelFilter !== 'all' ? { relationship: contactRelFilter } : {}),
        ...(contactMailingFilter ? { mailing_list: 'true' } : {}),
        ...(contactSearch ? { search: contactSearch } : {})
      })
      const res = await fetch(`/api/admin/ebay/contacts?${params}`, {
        headers: { 'x-admin-wallet': walletStr }
      })
      const data = await res.json()
      if (data.success) {
        setContacts(data.contacts)
        setContactTotal(data.total)
        setContactStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err)
    } finally {
      setContactsLoading(false)
    }
  }

  async function fetchSyncLogs() {
    // Sync log tab manages its own data fetching internally
  }

  async function handleContactUpdate(id, updates) {
    try {
      const res = await fetch('/api/admin/ebay/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletStr, id, updates })
      })
      const data = await res.json()
      if (data.success) {
        setContacts(prev => prev.map(c => c.id === id ? data.contact : c))
        setEditingContact(null)
        showToast('Contact updated', 'success')
      } else {
        showToast(data.error || 'Update failed', 'error')
      }
    } catch (err) {
      showToast('Update failed', 'error')
    }
  }

  async function handleToggleMailingList(contact) {
    await handleContactUpdate(contact.id, { mailing_list: !contact.mailing_list })
  }

  async function handleExportCSV() {
    try {
      const res = await fetch('/api/admin/ebay/contacts/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: walletStr,
          filters: {
            ...(contactMailingFilter ? { mailing_list: true } : {}),
            ...(contactRelFilter !== 'all' ? { relationship: contactRelFilter } : {})
          }
        })
      })

      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ebay-contacts-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      showToast('CSV exported', 'success')
    } catch (err) {
      showToast('Export failed', 'error')
    }
  }

  // Trigger searches on filter change
  useEffect(() => {
    if (isAdmin && connection.connected && activeTab === 'purchases') {
      setPurchasePage(1)
      fetchPurchases()
    }
  }, [purchaseFilter, purchaseSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAdmin && connection.connected && activeTab === 'contacts') {
      setContactPage(1)
      fetchContacts()
    }
  }, [contactRelFilter, contactMailingFilter, contactSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  // Page changes
  useEffect(() => {
    if (isAdmin && connection.connected && activeTab === 'purchases') fetchPurchases()
  }, [purchasePage]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAdmin && connection.connected && activeTab === 'contacts') fetchContacts()
  }, [contactPage]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auth guard
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4" />
          <p className="text-gray-400">Connecting wallet...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl mb-2">Admin Access Required</p>
          <p className="text-gray-400">Please connect with admin wallet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-500/90 text-white' :
          toast.type === 'error' ? 'bg-red-500/90 text-white' :
          'bg-blue-500/90 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="w-8 h-8 text-orange-400" />
                <h1 className="text-3xl font-bold">eBay Hub</h1>
              </div>
              <p className="text-gray-400">
                Track purchases, manage seller contacts, sync with eBay
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {connectionLoading ? (
          <div className="bg-gray-800/50 rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
            <span className="text-gray-400">Checking eBay connection...</span>
          </div>
        ) : connection.connected ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link2 className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">
                Connected as <span className="font-bold">{connection.ebayUsername}</span>
              </span>
              {connection.tokenStatus === 'expiring_soon' && (
                <span className="text-yellow-400 text-sm">(token expiring soon)</span>
              )}
              {connection.lastSyncAt && (
                <span className="text-gray-500 text-sm">
                  Last sync: {new Date(connection.lastSyncAt).toLocaleString()}
                </span>
              )}
            </div>
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
            >
              <Unlink className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">eBay account not connected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowManualToken(!showManualToken)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  Paste Token
                </button>
                <button
                  onClick={handleConnect}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Connect eBay
                </button>
              </div>
            </div>
            {showManualToken && (
              <div className="mt-4 pt-4 border-t border-red-500/20 space-y-3">
                <p className="text-sm text-gray-400">Paste your OAuth token from the eBay Developer Portal:</p>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">User Access Token *</label>
                  <input
                    type="password"
                    value={manualAccessToken}
                    onChange={(e) => setManualAccessToken(e.target.value)}
                    placeholder="v^1.1#i^1#p^3#..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Refresh Token (optional, for auto-renewal)</label>
                  <input
                    type="password"
                    value={manualRefreshToken}
                    onChange={(e) => setManualRefreshToken(e.target.value)}
                    placeholder="v^1.1#i^1#r^1#..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <button
                  onClick={handleManualToken}
                  disabled={savingToken || !manualAccessToken.trim()}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {savingToken ? 'Saving...' : 'Save Token'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 border-b border-gray-800">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-400 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'purchases' && (
          <PurchasesTab
            purchases={purchases}
            stats={purchaseStats}
            filter={purchaseFilter}
            setFilter={setPurchaseFilter}
            search={purchaseSearch}
            setSearch={setPurchaseSearch}
            page={purchasePage}
            setPage={setPurchasePage}
            total={purchaseTotal}
            loading={purchasesLoading}
            syncing={syncing}
            onSync={handleSync}
            connected={connection.connected}
          />
        )}
        {activeTab === 'contacts' && (
          <ContactsTab
            contacts={contacts}
            stats={contactStats}
            relFilter={contactRelFilter}
            setRelFilter={setContactRelFilter}
            mailingFilter={contactMailingFilter}
            setMailingFilter={setContactMailingFilter}
            search={contactSearch}
            setSearch={setContactSearch}
            page={contactPage}
            setPage={setContactPage}
            total={contactTotal}
            loading={contactsLoading}
            onToggleMailingList={handleToggleMailingList}
            onEdit={setEditingContact}
            onExportCSV={handleExportCSV}
            connected={connection.connected}
          />
        )}
        {activeTab === 'sync-log' && (
          <SyncLogTab
            logs={syncLogs}
            walletStr={walletStr}
            connected={connection.connected}
          />
        )}
      </div>

      {/* Edit Contact Modal */}
      {editingContact && (
        <ContactEditModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSave={handleContactUpdate}
        />
      )}
    </div>
  )
}

// ============================================================
// Purchases Tab
// ============================================================
function PurchasesTab({
  purchases, stats, filter, setFilter, search, setSearch,
  page, setPage, total, loading, syncing, onSync, connected
}) {
  if (!connected) {
    return <EmptyState message="Connect your eBay account to view purchases" />
  }

  const totalPages = Math.ceil(total / 50) || 1

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Purchases" value={stats.totalPurchases || 0} icon={ShoppingCart} color="text-orange-400" />
        <StatCard label="Total Spent" value={`$${(stats.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={DollarSign} color="text-green-400" />
        <StatCard label="Awaiting Delivery" value={stats.awaitingDelivery || 0} icon={Package} color="text-blue-400" />
        <StatCard label="Unique Sellers" value={stats.uniqueSellers || 0} icon={Users} color="text-purple-400" />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white w-64 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <button
            onClick={onSync}
            disabled={syncing}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Seller</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tracking</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-3" />
                    Loading purchases...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No purchases found. Click &quot;Sync Now&quot; to pull from eBay.
                  </td>
                </tr>
              ) : purchases.map(p => (
                <tr key={p.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {p.order_date ? new Date(p.order_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white max-w-xs truncate" title={p.title}>
                      {p.title}
                    </div>
                    {p.ebay_item_id && (
                      <a
                        href={`https://www.ebay.com/itm/${p.ebay_item_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-orange-400/60 hover:text-orange-400 flex items-center gap-1"
                      >
                        #{p.ebay_item_id} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white">
                      ${parseFloat(p.total_cost || 0).toFixed(2)}
                    </div>
                    {parseFloat(p.shipping_cost) > 0 && (
                      <div className="text-xs text-gray-500">+${parseFloat(p.shipping_cost).toFixed(2)} ship</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {p.seller_username || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {p.tracking_number ? (
                      <a
                        href={p.tracking_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                      >
                        {p.shipping_carrier && <span className="text-gray-500">{p.shipping_carrier}</span>}
                        {p.tracking_number.slice(0, 12)}...
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-600">No tracking</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.order_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      )}
    </div>
  )
}

// ============================================================
// Contacts Tab
// ============================================================
function ContactsTab({
  contacts, stats, relFilter, setRelFilter, mailingFilter, setMailingFilter,
  search, setSearch, page, setPage, total, loading,
  onToggleMailingList, onEdit, onExportCSV, connected
}) {
  if (!connected) {
    return <EmptyState message="Connect your eBay account to view contacts" />
  }

  const totalPages = Math.ceil(total / 50) || 1

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Contacts" value={stats.totalContacts || 0} icon={Users} color="text-orange-400" />
        <StatCard label="On Mailing List" value={stats.onMailingList || 0} icon={Mail} color="text-green-400" />
        <StatCard label="VIP Sellers" value={stats.vipSellers || 0} icon={Star} color="text-yellow-400" />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {RELATIONSHIP_OPTIONS.map(r => (
            <button
              key={r}
              onClick={() => setRelFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                relFilter === r
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {r}
            </button>
          ))}

          <button
            onClick={() => setMailingFilter(!mailingFilter)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              mailingFilter
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Mailing List
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white w-64 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <button
            onClick={onExportCSV}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Seller</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Deals</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total Spent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Avg Deal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Purchase</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Mailing List</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-3" />
                    Loading contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No contacts found. Contacts are auto-harvested when you sync purchases.
                  </td>
                </tr>
              ) : contacts.map(c => (
                <tr key={c.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-white">{c.display_name || c.ebay_username}</div>
                    {c.display_name && (
                      <div className="text-xs text-gray-500">@{c.ebay_username}</div>
                    )}
                    <RelationshipBadge relationship={c.relationship} />
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{c.total_purchases}</td>
                  <td className="px-4 py-3 text-sm text-green-400 font-medium">
                    ${parseFloat(c.total_spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    ${parseFloat(c.avg_deal_size || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {c.last_purchase_at ? new Date(c.last_purchase_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleMailingList(c)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        c.mailing_list ? 'bg-green-500' : 'bg-gray-700'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        c.mailing_list ? 'left-5.5 right-0.5' : 'left-0.5'
                      }`} style={{ left: c.mailing_list ? '22px' : '2px' }} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEdit(c)}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                      title="Edit contact"
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      )}
    </div>
  )
}

// ============================================================
// Sync Log Tab
// ============================================================
function SyncLogTab({ walletStr, connected }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (connected) fetchLogs()
  }, [connected]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchLogs() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ebay/sync-log', {
        headers: { 'x-admin-wallet': walletStr }
      })
      const data = await res.json()
      if (data.success) {
        setLogs(data.logs || [])
      }
    } catch (err) {
      console.error('Failed to fetch sync logs:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return <EmptyState message="Connect your eBay account to view sync history" />
  }

  return (
    <div>
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fetched</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Updated</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-3" />
                    Loading sync logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No sync runs yet. Click &quot;Sync Now&quot; on the Purchases tab to start.
                  </td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-white capitalize">{log.sync_type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      log.status === 'completed' ? 'bg-green-400/10 text-green-400' :
                      log.status === 'failed' ? 'bg-red-400/10 text-red-400' :
                      'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{log.records_fetched}</td>
                  <td className="px-4 py-3 text-sm text-green-400">{log.records_created}</td>
                  <td className="px-4 py-3 text-sm text-blue-400">{log.records_updated}</td>
                  <td className="px-4 py-3 text-sm text-red-400 max-w-xs truncate">
                    {log.error_message || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Contact Edit Modal
// ============================================================
function ContactEditModal({ contact, onClose, onSave }) {
  const [form, setForm] = useState({
    display_name: contact.display_name || '',
    email: contact.email || '',
    phone: contact.phone || '',
    address_line1: contact.address_line1 || '',
    address_line2: contact.address_line2 || '',
    city: contact.city || '',
    state: contact.state || '',
    zip: contact.zip || '',
    country: contact.country || 'US',
    tags: (contact.tags || []).join(', '),
    relationship: contact.relationship || 'new',
    mailing_list: contact.mailing_list || false,
    notes: contact.notes || ''
  })

  function handleSubmit(e) {
    e.preventDefault()
    onSave(contact.id, {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Contact</h2>
            <p className="text-sm text-gray-400">@{contact.ebay_username}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
            <input
              type="text"
              value={form.display_name}
              onChange={e => setForm({ ...form, display_name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="Real name or business name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Address Line 1</label>
            <input
              type="text"
              value={form.address_line1}
              onChange={e => setForm({ ...form, address_line1: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Address Line 2</label>
            <input
              type="text"
              value={form.address_line2}
              onChange={e => setForm({ ...form, address_line2: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">State</label>
              <input
                type="text"
                value={form.state}
                onChange={e => setForm({ ...form, state: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Zip</label>
              <input
                type="text"
                value={form.zip}
                onChange={e => setForm({ ...form, zip: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Relationship</label>
              <select
                value={form.relationship}
                onChange={e => setForm({ ...form, relationship: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="vip">VIP</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Tags</label>
              <input
                type="text"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="wholesale, iphones, samsung"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.mailing_list}
                onChange={e => setForm({ ...form, mailing_list: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 text-green-600"
              />
              <span className="text-sm text-gray-300">On mailing list</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
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

// ============================================================
// Shared Components
// ============================================================
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-sm">{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    Active: 'bg-blue-400/10 text-blue-400',
    Shipped: 'bg-yellow-400/10 text-yellow-400',
    Delivered: 'bg-green-400/10 text-green-400',
    Cancelled: 'bg-red-400/10 text-red-400',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || 'bg-gray-400/10 text-gray-400'}`}>
      {status}
    </span>
  )
}

function RelationshipBadge({ relationship }) {
  const colors = {
    new: 'bg-gray-400/10 text-gray-400',
    active: 'bg-blue-400/10 text-blue-400',
    vip: 'bg-yellow-400/10 text-yellow-400',
    inactive: 'bg-red-400/10 text-red-400',
  }
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${colors[relationship] || 'bg-gray-400/10 text-gray-400'}`}>
      {relationship}
    </span>
  )
}

function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-400 disabled:opacity-30 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-400 disabled:opacity-30 flex items-center gap-1"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-16">
      <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
      <p className="text-gray-500">{message}</p>
    </div>
  )
}
