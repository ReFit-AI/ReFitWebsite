import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Smartphone, 
  TrendingUp, 
  Globe, 
  Shield,
  Zap,
  Users,
  BarChart3,
  CircuitBoard,
  ArrowRight,
  Play,
  Rocket
} from 'lucide-react';

const slides = [
  {
    id: 'intro',
    title: 'The Future of Physical Asset Trading',
    subtitle: 'ReFit',
    content: (
      <div className="flex flex-col items-center justify-center text-center space-y-8">
        <div className="text-3xl font-light text-gray-300">
          DeFi meets Real World Assets
        </div>
        <div className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
          Trade phones like tokens
        </div>
        <div className="text-xl text-gray-400 max-w-3xl">
          Starting with Solana phones. Expanding to all hardware.
        </div>
        <div className="mt-8 text-lg text-gray-500 italic">
          "What if every physical object had the liquidity of cryptocurrency?"
        </div>
      </div>
    ),
    icon: <Smartphone className="w-24 h-24" />
  },
  {
    id: 'problem',
    title: 'The Great Market Failure',
    subtitle: 'Physical Assets Are Trapped in the Stone Age',
    content: (
      <div className="space-y-6">
        {/* The Shocking Truth */}
        <div className="bg-red-900/20 p-6 rounded-xl">
          <h3 className="text-2xl font-bold text-center mb-4">A Tale of Two Markets</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-green-400 font-bold mb-3">Digital Assets (Crypto)</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ Trade 24/7 globally in seconds</li>
                <li>✓ 0.1% spreads</li>
                <li>✓ Instant settlement</li>
                <li>✓ Full price transparency</li>
                <li>✓ Anyone can be a market maker</li>
              </ul>
            </div>
            <div>
              <h4 className="text-red-400 font-bold mb-3">Physical Assets (Reality)</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✗ Days/weeks to find buyers</li>
                <li>✗ 20-40% spreads</li>
                <li>✗ Trust-based settlement</li>
                <li>✗ Opaque local pricing</li>
                <li>✗ Gatekept by middlemen</li>
              </ul>
            </div>
          </div>
        </div>

        {/* The Numbers */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <div className="text-3xl font-bold text-purple-400">$24T</div>
            <div className="text-sm text-gray-400">Annual secondary goods volume</div>
            <div className="text-xs text-gray-500 mt-1">Larger than all crypto + stocks combined</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <div className="text-3xl font-bold text-cyan-400">$7.2T</div>
            <div className="text-sm text-gray-400">Value lost to inefficiency</div>
            <div className="text-xs text-gray-500 mt-1">30% average price gap</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <div className="text-3xl font-bold text-green-400">0%</div>
            <div className="text-sm text-gray-400">Have modern financial rails</div>
            <div className="text-xs text-gray-500 mt-1">Still using classifieds & WhatsApp</div>
          </div>
        </div>

        {/* The Opportunity */}
        <div className="text-center p-6 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-xl">
          <div className="text-xl font-bold mb-2">The Eureka Moment</div>
          <div className="text-gray-300">
            What if physical goods could trade as efficiently as cryptocurrencies?
          </div>
          <div className="text-2xl font-bold mt-3 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            We'd unlock $7.2 trillion in trapped value.
          </div>
        </div>
      </div>
    ),
    icon: <TrendingUp className="w-24 h-24" />
  },
  {
    id: 'ecosystem',
    title: 'The $24 Trillion Opportunity',
    subtitle: 'Physical Assets Have No Financial Infrastructure',
    content: (
      <div className="space-y-6">
        {/* The Problem */}
        <div className="bg-red-900/20 p-4 rounded-xl mb-6">
          <h3 className="font-bold text-red-400 mb-2">The Hidden Crisis</h3>
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <div className="text-2xl font-bold">$24T</div>
              <div>Global secondary goods market</div>
            </div>
            <div>
              <div className="text-2xl font-bold">97%</div>
              <div>Trades happen offline</div>
            </div>
            <div>
              <div className="text-2xl font-bold">30%</div>
              <div>Average price inefficiency</div>
            </div>
          </div>
        </div>

        {/* The Solution Architecture */}
        <div className="space-y-4">
          <h3 className="text-center font-bold text-xl mb-4">ReFit: The Uniswap for Physical Assets</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-4 rounded-xl">
              <h4 className="font-bold text-purple-400 mb-2">Price Discovery Layer</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• Real-time pricing oracles</li>
                <li>• Condition grading AI</li>
                <li>• Global arbitrage data</li>
                <li>• Bloomberg Terminal for goods</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 p-4 rounded-xl">
              <h4 className="font-bold text-cyan-400 mb-2">Liquidity Layer</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• Instant buyback AMM</li>
                <li>• B2B orderbook (100+ units)</li>
                <li>• Cross-border settlement</li>
                <li>• Zero counterparty risk</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-4 rounded-xl">
            <h4 className="font-bold text-green-400 mb-2">Infrastructure Layer</h4>
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
              <div>
                <div className="font-bold">For Businesses</div>
                <div>APIs, SDKs, White-label</div>
              </div>
              <div>
                <div className="font-bold">For Developers</div>
                <div>Build apps on our rails</div>
              </div>
              <div>
                <div className="font-bold">For Institutions</div>
                <div>Compliance, reporting</div>
              </div>
            </div>
          </div>
        </div>

        {/* The Moat */}
        <div className="text-center p-4 bg-gray-800/30 rounded-xl">
          <div className="text-lg font-bold mb-2">Our Unfair Advantage</div>
          <div className="text-sm text-gray-400">
            Every transaction makes our pricing more accurate. Every user adds liquidity. Every partner extends our reach.
            <div className="mt-2 text-yellow-400">Network effects + switching costs = unstoppable moat</div>
          </div>
        </div>
      </div>
    ),
    icon: <Globe className="w-24 h-24" />
  },
  {
    id: 'how',
    title: 'Revolutionary Mechanics',
    content: (
      <div className="space-y-8">
        <div className="text-2xl font-light mb-6">Advanced Swap Protocol</div>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <div className="text-purple-400 mb-4">1. Deposit</div>
            <p>Lock collateral in smart contract</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <div className="text-cyan-400 mb-4">2. Instant Ship</div>
            <p>Replacement phone sent immediately</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <div className="text-green-400 mb-4">3. Settlement</div>
            <p>Pay only the difference after return</p>
          </div>
        </div>
        <div className="mt-8 text-center text-xl">
          <span className="text-purple-400">Tokenized phones</span> trade on 
          <span className="text-cyan-400"> Raydium pools</span> for 
          <span className="text-green-400"> instant liquidity</span>
        </div>
      </div>
    ),
    icon: <Zap className="w-24 h-24" />
  },
  {
    id: 'market',
    title: 'Massive Market Opportunity',
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-6xl font-bold text-purple-400">$65B</div>
            <div className="text-xl">Phone resale market</div>
            <div className="text-gray-400">Growing 11% yearly</div>
          </div>
          <div>
            <div className="text-6xl font-bold text-cyan-400">$500B+</div>
            <div className="text-xl">Electronics secondary market</div>
            <div className="text-gray-400">Our expansion target</div>
          </div>
        </div>
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-xl">
          <div className="text-2xl mb-4">Network Effects</div>
          <div className="text-gray-300">
            More phones → Better liquidity → Tighter spreads → More users
          </div>
        </div>
      </div>
    ),
    icon: <Globe className="w-24 h-24" />
  },
  {
    id: 'dynamics',
    title: 'Why ReFit Becomes Inevitable',
    subtitle: 'The Physics of Market Dominance',
    content: (
      <div className="space-y-6">
        {/* The Flywheel */}
        <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-center mb-4">The Unstoppable Flywheel</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-purple-400 mb-3">Supply Side Network Effects</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">→</span>
                  <span>More sellers = Better prices for buyers</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">→</span>
                  <span>More inventory = More trading opportunities</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">→</span>
                  <span>More data = More accurate pricing</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-cyan-400 mb-3">Demand Side Network Effects</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">→</span>
                  <span>More buyers = Instant liquidity</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">→</span>
                  <span>More traders = Tighter spreads</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">→</span>
                  <span>More volume = Lower fees</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Moat */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-xl text-center">
            <div className="text-3xl mb-2">🏰</div>
            <div className="font-bold text-sm mb-1">Data Moat</div>
            <div className="text-xs text-gray-400">10M+ price points across conditions & locations</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-bold text-sm mb-1">Liquidity Moat</div>
            <div className="text-xs text-gray-400">Deepest pools = Best execution</div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl text-center">
            <div className="text-3xl mb-2">🌐</div>
            <div className="font-bold text-sm mb-1">Network Moat</div>
            <div className="text-xs text-gray-400">Every partner is locked in</div>
          </div>
        </div>

        {/* The Outcome */}
        <div className="bg-green-900/20 p-6 rounded-xl text-center">
          <div className="text-lg font-bold mb-2">The Inevitable Outcome</div>
          <div className="text-gray-300 mb-3">
            Once we reach critical mass (10K daily transactions), network effects make us unbeatable.
          </div>
          <div className="text-2xl font-bold text-green-400">
            We become the Schelling point for all physical asset trades.
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Just like Uniswap for tokens. Just like eBay for auctions. But bigger.
          </div>
        </div>
      </div>
    ),
    icon: <Zap className="w-24 h-24" />
  },
  {
    id: 'agents',
    title: 'The Secret Weapon: AI Agents',
    subtitle: 'Liquidity from Day One',
    content: (
      <div className="space-y-6">
        {/* The Vision */}
        <div className="text-center bg-gradient-to-r from-purple-900/20 to-cyan-900/20 p-4 rounded-xl mb-6">
          <div className="text-xl font-bold mb-2">The First Physical Asset Market Built for Machines</div>
          <div className="text-gray-400">Where AI agents trade phones 24/7, creating perfect market efficiency</div>
        </div>

        {/* Agent Types */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-bold text-purple-400">Trading Agents</h3>
            <div className="space-y-2">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="font-bold text-sm text-cyan-400">🤖 Arbitrage Bots</div>
                <div className="text-xs text-gray-400">Cross-market price differences</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="font-bold text-sm text-green-400">📊 Market Makers</div>
                <div className="text-xs text-gray-400">Provide constant liquidity</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="font-bold text-sm text-yellow-400">🔮 Prediction Agents</div>
                <div className="text-xs text-gray-400">ML-powered price forecasting</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-bold text-cyan-400">Optimization Agents</h3>
            <div className="space-y-2">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="font-bold text-sm text-purple-400">🔧 Repair Optimizers</div>
                <div className="text-xs text-gray-400">Buy broken, fix, sell higher</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="font-bold text-sm text-pink-400">📦 Inventory Managers</div>
                <div className="text-xs text-gray-400">Optimize wholesale positions</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="font-bold text-sm text-orange-400">🌍 Geo-Arbitrageurs</div>
                <div className="text-xs text-gray-400">Exploit regional price gaps</div>
              </div>
            </div>
          </div>
        </div>

        {/* The Flywheel */}
        <div className="bg-green-900/20 p-5 rounded-xl">
          <h3 className="font-bold text-center mb-3">The AI-Powered Liquidity Flywheel</h3>
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className="bg-green-800/50 px-3 py-1 rounded">Agents trade</div>
            <span>→</span>
            <div className="bg-green-700/50 px-3 py-1 rounded">Spreads tighten</div>
            <span>→</span>
            <div className="bg-green-600/50 px-3 py-1 rounded">Humans join</div>
            <span>→</span>
            <div className="bg-green-500/50 px-3 py-1 rounded">More data</div>
            <span>→</span>
            <div className="bg-green-400/50 px-3 py-1 rounded">Better agents</div>
          </div>
        </div>

        {/* Agent Marketplace */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-800/30 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">100+</div>
            <div className="text-xs text-gray-400">Agents competing</div>
          </div>
          <div className="bg-gray-800/30 p-3 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400">$10M+</div>
            <div className="text-xs text-gray-400">Daily agent volume</div>
          </div>
          <div className="bg-gray-800/30 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-400">0.1%</div>
            <div className="text-xs text-gray-400">Average spreads</div>
          </div>
        </div>

        {/* The Kicker */}
        <div className="text-center p-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-xl">
          <div className="font-bold text-lg">We don't need to wait for users.</div>
          <div className="text-sm text-gray-300 mt-1">
            The agents create the liquidity. The liquidity attracts the users.
          </div>
        </div>
      </div>
    ),
    icon: <CircuitBoard className="w-24 h-24" />
  },
  {
    id: 'traction',
    title: 'Current Progress',
    subtitle: 'Ready to Launch',
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400">MVP</div>
            <div className="text-gray-400">Live on devnet</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400">UI/UX</div>
            <div className="text-gray-400">Cyberpunk branded</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400">Smart</div>
            <div className="text-gray-400">Contracts designed</div>
          </div>
        </div>

        {/* Technical Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span>Solana wallet integration</span>
            <span className="text-green-400">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span>Phone valuation system</span>
            <span className="text-green-400">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span>AI agent framework</span>
            <span className="text-yellow-400">⚡ In progress</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <span>Smart escrow contracts</span>
            <span className="text-yellow-400">⚡ In progress</span>
          </div>
        </div>

        {/* Agent Framework Preview */}
        <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 p-4 rounded-xl">
          <h3 className="font-bold text-sm mb-2">Agent Framework Preview</h3>
          <div className="bg-gray-900 p-3 rounded text-xs font-mono text-gray-300 overflow-x-auto">
            <div className="text-green-400">// ReFit Agent SDK (TypeScript)</div>
            <div>const agent = new ReFitAgent({`{`}</div>
            <div className="ml-4">strategy: 'cross-market-arbitrage',</div>
            <div className="ml-4">markets: ['refit', 'ebay', 'gazelle'],</div>
            <div className="ml-4">minProfit: 0.05, <span className="text-gray-500">// 5% minimum</span></div>
            <div className="ml-4">maxInventory: 100_000 <span className="text-gray-500">// $100K max</span></div>
            <div>{`}`});</div>
            <div className="mt-2">agent.on('opportunity', async (arb) =&gt; {`{`}</div>
            <div className="ml-4">await agent.executeAtomic(arb);</div>
            <div>{`}`});</div>
          </div>
        </div>

        {/* Ready to Launch */}
        <div className="text-center p-4 bg-green-900/20 rounded-xl">
          <div className="text-lg font-bold text-green-400">Ready for Mainnet</div>
          <div className="text-sm text-gray-400">Just need fuel to ignite the rocket 🚀</div>
        </div>
      </div>
    ),
    icon: <BarChart3 className="w-24 h-24" />
  },
  {
    id: 'roadmap',
    title: 'The Master Plan',
    subtitle: 'From Phones to Everything',
    content: (
      <div className="space-y-6">
        <div className="text-center text-lg text-gray-400 mb-6">
          "Start with a beachhead market, then expand concentrically"
        </div>

        {/* Market Expansion Visual */}
        <div className="bg-gray-800/30 p-6 rounded-xl mb-6">
          <h3 className="text-center font-bold mb-4">Market Expansion Strategy</h3>
          <div className="flex justify-center items-center space-x-2 text-sm">
            <div className="bg-purple-600 px-3 py-1 rounded">Phones ($65B)</div>
            <div>→</div>
            <div className="bg-cyan-600 px-3 py-1 rounded">Electronics ($500B)</div>
            <div>→</div>
            <div className="bg-green-600 px-3 py-1 rounded">All Goods ($24T)</div>
          </div>
        </div>

        {/* Concrete Milestones */}
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/10 p-4 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-bold text-purple-400">Q3 2024: Launch</div>
                <div className="text-sm text-gray-400 mt-1">
                  • 1,000 phones traded • 5 repair shop partners • $500K volume
                </div>
              </div>
              <div className="text-green-400 text-sm">✓ On track</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-900/20 to-cyan-800/10 p-4 rounded-xl">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="font-bold text-cyan-400">Q1 2025: Scale</div>
                <div className="text-sm text-gray-400 mt-1">
                  • 10K monthly trades • Wholesale DEX live • First tokenized inventory
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 p-4 rounded-xl">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="font-bold text-green-400">Q3 2025: Expand</div>
                <div className="text-sm text-gray-400 mt-1">
                  • Add laptops & tablets • P2P marketplace • $10M monthly volume
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 p-4 rounded-xl">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="font-bold text-yellow-400">2026: Dominate</div>
                <div className="text-sm text-gray-400 mt-1">
                  • #1 in phone liquidity • Expand to GPUs • Launch ReFit Protocol v2
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-900/20 to-pink-800/10 p-4 rounded-xl">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="font-bold text-pink-400">2027+: The Endgame</div>
                <div className="text-sm text-gray-400 mt-1">
                  • Universal asset protocol • $1B+ daily volume • IPO or acquisition
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Every physical object becomes a liquid financial asset.
          </div>
        </div>
      </div>
    ),
    icon: <CircuitBoard className="w-24 h-24" />
  },
  {
    id: 'g2m',
    title: 'Go-To-Market Strategy',
    subtitle: 'The Tesla Playbook: Start Premium, Go Mass Market',
    content: (
      <div className="space-y-6">
        {/* Strategy Overview */}
        <div className="text-center mb-6">
          <div className="text-xl font-light text-gray-400">
            "Build the best product for power users, then scale down to everyone"
          </div>
        </div>

        {/* Three Pronged Attack */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-4 rounded-xl">
            <div className="font-bold text-purple-400 mb-2">Attack Vector 1</div>
            <div className="text-lg font-bold mb-2">Crypto Natives</div>
            <ul className="text-sm space-y-1 text-gray-400">
              <li>• Solana phone traders</li>
              <li>• Saga flippers</li>
              <li>• DeFi degens</li>
            </ul>
            <div className="mt-3 text-xs text-green-400">
              Hook: Instant SOL payouts
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 p-4 rounded-xl">
            <div className="font-bold text-cyan-400 mb-2">Attack Vector 2</div>
            <div className="text-lg font-bold mb-2">Repair Shops</div>
            <ul className="text-sm space-y-1 text-gray-400">
              <li>• 100K+ shops globally</li>
              <li>• Need inventory financing</li>
              <li>• Hate waiting for payments</li>
            </ul>
            <div className="mt-3 text-xs text-green-400">
              Hook: Same-day liquidity
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-4 rounded-xl">
            <div className="font-bold text-green-400 mb-2">Attack Vector 3</div>
            <div className="text-lg font-bold mb-2">Wholesale Traders</div>
            <ul className="text-sm space-y-1 text-gray-400">
              <li>• Buy 100-200 unit lots</li>
              <li>• Need price discovery</li>
              <li>• Want futures/hedging</li>
            </ul>
            <div className="mt-3 text-xs text-green-400">
              Hook: B2B DEX orderbook
            </div>
          </div>
        </div>

        {/* Growth Flywheel */}
        <div className="bg-gray-800/30 p-6 rounded-xl mt-6">
          <h3 className="text-center font-bold text-lg mb-4">The Network Effects Playbook</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="font-bold text-purple-400 mb-2">Supply-Side Growth</div>
              <ol className="text-sm space-y-2 text-gray-400">
                <li>1. Launch with premium phones (Saga)</li>
                <li>2. Add repair shop inventory APIs</li>
                <li>3. Enable P2P listings</li>
                <li>4. Wholesale partnerships</li>
              </ol>
            </div>
            
            <div>
              <div className="font-bold text-cyan-400 mb-2">Demand-Side Growth</div>
              <ol className="text-sm space-y-2 text-gray-400">
                <li>1. Token incentives for early traders</li>
                <li>2. Liquidity mining on Raydium</li>
                <li>3. Arbitrage bots drive volume</li>
                <li>4. Consumer apps on top</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Key Milestones */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">Month 3</div>
            <div className="text-sm text-gray-400">1K phones traded</div>
          </div>
          <div className="text-center p-4 bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400">Month 6</div>
            <div className="text-sm text-gray-400">$1M monthly volume</div>
          </div>
          <div className="text-center p-4 bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">Month 12</div>
            <div className="text-sm text-gray-400">100K active users</div>
          </div>
        </div>
      </div>
    ),
    icon: <TrendingUp className="w-24 h-24" />
  },
  {
    id: 'ask',
    title: 'The Opportunity',
    subtitle: 'Back the Future of Physical Commerce',
    content: (
      <div className="space-y-6">
        {/* The Ask */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            $2.5M Seed Round
          </div>
          <div className="text-lg text-gray-400">To capture 1% of a $24 trillion market</div>
        </div>

        {/* Use of Funds */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 rounded-xl">
            <h3 className="font-bold text-purple-400 mb-3">Technology (60%)</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• World-class engineering team</li>
              <li>• Smart contract audits</li>
              <li>• Oracle infrastructure</li>
              <li>• AI pricing models</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 p-6 rounded-xl">
            <h3 className="font-bold text-cyan-400 mb-3">Growth (40%)</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• $1M initial liquidity</li>
              <li>• 10 warehouse partners</li>
              <li>• Market maker incentives</li>
              <li>• User acquisition</li>
            </ul>
          </div>
        </div>

        {/* The Returns */}
        <div className="bg-gradient-to-r from-green-900/20 to-green-800/10 p-6 rounded-xl">
          <h3 className="text-center font-bold text-lg mb-4">The Unicorn Math</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">0.1%</div>
              <div className="text-sm text-gray-400">Market share</div>
              <div className="text-xs text-gray-500">= $24B GMV</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">2%</div>
              <div className="text-sm text-gray-400">Take rate</div>
              <div className="text-xs text-gray-500">= $480M revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">$10B+</div>
              <div className="text-sm text-gray-400">Valuation</div>
              <div className="text-xs text-gray-500">20x revenue multiple</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center p-6 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl">
          <div className="text-2xl font-bold mb-2">Join Us in Building the Future</div>
          <div className="text-lg mb-4">
            The same way Uniswap revolutionized token trading,<br/>
            ReFit will revolutionize physical asset trading.
          </div>
          <div className="text-sm text-gray-200">
            Contact: founders@refit.xyz | Calendly: refit.xyz/meet
          </div>
        </div>

        {/* Investors */}
        <div className="text-center text-sm text-gray-500">
          Looking for visionary investors who understand network effects and protocol economics
        </div>
      </div>
    ),
    icon: <Rocket className="w-24 h-24" />
  }
];

const PitchPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Progress Bar */}
      <div className="h-1 bg-gray-800">
        <div 
          className="h-full bg-gradient-to-r from-purple-600 to-cyan-600 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl w-full"
          >
            <div className="text-center mb-12">
              <motion.div 
                className="inline-flex justify-center mb-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="text-purple-400">
                  {slides[currentSlide].icon}
                </div>
              </motion.div>
              
              {slides[currentSlide].subtitle && (
                <div className="text-sm uppercase tracking-widest text-gray-500 mb-2">
                  {slides[currentSlide].subtitle}
                </div>
              )}
              
              <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {slides[currentSlide].title}
              </h1>
            </div>

            <div className="mb-12">
              {slides[currentSlide].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-8 bg-gradient-to-r from-purple-600 to-cyan-600' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PitchPage;
