'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Package, ArrowUpDown } from 'lucide-react'

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

  const sellOrders = [
    { price: 1055, quantity: 15, total: 15825, condition: 'Excellent' },
    { price: 1053, quantity: 8, total: 8424, condition: 'Excellent' },
    { price: 1052, quantity: 12, total: 12624, condition: 'Good' },
    { price: 1051, quantity: 20, total: 21020, condition: 'Excellent' },
    { price: 1050, quantity: 25, total: 26250, condition: 'Good' },
  ]

  const buyOrders = [
    { price: 1049, quantity: 18, total: 18882, condition: 'Any' },
    { price: 1048, quantity: 30, total: 31440, condition: 'Good+' },
    { price: 1047, quantity: 22, total: 23034, condition: 'Any' },
    { price: 1046, quantity: 15, total: 15690, condition: 'Excellent' },
    { price: 1045, quantity: 28, total: 29260, condition: 'Good+' },
  ]

  const recentTrades = [
    { time: '14:32:18', price: 1050, quantity: 12, side: 'buy', condition: 'Excellent' },
    { time: '14:31:45', price: 1049, quantity: 8, side: 'sell', condition: 'Good' },
    { time: '14:30:12', price: 1051, quantity: 15, side: 'buy', condition: 'Excellent' },
    { time: '14:29:33', price: 1050, quantity: 5, side: 'sell', condition: 'Good' },
    { time: '14:28:51', price: 1052, quantity: 20, side: 'buy', condition: 'Excellent' },
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
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Activity className="w-8 h-8 text-purple-400" />
                Wholesale Orderbook
                <span className="px-3 py-1 text-xs bg-purple-600/30 text-purple-300 rounded-full">BETA</span>
              </h1>
              <p className="text-gray-400 mt-1">Real-time wholesale phone trading on Solana</p>
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
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Last Price</div>
            <div className="text-2xl font-bold">${selectedModelData.lastPrice}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">24h Change</div>
            <div className={`text-2xl font-bold flex items-center gap-2 ${selectedModelData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {selectedModelData.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {selectedModelData.change >= 0 ? '+' : ''}{selectedModelData.change}%
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">24h Volume</div>
            <div className="text-2xl font-bold">{selectedModelData.volume} units</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Bid/Ask Spread</div>
            <div className="text-2xl font-bold text-yellow-400">$1</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Liquidity</div>
            <div className="text-2xl font-bold text-purple-400">High</div>
          </div>
        </div>

        {/* Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orderbook */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5 text-blue-400" />
                  Order Book
                </h2>
                <div className="flex gap-2 text-xs">
                  <button className="px-3 py-1 bg-gray-800 rounded">0.01</button>
                  <button className="px-3 py-1 bg-purple-600 rounded">0.1</button>
                  <button className="px-3 py-1 bg-gray-800 rounded">1</button>
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
                      <div key={idx} className="relative">
                        <div className="absolute inset-0 bg-red-500/10" style={{ width: `${(order.quantity / 30) * 100}%` }}></div>
                        <div className="relative grid grid-cols-3 text-sm py-1.5 hover:bg-gray-800/50 cursor-pointer rounded transition-colors">
                          <div className="text-red-400 font-medium">${order.price.toLocaleString()}</div>
                          <div className="text-right text-gray-300">{order.quantity}</div>
                          <div className="text-right text-gray-400">${order.total.toLocaleString()}</div>
                        </div>
                        <div className="text-[10px] text-gray-500 pl-1">{order.condition}</div>
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
                      <div key={idx} className="relative">
                        <div className="absolute inset-0 bg-green-500/10" style={{ width: `${(order.quantity / 30) * 100}%` }}></div>
                        <div className="relative grid grid-cols-3 text-sm py-1.5 hover:bg-gray-800/50 cursor-pointer rounded transition-colors">
                          <div className="text-green-400 font-medium">${order.price.toLocaleString()}</div>
                          <div className="text-right text-gray-300">{order.quantity}</div>
                          <div className="text-right text-gray-400">${order.total.toLocaleString()}</div>
                        </div>
                        <div className="text-[10px] text-gray-500 pl-1">{order.condition}</div>
                      </div>
                    ))}
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
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Recent Trades
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {recentTrades.map((trade, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-gray-800/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${trade.side === 'buy' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-gray-500 text-xs">{trade.time}</span>
                      </div>
                      <div className={`font-medium ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                        ${trade.price}
                      </div>
                      <div className="text-gray-400">{trade.quantity}</div>
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
      </div>
    </div>
  )
}
