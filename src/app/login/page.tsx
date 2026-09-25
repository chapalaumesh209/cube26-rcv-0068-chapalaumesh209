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
    station: "Bay 4 Intake Station",
    desc: "Photograph arrivals, verify SKU & count, and run single-pass inspection at the bay.",
    target: "/receiving",
    icon: Package,
    color: "emerald",
    badge: "Operational Intake",
  },
  {
    role: "reviewer",
    email: "lead@alpha.com",
    title: "Lead Reviewer",
    station: "Discrepancy Triage Desk",
    desc: "Adjudicate transit defects, short-shipments, and occluded stock with binding audit trails.",
    target: "/review",
    icon: AlertTriangle,
    color: "amber",
    badge: "Exception Review",
  },
  {
    role: "admin",
    email: "admin@alpha.com",
    title: "Site Administrator",
    station: "Operations & Policy Desk",
    desc: "Import purchase order manifests, manage catalogue BOM, and configure access policies.",
    target: "/shipments",
    icon: ClipboardList,
    color: "indigo",
    badge: "Manifests & Policy",
  },
  {
    role: "evaluator",
    email: "evaluator@alpha.com",
    title: "Quality Assurance Lead",
    station: "Quality & Compliance Lab",
    desc: "Score held-out 50-unit benchmark suite, Cohen's kappa agreement, and error rates.",
    target: "/evaluation",
    icon: BarChart3,
    color: "purple",
    badge: "Benchmark & Accuracy",
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
        setError(data.error || "Authentication failed. Check credentials.");
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
      setError("Network connection error. Please try again.");
      setLoadingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Background Subtle Gradient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-brand-600/15 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">DockProof</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full">
                RCV · Pod 01
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous Inbound Receiving Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Bay Intake Pipeline Active</span>
          </div>

          <button
            onClick={() => setSopOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-400" />
            <span>Receiving SOP</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-10 flex-1 flex flex-col justify-center space-y-8">
        {/* Header Hero Title */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Select Operational Station
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Autonomous optical verification at the receiving bay. Single-pass multimodal inspection against Purchase Orders with pure deterministic commercial verdicts.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs text-center flex items-center justify-center gap-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Station Workspace Cards (Grid 2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STATIONS.map((st) => {
            const Icon = st.icon;
            const isLoading = loadingKey === st.email;

            return (
              <button
                key={st.role}
                onClick={() => handleLogin(st.email, st.target)}
                disabled={Boolean(loadingKey)}
                className="group relative text-left p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-brand-500/60 transition-all duration-200 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          st.color === "emerald"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20"
                            : st.color === "amber"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20"
                            : st.color === "purple"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white group-hover:text-brand-300 transition-colors">
                          {st.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono">{st.station}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        st.color === "emerald"
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                          : st.color === "amber"
                          ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
                          : st.color === "purple"
                          ? "bg-purple-950/60 text-purple-300 border-purple-800/60"
                          : "bg-indigo-950/60 text-indigo-300 border-indigo-800/60"
                      }`}
                    >
                      {st.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">1-Click Launch</span>
                  <div className="flex items-center gap-1 font-semibold text-brand-400 group-hover:text-brand-300 transition-colors">
                    {isLoading ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-brand-400">
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

        {/* Optional Custom Organization Login Accordion */}
        <div className="max-w-md mx-auto w-full pt-2">
          <button
            type="button"
            onClick={() => setShowCustomLogin(!showCustomLogin)}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors py-1.5"
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
              className="mt-3 p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 animate-slide-in"
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
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
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
                    className="w-full px-3 py-2 pr-9 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
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
                className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 shadow"
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

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Pure Deterministic Decision Engine · Sealed rcv.v1 Evidence Contract</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSopOpen(true)}
            className="hover:text-slate-300 transition-colors"
          >
            Receiving Specification & 8 Gates
          </button>
          <span>·</span>
          <span>CUBE Buildathon 2026</span>
        </div>
      </footer>

      {/* SOP Modal */}
      <ReceivingSopModal open={sopOpen} onOpenChange={setSopOpen} />
    </div>
  );
}
