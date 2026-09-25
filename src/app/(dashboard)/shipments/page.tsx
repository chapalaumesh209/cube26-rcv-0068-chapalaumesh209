'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Upload, ChevronRight, Inbox } from 'lucide-react'

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setShipments([
        { id: 'SHP-001', ref: 'PO-2023-110', supplier: 'TechCorp', status: 'active', units: 150, date: '2023-10-01' },
        { id: 'SHP-002', ref: 'PO-2023-111', supplier: 'GlobalSupplies', status: 'completed', units: 500, date: '2023-10-05' },
        { id: 'SHP-003', ref: 'PO-2023-112', supplier: 'LocalMfg', status: 'draft', units: 50, date: '2023-10-10' },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filtered = shipments.filter(s => s.ref.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
          <p className="text-sm text-gray-500">Manage and track incoming shipments.</p>
        </div>
        <Link href="/shipments/import" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 bg-[#4F46E5] text-white shadow hover:bg-[#4F46E5]/90 h-9 px-4 py-2">
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </Link>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        <input 
          type="text" 
          placeholder="Search by PO or Ref..." 
          className="flex-1 outline-none text-sm p-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Inbox className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No shipments found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                <tr>
                  <th className="px-6 py-3">Shipment Ref</th>
                  <th className="px-6 py-3">PO Number</th>
                  <th className="px-6 py-3">Supplier</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Units</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(shipment => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{shipment.id}</td>
                    <td className="px-6 py-4">{shipment.ref}</td>
                    <td className="px-6 py-4">{shipment.supplier}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        shipment.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        shipment.status === 'completed' ? 'bg-[#10B981]/10 text-[#10B981]' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{shipment.units}</td>
                    <td className="px-6 py-4 text-gray-500">{shipment.date}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/shipments/${shipment.id}`} className="text-[#4F46E5] hover:underline inline-flex items-center">
                        View <ChevronRight className="w-4 h-4 ml-1" />
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
