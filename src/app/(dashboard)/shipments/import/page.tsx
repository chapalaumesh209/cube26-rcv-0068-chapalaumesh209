'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, UploadCloud, File, CheckCircle2 } from 'lucide-react'

export default function ImportShipmentsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleImport = () => {
    setImporting(true)
    setTimeout(() => {
      setImporting(false)
      setSuccess(true)
    }, 2000)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/shipments" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Shipments
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Import Shipments (CSV)</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a CSV file containing shipment data.</p>
      </div>

      {!success ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-6">
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors"
          >
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {file ? (
              <div className="flex items-center justify-center text-sm text-gray-900">
                <File className="w-4 h-4 mr-2 text-[#4F46E5]" />
                {file.name}
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-900">Drag and drop your CSV file here</p>
                <p className="text-xs text-gray-500 mt-1">or click to browse</p>
              </div>
            )}
          </div>

          {file && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Preview (First 2 rows)</h3>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-2">PO_NUMBER</th>
                      <th className="px-4 py-2">SKU</th>
                      <th className="px-4 py-2">QUANTITY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="px-4 py-2">PO-1001</td>
                      <td className="px-4 py-2">SKU-A1</td>
                      <td className="px-4 py-2">50</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">PO-1002</td>
                      <td className="px-4 py-2">SKU-B2</td>
                      <td className="px-4 py-2">120</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleImport}
                  disabled={importing}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 bg-[#4F46E5] text-white shadow hover:bg-[#4F46E5]/90 h-9 px-4 py-2 w-full sm:w-auto"
                >
                  {importing ? 'Importing...' : 'Start Import'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#10B981] rounded-lg shadow-sm p-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-[#10B981] mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Import Successful!</h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">Your shipment data has been successfully imported and processed.</p>
          <Link href="/shipments" className="text-[#4F46E5] font-medium hover:underline">
            View Shipments
          </Link>
        </div>
      )}
    </div>
  )
}
