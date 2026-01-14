'use client'

/**
 * OrdersStats Component
 * Clean stats display for admin dashboard
 */
export default function OrdersStats({ stats }) {
  if (!stats) return null

  const statCards = [
    { label: 'Total Orders', value: stats.total, color: 'gray' },
    { label: 'Pending Ship', value: stats.pending_shipment, color: 'yellow' },
    { label: 'Shipped', value: stats.shipped, color: 'blue' },
    { label: 'Received', value: stats.received, color: 'purple' },
    { label: 'Inspected', value: stats.inspected, color: 'orange' },
    { label: 'Completed', value: stats.completed, color: 'green' },
  ]

  const colorClasses = {
    gray: 'bg-gray-900 border-gray-800',
    yellow: 'bg-yellow-900/20 border-yellow-700/30',
    blue: 'bg-blue-900/20 border-blue-700/30',
    purple: 'bg-purple-900/20 border-purple-700/30',
    orange: 'bg-orange-900/20 border-orange-700/30',
    green: 'bg-green-900/20 border-green-700/30',
  }

  const textColors = {
    gray: 'text-gray-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={`${colorClasses[stat.color]} border rounded-lg p-4`}
        >
          <div className={`text-sm ${textColors[stat.color]} mb-1`}>
            {stat.label}
          </div>
          <div className={`text-2xl font-bold ${stat.color === 'gray' ? 'text-white' : textColors[stat.color]}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )
}