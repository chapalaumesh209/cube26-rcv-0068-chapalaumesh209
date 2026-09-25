'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, Download, ShieldCheck } from 'lucide-react'

export default function EvidenceDetailPage() {
  const { id } = useParams()
  const [evidence, setEvidence] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/inspections/${id}/evidence`)
      .then(async (r) => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then((data) => setEvidence(data.evidence))
      .catch(() => setError('Evidence record not found for this inspection.'))
  }, [id])

  const jsonString = evidence ? JSON.stringify(evidence, null, 2) : ''

  const highlightJSON = (json: string) => {
    if (!json) return ''
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'text-emerald-400'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-sky-300 font-medium'
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-violet-300 font-bold'
      } else if (/null/.test(match)) {
        cls = 'text-slate-500 italic'
      } else {
        cls = 'text-amber-300'
      }
      return `<span class="${cls}">${match}</span>`
    })
  }

  const downloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rcv-${id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/evidence" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Evidence vault
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Receiving receipt
              {evidence && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" /> rcv.v1
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">{id}</p>
          </div>
          {evidence && (
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(jsonString)}
                className="inline-flex items-center rounded-lg text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 h-9 px-4"
              >
                <Copy className="w-4 h-4 mr-2" /> Copy
              </button>
              <button
                onClick={downloadJson}
                className="inline-flex items-center rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 h-9 px-4"
              >
                <Download className="w-4 h-4 mr-2" /> Download
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl">{error}</div>
      )}

      {!evidence && !error ? (
        <div className="h-96 bg-slate-100 animate-pulse rounded-xl border border-slate-200" />
      ) : evidence ? (
        <div className="bg-slate-900 rounded-xl shadow-sm overflow-hidden border border-slate-800">
          <div className="flex bg-slate-800 px-4 py-2 border-b border-slate-700 text-slate-300 text-xs font-mono">
            rcv.v1.json
          </div>
          <pre
            className="p-6 text-sm font-mono overflow-x-auto text-slate-100"
            dangerouslySetInnerHTML={{ __html: highlightJSON(jsonString) }}
          />
        </div>
      ) : null}
    </div>
  )
}
