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
  UserCheck,
  Menu,
  ChevronDown,
  Lock,
  Sparkles,
} from "lucide-react";

interface UserSession {
  userId: string;
  orgId: string;
  role: "admin" | "operator" | "reviewer" | "evaluator";
  email?: string;
  fullName?: string;
}

const DEMO_USERS = [
  { email: "operator@alpha.com", role: "operator", name: "Operator Alpha", org: "org_demo_alpha", label: "Alpha Corp" },
  { email: "lead@alpha.com", role: "reviewer", name: "Lead Reviewer", org: "org_demo_alpha", label: "Alpha Corp" },
  { email: "admin@alpha.com", role: "admin", name: "Admin Alpha", org: "org_demo_alpha", label: "Alpha Corp" },
  { email: "evaluator@alpha.com", role: "evaluator", name: "Evaluator", org: "org_demo_alpha", label: "Alpha Corp" },
  { email: "operator@bravo.com", role: "operator", name: "Operator Bravo", org: "org_demo_bravo", label: "Bravo Inc" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  const fetchCurrentUser = () => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleQuickSwitch = async (email: string) => {
    setSwitchingRole(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "demo123" }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoleSwitcherOpen(false);
        fetchCurrentUser();
        const role = data.user?.role;
        if (role === "reviewer") router.push("/review");
        else if (role === "evaluator") router.push("/evaluation");
        else if (role === "admin") router.push("/shipments");
        else router.push("/receiving");
        router.refresh();
      }
    } finally {
      setSwitchingRole(false);
    }
  };

  const currentRole = user?.role || "operator";
  const orgLabel = user?.orgId === "org_demo_alpha" ? "Alpha Corp" : user?.orgId === "org_demo_bravo" ? "Bravo Inc" : user?.orgId || "";
  const roleLabel = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);

  // Role-customized navigation structure - minimal text, role-specific
  const allNavItems = [
    {
      href: "/receiving",
      label: "Receiving",
      icon: Package,
      badge: currentRole === "operator" ? "Active" : null,
      roles: ["operator", "admin"],
    },
    {
      href: "/shipments",
      label: "Shipments",
      icon: ClipboardList,
      badge: null,
      roles: ["operator", "admin"],
    },
    {
      href: "/inspections",
      label: "Inspections",
      icon: Search,
      badge: null,
      roles: ["operator", "reviewer", "admin", "evaluator"],
    },
    {
      href: "/review",
      label: "Review Queue",
      icon: AlertTriangle,
      badge: currentRole === "reviewer" ? "Triage" : null,
      roles: ["reviewer", "admin"],
    },
    {
      href: "/evidence",
      label: "Evidence Vault",
      icon: FileText,
      badge: null,
      roles: ["reviewer", "evaluator", "admin"],
    },
    {
      href: "/evaluation",
      label: "Evaluation Suite",
      icon: BarChart3,
      badge: currentRole === "evaluator" ? "50 Units" : null,
      roles: ["evaluator", "admin"],
    },
    {
      href: "/catalog",
      label: "Catalogue",
      icon: BookOpen,
      badge: null,
      roles: ["admin", "reviewer"],
    },
    {
      href: "/settings",
      label: "Settings & VLM",
      icon: Settings,
      badge: currentRole === "admin" ? "Admin" : null,
      roles: ["admin"],
    },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(currentRole));

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
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white">DockProof</h1>
              <p className="text-[10px] text-slate-400">AI Receiving Manager</p>
            </div>
          )}
        </div>

        {/* Tenant & Active Role Card */}
        {!collapsed && user && (
          <div className="mx-3 mt-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 shadow-inner">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Active Tenant</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-brand-900/60 text-brand-300 border border-brand-700/50">
                {user.orgId}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-200">{orgLabel}</p>
            <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  currentRole === "admin" ? "bg-indigo-400" :
                  currentRole === "reviewer" ? "bg-amber-400" :
                  currentRole === "evaluator" ? "bg-purple-400" : "bg-emerald-400"
                }`} />
                <span className="text-xs font-medium text-slate-300">{roleLabel}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {currentRole === "admin" ? "Full Access" :
                 currentRole === "reviewer" ? "Lead Triage" :
                 currentRole === "evaluator" ? "Benchmark" : "Dock Ops"}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const isRestrictedForUser = item.href === "/settings" && currentRole !== "admin";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "text-white bg-brand-600/20 border-l-2 border-brand-400 ml-0"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-brand-400" : "group-hover:text-slate-200"}`} />
                  {!collapsed && (
                    <span className="leading-tight font-medium text-xs">
                      {item.label}
                    </span>
                  )}
                </div>

                {!collapsed && item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium bg-brand-900/60 text-brand-300 border-brand-700/50">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:block px-2 pb-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>

        {/* User profile & Sign out */}
        <div className={`px-2 pb-3 border-t border-slate-800 pt-3 ${collapsed ? "flex flex-col items-center" : ""}`}>
          {!collapsed && user && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.fullName || user.email}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Interactive Quick-Role-Switcher */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 lg:px-6 gap-4 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            <div>
              <h2 className="text-base font-bold text-slate-900 capitalize leading-tight">
                {pathname.split("/").filter(Boolean)[0] || "Receiving"}
              </h2>
            </div>
          </div>

          {/* Interactive Role Switcher & Tenant Badge */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition-colors shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                <span className="font-semibold text-slate-900">{roleLabel}</span>
                <span className="text-[10px] text-slate-400 font-mono">({orgLabel})</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${roleSwitcherOpen ? "rotate-180" : ""}`} />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-slide-in">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">Switch Role</p>
                  </div>
                  <div className="space-y-1 py-1">
                    {DEMO_USERS.map((demo) => {
                      const isCurrent = user?.email === demo.email;
                      return (
                        <button
                          key={demo.email}
                          onClick={() => handleQuickSwitch(demo.email)}
                          disabled={switchingRole}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            isCurrent
                              ? "bg-brand-50 border border-brand-200 text-brand-900 font-semibold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{demo.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono uppercase">
                                {demo.role}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">{demo.label}</span>
                          </div>
                          {isCurrent && <span className="text-xs text-brand-600 font-bold">Active</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar */}
            {user && (
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-brand-100">
                {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
