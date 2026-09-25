"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Shield, Eye, Loader2 } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "admin@alpha.com", role: "Admin", org: "Alpha Corp", icon: "🔑" },
  { email: "operator@alpha.com", role: "Operator", org: "Alpha Corp", icon: "📦" },
  { email: "lead@alpha.com", role: "Reviewer", org: "Alpha Corp", icon: "🔍" },
  { email: "operator@bravo.com", role: "Operator", org: "Bravo Inc", icon: "📦" },
  { email: "evaluator@alpha.com", role: "Evaluator", org: "Alpha Corp", icon: "📊" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (loginEmail?: string) => {
    setError("");
    setLoading(true);
    const useEmail = loginEmail || email;
    const usePassword = loginEmail ? "demo123" : password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: useEmail, password: usePassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/receiving");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-brand-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">DockProof</span>
          </div>
          <p className="text-slate-400 text-sm ml-[52px]">Evidence-First AI Receiving Manager</p>
        </div>

        <div className="relative z-10 space-y-8">
          <blockquote className="text-2xl font-light leading-relaxed text-slate-300 border-l-2 border-brand-500 pl-6">
            AI observes.<br />
            Rules decide.<br />
            Evidence proves.<br />
            <span className="text-brand-400">Uncertainty is a valid result.</span>
          </blockquote>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "8 Required Checks", desc: "Identity to components" },
              { label: "Evidence-First", desc: "Every decision traceable" },
              { label: "Deterministic", desc: "Rules own the verdict" },
              { label: "Fail-Open", desc: "Never blocks the operator" },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          CUBE Buildathon · Round 2 · Track 01: Receiving Manager
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-4 lg:hidden">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">DockProof</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-1">Sign in to access the receiving manager</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-white"
                placeholder="operator@alpha.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-white pr-10"
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign in"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-slate-50 text-slate-400 uppercase tracking-wider">Demo Accounts</span>
            </div>
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handleLogin(account.email)}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm hover:border-brand-300 hover:bg-brand-50/50 transition-all group disabled:opacity-50"
              >
                <span className="text-lg">{account.icon}</span>
                <div className="text-left flex-1">
                  <p className="font-medium text-slate-700 group-hover:text-brand-700">{account.email}</p>
                  <p className="text-xs text-slate-400">{account.role} · {account.org}</p>
                </div>
                <span className="text-xs text-slate-300 group-hover:text-brand-400">→</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-center text-slate-400">
            All demo accounts use password: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">demo123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
