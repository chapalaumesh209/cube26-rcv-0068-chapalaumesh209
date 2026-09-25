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
} from "lucide-react";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900">Lead Review Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {items.length} Pending Triage
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Section 14 & 20: Mandatory human adjudication queue for all exceptions, defects, and uncertain cases.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Queue
        </button>
      </div>

      {/* Role-Specific Station Banner */}
      <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
        canOverride ? "bg-amber-50/80 border-amber-200 text-amber-900" :
        userRole === "evaluator" ? "bg-purple-50/80 border-purple-200 text-purple-900" :
        "bg-slate-100 border-slate-200 text-slate-700"
      }`}>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-600 shrink-0" />
          <div>
            <span className="font-semibold">Review Station Access: </span>
            {canOverride && "You are authenticated with Lead Reviewer / Admin credentials. Overrides applied here are legally binding and preserved in the audit contract."}
            {userRole === "operator" && "You are viewing the queue as Receiving Operator. You can inspect units and submit escalation notes; overrides require Lead Reviewer approval."}
            {userRole === "evaluator" && "You are viewing the queue in Evaluator mode. Review controls are in read-only observation mode."}
          </div>
        </div>
        <span className="font-mono uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 shadow-xs">
          Role: {userRole}
        </span>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between animate-fade-in">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice("")}><X className="w-4 h-4 text-emerald-600" /></button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterVerdict("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
            filterVerdict === "all" ? "bg-brand-600 text-white border-brand-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Items ({items.length})
        </button>
        <button
          onClick={() => setFilterVerdict("exception")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
            filterVerdict === "exception" ? "bg-rose-600 text-white border-rose-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Exceptions ({exceptionCount})
        </button>
        <button
          onClick={() => setFilterVerdict("uncertain")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
            filterVerdict === "uncertain" ? "bg-amber-600 text-white border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Uncertain ({uncertainCount})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="px-4 py-3">Unit Code</th>
                <th className="px-4 py-3">PO & Supplier</th>
                <th className="px-4 py-3">Product / SKU</th>
                <th className="px-4 py-3">Current Verdict</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-right">Adjudication Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                    <Inbox className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">Review Queue Cleared</p>
                    <p className="text-xs text-slate-400 mt-1">Zero pending exceptions or uncertain items requiring lead triage.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-brand-600">{item.unitCode}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{item.poNumber}</div>
                      <div className="text-[11px] text-slate-400">{item.supplier.replace(" (DUMMY)", "")}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-700">{item.sku}</div>
                      <div className="text-[11px] text-slate-400 max-w-[200px] truncate">{item.productTitle}</div>
                    </td>
                    <td className="px-4 py-3">
                      {item.overallVerdict === "exception" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Exception
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5" /> Uncertain
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(item.completedAt || item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canOverride && (
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="px-2.5 py-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-md transition-colors"
                          >
                            Adjudicate
                          </button>
                        )}
                        <Link
                          href={`/inspections/${item.id}`}
                          className="px-2.5 py-1 text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Workspace
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
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-50 animate-slide-in">
            {selectedItem && (
              <form onSubmit={handleApplyOverride} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <Dialog.Title className="text-base font-bold text-slate-900">
                      Adjudicate Unit: {selectedItem.unitCode}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-slate-500">
                      PO: {selectedItem.poNumber} · Current: {selectedItem.overallVerdict.toUpperCase()}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </Dialog.Close>
                </div>

                <div className="text-xs space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Verdict</label>
                    <select
                      value={newVerdict}
                      onChange={(e) => setNewVerdict(e.target.value as any)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="pass">PASS (Admit for Put-Away)</option>
                      <option value="exception">EXCEPTION (Quarantine / Claim)</option>
                      <option value="uncertain">UNCERTAIN (Require Re-inspection)</option>
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
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Dialog.Close asChild>
                    <button type="button" className="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={submitting || !overrideReason}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    {submitting ? "Applying..." : "Save Adjudication"}
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
