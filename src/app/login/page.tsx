"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  Package,
  ClipboardCheck,
  Scale,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { ReceivingSopModal } from "@/components/receiving-sop-modal";

const WORKSPACES = [
  {
    email: "operator@alpha.com",
    title: "Dock operator",
    desc: "Photograph inbound freight and record condition on arrival.",
    target: "/receiving",
  },
  {
    email: "lead@alpha.com",
    title: "Lead reviewer",
    desc: "Adjudicate exceptions and uncertain units before put-away.",
    target: "/review",
  },
  {
    email: "admin@alpha.com",
    title: "Site administrator",
    desc: "Manifests, catalogue, access, and receiving policy.",
    target: "/shipments",
  },
  {
    email: "evaluator@alpha.com",
    title: "Quality lead",
    desc: "Held-out receiving accuracy against the eight checks.",
    target: "/evaluation",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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
        setError(data.error || "Sign-in failed");
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
      setError("Network error. Try again.");
      setLoadingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between p-12 border-r border-slate-800 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-brand-900/40 via-slate-950 to-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold tracking-tight">DockProof</p>
            <p className="text-xs text-slate-400">Receiving Manager</p>
          </div>
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Prove what arrived before it enters the building.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            A pallet is photographed at the bay. DockProof records identity, count, carton
            structure, variant, damage, and missing components against the purchase order.
            Prep and claims inherit that record — not a signed clean bill of lading with no proof.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              { icon: Package, text: "Match SKU, colour, and pack spec to the PO line" },
              { icon: ClipboardCheck, text: "Count cartons and units; flag shortage or overage" },
              { icon: AlertTriangle, text: "Catch crush, water, tears, and empty accessory cavities" },
              { icon: Scale, text: "Rules own PASS / EXCEPTION / UNCERTAIN — never a guess" },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-slate-300">
                <item.icon className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={() => setSopOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/40 rounded-xl text-xs font-semibold transition-colors"
          >
            <BookOpen className="w-4 h-4 text-brand-400" />
            <span>Explore Receiving Manager SOP & Specification</span>
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            Evidence is sealed per receipt. Overrides preserve original visual facts.
          </p>
        </div>
      </section>

      <section className="flex flex-col justify-center p-6 sm:p-12">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold">DockProof</p>
            <p className="text-[11px] text-slate-400">Receiving Manager</p>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Sign in</h2>
            <p className="text-sm text-slate-400 mt-1">
              Open the workspace that matches your job on the dock.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-2">
            {WORKSPACES.map((ws) => {
              const loading = loadingKey === ws.email;
              return (
                <button
                  key={ws.title}
                  onClick={() => handleLogin(ws.email, ws.target)}
                  disabled={Boolean(loadingKey)}
                  className="w-full text-left p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{ws.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ws.desc}</p>
                    </div>
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand-400 shrink-0" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-3 pt-2 border-t border-slate-800"
          >
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Organization credentials
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Work email"
              className="w-full px-3 py-2.5 text-sm bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2.5 pr-10 text-sm bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={Boolean(loadingKey) || !email || !password}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loadingKey === email ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
            </button>
          </form>
        </div>
      </section>
      <ReceivingSopModal open={sopOpen} onOpenChange={setSopOpen} />
    </div>
  );
}
