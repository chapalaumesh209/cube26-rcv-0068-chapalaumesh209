'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Copy, Download, ShieldCheck } from 'lucide-react'

export default function EvidenceDetailPage() {
  const { id } = useParams()
  const [evidence, setEvidence] = useState<any>(null)
  
  useEffect(() => {
    setTimeout(() => {
      setEvidence({
        record_info: { id: id, schema: 'v1.2', timestamp: '2023-10-15T10:30:00Z' },
        subject: { unit: 'U-001', sku: 'SKU-ABC' },
        outcome: { verdict: 'PASS', confidence: 0.98 },
        checks: [
          { name: 'barcode_scan', result: 'pass', details: 'Barcode matched SKU-ABC' },
          { name: 'packaging_intact', result: 'pass', details: 'No visible dents' }
        ],
        images: ['img_123.jpg', 'img_124.jpg']
      })
    }, 500)
  }, [id])

  const jsonString = JSON.stringify(evidence, null, 2) || ''

  // Simple syntax highlighting function
  const highlightJSON = (json: string) => {
    if (!json) return ''
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'text-green-600' // strings
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-blue-600 font-medium' // keys
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-600 font-bold' // booleans
      } else if (/null/.test(match)) {
        cls = 'text-gray-500 italic' // null
      } else {
        cls = 'text-orange-600' // numbers
      }
      return `<span class="${cls}">${match}</span>`
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/evidence" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Evidence
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Record {id}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Hash Verified
              </span>
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={copyToClipboard} className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-100 h-9 px-4 py-2">
              <Copy className="w-4 h-4 mr-2" /> Copy
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#4F46E5] text-white hover:bg-[#4F46E5]/90 h-9 px-4 py-2">
              <Download className="w-4 h-4 mr-2" /> Download JSON
            </button>
          </div>
        </div>
      </div>

      {!evidence ? (
        <div className="h-96 bg-gray-100 animate-pulse rounded-lg border border-gray-200" />
      ) : (
        <div className="bg-[#1e1e1e] rounded-lg shadow-sm overflow-hidden border border-gray-800">
          <div className="flex bg-[#2d2d2d] px-4 py-2 border-b border-gray-800 text-gray-300 text-xs font-mono">
            evidence_contract.json
          </div>
          <pre 
            className="p-6 text-sm font-mono overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: highlightJSON(jsonString) }}
          />
        </div>
      )}
    </div>
  )
}
