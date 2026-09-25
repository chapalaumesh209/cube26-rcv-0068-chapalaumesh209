"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

const ROLE_ACCOUNTS = [
  {
    email: "operator@alpha.com",
    role: "Operator",
    title: "Dock Operator",
    org: "Alpha Corp",
    desc: "Intake, Barcode Scan & VLM Camera",
    color: "from-blue-600 to-indigo-600",
    badge: "Intake",
    target: "/receiving",
  },
  {
    email: "lead@alpha.com",
    role: "Reviewer",
    title: "Lead Reviewer",
    org: "Alpha Corp",
    desc: "Exceptions Triage & Commercial Sign-off",
    color: "from-amber-600 to-orange-600",
    badge: "Triage",
    target: "/review",
  },
  {
    email: "admin@alpha.com",
    role: "Admin",
    title: "Administrator",
    org: "Alpha Corp",
    desc: "Manifests, VLM Engine & Access Control",
    color: "from-slate-800 to-slate-950",
    badge: "Config",
    target: "/shipments",
  },
  {
    email: "evaluator@alpha.com",
    role: "Evaluator",
    title: "Benchmark Evaluator",
    org: "Alpha Corp",
    desc: "50-Unit Held-Out Suite & Kappa Score",
    color: "from-purple-600 to-indigo-700",
    badge: "Metrics",
    target: "/evaluation",
  },
  {
    email: "operator@bravo.com",
    role: "Operator",
    title: "Tenant Bravo",
    org: "Bravo Inc",
    desc: "Cross-Tenant Data Boundary Isolation",
    color: "from-emerald-600 to-teal-700",
    badge: "Isolated",
    target: "/receiving",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (targetEmail?: string, customTarget?: string) => {
    setError("");
    const useEmail = targetEmail || email;
    const usePassword = targetEmail ? "demo123" : password;
    setLoadingEmail(useEmail);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: useEmail, password: usePassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoadingEmail(null);
        return;
      }

      // Route to role-specific destination
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
      setError("Network connection error. Try again.");
      setLoadingEmail(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      {/* Background Subtle Gradient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-brand-400">
            <Shield className="w-3.5 h-3.5 text-brand-500" />
            DockProof · Track 01 RCV
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Receiving Manager</h1>
          <p className="text-xs text-slate-400">Select a role to enter its specialized workspace</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* 1-Click Role-Based Entry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ROLE_ACCOUNTS.map((acc) => {
            const isLoading = loadingEmail === acc.email;
            return (
              <button
                key={acc.email}
                onClick={() => handleLogin(acc.email, acc.target)}
                disabled={Boolean(loadingEmail)}
                className="group relative p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-850 transition-all text-left flex flex-col justify-between shadow-lg disabled:opacity-50"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {acc.badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{acc.org}</span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm group-hover:text-brand-300 transition-colors">
                    {acc.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {acc.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-white">
                  <span className="font-mono text-[11px] truncate max-w-[170px]">{acc.email}</span>
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Manual Credentials Accordion / Input */}
        <div className="max-w-md mx-auto bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@alpha.com"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
              />
              <div className="relative w-36 shrink-0">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 pr-7 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={Boolean(loadingEmail) || !email || !password}
              className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              {loadingEmail === email ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-500">
            Pre-seeded password for all accounts: <code className="text-slate-400 font-mono">demo123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
