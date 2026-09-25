"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building,
  Key,
  Shield,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Sliders,
} from "lucide-react";

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
  const [showKey, setShowKey] = useState(false);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [vlmMode, setVlmMode] = useState("mock");
  const [provider, setProvider] = useState("gemini");
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-2.0-flash");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openrouterModel, setOpenrouterModel] = useState("qwen/qwen-2.5-vl-72b-instruct");
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
        setVlmMode(vlmData.vlmMode || "mock");
        setProvider(vlmData.provider || "gemini");
        setGeminiModel(vlmData.geminiModel || "gemini-2.0-flash");
        setOpenrouterModel(vlmData.openrouterModel || "qwen/qwen-2.5-vl-72b-instruct");
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
    { id: "roles", label: "Role Permissions Matrix", icon: Shield, adminOnly: false },
    { id: "users", label: "Users & RBAC", icon: Users, adminOnly: true },
    { id: "org", label: "Organization & Tenant", icon: Building, adminOnly: false },
    { id: "api", label: "VLM Configuration", icon: Key, adminOnly: true },
    { id: "audit", label: "System Audit Log", icon: Sliders, adminOnly: false },
  ];

  const CAPABILITY_MATRIX = [
    { capability: "View Inbound Shipments & Receiving Records", operator: true, reviewer: true, admin: true, evaluator: true, note: "Evaluator in read-only mode" },
    { capability: "Create New Receiving Intake / Import POs", operator: true, reviewer: true, admin: true, evaluator: false, note: "Restricted for Evaluator" },
    { capability: "Upload Dock Evidence & Photographs", operator: true, reviewer: true, admin: true, evaluator: false, note: "Pre-flight quality gate enforced" },
    { capability: "Execute Single-Call Multimodal VLM Inspection", operator: true, reviewer: true, admin: true, evaluator: false, note: "1 call per unit" },
    { capability: "Accept Clean PASS Inbound Receipts", operator: true, reviewer: true, admin: true, evaluator: false, note: "Standard dock put-away" },
    { capability: "Adjudicate Exceptions & Record Binding Overrides", operator: false, reviewer: true, admin: true, evaluator: false, note: "Mandatory justification audit trail" },
    { capability: "Inspect & Export Sealed rcv.v1 Evidence Contract", operator: true, reviewer: true, admin: true, evaluator: true, note: "SHA-256 tamper-evident contract" },
    { capability: "Execute 50-Unit Held-Out Evaluation Suite", operator: false, reviewer: true, admin: true, evaluator: true, note: "Cohen's Kappa & FP/FN analysis" },
    { capability: "Manage Users, Tenant Policies & API Credentials", operator: false, reviewer: false, admin: true, evaluator: false, note: "Admin credentials required" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">System Settings & Governance</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isAdmin ? "bg-indigo-100 text-indigo-800 border border-indigo-200" : "bg-slate-100 text-slate-700 border border-slate-200"
            }`}>
              Credentials: {userRole.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Section 14 & 15: Role-based access control (RBAC), multi-tenant isolation, and governance policies.
          </p>
        </div>

        {saveNotice && (
          <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg animate-fade-in font-medium">
            {saveNotice}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 space-y-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isLocked = tab.adminOnly && !isAdmin;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[460px]">
          {/* Tab 1: Role Permissions Matrix */}
          {activeTab === "roles" && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h2 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC) Specification</h2>
                <p className="text-xs text-slate-500">
                  Section 14 of Architecture Spec: Explicit capabilities enforced across Operator, Reviewer, Admin, and Evaluator credentials.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b">
                      <th className="py-2.5 px-3">System Capability</th>
                      <th className="py-2.5 px-2 text-center">Operator</th>
                      <th className="py-2.5 px-2 text-center">Reviewer</th>
                      <th className="py-2.5 px-2 text-center">Admin</th>
                      <th className="py-2.5 px-2 text-center">Evaluator</th>
                      <th className="py-2.5 px-3">Operational Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CAPABILITY_MATRIX.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">{row.capability}</td>
                        <td className="py-2.5 px-2 text-center">
                          {row.operator ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {row.reviewer ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {row.admin ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {row.evaluator ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-brand-50/50 rounded-xl border border-brand-100 text-xs">
                <span className="font-semibold text-brand-900 block mb-1">Quick Role Switcher Tip:</span>
                <p className="text-slate-600">
                  You can use the <strong>Role Switcher</strong> dropdown at the top-right of the dashboard header at any time to immediately switch credentials and verify how the UI and permissions adapt live.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Users & RBAC (Admin only) */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {!isAdmin ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Lock className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800">Administrative Credentials Required</h3>
                  <p className="text-xs max-w-md mx-auto text-slate-500">
                    User account management is strictly restricted to Organization Administrators. Switch to <code>admin@alpha.com</code> using the top header to manage users.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-b pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Tenant User Accounts</h2>
                      <p className="text-xs text-slate-500">Manage operator, reviewer, and administrator credentials for {currentUser?.orgId}.</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-brand-50 text-brand-700 font-semibold rounded-lg border border-brand-200">
                      5 Pre-Seeded Accounts
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { email: "operator@alpha.com", role: "operator", name: "Operator Alpha", desc: "Dock intake & capture" },
                      { email: "lead@alpha.com", role: "reviewer", name: "Lead Reviewer", desc: "Triage & overrides" },
                      { email: "admin@alpha.com", role: "admin", name: "Admin Alpha", desc: "Full governance" },
                      { email: "evaluator@alpha.com", role: "evaluator", name: "Evaluator", desc: "Benchmark runner" },
                    ].map((u) => (
                      <div key={u.email} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{u.name}</span>
                            <span className="font-mono text-slate-500">({u.email})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{u.desc}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] bg-white border border-slate-200 text-slate-700">
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Organization & Tenant Isolation */}
          {activeTab === "org" && (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h2 className="text-base font-bold text-slate-900">Organization & Multi-Tenancy Boundary</h2>
                <p className="text-xs text-slate-500">
                  Section 15: Complete logical separation between demo organizations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Current Organization</span>
                  <p className="text-base font-bold text-slate-900">{currentUser?.orgId === "org_demo_alpha" ? "Alpha Corp" : "Bravo Inc"}</p>
                  <p className="text-slate-500 font-mono text-[11px]">Tenant ID: {currentUser?.orgId}</p>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">Security Guarantee</span>
                  <p className="font-semibold text-emerald-900">Row-Level Security Active</p>
                  <p className="text-emerald-700 text-[11px]">
                    All database queries and image keys are partitioned by organization ID. Contamination between Alpha and Bravo is strictly prevented.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: VLM Configuration */}
          {activeTab === "api" && (
            <div className="space-y-4">
              {!isAdmin ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Lock className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800">Administrator Credentials Required</h3>
                  <p className="text-xs max-w-md mx-auto text-slate-500">
                    Modifying vision model endpoints and API keys requires Admin authorization.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-lg text-xs">
                  <div className="border-b pb-3">
                    <h2 className="text-base font-bold text-slate-900">VLM & AI Vision Pipeline</h2>
                    <p className="text-slate-500">Configure single-call multimodal inference: Google Gemini Flash or OpenRouter open-source vision models.</p>
                  </div>

                  {/* Mode Selector */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Inference Engine</label>
                    <select
                      value={vlmMode}
                      onChange={(e) => setVlmMode(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="mock">Offline / Local Deterministic Mock Engine</option>
                      <option value="live">Live Multimodal API (Google Gemini or OpenRouter)</option>
                    </select>
                  </div>

                  {vlmMode === "live" && (
                    <>
                      {/* Provider Selector */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Vision Provider</label>
                        <select
                          value={provider}
                          onChange={(e) => setProvider(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        >
                          <option value="gemini">Google Gemini API (Official SDK)</option>
                          <option value="openrouter">OpenRouter (Open-Source & Commercial Vision Models)</option>
                        </select>
                      </div>

                      {/* Google Gemini Section */}
                      {provider === "gemini" && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <span className="font-semibold text-slate-800 block text-xs">Google Gemini Configuration</span>
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Gemini Model</label>
                            <select
                              value={geminiModel}
                              onChange={(e) => setGeminiModel(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                            >
                              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended — Sub-Second Multimodal)</option>
                              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Cost-Efficient)</option>
                              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Multimodal Reasoning)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Google GenAI API Key (GEMINI_API_KEY)</label>
                            <div className="relative">
                              <input
                                type={showKey ? "text" : "password"}
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                placeholder="Paste your AIzaSy... API key here"
                                className="w-full border border-slate-300 rounded-lg p-2 pr-10 bg-white font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Get an API key from Google AI Studio (aistudio.google.com).</p>
                          </div>
                        </div>
                      )}

                      {/* OpenRouter Section */}
                      {provider === "openrouter" && (
                        <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-3">
                          <span className="font-semibold text-purple-950 block text-xs">OpenRouter Vision Models Configuration</span>
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">Model Architecture</label>
                            <select
                              value={openrouterModel}
                              onChange={(e) => setOpenrouterModel(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                            >
                              <option value="qwen/qwen-2.5-vl-72b-instruct">Qwen 2.5 VL 72B (Open Source — State of the Art Vision)</option>
                              <option value="meta-llama/llama-3.2-11b-vision-instruct">Meta Llama 3.2 11B Vision (Open Source)</option>
                              <option value="meta-llama/llama-3.2-90b-vision-instruct">Meta Llama 3.2 90B Vision (Open Source Large)</option>
                              <option value="mistralai/pixtral-12b">Mistral Pixtral 12B (Open Source Vision)</option>
                              <option value="google/gemini-2.0-flash-001">Google Gemini 2.0 Flash (via OpenRouter)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">OpenRouter API Key (OPENROUTER_API_KEY)</label>
                            <div className="relative">
                              <input
                                type={showKey ? "text" : "password"}
                                value={openrouterKey}
                                onChange={(e) => setOpenrouterKey(e.target.value)}
                                placeholder="Paste your sk-or-v1-... key here"
                                className="w-full border border-slate-300 rounded-lg p-2 pr-10 bg-white font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Get an API key from openrouter.ai/keys.</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    disabled={savingSettings}
                    onClick={async () => {
                      setSavingSettings(true);
                      try {
                        const res = await fetch("/api/settings/vlm", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            vlmMode,
                            provider,
                            geminiKey,
                            geminiModel,
                            openrouterKey,
                            openrouterModel,
                          }),
                        });
                        if (res.ok) {
                          setSaveNotice("VLM model configuration saved and applied immediately!");
                          setTimeout(() => setSaveNotice(""), 4000);
                        }
                      } finally {
                        setSavingSettings(false);
                      }
                    }}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {savingSettings ? "Saving..." : "Save & Apply VLM Configuration"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: System Audit Log */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Immutable System Audit Log</h2>
                  <p className="text-xs text-slate-500">Section 21: Tamper-evident trace of overrides and inspection events.</p>
                </div>
                <button onClick={fetchSession} className="p-1.5 rounded-lg border text-slate-500 hover:bg-slate-50">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {auditEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Sliders className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">No audit events recorded yet for this tenant.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {auditEvents.map((evt) => (
                    <div key={evt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{evt.eventType}</span>
                          <span className="font-mono text-slate-500">[{evt.objectType}:{evt.objectId}]</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">Payload Hash: {evt.payloadHash}</p>
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
