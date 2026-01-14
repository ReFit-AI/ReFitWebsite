'use client'

import { useAdminAuth } from '@/hooks/useAdminAuth'
import Link from 'next/link'
import {
  FileText,
  BarChart3,
  Database,
  ClipboardList,
  Boxes,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  ChevronRight
} from 'lucide-react'

export default function AdminDashboard() {
  const { isAdmin, authLoading, publicKey } = useAdminAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Checking admin access...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Admin access required</div>
      </div>
    )
  }

  const adminSections = [
    {
      title: 'Operations',
      description: 'Core business operations',
      items: [
        {
          href: '/admin/inventory',
          label: 'Inventory Management',
          icon: Boxes,
          description: 'Track all devices in stock',
          color: 'from-blue-500 to-cyan-500'
        },
        {
          href: '/admin/invoices',
          label: 'Invoices & Shipping',
          icon: FileText,
          description: 'Manage invoices and shipments',
          color: 'from-purple-500 to-pink-500'
        },
        {
          href: '/admin/invoices/new',
          label: 'Create Invoice',
          icon: ClipboardList,
          description: 'Generate new invoice',
          color: 'from-green-500 to-emerald-500'
        },
      ]
    },
    {
      title: 'Analytics & Reports',
      description: 'Business intelligence and reporting',
      items: [
        {
          href: '/admin/analytics',
          label: 'Analytics Dashboard',
          icon: BarChart3,
          description: 'View business metrics',
          color: 'from-orange-500 to-red-500'
        },
        {
          href: '/admin/reports',
          label: 'Export Reports',
          icon: DollarSign,
          description: 'Download financial reports',
          color: 'from-yellow-500 to-orange-500'
        },
        {
          href: '/stats',
          label: 'Public Stats',
          icon: TrendingUp,
          description: 'View public-facing stats',
          color: 'from-indigo-500 to-purple-500'
        },
      ]
    },
    {
      title: 'System & Setup',
      description: 'System configuration and maintenance',
      items: [
        {
          href: '/admin/setup',
          label: 'Database Setup',
          icon: Database,
          description: 'Initialize database tables',
          color: 'from-gray-500 to-gray-600'
        },
        {
          href: '/orderbook',
          label: 'Order Book',
          icon: Users,
          description: 'View all customer orders',
          color: 'from-teal-500 to-green-500'
        },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-green-400 h-8 w-8" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-white/60">
            Connected as: {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-sm mb-1">Today&apos;s Revenue</div>
            <div className="text-2xl font-bold text-green-400">$0</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-sm mb-1">Active Orders</div>
            <div className="text-2xl font-bold text-blue-400">0</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-sm mb-1">Inventory Value</div>
            <div className="text-2xl font-bold text-purple-400">$0</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-sm mb-1">Pending Shipments</div>
            <div className="text-2xl font-bold text-orange-400">0</div>
          </div>
        </div>

        {/* Admin Sections */}
        {adminSections.map((section) => (
          <div key={section.title} className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <p className="text-white/60 text-sm">{section.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative bg-white/5 rounded-xl p-5 border border-white/10 hover:border-white/30 transition-all duration-300 hover:bg-white/10"
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />

                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-white/30 group-hover:text-white/60 transition-colors" />
                      </div>
                      <h3 className="text-white font-medium mb-1 group-hover:text-white transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <div className="mt-8 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
          <h3 className="text-yellow-400 font-medium mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/invoices/new"
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
            >
              + New Invoice
            </Link>
            <Link
              href="/admin/inventory"
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
            >
              + Add Inventory
            </Link>
            <Link
              href="/admin/reports"
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
            >
              Export Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}