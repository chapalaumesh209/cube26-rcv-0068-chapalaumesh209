"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Package,
  ClipboardList,
  Search,
  AlertTriangle,
  FileText,
  BarChart3,
  BookOpen,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { orgDisplayName } from "@/lib/public-labels";
import { ReceivingSopModal } from "@/components/receiving-sop-modal";

interface UserSession {
  userId: string;
  orgId: string;
  role: "admin" | "operator" | "reviewer" | "evaluator";
  email?: string;
  fullName?: string;
}

const PAGE_TITLES: Record<string, { title: string; hint: string }> = {
  receiving: { title: "Dock receiving", hint: "Condition on arrival" },
  shipments: { title: "Inbound shipments", hint: "Purchase orders at the bay" },
  inspections: { title: "Inspections", hint: "Eight checks per unit" },
  review: { title: "Review queue", hint: "Exceptions and uncertain units" },
  evidence: { title: "Evidence vault", hint: "Sealed receiving records" },
  evaluation: { title: "Receiving quality", hint: "Held-out check accuracy" },
  catalog: { title: "Catalogue", hint: "SKU, variant, and BOM spec" },
  settings: { title: "Settings", hint: "Access and receiving policy" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sopOpen, setSopOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const currentRole = user?.role || "operator";
  const orgLabel = orgDisplayName(user?.orgId);
  const roleLabel = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
  const segment = pathname.split("/").filter(Boolean)[0] || "receiving";
  const pageMeta = PAGE_TITLES[segment] || { title: segment, hint: "" };

  const allNavItems = [
    { href: "/receiving", label: "Receiving", icon: Package, roles: ["operator", "admin"] },
    { href: "/shipments", label: "Shipments", icon: ClipboardList, roles: ["operator", "admin"] },
    { href: "/inspections", label: "Inspections", icon: Search, roles: ["operator", "reviewer", "admin", "evaluator"] },
    { href: "/review", label: "Review queue", icon: AlertTriangle, roles: ["reviewer", "admin"] },
    { href: "/evidence", label: "Evidence", icon: FileText, roles: ["reviewer", "evaluator", "admin"] },
    { href: "/evaluation", label: "Quality", icon: BarChart3, roles: ["evaluator", "admin"] },
    { href: "/catalog", label: "Catalogue", icon: BookOpen, roles: ["admin", "reviewer"] },
    { href: "/settings", label: "Settings", icon: Settings, roles: ["admin"] },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(currentRole));

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-slate-200/90 text-slate-800 flex flex-col transition-all duration-300 shadow-[1px_0_4px_rgba(0,0,0,0.02)] ${
          collapsed ? "w-[68px]" : "w-64"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-slate-100 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 text-white shadow-sm shadow-indigo-600/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-sm tracking-tight text-slate-900">DockProof</h1>
              <p className="text-[10px] text-slate-500 font-medium">Receiving Manager</p>
            </div>
          )}
        </div>

        {!collapsed && user && (
          <div className="mx-3 mt-3 p-3 bg-slate-50/90 rounded-xl border border-slate-200/80">
            <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">Facility / Site</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{orgLabel}</p>
            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentRole === "admin"
                    ? "bg-indigo-500"
                    : currentRole === "reviewer"
                    ? "bg-amber-500"
                    : currentRole === "evaluator"
                    ? "bg-purple-500"
                    : "bg-emerald-500"
                }`}
              />
              <span className="text-xs font-semibold text-slate-700">{roleLabel}</span>
            </div>
          </div>
        )}

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? "text-indigo-700 bg-indigo-50/90 border-l-2 border-indigo-600 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                } ${collapsed ? "justify-center" : "gap-3"}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block px-2 pb-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>

        <div className={`px-2 pb-3 border-t border-slate-100 pt-3 bg-slate-50/40 ${collapsed ? "flex flex-col items-center" : ""}`}>
          {!collapsed && user && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
                {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.fullName || user.email}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 lg:px-6 gap-4 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">{pageMeta.title}</h2>
              {pageMeta.hint && <p className="text-[11px] text-slate-500">{pageMeta.hint}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSopOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-200 bg-brand-50/80 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-all shadow-sm"
              title="View Standard Operating Procedure & Receiving Guidelines"
            >
              <BookOpen className="w-3.5 h-3.5 text-brand-600" />
              <span className="hidden sm:inline">Receiving SOP & Guide</span>
              <span className="sm:hidden">SOP</span>
            </button>

            {user && (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-slate-800">{orgLabel}</p>
                  <p className="text-[10px] text-slate-500">{roleLabel}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-brand-100">
                  {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 animate-fade-in">{children}</main>
        <ReceivingSopModal open={sopOpen} onOpenChange={setSopOpen} />
      </div>
    </div>
  );
}
