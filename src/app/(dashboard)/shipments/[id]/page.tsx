'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Box, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'

export default function ShipmentDetailPage() {
  const params = useParams()
  const { id } = params
  
  const [shipment, setShipment] = useState<any>(null)
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setShipment({
        id,
        ref: 'PO-2023-110',
        supplier: 'TechCorp',
        date: '2023-10-01'
      })
      setUnits([
        { id: 'U-001', sku: 'SKU-ABC', status: 'pass' },
        { id: 'U-002', sku: 'SKU-ABC', status: 'fail' },
        { id: 'U-003', sku: 'SKU-XYZ', status: 'uncertain' },
        { id: 'U-004', sku: 'SKU-XYZ', status: 'pending' },
      ])
      setLoading(false)
    }, 800)
  }, [id])

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
      case 'fail': return <XCircle className="w-5 h-5 text-[#F43F5E]" />
      case 'uncertain': return <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
      case 'pending': return <Clock className="w-5 h-5 text-[#94A3B8]" />
      default: return null
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <Link href="/shipments" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Shipments
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{shipment.id}</h1>
            <p className="text-sm text-gray-500 mt-1">PO: {shipment.ref} • Supplier: {shipment.supplier}</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 bg-[#4F46E5] text-white shadow hover:bg-[#4F46E5]/90 h-9 px-4 py-2">
            <Box className="w-4 h-4 mr-2" />
            Inspect All Units
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Units in Shipment</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-6 py-3">Unit ID</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Inspection Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {units.map(unit => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{unit.id}</td>
                  <td className="px-6 py-4 text-gray-500">{unit.sku}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(unit.status)}
                      <span className="capitalize">{unit.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/inspections/${unit.id}`} className="text-[#4F46E5] hover:underline text-sm">
                      View Inspection
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
