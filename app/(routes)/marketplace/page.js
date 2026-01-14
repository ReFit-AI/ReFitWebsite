'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { motion } from 'framer-motion'
import { ArrowUpIcon, ArrowDownIcon, ShoppingCartIcon, PlusIcon } from '@heroicons/react/24/outline'
import ReFitMarketplaceSDK from '@/lib/refit-marketplace-sdk'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function MarketplacePage() {
  const router = useRouter()
  const { publicKey, signTransaction, connected } = useWallet()

  // State management
  const [sdk, setSdk] = useState(null)
  const [activeTab, setActiveTab] = useState('buy')
  const [selectedModel, setSelectedModel] = useState('all')
  const [listings, setListings] = useState([])
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] })
  const [userOrders, setUserOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshInterval, setRefreshInterval] = useState(null)

  // Phone models for filtering
  const phoneModels = [
    { id: 'all', name: 'All Models' },
    { id: 'iPhone-15-Pro-Max', name: 'iPhone 15 Pro Max' },
    { id: 'iPhone-14-Pro', name: 'iPhone 14 Pro' },
    { id: 'Samsung-Galaxy-S24-Ultra', name: 'Galaxy S24 Ultra' },
    { id: 'Google-Pixel-8-Pro', name: 'Pixel 8 Pro' },
  ]

  // Initialize SDK
  useEffect(() => {
    if (connected && publicKey && signTransaction) {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || 'https://api.devnet.solana.com'
      )

      const marketplaceSDK = new ReFitMarketplaceSDK({
        connection,
        wallet: { publicKey, signTransaction },
        environment: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
      })

      setSdk(marketplaceSDK)
    }
  }, [connected, publicKey, signTransaction])

  // Load marketplace data
  const loadMarketplaceData = useCallback(async () => {
    if (!sdk) return

    try {
      setLoading(true)

      // Load active listings
      const activeListings = await sdk.getActiveListings()
      setListings(activeListings)

      // Load orderbook for selected model
      if (selectedModel !== 'all') {
        const book = await sdk.getOrderbook(selectedModel)
        setOrderbook(book)
      }

      // Load user's orders
      if (publicKey) {
        const orders = await sdk.getUserOrders(publicKey)
        setUserOrders(orders)
      }

      // Load inventory from existing system
      const inventoryRes = await fetch('/api/admin/inventory')
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json()
        setInventory(inventoryData.inventory || [])
      }

      setError(null)
    } catch (err) {
      console.error('Failed to load marketplace data:', err)
      setError('Failed to load marketplace data')
    } finally {
      setLoading(false)
    }
  }, [sdk, selectedModel, publicKey])

  // Auto-refresh data
  useEffect(() => {
    loadMarketplaceData()

    // Set up auto-refresh every 5 seconds
    const interval = setInterval(loadMarketplaceData, 5000)
    setRefreshInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [loadMarketplaceData])

  // Handle listing creation from inventory
  const handleListFromInventory = async (phone) => {
    if (!sdk) return

    try {
      setLoading(true)

      const listing = await sdk.createListing({
        phoneData: {
          model: phone.model,
          brand: phone.brand || 'Apple',
          storage: phone.storage || '128GB',
          condition: phone.condition,
          imei: phone.imei,
          batteryHealth: phone.battery_health || 85,
          carrierStatus: phone.carrier_status || 'Unlocked',
          issues: phone.issues || [],
        },
        priceUsdc: phone.price,
      })

      alert(`Phone listed successfully! Listing ID: ${listing.listingId}`)
      await loadMarketplaceData()
    } catch (err) {
      console.error('Failed to list phone:', err)
      alert('Failed to list phone: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle purchase initiation
  const handleBuy = async (listing) => {
    if (!sdk || !connected) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setLoading(true)

      const order = await sdk.initiatePurchase({
        listingId: listing.listingId,
      })

      alert(`Purchase initiated! Order ID: ${order.orderId}`)
      await loadMarketplaceData()
    } catch (err) {
      console.error('Failed to initiate purchase:', err)
      alert('Failed to initiate purchase: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Orderbook depth chart component
  const OrderbookDepth = ({ bids, asks }) => {
    const maxDepth = Math.max(
      ...bids.map(b => parseFloat(b.size)),
      ...asks.map(a => parseFloat(a.size))
    )

    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Order Book</h3>

        <div className="space-y-2">
          {/* Asks (Sells) */}
          <div className="space-y-1">
            <div className="text-xs text-gray-400 flex justify-between">
              <span>Price (USDC)</span>
              <span>Size</span>
            </div>
            {asks.slice(0, 5).reverse().map((ask, i) => (
              <div key={i} className="relative">
                <div
                  className="absolute inset-0 bg-red-500 opacity-20"
                  style={{ width: `${(parseFloat(ask.size) / maxDepth) * 100}%` }}
                />
                <div className="relative flex justify-between text-sm px-2 py-1">
                  <span className="text-red-400">${(parseFloat(ask.price) / 1e6).toFixed(2)}</span>
                  <span>{ask.size}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Spread */}
          <div className="border-t border-b border-gray-700 py-2 text-center">
            <span className="text-xs text-gray-400">Spread: </span>
            <span className="text-sm font-medium">
              ${orderbook.spread ? (parseFloat(orderbook.spread) / 1e6).toFixed(2) : 'N/A'}
            </span>
          </div>

          {/* Bids (Buys) */}
          <div className="space-y-1">
            {bids.slice(0, 5).map((bid, i) => (
              <div key={i} className="relative">
                <div
                  className="absolute inset-0 bg-green-500 opacity-20"
                  style={{ width: `${(parseFloat(bid.size) / maxDepth) * 100}%` }}
                />
                <div className="relative flex justify-between text-sm px-2 py-1">
                  <span className="text-green-400">${(parseFloat(bid.price) / 1e6).toFixed(2)}</span>
                  <span>{bid.size}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Listing card component
  const ListingCard = ({ listing }) => {
    const phone = listing.phoneData

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gray-800 rounded-lg p-4 space-y-3"
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">{phone.model}</h4>
            <p className="text-sm text-gray-400">{phone.storage} • {phone.condition}</p>
          </div>
          <span className="text-xl font-bold text-green-400">
            ${listing.priceUsdc.toFixed(2)}
          </span>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>IMEI: •••••{phone.imei.slice(-4)}</p>
          <p>Battery: {phone.batteryHealth}%</p>
          {phone.issues.length > 0 && (
            <p className="text-yellow-500">Issues: {phone.issues.join(', ')}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleBuy(listing)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition"
          >
            Buy Now
          </button>
          <button
            className="px-4 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-700 transition"
          >
            Details
          </button>
        </div>
      </motion.div>
    )
  }

  // Inventory item component
  const InventoryItem = ({ phone }) => (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{phone.model}</h4>
          <p className="text-sm text-gray-400">{phone.storage} • {phone.condition}</p>
        </div>
        <span className="text-sm px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded">
          In Stock
        </span>
      </div>

      <div className="text-xs text-gray-500">
        <p>IMEI: {phone.imei}</p>
        <p>Cost: ${phone.price_paid} • Asking: ${phone.price}</p>
      </div>

      <button
        onClick={() => handleListFromInventory(phone)}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
      >
        <PlusIcon className="h-4 w-4" />
        List on Marketplace
      </button>
    </div>
  )

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">ReFit Marketplace</h1>
          <p className="text-gray-400">Connect your wallet to access the marketplace</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">ReFit Marketplace</h1>
            <p className="text-gray-400">Buy and sell phones with escrow protection</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/sell')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Trade In
            </button>
            <button
              onClick={loadMarketplaceData}
              className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          {['buy', 'sell', 'orders', 'inventory'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Model Filter */}
        <div className="flex gap-2 flex-wrap">
          {phoneModels.map(model => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedModel === model.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-gray-400">Loading marketplace data...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            ) : (
              <>
                {activeTab === 'buy' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listings.filter(l =>
                      selectedModel === 'all' ||
                      l.phoneData.model.includes(selectedModel.replace(/-/g, ' '))
                    ).map(listing => (
                      <ListingCard key={listing.listingId} listing={listing} />
                    ))}
                  </div>
                )}

                {activeTab === 'sell' && (
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-4">List a Phone</h3>
                      <p className="text-gray-400 mb-4">
                        You can list phones from your inventory or trade in new phones.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push('/sell')}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                        >
                          Trade In New Phone
                        </button>
                        <button
                          onClick={() => setActiveTab('inventory')}
                          className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                        >
                          List from Inventory
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    {userOrders.length === 0 ? (
                      <div className="bg-gray-800 rounded-lg p-8 text-center">
                        <ShoppingCartIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No orders yet</p>
                      </div>
                    ) : (
                      userOrders.map(order => (
                        <div key={order.orderId} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{order.phoneModel}</p>
                              <p className="text-sm text-gray-400">
                                {order.side === 'buy' ? 'Buying' : 'Selling'} • {order.size} units
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${(parseFloat(order.price) / 1e6).toFixed(2)}</p>
                              <p className="text-xs text-gray-500">Order #{order.orderId.slice(0, 8)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory.filter(phone => phone.status === 'in_stock').map(phone => (
                      <InventoryItem key={phone.id} phone={phone} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Orderbook */}
          <div className="space-y-6">
            {selectedModel !== 'all' && (
              <OrderbookDepth bids={orderbook.bids} asks={orderbook.asks} />
            )}

            {/* Market Stats */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold">Market Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Listings</span>
                  <span>{listings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Orders</span>
                  <span>{userOrders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Inventory</span>
                  <span>{inventory.filter(p => p.status === 'in_stock').length}</span>
                </div>
              </div>
            </div>

            {/* Platform Info */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-4 text-white">
              <h3 className="font-semibold mb-2">Why ReFit?</h3>
              <ul className="text-sm space-y-1">
                <li>• 1% fees vs eBay's 13%</li>
                <li>• Instant settlements</li>
                <li>• Escrow protection</li>
                <li>• NFT certificates</li>
                <li>• On-chain orderbook</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}