'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, ChevronRight, FileText, ShieldCheck, RefreshCw } from 'lucide-react';
import { LoadingIcon } from '@/components/ui/loading-icon';

interface EvidenceRow {
  id: string;
  unitCode: string;
  overallVerdict: string;
  schemaVersion: string;
  contentHash: string | null;
  completedAt: string | null;
  createdAt: string;
}

export default function EvidencePage() {
  const [records, setRecords] = useState<EvidenceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = () => {
    setLoading(true);
    fetch('/api/inspections?limit=100')
      .then((r) => r.json())
      .then((data) => {
        const list: EvidenceRow[] = (data.inspections || []).filter(
          (row: EvidenceRow) => row.contentHash || row.overallVerdict
        );
        setRecords(list);
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-slate-500">
            <span className="font-bold text-slate-900 tracking-wider">RCV · POD 01</span>
            <span>/</span>
            <span>CRYPTOGRAPHIC EVIDENCE VAULT</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Sealed Evidence Vault</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable arrival receipts and SHA-256 sealed contract records for claims, audits, and prep.
          </p>
        </div>

        <button
          onClick={fetchRecords}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs disabled:opacity-50 self-start sm:self-center"
        >
          {loading ? (
            <LoadingIcon size="xs" color="indigo" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>Refresh Vault</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="text-[11px] text-slate-500 bg-slate-50/80 border-b border-slate-100 font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Unit Code</th>
                <th className="px-5 py-3">Arrival Verdict</th>
                <th className="px-5 py-3">Contract Schema</th>
                <th className="px-5 py-3">SHA-256 Content Hash</th>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <LoadingIcon size="lg" color="indigo" label="Loading sealed evidence vault…" className="flex-col gap-3" />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 space-y-2">
                    <FileText className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-sm font-semibold text-slate-800">No sealed records yet</p>
                    <p className="text-xs text-slate-400">Complete an arrival inspection to write a sealed receipt.</p>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 flex items-center gap-2 whitespace-nowrap">
                      <Database className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-mono font-bold text-slate-900">{record.unitCode}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        record.overallVerdict === 'pass'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : record.overallVerdict === 'uncertain'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {(record.overallVerdict || 'pending')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {record.schemaVersion || 'rcv.v1'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {record.contentHash ? (
                        <span className="text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {record.contentHash.slice(0, 16)}…
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(record.completedAt || record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/evidence/${record.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
                      >
                        <span>Open Contract</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && records.length > 0 && (
          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Showing {records.length} sealed evidence contracts</span>
            <span className="font-mono">SHA-256 cryptographic verification</span>
          </div>
        )}
      </div>
    </div>
  );
}
