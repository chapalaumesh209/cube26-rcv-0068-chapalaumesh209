"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Eye,
  EyeOff,
  Package,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Lock,
  ChevronDown,
} from "lucide-react";
import { ReceivingSopModal } from "@/components/receiving-sop-modal";
import { LoadingIcon } from "@/components/ui/loading-icon";

const STATIONS = [
  {
    role: "operator",
    email: "operator@alpha.com",
    title: "Dock Intake Operator",
    station: "Bay 4 Intake Station",
    duty: "Photograph physical freight, match PO lines, and execute single-pass arrival inspection.",
    target: "/receiving",
    icon: Package,
    accent: "emerald",
    badge: "Operational Intake",
    statusText: "Camera Ready",
  },
  {
    role: "reviewer",
    email: "lead@alpha.com",
    title: "Lead Reviewer",
    station: "Discrepancy Triage Desk",
    duty: "Adjudicate transit defects, short-shipments, and occluded stock with binding audit notes.",
    target: "/review",
    icon: AlertTriangle,
    accent: "amber",
    badge: "Exception Review",
    statusText: "Review Queue Active",
  },
  {
    role: "admin",
    email: "admin@alpha.com",
    title: "Site Administrator",
    station: "Operations & Policy Console",
    duty: "Import PO manifests, configure tenant isolation policies, and manage catalogue BOM specs.",
    target: "/shipments",
    icon: ClipboardList,
    accent: "indigo",
    badge: "Manifests & Policy",
    statusText: "Multi-Tenant Policy",
  },
  {
    role: "evaluator",
    email: "evaluator@alpha.com",
    title: "Quality Assurance Lead",
    station: "Held-Out Benchmark Lab",
    duty: "Evaluate model accuracy on 50 unseen units, measure Cohen's kappa (κ), and audit false positives.",
    target: "/evaluation",
    icon: BarChart3,
    accent: "purple",
    badge: "Quality Benchmark",
    statusText: "κ = 0.9293 Suite",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCustomLogin, setShowCustomLogin] = useState(false);
  const [sopOpen, setSopOpen] = useState(false);

  const handleLogin = async (targetEmail?: string, customTarget?: string) => {
    setError("");
    const useEmail = targetEmail || email;
    const usePassword = targetEmail ? "demo123" : password;
    setLoadingKey(useEmail);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: useEmail, password: usePassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed. Please verify credentials.");
        setLoadingKey(null);
        return;
      }

      let destination = customTarget;
      if (!destination) {
        const role = data.user?.role;
        if (role === "reviewer") destination = "/review";
        else if (role === "evaluator") destination = "/evaluation";
        else if (role === "admin") destination = "/shipments";
        else destination = "/receiving";
      }

      router.push(destination);
      router.refresh();
    } catch {
      setError("Network connection timeout. Please try again.");
      setLoadingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-indigo-600 selection:text-white bg-dot-pattern">
      {/* Top Refined Light Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  DockProof
                </span>
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  RCV · Pod 01
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Autonomous Receiving Manager · CUBE Buildathon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Bay 4 Intake Pipeline Active</span>
            </div>

            <button
              onClick={() => setSopOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs"
              title="Open Standard Operating Procedure & Specification"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Receiving SOP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 flex flex-col justify-center space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <span className="font-bold text-slate-900 tracking-wider">CUBE TRACK 01</span>
            <span>/</span>
            <span>COMMERCE CONTEXT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Select Operational Station
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
            Autonomous optical verification at bay arrival. Single-pass multimodal inspection against Purchase Orders with pure deterministic commercial verdicts.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs text-center flex items-center justify-center gap-2 shadow-xs animate-slide-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Station Workspace Consoles (Clean Light Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STATIONS.map((st) => {
            const Icon = st.icon;
            const isLoading = loadingKey === st.email;

            return (
              <button
                key={st.role}
                onClick={() => handleLogin(st.email, st.target)}
                disabled={Boolean(loadingKey)}
                className="group text-left p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden"
              >
                <div className="space-y-3 w-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${
                          st.accent === "emerald"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : st.accent === "amber"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : st.accent === "purple"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {st.title}
                        </h2>
                        <span className="text-[11px] font-mono text-slate-500 block">
                          {st.station}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        st.accent === "emerald"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : st.accent === "amber"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : st.accent === "purple"
                          ? "bg-purple-50 text-purple-800 border-purple-200"
                          : "bg-indigo-50 text-indigo-800 border-indigo-200"
                      }`}
                    >
                      {st.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{st.duty}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between w-full text-xs">
                  <span className="text-[11px] font-mono text-slate-400">1-Click Fast Launch</span>
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    {isLoading ? (
                      <LoadingIcon size="xs" color="indigo" label="Authenticating…" />
                    ) : (
                      <>
                        <span>Enter Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Organization Credentials Drawer */}
        <div className="max-w-md mx-auto w-full pt-1">
          <button
            type="button"
            onClick={() => setShowCustomLogin(!showCustomLogin)}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors py-1.5 font-mono"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign in with custom organization credentials</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showCustomLogin ? "rotate-180" : ""}`}
            />
          </button>

          {showCustomLogin && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="mt-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-md space-y-3.5 animate-slide-in"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@alpha.com"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 pr-9 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={Boolean(loadingKey) || !email || !password}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-xs"
              >
                {loadingKey === email ? (
                  <LoadingIcon size="xs" color="white" label="Signing in…" />
                ) : (
                  "Continue to Workspace"
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Refined Light Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white/70 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Deterministic Rules Engine · SHA-256 rcv.v1 Sealed Contract</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSopOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              8 Arrival Gates SOP
            </button>
            <span>·</span>
            <span>CUBE Buildathon 2026</span>
          </div>
        </div>
      </footer>

      {/* SOP Modal */}
      <ReceivingSopModal open={sopOpen} onOpenChange={setSopOpen} />
    </div>
  );
}
