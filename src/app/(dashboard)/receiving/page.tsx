"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package, AlertTriangle, CheckCircle, Clock, Search,
  ArrowUpDown, RefreshCw, Eye, XCircle, Fingerprint, Box, Layers, Palette, ShieldAlert, Puzzle,
} from "lucide-react";

interface KPI { label: string; value: number; icon: React.ElementType; color: string; }
interface Inspection {
  id: string; unitCode: string; sku: string; productTitle: string;
  poNumber: string; supplier: string; status: string; overallVerdict: string;
  completedAt: string; startedAt: string; createdAt: string;
}

export default function ReceivingPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("verdict", statusFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/inspections?${params}`);
      const data = await res.json();
      const list: Inspection[] = data.inspections || [];
      setInspections(list);

      const pass = list.filter((i) => i.overallVerdict === "pass").length;
      const exception = list.filter((i) => i.overallVerdict === "exception").length;
      const uncertain = list.filter((i) => i.overallVerdict === "uncertain").length;
      const pending = list.filter((i) => i.status === "pending" || !i.overallVerdict).length;

      setKpis([
        { label: "Pass", value: pass, icon: CheckCircle, color: "emerald" },
        { label: "Exceptions", value: exception, icon: XCircle, color: "rose" },
        { label: "Uncertain", value: uncertain, icon: AlertTriangle, color: "amber" },
        { label: "Pending", value: pending, icon: Clock, color: "slate" },
      ]);
    } catch {
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    const styles: Record<string, string> = {
      pass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      exception: "bg-rose-50 text-rose-700 border-rose-200",
      uncertain: "bg-amber-50 text-amber-700 border-amber-200",
      pending: "bg-slate-50 text-slate-500 border-slate-200",
    };
    const icons: Record<string, React.ElementType> = {
      pass: CheckCircle, exception: XCircle, uncertain: AlertTriangle, pending: Clock,
    };
    const Icon = icons[verdict] || Clock;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[verdict] || styles.pending}`}>
        <Icon className="w-3.5 h-3.5" />
        {verdict ? verdict.charAt(0).toUpperCase() + verdict.slice(1) : "Pending"}
      </span>
    );
  };

  const sorted = [...inspections].sort((a, b) => {
    const aVal = String((a as unknown as Record<string, unknown>)[sortField] || "");
    const bVal = String((b as unknown as Record<string, unknown>)[sortField] || "");
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dock receiving</h1>
          <p className="text-sm text-slate-500 mt-1">
            What arrived versus what was ordered — identity, count, damage, and spec, recorded at the bay.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { icon: Fingerprint, label: "Identity" },
          { icon: Package, label: "Quantity" },
          { icon: Box, label: "Cartons" },
          { icon: Layers, label: "Pack" },
          { icon: Palette, label: "Variant" },
          { icon: AlertTriangle, label: "Carton" },
          { icon: ShieldAlert, label: "Unit" },
          { icon: Puzzle, label: "Parts" },
        ].map((check) => (
          <div key={check.label} className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <check.icon className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="text-[11px] font-medium text-slate-600">{check.label}</span>
          </div>
        ))}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              kpi.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
              kpi.color === "rose" ? "bg-rose-50 text-rose-600" :
              kpi.color === "amber" ? "bg-amber-50 text-amber-600" :
              "bg-slate-50 text-slate-500"
            }`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by PO, SKU, product, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pass", "exception", "uncertain"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                statusFilter === status
                  ? "bg-brand-50 text-brand-700 border-brand-200"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {[
                  { key: "unitCode", label: "Unit" },
                  { key: "sku", label: "SKU" },
                  { key: "productTitle", label: "Product" },
                  { key: "poNumber", label: "PO" },
                  { key: "supplier", label: "Supplier" },
                  { key: "overallVerdict", label: "Verdict" },
                  { key: "createdAt", label: "Date" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">No inspections found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                sorted.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-medium text-brand-600">{item.unitCode}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-slate-600">{item.sku}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700 max-w-[200px] truncate block">{item.productTitle}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{item.poNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">{item.supplier?.replace(" (DUMMY)", "")}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getVerdictBadge(item.overallVerdict)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">
                        {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/inspections/${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && sorted.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing {sorted.length} inspections</p>
          </div>
        )}
      </div>
    </div>
  );
}
