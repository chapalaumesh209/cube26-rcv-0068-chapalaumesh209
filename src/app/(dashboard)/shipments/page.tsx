'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Upload, ChevronRight, Inbox, RefreshCw, Package } from 'lucide-react';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shipments?limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setShipments(data.shipments || []);
      }
    } catch {
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inbound Shipments</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manifests and purchase order consignments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchShipments}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh shipments"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/shipments/import"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Import Manifest
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by PO, Shipment Ref, or Supplier..."
          className="flex-1 outline-none text-xs bg-transparent text-slate-800 placeholder-slate-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-white border border-slate-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Inbox className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No shipments found</p>
          <p className="text-xs text-slate-400 mt-0.5">Import a CSV manifest or adjust filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-slate-500 bg-slate-50 border-b border-slate-200 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Shipment Ref</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Units</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-brand-600">{s.ref}</td>
                    <td className="px-4 py-3 text-slate-700">{s.supplier}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{s.units}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{s.date}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/shipments/${s.id}`}
                        className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-0.5"
                      >
                        Inspect <ChevronRight className="w-3.5 h-3.5" />
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
  );
}
