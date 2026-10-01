"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity, ArrowUpRight, BookOpen, Boxes, ChevronLeft, ClipboardCheck,
  ClipboardList, FileCheck2, FlaskConical, LogOut, Menu, PackageCheck,
  Settings2, ShieldAlert, X,
} from "lucide-react";
import { orgDisplayName } from "@/lib/public-labels";

interface UserSession {
  userId: string;
  orgId: string;
  role: "admin" | "operator" | "reviewer" | "evaluator";
  email?: string;
  fullName?: string;
}

const PAGE_TITLES: Record<string, { title: string; hint: string; code: string }> = {
  receiving: { title: "Receiving", hint: "Live intake and arrival verification", code: "RCV / 01" },
  shipments: { title: "Shipments", hint: "Purchase orders and inbound manifests", code: "RCV / 02" },
  inspections: { title: "Inspections", hint: "Eight checks. One accountable decision.", code: "RCV / 03" },
  review: { title: "Review queue", hint: "Resolve exceptions with an audit reason", code: "RCV / 04" },
  evidence: { title: "Evidence vault", hint: "Sealed records and decision provenance", code: "RCV / 05" },
  evaluation: { title: "Quality lab", hint: "Held-out cases and model performance", code: "RCV / 06" },
  catalog: { title: "Catalogue", hint: "SKU specifications and bill of materials", code: "RCV / 07" },
  settings: { title: "Settings", hint: "Access, policy, and observation engine", code: "RCV / 08" },
};

const NAV = [
  { href: "/receiving", label: "Receiving", icon: PackageCheck, group: "Operations", roles: ["operator", "admin"] },
  { href: "/shipments", label: "Shipments", icon: Boxes, group: "Operations", roles: ["operator", "admin"] },
  { href: "/inspections", label: "Inspections", icon: ClipboardCheck, group: "Operations", roles: ["operator", "reviewer", "admin", "evaluator"] },
  { href: "/review", label: "Review queue", icon: ShieldAlert, group: "Operations", roles: ["reviewer", "admin"] },
  { href: "/evidence", label: "Evidence vault", icon: FileCheck2, group: "Records", roles: ["reviewer", "evaluator", "admin"] },
  { href: "/evaluation", label: "Quality lab", icon: FlaskConical, group: "Records", roles: ["evaluator", "admin"] },
  { href: "/catalog", label: "Catalogue", icon: BookOpen, group: "Records", roles: ["admin", "reviewer"] },
  { href: "/settings", label: "Settings", icon: Settings2, group: "System", roles: ["admin"] },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const role = user?.role || "operator";
  const org = orgDisplayName(user?.orgId);
  const segment = pathname.split("/").filter(Boolean)[0] || "receiving";
  const page = PAGE_TITLES[segment] || PAGE_TITLES.receiving;
  const roleLabel = role === "admin" ? "Site administrator" : role === "reviewer" ? "Lead reviewer" : role === "evaluator" ? "Quality evaluator" : "Intake operator";
  const items = NAV.filter((item) => (item.roles as readonly string[]).includes(role));

  return (
    <div className="dock-shell" data-surface={segment}>
      <aside className={`dock-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileMenuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
        <div className="dock-brand">
          <Link href="/receiving" className="dock-brand-link" aria-label="DockProof home">
            <span className="dock-mark" aria-hidden="true"><span /><span /><span /></span>
            {!collapsed && <span className="dock-brand-type"><strong>DockProof</strong><small>RECEIVING SYSTEM</small></span>}
          </Link>
          <button type="button" className="dock-mobile-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation"><X size={19} /></button>
        </div>

        {!collapsed && <div className="dock-station"><span className="dock-station-led" /> <span>Bay 04</span><span className="dock-station-divider" /> <strong>Intake active</strong></div>}

        <nav className="dock-navigation">
          {["Operations", "Records", "System"].map((group) => {
            const groupItems = items.filter((item) => item.group === group);
            if (groupItems.length === 0) return null;
            return <div className="dock-nav-group" key={group}>
              {!collapsed && <div className="dock-nav-heading">{group}</div>}
              {groupItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return <Link key={item.href} href={item.href} className={`dock-nav-link ${active ? "active" : ""}`} aria-current={active ? "page" : undefined} title={collapsed ? item.label : undefined}>
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && active && <ArrowUpRight size={14} className="dock-nav-arrow" aria-hidden="true" />}
                </Link>;
              })}
            </div>;
          })}
        </nav>

        <div className="dock-sidebar-footer">
          {!collapsed && <div className="dock-system-status"><Activity size={15} aria-hidden="true" /><span>Deterministic rules active</span></div>}
          <button type="button" className="dock-collapse" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}><ChevronLeft size={17} className={collapsed ? "rotate-180" : ""} />{!collapsed && <span>Collapse</span>}</button>
        </div>
      </aside>

      {mobileMenuOpen && <button className="dock-scrim" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation" />}

      <div className="dock-workspace">
        <header className="dock-topbar">
          <div className="dock-topbar-left">
            <button type="button" className="dock-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
            <div className="dock-page-meta"><span>{page.code}</span><span className="dock-meta-separator" /><span>DockProof / {page.title}</span></div>
          </div>
          <div className="dock-topbar-right">
            <span className="dock-topbar-org">{org}</span>
            <span className="dock-role-pill">{roleLabel}</span>
            <div className="dock-avatar" title={user?.fullName || user?.email || roleLabel}>{(user?.fullName || user?.email || roleLabel).charAt(0).toUpperCase()}</div>
            <button type="button" onClick={signOut} className="dock-signout" aria-label="Sign out" title="Sign out"><LogOut size={17} /></button>
          </div>
        </header>
        <main className="dock-main" id="main-content">{children}</main>
        <footer className="dock-footer"><span><ClipboardList size={13} /> DockProof / RCV-01</span><span>Observed once. Decided by rule. Sealed for review.</span></footer>
      </div>
    </div>
  );
}
