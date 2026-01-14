'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Package,
  ArrowUpDown,
  Zap,
  DollarSign,
  Clock,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function OrderbookPage() {
  const [selectedModel, setSelectedModel] = useState('iPhone 15 Pro Max')
  const [timeframe, setTimeframe] = useState('24h')

  // Mock data for demonstration
  const models = [
    { name: 'iPhone 15 Pro Max', lastPrice: 1050, change: 2.5, volume: 127 },
    { name: 'iPhone 15 Pro', lastPrice: 925, change: 1.8, volume: 89 },
    { name: 'iPhone 14 Pro Max', lastPrice: 750, change: -1.2, volume: 156 },
    { name: 'Samsung S24 Ultra', lastPrice: 825, change: 3.1, volume: 74 },
    { name: 'Samsung S23 Ultra', lastPrice: 625, change: 0.5, volume: 98 }
  ]

  // Enhanced mock data with wallet addresses
  const sellOrders = [
    { price: 1055, quantity: 15, total: 15825, condition: 'Excellent', wallet: '7dvc...jemn' },
    { price: 1053, quantity: 8, total: 8424, condition: 'Excellent', wallet: '9H6V...Poqm' },
    { price: 1052, quantity: 12, total: 12624, condition: 'Good', wallet: 'BLVi...mjKp' },
    { price: 1051, quantity: 20, total: 21020, condition: 'Excellent', wallet: '5Qyx...8Kp3' },
    { price: 1050, quantity: 25, total: 26250, condition: 'Good', wallet: 'Fg7M...nQ9s' },
    { price: 1049.50, quantity: 10, total: 10495, condition: 'Excellent', wallet: '3vZk...2mPq' },
    { price: 1049, quantity: 18, total: 18882, condition: 'Good', wallet: 'JkL9...Xy4m' },
    { price: 1048.50, quantity: 14, total: 14679, condition: 'Excellent', wallet: '8Hn2...9Lp1' },
  ]

  const buyOrders = [
    { price: 1048, quantity: 18, total: 18864, condition: 'Any', wallet: 'Qw3E...7Rn5' },
    { price: 1047.50, quantity: 22, total: 23045, condition: 'Good+', wallet: 'Tz6Y...4Bp8' },
    { price: 1047, quantity: 15, total: 15705, condition: 'Any', wallet: 'Ax8C...3Vp2' },
    { price: 1046.50, quantity: 30, total: 31395, condition: 'Excellent', wallet: 'Km5N...1Dq7' },
    { price: 1046, quantity: 12, total: 12552, condition: 'Good+', wallet: 'Pn2J...6Hp9' },
    { price: 1045.50, quantity: 28, total: 29274, condition: 'Any', wallet: 'Rt4L...8Mp4' },
    { price: 1045, quantity: 20, total: 20900, condition: 'Good+', wallet: 'Vy7Q...2Kp1' },
    { price: 1044.50, quantity: 16, total: 16712, condition: 'Excellent', wallet: 'Zx9M...5Tp3' },
  ]

  const recentTrades = [
    { time: '14:32:18', price: 1050, quantity: 12, side: 'buy', condition: 'Excellent', buyer: '7dvc...jemn', seller: 'Ax8C...3Vp2' },
    { time: '14:31:45', price: 1049, quantity: 8, side: 'sell', condition: 'Good', buyer: '9H6V...Poqm', seller: 'Km5N...1Dq7' },
    { time: '14:30:12', price: 1051, quantity: 15, side: 'buy', condition: 'Excellent', buyer: 'BLVi...mjKp', seller: 'Pn2J...6Hp9' },
    { time: '14:29:33', price: 1050, quantity: 5, side: 'sell', condition: 'Good', buyer: '5Qyx...8Kp3', seller: 'Rt4L...8Mp4' },
    { time: '14:28:51', price: 1052, quantity: 20, side: 'buy', condition: 'Excellent', buyer: 'Fg7M...nQ9s', seller: 'Vy7Q...2Kp1' },
    { time: '14:27:22', price: 1048, quantity: 7, side: 'sell', condition: 'Good', buyer: '3vZk...2mPq', seller: 'Zx9M...5Tp3' },
    { time: '14:26:15', price: 1049, quantity: 11, side: 'buy', condition: 'Excellent', buyer: 'JkL9...Xy4m', seller: 'Bq1N...7Wp6' },
    { time: '14:25:03', price: 1051, quantity: 4, side: 'buy', condition: 'Good', buyer: '8Hn2...9Lp1', seller: 'Gh3P...9Xp8' },
  ]

  const candlestickData = [
    { time: '09:00', open: 1040, high: 1045, low: 1038, close: 1042, volume: 15 },
    { time: '10:00', open: 1042, high: 1048, low: 1041, close: 1045, volume: 22 },
    { time: '11:00', open: 1045, high: 1051, low: 1044, close: 1048, volume: 28 },
    { time: '12:00', open: 1048, high: 1049, low: 1045, close: 1047, volume: 18 },
    { time: '13:00', open: 1047, high: 1052, low: 1046, close: 1049, volume: 31 },
    { time: '14:00', open: 1049, high: 1053, low: 1048, close: 1050, volume: 25 },
  ]

  const selectedModelData = models.find(m => m.name === selectedModel)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-600/20 to-green-600/20 rounded-full text-sm font-semibold text-purple-400">
                  <Zap className="w-3 h-3" />
                  MVP DEMO - Mock Data
                </div>
              </div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-400" />
                Decentralized Orderbook
                <span className="px-3 py-1 text-xs bg-green-600/30 text-green-300 rounded-full">OpenBook V2</span>
              </h1>
              <p className="text-gray-400 mt-1">Blockchain-powered wholesale phone marketplace</p>
            </div>
          </div>

          {/* Model Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {models.map((model) => (
              <button
                key={model.name}
                onClick={() => setSelectedModel(model.name)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  selectedModel === model.name
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{model.name}</span>
                  <span className={model.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {model.change >= 0 ? '+' : ''}{model.change}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-purple-600/50 transition-all group">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <div className="text-sm text-gray-400">Last Price</div>
            </div>
            <div className="text-2xl font-bold">${selectedModelData.lastPrice}</div>
            <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Latest trade price
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-purple-600/50 transition-all group">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <div className="text-sm text-gray-400">24h Change</div>
            </div>
            <div className={`text-2xl font-bold flex items-center gap-2 ${selectedModelData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {selectedModelData.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {selectedModelData.change >= 0 ? '+' : ''}{selectedModelData.change}%
            </div>
            <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Price change vs 24h ago
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-purple-600/50 transition-all group">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-green-400" />
              <div className="text-sm text-gray-400">24h Volume</div>
            </div>
            <div className="text-2xl font-bold">{selectedModelData.volume} units</div>
            <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Phones traded today
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-purple-600/50 transition-all group">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpDown className="w-4 h-4 text-yellow-400" />
              <div className="text-sm text-gray-400">Bid/Ask Spread</div>
            </div>
            <div className="text-2xl font-bold text-yellow-400">$1.00</div>
            <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Difference: best bid & ask
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-purple-600/50 transition-all group">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <div className="text-sm text-gray-400">Liquidity</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-purple-400">High</div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              $202k total order value
            </div>
          </div>
        </div>

        {/* Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orderbook */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ArrowUpDown className="w-5 h-5 text-blue-400" />
                    Order Book
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-medium">Live Updates</span>
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <button className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 transition-colors">0.01</button>
                  <button className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-colors">0.1</button>
                  <button className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 transition-colors">1</button>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-gray-800">
                {/* Sell Orders (Asks) */}
                <div>
                  <div className="p-3 bg-gray-800/50">
                    <div className="grid grid-cols-3 text-xs text-gray-400 font-medium">
                      <div>Price (USD)</div>
                      <div className="text-right">Quantity</div>
                      <div className="text-right">Total</div>
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    {sellOrders.map((order, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute inset-0 bg-red-500/10 transition-all group-hover:bg-red-500/20" style={{ width: `${(order.quantity / 30) * 100}%` }}></div>
                        <div className="relative grid grid-cols-3 text-sm py-1.5 hover:bg-gray-800/50 cursor-pointer rounded transition-colors">
                          <div className="text-red-400 font-medium">${order.price.toLocaleString()}</div>
                          <div className="text-right text-gray-300">{order.quantity}</div>
                          <div className="text-right text-gray-400">${order.total.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-500 pl-1">
                          <span>{order.condition}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">{order.wallet}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buy Orders (Bids) */}
                <div>
                  <div className="p-3 bg-gray-800/50">
                    <div className="grid grid-cols-3 text-xs text-gray-400 font-medium">
                      <div>Price (USD)</div>
                      <div className="text-right">Quantity</div>
                      <div className="text-right">Total</div>
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    {buyOrders.map((order, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute inset-0 bg-green-500/10 transition-all group-hover:bg-green-500/20" style={{ width: `${(order.quantity / 30) * 100}%` }}></div>
                        <div className="relative grid grid-cols-3 text-sm py-1.5 hover:bg-gray-800/50 cursor-pointer rounded transition-colors">
                          <div className="text-green-400 font-medium">${order.price.toLocaleString()}</div>
                          <div className="text-right text-gray-300">{order.quantity}</div>
                          <div className="text-right text-gray-400">${order.total.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-500 pl-1">
                          <span>{order.condition}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">{order.wallet}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Spread Indicator */}
              <div className="px-4 py-3 bg-gradient-to-r from-red-900/20 via-yellow-900/20 to-green-900/20 border-t border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Spread: $1.00</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <span className="text-gray-400">Best Ask: <span className="text-red-400 font-medium">$1048.50</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-gray-400">Best Bid: <span className="text-green-400 font-medium">$1048.00</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Candlestick Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Price Chart</h2>
                <div className="flex gap-2">
                  {['1h', '24h', '7d', '30d'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 text-sm rounded ${
                        timeframe === tf ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Candlestick Chart */}
              <div className="relative h-80 bg-gray-950 rounded-lg p-4 border border-gray-800">
                {/* Price axis */}
                <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500 py-4">
                  <div>$1053</div>
                  <div>$1048</div>
                  <div>$1043</div>
                  <div>$1038</div>
                </div>

                {/* Chart area */}
                <div className="ml-16 h-full flex items-end justify-around gap-4">
                  {candlestickData.map((candle, idx) => {
                    const maxPrice = Math.max(...candlestickData.map(c => c.high))
                    const minPrice = Math.min(...candlestickData.map(c => c.low))
                    const range = maxPrice - minPrice

                    const isGreen = candle.close >= candle.open
                    const bodyTop = Math.max(candle.open, candle.close)
                    const bodyBottom = Math.min(candle.open, candle.close)
                    const bodyHeight = Math.abs(candle.close - candle.open)

                    const wickTopHeight = candle.high - bodyTop
                    const wickBottomHeight = bodyBottom - candle.low

                    // Calculate percentages for rendering
                    const bodyHeightPercent = (bodyHeight / range) * 100
                    const wickTopPercent = (wickTopHeight / range) * 100
                    const wickBottomPercent = (wickBottomHeight / range) * 100

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full relative group">
                        {/* Tooltip */}
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap text-xs">
                          <div className="font-medium mb-1">{candle.time}</div>
                          <div className="space-y-0.5 text-gray-400">
                            <div>O: ${candle.open}</div>
                            <div>H: ${candle.high}</div>
                            <div>L: ${candle.low}</div>
                            <div>C: ${candle.close}</div>
                            <div>Vol: {candle.volume}</div>
                          </div>
                        </div>

                        {/* Candlestick */}
                        <div className="relative w-full h-full flex flex-col justify-end items-center">
                          {/* Upper wick */}
                          <div
                            className={`w-0.5 ${isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ height: `${wickTopPercent}%` }}
                          ></div>

                          {/* Body */}
                          <div
                            className={`w-full ${isGreen ? 'bg-green-500' : 'bg-red-500'} ${bodyHeightPercent < 1 ? 'min-h-[2px]' : ''}`}
                            style={{ height: `${Math.max(bodyHeightPercent, 0.5)}%` }}
                          ></div>

                          {/* Lower wick */}
                          <div
                            className={`w-0.5 ${isGreen ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ height: `${wickBottomPercent}%` }}
                          ></div>
                        </div>

                        {/* Time label */}
                        <div className="text-xs text-gray-500 mt-2">{candle.time}</div>

                        {/* Volume bar */}
                        <div className="w-full mt-1">
                          <div
                            className={`w-full ${isGreen ? 'bg-green-500/30' : 'bg-red-500/30'} rounded-t`}
                            style={{ height: `${(candle.volume / 35) * 20}px` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Grid lines */}
                <div className="absolute inset-0 ml-16 pointer-events-none">
                  {[0, 25, 50, 75, 100].map((percent) => (
                    <div
                      key={percent}
                      className="absolute w-full border-t border-gray-800/50"
                      style={{ bottom: `${percent}%` }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Chart indicators */}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-400">Bullish</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-gray-400">Bearish</span>
                </div>
                <div className="ml-auto text-gray-400">
                  Volume: <span className="text-white font-medium">139 units</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Trade Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Place Order</h2>

              <div className="flex gap-2 mb-4">
                <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors">
                  Buy
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors">
                  Sell
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Price (USD)</label>
                  <input
                    type="number"
                    placeholder="1050.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Quantity</label>
                  <input
                    type="number"
                    placeholder="10"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Condition</label>
                  <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Any</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-gray-800">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Total</span>
                    <span className="font-medium">$10,500.00</span>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-gray-400">Fee (0.5%)</span>
                    <span className="font-medium">$52.50</span>
                  </div>
                </div>

                <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium transition-all">
                  Connect Wallet to Trade
                </button>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Recent Trades
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">Live</span>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {recentTrades.map((trade, idx) => (
                    <div key={idx} className="group bg-gray-800/30 hover:bg-gray-800/60 p-3 rounded-lg border border-gray-800/50 hover:border-gray-700 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${trade.side === 'buy' ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse'}`}></div>
                          <span className="text-gray-500 text-xs font-mono">{trade.time}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${trade.side === 'buy' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                            {trade.side.toUpperCase()}
                          </span>
                        </div>
                        <div className={`font-bold text-lg ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                          ${trade.price}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Package className="w-3 h-3" />
                          <span>{trade.quantity} units</span>
                          <span className="mx-1">•</span>
                          <span className="text-gray-500">{trade.condition}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2 pt-2 border-t border-gray-800/50">
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3 text-green-400" />
                          <span>Buyer: <span className="font-mono text-gray-400">{trade.buyer}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowDownRight className="w-3 h-3 text-red-400" />
                          <span>Seller: <span className="font-mono text-gray-400">{trade.seller}</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Market Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-yellow-400" />
                Market Depth
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Bids</span>
                  <span className="font-medium text-green-400">113 units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Asks</span>
                  <span className="font-medium text-red-400">80 units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Bid Liquidity</span>
                  <span className="font-medium">$118,306</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ask Liquidity</span>
                  <span className="font-medium">$84,143</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20 border border-purple-800/30 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-purple-400" />
              How the Decentralized Orderbook Works
            </h2>
            <p className="text-gray-400">Powered by Solana blockchain and OpenBook V2 protocol</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-purple-600/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">1. Peer-to-Peer Trading</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Wholesale buyers and sellers place orders directly on-chain. No middlemen. No centralized control.
                Orders are matched automatically through smart contracts on Solana.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-green-600/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold">2. Price Discovery</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Market-driven pricing based on real supply and demand. The orderbook shows all bids and asks,
                allowing transparent price discovery and optimal trade execution.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-blue-600/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold">3. Instant Settlement</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                When orders match, trades execute instantly on Solana. Funds are held in escrow smart contracts
                until delivery is confirmed, ensuring security for both parties.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <ArrowUpRight className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-green-400">Buyer Benefits</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></div>
                  <span>Access wholesale inventory at competitive market prices</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></div>
                  <span>Set your own buy orders and wait for sellers to match</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></div>
                  <span>Funds held in escrow until delivery confirmed</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5"></div>
                  <span>Filter by condition: Excellent, Good, Fair, or Any</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <ArrowDownRight className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold text-red-400">Seller Benefits</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></div>
                  <span>List inventory at your desired price point</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></div>
                  <span>Instant matching with highest bidders</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></div>
                  <span>Payment guaranteed through smart contract escrow</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></div>
                  <span>Transparent pricing - see real-time market demand</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2">MVP Demo Notice</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  This is a demonstration of the orderbook interface with mock data. The full implementation will
                  integrate with Solana blockchain, OpenBook V2 DEX protocol, and smart contract escrow for secure
                  peer-to-peer trading. Phone inventory will be tokenized as compressed NFTs for digital product passports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
