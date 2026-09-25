'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, AlertCircle, Inbox, Check } from 'lucide-react'

export default function ReviewQueuePage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setItems([
        { id: 'U-002', sku: 'SKU-ABC', product: 'Wireless Mouse', verdict: 'exception', failedChecks: ['Packaging Damaged', 'Missing Label'], date: '2023-10-15' },
        { id: 'U-003', sku: 'SKU-XYZ', product: 'USB-C Cable', verdict: 'uncertain', failedChecks: ['Color Mismatch'], date: '2023-10-15' },
      ])
      setLoading(false)
    }, 800)
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Review Queue
            <span className="bg-red-100 text-red-700 text-xs py-1 px-2 rounded-full font-semibold">
              {items.length} items
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manual review required for exceptions and uncertain verdicts.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Inbox className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">No items currently require manual review.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                <tr>
                  <th className="px-6 py-3">Unit</th>
                  <th className="px-6 py-3">Product Info</th>
                  <th className="px-6 py-3">Verdict</th>
                  <th className="px-6 py-3">Failed Checks</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{item.sku}</div>
                      <div className="text-gray-500 text-xs">{item.product}</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.verdict === 'exception' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F43F5E]/10 text-[#F43F5E]">
                          <AlertCircle className="w-3.5 h-3.5" /> Exception
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]">
                          <AlertTriangle className="w-3.5 h-3.5" /> Uncertain
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.failedChecks.map((check: string) => (
                          <span key={check} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded border border-gray-200">
                            {check}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="text-xs px-3 py-1.5 border border-[#10B981] text-[#10B981] rounded hover:bg-[#10B981]/10 font-medium transition-colors">
                          Override Pass
                        </button>
                        <button className="text-xs px-3 py-1.5 bg-[#4F46E5] text-white rounded hover:bg-[#4F46E5]/90 font-medium transition-colors">
                          Review Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
