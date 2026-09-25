"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, ChevronRight, CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { LoadingIcon } from "@/components/ui/loading-icon";

type Inspection = {
  id: string;
  unitCode: string;
  sku: string;
  productTitle: string;
  poNumber: string;
  status: string;
  overallVerdict: "pass" | "exception" | "uncertain" | "pending";
  startedAt: string;
};

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVerdict, setFilterVerdict] = useState<string>("all");

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/inspections");
      if (response.ok) {
        const data = await response.json();
        setInspections(data.inspections || []);
      } else {
        setInspections([]);
      }
    } catch {
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const filteredInspections = inspections.filter((ins) => {
    const matchesSearch = 
      ins.unitCode.toLowerCase().includes(search.toLowerCase()) ||
      ins.sku.toLowerCase().includes(search.toLowerCase()) ||
      ins.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      ins.poNumber.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filterVerdict === "all" || ins.overallVerdict === filterVerdict;

    return matchesSearch && matchesFilter;
  });

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            PASS
          </span>
        );
      case "exception":
      case "fail":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            EXCEPTION
          </span>
        );
      case "uncertain":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            UNCERTAIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-slate-500">
            <span className="font-bold text-slate-900 tracking-wider">RCV · POD 01</span>
            <span>/</span>
            <span>INSPECTION LEDGER</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Arrival Inspections</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every inbound freight unit evaluated across eight arrival verification checks.
          </p>
        </div>

        <button
          onClick={fetchInspections}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs disabled:opacity-50 self-start sm:self-center"
        >
          {loading ? (
            <LoadingIcon size="xs" color="indigo" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-xs"
            placeholder="Search by Unit Code, SKU, Title, or PO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <select
            className="block w-full sm:w-44 pl-9 pr-8 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs appearance-none cursor-pointer"
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
          >
            <option value="all">All Verdicts</option>
            <option value="pass">Pass Only</option>
            <option value="exception">Exception Only</option>
            <option value="uncertain">Uncertain Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th scope="col" className="py-3 px-4">Unit Code</th>
                <th scope="col" className="py-3 px-4">SKU / Product</th>
                <th scope="col" className="py-3 px-4">PO Number</th>
                <th scope="col" className="py-3 px-4">Arrival Verdict</th>
                <th scope="col" className="py-3 px-4">Intake Date</th>
                <th scope="col" className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <LoadingIcon size="lg" color="indigo" label="Loading arrival inspections…" className="flex-col gap-3" />
                  </td>
                </tr>
              ) : filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-700 text-sm">No inspections match filter</p>
                    <p className="text-xs text-slate-400">Try adjusting your query or filter selection.</p>
                  </td>
                </tr>
              ) : (
                filteredInspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="whitespace-nowrap py-3.5 px-4 font-mono font-bold text-slate-900">
                      {inspection.unitCode}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{inspection.productTitle}</div>
                      <div className="font-mono text-[10px] text-slate-500 mt-0.5">{inspection.sku}</div>
                    </td>
                    <td className="whitespace-nowrap py-3.5 px-4 font-semibold text-slate-700">
                      {inspection.poNumber}
                    </td>
                    <td className="whitespace-nowrap py-3.5 px-4">
                      {getVerdictBadge(inspection.overallVerdict)}
                    </td>
                    <td className="whitespace-nowrap py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(inspection.startedAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap py-3.5 px-4 text-right">
                      <Link
                        href={`/inspections/${inspection.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredInspections.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Showing {filteredInspections.length} inspection records</span>
            <span className="font-mono">Tamper-evident verification</span>
          </div>
        )}
      </div>
    </div>
  );
}
