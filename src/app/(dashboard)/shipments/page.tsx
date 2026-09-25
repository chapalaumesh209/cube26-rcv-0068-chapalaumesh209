'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Upload, ChevronRight, Inbox, RefreshCw, Package, Truck } from 'lucide-react';
import { LoadingIcon } from '@/components/ui/loading-icon';

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
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-slate-500">
            <span className="font-bold text-slate-900 tracking-wider">RCV · POD 01</span>
            <span>/</span>
            <span>INBOUND FREIGHT CONSIGNMENTS</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Inbound Shipments & POs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Purchase orders and carrier manifests delivered to intake bays.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            onClick={fetchShipments}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs disabled:opacity-50"
            title="Refresh shipments"
          >
            {loading ? (
              <LoadingIcon size="xs" color="indigo" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Refresh</span>
          </button>

          <Link
            href="/shipments/import"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Manifest</span>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Filter by PO, Shipment Ref, or Supplier..."
          className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs transition-colors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="text-[11px] text-slate-500 bg-slate-50/80 border-b border-slate-100 font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Shipment Ref</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Units</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expected Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <LoadingIcon size="lg" color="indigo" label="Loading inbound manifests…" className="flex-col gap-3" />
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 space-y-2">
                    <Truck className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-800">No shipments found</p>
                    <p className="text-xs text-slate-400">Import a CSV manifest or adjust filter query</p>
                  </td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-700">
                      {s.ref}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {s.supplier}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                      {s.units} units
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                      {s.date}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/shipments/${s.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
                      >
                        <span>Inspect PO</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && shipments.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Showing {shipments.length} inbound consignments</span>
            <span className="font-mono">Carrier EDI & Manifest synced</span>
          </div>
        )}
      </div>
    </div>
  );
}
