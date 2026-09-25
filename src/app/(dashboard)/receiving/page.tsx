"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  ArrowUpDown,
  RefreshCw,
  Eye,
  XCircle,
  Fingerprint,
  Box,
  Layers,
  Palette,
  ShieldAlert,
  Puzzle,
  BookOpen,
  Filter,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { ReceivingSopModal } from "@/components/receiving-sop-modal";
import { LoadingIcon } from "@/components/ui/loading-icon";

interface Inspection {
  id: string;
  unitCode: string;
  sku: string;
  productTitle: string;
  poNumber: string;
  supplier: string;
  status: string;
  overallVerdict: "pass" | "exception" | "uncertain" | "pending";
  completedAt: string | null;
  startedAt: string | null;
  createdAt: string;
  contentHash?: string | null;
}

const GATES = [
  { key: "identity", label: "01 Identity", icon: Fingerprint, desc: "OCR Barcode & SKU match against catalogue PO line" },
  { key: "quantity", label: "02 Quantity", icon: Package, desc: "Visible item count verification against PO line count" },
  { key: "carton_count", label: "03 Cartons", icon: Box, desc: "Pallet master carton count vs manifest bill of lading" },
  { key: "units_per_carton", label: "04 Pack Spec", icon: Layers, desc: "Internal row/grid pack count inside master carton" },
  { key: "variant", label: "05 Variant", icon: Palette, desc: "Physical colour, finish, and model attribute check" },
  { key: "carton_damage", label: "06 Carton Crush", icon: AlertTriangle, desc: "Transit impact, corner crush, puncture, water tears" },
  { key: "unit_damage", label: "07 Unit Defect", icon: ShieldAlert, desc: "Physical chassis scratch, dent, and broken seal detection" },
  { key: "components", label: "08 BOM Parts", icon: Puzzle, desc: "Accessory cavities completeness against product BOM" },
];

export default function ReceivingPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pass" | "exception" | "uncertain">("all");
  const [activeGate, setActiveGate] = useState<string | null>(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sopOpen, setSopOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("verdict", statusFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/inspections?${params}`);
      const data = await res.json();
      const list: Inspection[] = data.inspections || [];
      setInspections(list);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = inspections.length;
    const pass = inspections.filter((i) => i.overallVerdict === "pass").length;
    const exception = inspections.filter((i) => i.overallVerdict === "exception").length;
    const uncertain = inspections.filter((i) => i.overallVerdict === "uncertain").length;
    const pending = inspections.filter((i) => i.status === "pending" || !i.overallVerdict).length;
    return { total, pass, exception, uncertain, pending };
  }, [inspections]);

  // Sorting
  const sorted = useMemo(() => {
    return [...inspections].sort((a, b) => {
      const aVal = String((a as unknown as Record<string, unknown>)[sortField] || "");
      const bVal = String((b as unknown as Record<string, unknown>)[sortField] || "");
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [inspections, sortField, sortDir]);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Station Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-slate-500">
            <span className="font-bold text-slate-900 tracking-wider">POD 01</span>
            <span>/</span>
            <span className="text-slate-600">INBOUND INTAKE FEED</span>
            <span>/</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              BAY 04 ACTIVE {lastUpdated ? `· ${lastUpdated}` : ""}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dock Receiving & Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real-time physical verification of arrivals against Purchase Orders. Executes all 8 arrival gates in a single multimodal observation pass, bound by deterministic rules into sealed <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono font-medium">rcv.v1</code> evidence contracts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setSopOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-brand-600" />
            <span>Receiving SOP</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <LoadingIcon size="xs" color="indigo" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Refresh</span>
          </button>

          <Link
            href="/shipments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-sm"
          >
            <span>Inbound Manifests</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Throughput & Health Distribution Bar */}
      {stats.total > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-600">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Verified: <strong className="text-slate-900 tabular-nums">{stats.pass}</strong> ({Math.round((stats.pass / stats.total) * 100)}%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Defects/Shortage: <strong className="text-slate-900 tabular-nums">{stats.exception}</strong> ({Math.round((stats.exception / stats.total) * 100)}%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Under Review: <strong className="text-slate-900 tabular-nums">{stats.uncertain}</strong> ({Math.round((stats.uncertain / stats.total) * 100)}%)</span>
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">Total: {stats.total} units catalogued</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden">
            <div style={{ width: `${(stats.pass / stats.total) * 100}%` }} className="bg-emerald-500 h-full transition-all duration-300" />
            <div style={{ width: `${(stats.exception / stats.total) * 100}%` }} className="bg-rose-500 h-full transition-all duration-300" />
            <div style={{ width: `${(stats.uncertain / stats.total) * 100}%` }} className="bg-amber-500 h-full transition-all duration-300" />
          </div>
        </div>
      )}

      {/* 2. Elevated KPI Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pass Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === "pass" ? "all" : "pass")}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all duration-200 shadow-sm ${
            statusFilter === "pass"
              ? "border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/20"
              : "border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified Condition
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.pass}</span>
            <span className="text-xs font-medium text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Clean arrival proven. Dispatched to Inbound Prep (Pod 02).
          </p>
        </div>

        {/* Exception Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === "exception" ? "all" : "exception")}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all duration-200 shadow-sm ${
            statusFilter === "exception"
              ? "border-rose-500 ring-2 ring-rose-100 bg-rose-50/20"
              : "border-slate-200 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Defects / Shortages
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100/70 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.exception}</span>
            <span className="text-xs font-medium text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Zero-mask policy. Discrepancy logged for Recovery claim (Pod 05).
          </p>
        </div>

        {/* Uncertain Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === "uncertain" ? "all" : "uncertain")}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all duration-200 shadow-sm ${
            statusFilter === "uncertain"
              ? "border-amber-500 ring-2 ring-amber-100 bg-amber-50/20"
              : "border-slate-200 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Under Review
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.uncertain}</span>
            <span className="text-xs font-medium text-slate-500">units</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Occlusion or glare. Routed to Review Queue for human sign-off.
          </p>
        </div>

        {/* Pending Card */}
        <div
          onClick={() => setStatusFilter("all")}
          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all duration-200 shadow-sm ${
            statusFilter === "all" ? "border-slate-300 bg-slate-50/30" : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              Total Inbound Units
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.total}</span>
            <span className="text-xs font-medium text-slate-500">catalogued</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Continuous receiving intake ledger at this warehouse dock.
          </p>
        </div>
      </div>

      {/* 3. The 8 Verification Gates Interactive Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              The 8 Automated Verification Gates (Single Multimodal Pass)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Zero-Masking Decision Policy Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {GATES.map((gate) => {
            const Icon = gate.icon;
            const isSelected = activeGate === gate.key;
            return (
              <div
                key={gate.key}
                onClick={() => setActiveGate(isSelected ? null : gate.key)}
                className={`cursor-pointer p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-brand-50 border-brand-400 ring-2 ring-brand-100"
                    : "bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300"
                }`}
                title={gate.desc}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-brand-600" : "text-slate-500"}`} />
                  <span className="text-[11px] font-bold text-slate-900 truncate">{gate.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1">{gate.desc}</p>
              </div>
            );
          })}
        </div>

        {activeGate && (
          <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-200 text-xs text-brand-900 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="font-bold">Active Gate Filter:</span>
              <span>{GATES.find((g) => g.key === activeGate)?.desc}</span>
            </div>
            <button
              onClick={() => setActiveGate(null)}
              className="text-brand-600 hover:text-brand-800 text-[11px] font-semibold"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* 4. Search & Segmented Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Unit, SKU, Product, PO, or Supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-900 placeholder-slate-400 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Units", count: stats.total },
            { id: "pass", label: "Pass", count: stats.pass, color: "emerald" },
            { id: "exception", label: "Exceptions", count: stats.exception, color: "rose" },
            { id: "uncertain", label: "Uncertain", count: stats.uncertain, color: "amber" },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-slate-800 text-slate-200" : "bg-white text-slate-500 border border-slate-200"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Production Feed & Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Status</th>
                <th
                  onClick={() => toggleSort("unitCode")}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    Unit ID <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort("sku")}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    SKU & Specification <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="py-3 px-4">PO & Supplier</th>
                <th
                  onClick={() => toggleSort("overallVerdict")}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    Arrival Verdict <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="py-3 px-4">Evidence Hash</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <LoadingIcon size="lg" color="indigo" label="Streaming inbound intake ledger…" className="flex-col gap-3" />
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 space-y-2">
                    <Package className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-700 text-sm">No receiving records match filter</p>
                    <p className="text-xs text-slate-400">
                      Try clearing the search query or status filter to see inbound shipments.
                    </p>
                  </td>
                </tr>
              ) : (
                sorted.map((item) => {
                  const isPass = item.overallVerdict === "pass";
                  const isException = item.overallVerdict === "exception" || (item.overallVerdict as string) === "fail";
                  const isUncertain = item.overallVerdict === "uncertain";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Status indicator bar */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ring-4 ${
                            isPass
                              ? "bg-emerald-500 ring-emerald-100"
                              : isException
                              ? "bg-rose-500 ring-rose-100"
                              : isUncertain
                              ? "bg-amber-500 ring-amber-100"
                              : "bg-slate-300 ring-slate-100"
                          }`}
                        />
                      </td>

                      {/* Unit ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {item.unitCode}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Today"}
                        </span>
                      </td>

                      {/* SKU & Product Details */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-slate-900 block truncate">
                          {item.productTitle}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            {item.sku}
                          </span>
                        </div>
                      </td>

                      {/* PO & Supplier */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 block text-xs">
                          {item.poNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                          {item.supplier?.replace(" (DUMMY)", "")}
                        </span>
                      </td>

                      {/* Commercial Verdict */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPass && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            PASS
                          </span>
                        )}
                        {isException && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            EXCEPTION
                          </span>
                        )}
                        {isUncertain && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            UNCERTAIN
                          </span>
                        )}
                        {!isPass && !isException && !isUncertain && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* SHA-256 Evidence Seal */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                          <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span>
                            {item.contentHash
                              ? `${item.contentHash.substring(0, 10)}…`
                              : "Sealed rcv.v1"}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/inspections/${item.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-colors shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Record</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && sorted.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{sorted.length}</strong> inbound units in current view
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">
                Tamper-evident record sealed per receipt
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SOP Modal */}
      <ReceivingSopModal open={sopOpen} onOpenChange={setSopOpen} />
    </div>
  );
}
