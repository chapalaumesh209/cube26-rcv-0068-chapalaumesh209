"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
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

const STATIONS = [
  {
    role: "operator",
    email: "operator@alpha.com",
    title: "Dock Intake Operator",
    station: "Bay 4 Intake Line",
    duty: "Photograph physical freight, match PO lines, and execute single-pass arrival inspection.",
    target: "/receiving",
    icon: Package,
    accent: "emerald",
    statusText: "Camera Intake Ready",
  },
  {
    role: "reviewer",
    email: "lead@alpha.com",
    title: "Lead Reviewer",
    station: "Discrepancy Triage Desk",
    duty: "Adjudicate crushed packaging, quantity shortages, and occluded stock with binding audit notes.",
    target: "/review",
    icon: AlertTriangle,
    accent: "amber",
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
    statusText: "κ = 0.9293 Benchmark",
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
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Top Industrial Header Bar */}
      <header className="w-full border-b border-slate-800/80 bg-[#0C0E17]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-sans">
                  DockProof
                </span>
                <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  RCV · Pod 01
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Autonomous Receiving Manager · CUBE Buildathon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bay 4 Intake Pipeline Active</span>
            </div>

            <button
              onClick={() => setSopOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title="Open Standard Operating Procedure & Specification"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Receiving SOP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 flex flex-col justify-center space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Select Operational Station
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Autonomous optical verification at bay arrival. Single-pass multimodal inspection against Purchase Orders with pure deterministic commercial verdicts.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs text-center flex items-center justify-center gap-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Station Workspace Consoles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STATIONS.map((st) => {
            const Icon = st.icon;
            const isLoading = loadingKey === st.email;

            return (
              <button
                key={st.role}
                onClick={() => handleLogin(st.email, st.target)}
                disabled={Boolean(loadingKey)}
                className="group text-left p-5 rounded-xl bg-[#121520] border border-slate-800/90 hover:border-indigo-500/70 hover:bg-[#161a28] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div className="space-y-3 w-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          st.accent === "emerald"
                            ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/60"
                            : st.accent === "amber"
                            ? "bg-amber-950/70 text-amber-400 border border-amber-800/60"
                            : st.accent === "purple"
                            ? "bg-purple-950/70 text-purple-400 border border-purple-800/60"
                            : "bg-indigo-950/70 text-indigo-400 border border-indigo-800/60"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                          {st.title}
                        </h2>
                        <span className="text-[11px] font-mono text-slate-400 block">
                          {st.station}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {st.statusText}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{st.duty}</p>
                </div>

                <div className="pt-3.5 mt-3.5 border-t border-slate-800/80 flex items-center justify-between w-full text-xs">
                  <span className="text-[11px] font-mono text-slate-500">1-Click Launch</span>
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    {isLoading ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-mono">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Authenticating…
                      </span>
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
            className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors py-1.5 font-mono"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
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
              className="mt-3 p-4 bg-[#121520] rounded-xl border border-slate-800 space-y-3 animate-fade-in"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@alpha.com"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-9 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={Boolean(loadingKey) || !email || !password}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 shadow"
              >
                {loadingKey === email ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Continue to Workspace"
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Industrial Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#0C0E17]/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Rules Engine · SHA-256 rcv.v1 Sealed Contract</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSopOpen(true)}
              className="hover:text-slate-200 transition-colors"
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
