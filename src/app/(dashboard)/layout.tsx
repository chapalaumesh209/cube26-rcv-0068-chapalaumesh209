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
  User,
  Menu,
} from "lucide-react";

interface UserSession {
  userId: string;
  orgId: string;
  role: string;
  email?: string;
  fullName?: string;
}

const NAV_ITEMS = [
  { href: "/receiving", label: "Receiving", icon: Package, badge: null },
  { href: "/shipments", label: "Shipments", icon: ClipboardList, badge: null },
  { href: "/inspections", label: "Inspections", icon: Search, badge: null },
  { href: "/review", label: "Review Queue", icon: AlertTriangle, badge: "review" },
  { href: "/evidence", label: "Evidence", icon: FileText, badge: null },
  { href: "/evaluation", label: "Evaluation", icon: BarChart3, badge: null },
  { href: "/catalog", label: "Catalogue", icon: BookOpen, badge: null },
  { href: "/settings", label: "Settings", icon: Settings, badge: null },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const orgLabel = user?.orgId === "org_demo_alpha" ? "Alpha Corp" : user?.orgId === "org_demo_bravo" ? "Bravo Inc" : user?.orgId || "";
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "";

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-64"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-slate-800 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-sm tracking-tight">DockProof</h1>
              <p className="text-[10px] text-slate-500">AI Receiving Manager</p>
            </div>
          )}
        </div>

        {/* Tenant Badge */}
        {!collapsed && user && (
          <div className="mx-3 mt-3 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <p className="text-xs font-medium text-slate-300">{orgLabel}</p>
            <p className="text-[10px] text-slate-500">{roleLabel}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-white bg-brand-600/20 border-l-2 border-brand-400 ml-0"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-brand-400" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button */}
        <div className="hidden lg:block px-2 pb-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User section */}
        <div className={`px-2 pb-3 border-t border-slate-800 pt-3 ${collapsed ? "flex flex-col items-center" : ""}`}>
          {!collapsed && user && (
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold">
                {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{user.fullName || user.email}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-14 flex items-center px-4 lg:px-6 gap-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-700 capitalize">
              {pathname.split("/").filter(Boolean)[0] || "Receiving"}
            </h2>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-medium border border-brand-100">
                {orgLabel}
              </span>
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
