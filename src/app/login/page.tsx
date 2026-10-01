"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpenCheck, Boxes, ChevronDown, Eye, EyeOff, FlaskConical, ShieldAlert } from "lucide-react";
import { LoadingIcon } from "@/components/ui/loading-icon";

const STATIONS = [
  { index: "01", role: "operator", email: "operator@alpha.com", title: "Intake operator", station: "Bay 04 / Receiving", duty: "Verify arriving units against the purchase order.", target: "/receiving", icon: Boxes },
  { index: "02", role: "reviewer", email: "lead@alpha.com", title: "Lead reviewer", station: "Exception desk", duty: "Adjudicate damage, mismatches, and uncertainty.", target: "/review", icon: ShieldAlert },
  { index: "03", role: "admin", email: "admin@alpha.com", title: "Site administrator", station: "Operations & policy", duty: "Manage manifests, catalogue, and access policy.", target: "/shipments", icon: BookOpenCheck },
  { index: "04", role: "evaluator", email: "evaluator@alpha.com", title: "Quality evaluator", station: "Benchmark lab", duty: "Audit held-out cases and model performance.", target: "/evaluation", icon: FlaskConical },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCustomLogin, setShowCustomLogin] = useState(false);

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
        setError(data.error || "Sign in failed. Check the credentials and try again.");
        setLoadingKey(null);
        return;
      }
      let destination = customTarget;
      if (!destination) {
        const role = data.user?.role;
        destination = role === "reviewer" ? "/review" : role === "evaluator" ? "/evaluation" : role === "admin" ? "/shipments" : "/receiving";
      }
      router.push(destination);
      router.refresh();
    } catch {
      setError("Could not connect to DockProof. Check your connection and try again.");
      setLoadingKey(null);
    }
  };

  return <div className="login-shell">
    <section className="login-story" aria-label="About DockProof">
      <div className="login-brand"><span className="dock-mark" aria-hidden="true"><span /><span /><span /></span><span><strong>DockProof</strong><small>RECEIVING SYSTEM / POD 01</small></span></div>
      <div>
        <div className="login-story-rule" />
        <h1>Condition on arrival.<br /><em>Proof for what follows.</em></h1>
        <p>Inspect inbound freight against the purchase order, make a decision through eight deterministic checks, and seal the evidence at the dock.</p>
      </div>
      <div className="login-story-footer"><span>01 / Observe</span><span>02 / Decide</span><span>03 / Seal</span></div>
    </section>

    <main className="login-panel">
      <div className="login-panel-inner">
        <div className="login-panel-heading"><div><h2>Choose your workspace</h2><p>Launch a demo role to follow the receiving workflow.</p></div><span>RCV / ACCESS</span></div>
        {error && <div role="alert" className="login-error">{error}</div>}
        <div className="station-grid">
          {STATIONS.map((station) => {
            const Icon = station.icon;
            const busy = loadingKey === station.email;
            return <button type="button" className="station-card" key={station.role} disabled={Boolean(loadingKey)} onClick={() => handleLogin(station.email, station.target)}>
              <div className="station-card-top"><span className="station-card-icon"><Icon size={19} strokeWidth={1.8} /></span><span className="station-card-index">{station.index} / 04</span></div>
              <h3>{station.title}</h3><p>{station.station}<br />{station.duty}</p>
              <span className="station-card-bottom"><span>{busy ? "Opening workspace…" : "Enter workspace"}</span>{busy ? <LoadingIcon size="xs" color="indigo" /> : <ArrowRight size={17} />}</span>
            </button>;
          })}
        </div>
        <div className="login-custom">
          <button type="button" className="login-custom-toggle" aria-expanded={showCustomLogin} onClick={() => setShowCustomLogin(!showCustomLogin)}>Use organization credentials <ChevronDown size={14} className={showCustomLogin ? "rotate-180" : ""} /></button>
          {showCustomLogin && <form className="login-custom-form" onSubmit={(event) => { event.preventDefault(); handleLogin(); }}>
            <div><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="name@organization.com" /></div>
            <div><label htmlFor="password">Password</label><div className="relative"><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Password" style={{ paddingRight: 38 }} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} style={{ position: "absolute", right: 8, top: 8, color: "#52675b" }}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
            <button type="submit" disabled={Boolean(loadingKey)}>{loadingKey === email ? "Signing in…" : "Sign in"}</button>
          </form>}
        </div>
      </div>
    </main>
  </div>;
}
