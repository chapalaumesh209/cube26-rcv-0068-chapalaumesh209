'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Download, Database, ChevronRight } from 'lucide-react'

export default function EvidencePage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setRecords([
        { id: 'EV-8921', unit: 'U-001', verdict: 'pass', schema: 'v1.2', hash: '0x3f...a29b', date: '2023-10-15' },
        { id: 'EV-8922', unit: 'U-002', verdict: 'fail', schema: 'v1.2', hash: '0x7e...b11c', date: '2023-10-15' },
        { id: 'EV-8923', unit: 'U-003', verdict: 'pass', schema: 'v1.1', hash: '0x1a...f99e', date: '2023-10-14' },
      ])
      setLoading(false)
    }, 600)
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evidence Records</h1>
          <p className="text-sm text-gray-500">Immutable JSON contracts for completed inspections.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white shadow-sm hover:bg-gray-100 hover:text-gray-900 h-9 px-4 py-2">
          <Download className="w-4 h-4 mr-2" />
          Export All JSON
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                <tr>
                  <th className="px-6 py-3">Record ID</th>
                  <th className="px-6 py-3">Unit</th>
                  <th className="px-6 py-3">Verdict</th>
                  <th className="px-6 py-3">Schema Version</th>
                  <th className="px-6 py-3">Content Hash</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      {record.id}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{record.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.verdict === 'pass' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F43F5E]/10 text-[#F43F5E]'
                      }`}>
                        {record.verdict.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{record.schema}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{record.hash}</td>
                    <td className="px-6 py-4 text-gray-500">{record.date}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/evidence/${record.id}`} className="text-[#4F46E5] hover:underline inline-flex items-center">
                        View JSON <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
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
