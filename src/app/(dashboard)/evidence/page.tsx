'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Database, ChevronRight, FileText } from 'lucide-react'

interface EvidenceRow {
  id: string
  unitCode: string
  overallVerdict: string
  schemaVersion: string
  contentHash: string | null
  completedAt: string | null
  createdAt: string
}

export default function EvidencePage() {
  const [records, setRecords] = useState<EvidenceRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/inspections?limit=100')
      .then((r) => r.json())
      .then((data) => {
        const list: EvidenceRow[] = (data.inspections || []).filter(
          (row: EvidenceRow) => row.contentHash || row.overallVerdict
        )
        setRecords(list)
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Evidence vault</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Sealed receiving records for claims, prep, and audit. Original observations stay even after an override.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-700">No sealed records yet</p>
          <p className="text-xs text-slate-400 mt-1">Complete an inspection to write a receiving receipt.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
              <tr>
                <th className="px-6 py-3">Unit</th>
                <th className="px-6 py-3">Verdict</th>
                <th className="px-6 py-3">Schema</th>
                <th className="px-6 py-3">Content hash</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-400" />
                    <span className="font-mono">{record.unitCode}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.overallVerdict === 'pass'
                        ? 'bg-emerald-50 text-emerald-700'
                        : record.overallVerdict === 'uncertain'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {(record.overallVerdict || 'pending').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{record.schemaVersion || 'rcv.v1'}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                    {record.contentHash ? `${record.contentHash.slice(0, 16)}…` : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(record.completedAt || record.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/evidence/${record.id}`} className="text-brand-600 hover:underline inline-flex items-center text-xs font-medium">
                      Open <ChevronRight className="w-4 h-4 ml-0.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
