"use client";
// ─────────────────────────────────────────────
// SachaPay — Sidebar Navigation
// File: src/components/layout/Sidebar.tsx
// ─────────────────────────────────────────────
// Highlights the active route. Includes the AI
// Agent link that was previously missing.
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStoredUser } from "@/lib/api";
import Logo from "@/components/brand/Logo";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Wallet,
  ShieldCheck,
  Bot,
} from "lucide-react";

const links = [
  { name: "Dashboard",          href: "/dashboard",  icon: LayoutDashboard },
  { name: "Staff",              href: "/staff",       icon: Users },
  { name: "Attendance",         href: "/attendance",  icon: CalendarCheck },
  { name: "Payroll",            href: "/payroll",     icon: Wallet },
  { name: "Bank Accounts",      href: "/bank",        icon: CreditCard },
  { name: "Financial Passport", href: "/passport",    icon: ShieldCheck },
  { name: "AI Agent",           href: "/agent",       icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    setRole(user?.role || "WORKER");
  }, []);

  const isAdmin = role === "ADMIN" || role === "MANAGER";

  // Filter links based on role
  const visibleLinks = links.filter((link) => {
    if (link.name === "Staff" || link.name === "Payroll") return isAdmin;
    return true;
  });

  // Add worker-specific payroll link if needed
  if (!isAdmin && !visibleLinks.find(l => l.name === "Pay Slips")) {
      visibleLinks.splice(3, 0, { name: "Pay Slips", href: "/payroll", icon: Wallet });
  }

  return (
    <aside className="w-64 bg-[#0B3D2E] text-white flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-[#0B3D2E]">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo size={28} variant="inverted" />
        </Link>
        <p className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase mt-2 opacity-80">
          SachaPay {isAdmin ? "Enterprise" : "Worker"}
        </p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#C9962A] text-white shadow-lg shadow-black/20"
                  : "text-emerald-100/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Profile/Help Section */}
      <div className="p-6 mt-auto">
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-emerald-400">Secured Platform</p>
          <p className="text-[11px] text-emerald-100/40 mt-1 leading-relaxed">
            Bank-grade encryption active. Your financial passport is protected.
          </p>
          <div className="mt-4 flex flex-col gap-2">
             <Link href="/dashboard" className="text-[11px] text-white hover:underline">
               Privacy Policy
             </Link>
             <button className="text-[11px] text-left text-white/50">
               Support ID: SP-2026
             </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
