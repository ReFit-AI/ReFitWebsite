'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

/**
 * InspectionModal Component
 * Clean, focused modal for device inspection workflow
 *
 * Security: Validates condition match
 * UX: Clear visual feedback for mismatches
 */
export default function InspectionModal({ order, onSubmit, onClose, isProcessing = false }) {
  const [condition, setCondition] = useState(order.device_condition)
  const [notes, setNotes] = useState('')

  const conditions = ['excellent', 'good', 'fair', 'broken']

  const handleSubmit = () => {
    onSubmit(order.id, {
      inspectionCondition: condition,
      inspectionNotes: notes
    })
  }

  const conditionMismatch = condition !== order.device_condition

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold mb-6">Device Inspection</h2>

        {/* Order Details */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Device:</span>
              <span className="ml-2 font-medium">
                {order.device_brand} {order.device_model}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Quoted Condition:</span>
              <span className="ml-2 font-medium capitalize">{order.device_condition}</span>
            </div>
            <div>
              <span className="text-gray-400">IMEI:</span>
              <span className="ml-2 font-mono">{order.device_imei || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-gray-400">Quote:</span>
              <span className="ml-2 font-semibold">${order.quote_usd}</span>
            </div>
          </div>
        </div>

        {/* Condition Selection */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Actual Condition Found</label>
            <div className="grid grid-cols-2 gap-2">
              {conditions.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setCondition(cond)}
                  className={`px-4 py-2 rounded-lg border-2 capitalize transition-all ${
                    condition === cond
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Inspection Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Inspection Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any issues found, discrepancies, or special notes..."
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Condition Mismatch Warning */}
          {conditionMismatch && (
            <div className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-yellow-400 mt-0.5 flex-shrink-0" size={16} />
                <div className="text-sm text-yellow-200">
                  <strong>Condition Mismatch!</strong>
                  <p className="mt-1">
                    Actual: <span className="font-semibold capitalize">{condition}</span> |
                    Quoted: <span className="font-semibold capitalize">{order.device_condition}</span>
                  </p>
                  <p className="mt-1 text-yellow-300/80">
                    This order will require manual review before payment can be processed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 rounded-lg font-semibold transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Complete Inspection'}
          </button>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}