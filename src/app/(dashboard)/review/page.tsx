"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  AlertCircle,
  Inbox,
  CheckCircle2,
  Eye,
  Shield,
  Clock,
  X,
  UserCheck,
  RefreshCw,
  Scale,
} from "lucide-react";
import { LoadingIcon } from "@/components/ui/loading-icon";

interface ReviewItem {
  id: string;
  unitCode: string;
  sku: string;
  productTitle: string;
  poNumber: string;
  supplier: string;
  status: string;
  overallVerdict: "pass" | "exception" | "uncertain";
  completedAt: string;
  createdAt: string;
}

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterVerdict, setFilterVerdict] = useState<"all" | "exception" | "uncertain">("all");

  // Override dialog state
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [newVerdict, setNewVerdict] = useState<"pass" | "exception" | "uncertain">("pass");
  const [overrideReason, setOverrideReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inspRes, meRes] = await Promise.all([
        fetch("/api/inspections?limit=100"),
        fetch("/api/auth/me"),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }

      if (inspRes.ok) {
        const data = await inspRes.json();
        const all: ReviewItem[] = data.inspections || [];
        // Only exceptions and uncertain belong in the review queue
        const reviewOnly = all.filter(
          (i) => i.overallVerdict === "exception" || i.overallVerdict === "uncertain"
        );
        setItems(reviewOnly);
      }
    } catch (err) {
      console.error("Error loading review items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const userRole = currentUser?.role || "operator";
  const canOverride = userRole === "reviewer" || userRole === "admin";

  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !canOverride) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/inspections/${selectedItem.id}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newVerdict, reason: overrideReason }),
      });

      if (res.ok) {
        setSelectedItem(null);
        setOverrideReason("");
        setActionNotice(`Unit ${selectedItem.unitCode} successfully overridden to ${newVerdict.toUpperCase()}.`);
        await fetchData();
        setTimeout(() => setActionNotice(""), 5000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterVerdict === "all") return true;
    return item.overallVerdict === filterVerdict;
  });

  const exceptionCount = items.filter((i) => i.overallVerdict === "exception").length;
  const uncertainCount = items.filter((i) => i.overallVerdict === "uncertain").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-slate-500">
            <span className="font-bold text-slate-900 tracking-wider">RCV · POD 01</span>
            <span>/</span>
            <span>EXCEPTION TRIAGE DESK</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Review & Exception Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {items.length} Pending Triage
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Inbound units with detected defects, short shipments, or occluded evidence requiring human-in-the-loop lead adjudication.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            ROLE: {userRole}
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <LoadingIcon size="xs" color="indigo" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-slide-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice("")} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterVerdict("all")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-xs ${
            filterVerdict === "all"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Exceptions ({items.length})
        </button>
        <button
          onClick={() => setFilterVerdict("exception")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-xs ${
            filterVerdict === "exception"
              ? "bg-rose-600 text-white border-rose-600"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Defects & Shortages ({exceptionCount})
        </button>
        <button
          onClick={() => setFilterVerdict("uncertain")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-xs ${
            filterVerdict === "uncertain"
              ? "bg-amber-600 text-white border-amber-600"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Visual Occlusion ({uncertainCount})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">Unit Code</th>
                <th className="px-4 py-3">PO & Supplier</th>
                <th className="px-4 py-3">Product / SKU</th>
                <th className="px-4 py-3">Arrival Verdict</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-right">Adjudication Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <LoadingIcon size="lg" color="indigo" label="Loading exception triage queue…" className="flex-col gap-3" />
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-400 space-y-2">
                    <Inbox className="w-12 h-12 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-800 text-sm">Review Queue Cleared</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Zero pending exceptions or uncertain items requiring lead reviewer triage.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900">{item.unitCode}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{item.poNumber}</div>
                      <div className="text-[10px] text-slate-400">{item.supplier.replace(" (DUMMY)", "")}</div>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{item.productTitle}</div>
                      <div className="font-mono text-[10px] text-slate-500 mt-0.5">{item.sku}</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {item.overallVerdict === "exception" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> EXCEPTION
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> UNCERTAIN
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(item.completedAt || item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {canOverride && (
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl transition-colors shadow-2xs"
                          >
                            Adjudicate
                          </button>
                        )}
                        <Link
                          href={`/inspections/${item.id}`}
                          className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition-colors shadow-2xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Examine</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reviewer Quick Adjudication Dialog */}
      <Dialog.Root open={Boolean(selectedItem)} onOpenChange={() => setSelectedItem(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-50 animate-slide-in border border-slate-200">
            {selectedItem && (
              <form onSubmit={handleApplyOverride} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <Dialog.Title className="text-base font-bold text-slate-900">
                      Adjudicate Unit: {selectedItem.unitCode}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-slate-500 font-mono mt-0.5">
                      PO: {selectedItem.poNumber} · Current: {selectedItem.overallVerdict.toUpperCase()}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </Dialog.Close>
                </div>

                <div className="text-xs space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Commercial Verdict</label>
                    <select
                      value={newVerdict}
                      onChange={(e) => setNewVerdict(e.target.value as any)}
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-colors"
                    >
                      <option value="pass">PASS (Admit for Put-Away)</option>
                      <option value="exception">EXCEPTION (Quarantine / Vendor Claim)</option>
                      <option value="uncertain">UNCERTAIN (Require Physical Re-inspection)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lead Review Reason <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Explain physical inspection findings justifying this decision..."
                      className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-colors"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Decision will be recorded with timestamp and reviewer identity in sealed evidence contract.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <Dialog.Close asChild>
                    <button type="button" className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={submitting || !overrideReason}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <LoadingIcon size="xs" color="white" label="Applying…" />
                    ) : (
                      "Save Adjudication"
                    )}
                  </button>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
