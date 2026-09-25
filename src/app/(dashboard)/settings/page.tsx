"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building,
  Key,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { orgDisplayName } from "@/lib/public-labels";
import { LoadingIcon } from "@/components/ui/loading-icon";

interface AuditEvent {
  id: string;
  actorId: string;
  eventType: string;
  objectType: string;
  objectId: string;
  payloadHash: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"roles" | "users" | "org" | "api" | "audit">("roles");
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [mode, setMode] = useState<"offline" | "live">("offline");
  const [liveReady, setLiveReady] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchSession = async () => {
    try {
      const [meRes, auditRes, vlmRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/audit"),
        fetch("/api/settings/vlm"),
      ]);

      if (meRes.ok) {
        const data = await meRes.json();
        setCurrentUser(data.user);
        if (data.user?.role === "admin") {
          setActiveTab("users");
        }
      }

      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditEvents(auditData.events || []);
      }

      if (vlmRes.ok) {
        const vlmData = await vlmRes.json();
        setMode(vlmData.mode === "live" ? "live" : "offline");
        setLiveReady(Boolean(vlmData.liveReady));
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const userRole = currentUser?.role || "operator";
  const isAdmin = userRole === "admin";

  const tabs = [
    { id: "roles", label: "Permissions", icon: Shield, adminOnly: false },
    { id: "users", label: "Users", icon: Users, adminOnly: true },
    { id: "org", label: "Organization", icon: Building, adminOnly: false },
    { id: "api", label: "Observation engine", icon: Key, adminOnly: true },
    { id: "audit", label: "Audit log", icon: Sliders, adminOnly: false },
  ];

  const CAPABILITY_MATRIX = [
    { capability: "View inbound shipments", operator: true, reviewer: true, admin: true, evaluator: true },
    { capability: "Import purchase order manifests", operator: true, reviewer: true, admin: true, evaluator: false },
    { capability: "Capture dock photographs", operator: true, reviewer: true, admin: true, evaluator: false },
    { capability: "Run receiving inspection", operator: true, reviewer: true, admin: true, evaluator: false },
    { capability: "Accept PASS receipts", operator: true, reviewer: true, admin: true, evaluator: false },
    { capability: "Override EXCEPTION / UNCERTAIN", operator: false, reviewer: true, admin: true, evaluator: false },
    { capability: "Open sealed evidence record", operator: true, reviewer: true, admin: true, evaluator: true },
    { capability: "Run held-out quality suite", operator: false, reviewer: true, admin: true, evaluator: true },
    { capability: "Manage users and site policy", operator: false, reviewer: false, admin: true, evaluator: false },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Who can receive, who can override, and how this site records inbound condition.
          </p>
        </div>
        {saveNotice && (
          <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
            {saveNotice}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isLocked = tab.adminOnly && !isAdmin;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all ${
                  isActive
                    ? "bg-brand-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </div>
                {isLocked && (
                  <Lock className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[460px]">
          {activeTab === "roles" && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h2 className="text-base font-bold text-slate-900">Role permissions</h2>
                <p className="text-xs text-slate-500">Operators move freight. Reviewers own commercial overrides.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b">
                      <th className="py-2.5 px-3">Capability</th>
                      <th className="py-2.5 px-2 text-center">Operator</th>
                      <th className="py-2.5 px-2 text-center">Reviewer</th>
                      <th className="py-2.5 px-2 text-center">Admin</th>
                      <th className="py-2.5 px-2 text-center">Quality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CAPABILITY_MATRIX.map((row) => (
                      <tr key={row.capability} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">{row.capability}</td>
                        {[row.operator, row.reviewer, row.admin, row.evaluator].map((ok, i) => (
                          <td key={i} className="py-2.5 px-2 text-center">
                            {ok ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              {!isAdmin ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Lock className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800">Administrator access required</h3>
                  <p className="text-xs max-w-md mx-auto text-slate-500">
                    User management is limited to site administrators.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h2 className="text-base font-bold text-slate-900">People at this site</h2>
                    <p className="text-xs text-slate-500">Accounts bound to {orgDisplayName(currentUser?.orgId)}.</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { email: "operator@alpha.com", role: "operator", name: "Dock operator", desc: "Intake and capture" },
                      { email: "lead@alpha.com", role: "reviewer", name: "Lead reviewer", desc: "Triage and overrides" },
                      { email: "admin@alpha.com", role: "admin", name: "Site administrator", desc: "Policy and access" },
                      { email: "evaluator@alpha.com", role: "evaluator", name: "Quality lead", desc: "Held-out suite" },
                    ].map((u) => (
                      <div key={u.email} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-900">{u.name}</span>
                          <p className="text-[11px] text-slate-400 mt-0.5">{u.desc}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded font-medium uppercase text-[10px] bg-white border border-slate-200 text-slate-700">
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "org" && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h2 className="text-base font-bold text-slate-900">Organization</h2>
                <p className="text-xs text-slate-500">Receipts, photos, and POs never leave this site.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Current site</span>
                  <p className="text-base font-bold text-slate-900">{orgDisplayName(currentUser?.orgId)}</p>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">Isolation</span>
                  <p className="font-semibold text-emerald-900">Row-level tenancy is on</p>
                  <p className="text-emerald-700 text-[11px]">
                    Queries and image keys are scoped to this organization.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-4">
              {!isAdmin ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Lock className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800">Administrator access required</h3>
                  <p className="text-xs max-w-md mx-auto text-slate-500">
                    Observation engine policy is restricted to administrators.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-lg text-xs">
                  <div className="border-b pb-3">
                    <h2 className="text-base font-bold text-slate-900">Observation engine</h2>
                    <p className="text-slate-500">
                      Vision extracts facts. Commercial PASS / EXCEPTION / UNCERTAIN is owned by receiving rules.
                      Provider credentials stay on the server.
                    </p>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as "offline" | "live")}
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="offline">Offline — on-site observation fixture</option>
                      <option value="live">Live — configured server credentials</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {liveReady
                      ? "Server credentials are present. Live mode will run a single observation call per unit."
                      : "No live credentials on this host. Live mode will fail open to pending inspection."}
                  </p>
                  <button
                    type="button"
                    disabled={savingSettings}
                    onClick={async () => {
                      setSavingSettings(true);
                      try {
                        const res = await fetch("/api/settings/vlm", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ mode }),
                        });
                        if (res.ok) {
                          setSaveNotice("Observation policy saved.");
                          setTimeout(() => setSaveNotice(""), 4000);
                        }
                      } finally {
                        setSavingSettings(false);
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingSettings ? (
                      <LoadingIcon size="xs" color="white" label="Saving…" />
                    ) : (
                      "Save policy"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Audit log</h2>
                  <p className="text-xs text-slate-500">Overrides and inspection events for this site.</p>
                </div>
                <button onClick={fetchSession} className="p-1.5 rounded-lg border text-slate-500 hover:bg-slate-50">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              {auditEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Sliders className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">No audit events yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {auditEvents.map((evt) => (
                    <div key={evt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-900">{evt.eventType}</span>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {evt.payloadHash ? `${evt.payloadHash.slice(0, 16)}…` : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-slate-700 block">{evt.actorId}</span>
                        <span className="text-[10px] text-slate-400">{new Date(evt.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
