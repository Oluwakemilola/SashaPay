"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, logout } from "@/lib/api";
import Logo from "@/components/brand/Logo";
import {
  LayoutDashboard, Users, CalendarCheck, Wallet,
  ShieldCheck, CreditCard, Bot, Receipt, LogOut, Settings,
} from "lucide-react";

const adminLinks = [
  { name: "Dashboard",    href: "/dashboard",     icon: LayoutDashboard },
  { name: "Staff",        href: "/staff",          icon: Users },
  { name: "Attendance",   href: "/attendance",     icon: CalendarCheck },
  { name: "Payroll",      href: "/payroll",        icon: Wallet },
  { name: "Transactions", href: "/transactions",   icon: Receipt },
  { name: "AI Agent",     href: "/agent",          icon: Bot },
  { name: "Settings",     href: "/settings",       icon: Settings },
];

const workerLinks = [
  { name: "Dashboard",          href: "/dashboard", icon: LayoutDashboard },
  { name: "Attendance",         href: "/attendance", icon: CalendarCheck },
  { name: "Financial Passport", href: "/passport",  icon: ShieldCheck },
  { name: "Pay Slips",          href: "/payroll",   icon: Wallet },
  { name: "Bank Accounts",      href: "/bank",      icon: CreditCard },
  { name: "AI Agent",           href: "/agent",     icon: Bot },
];

export function Sidebar() {
  const pathname              = usePathname();
  const router                = useRouter();
  const [role, setRole]       = useState<string | null>(null);
  const [orgName, setOrgName] = useState("SachaPay");

  useEffect(() => {
    const user = getStoredUser();
    const org  = JSON.parse(localStorage.getItem("organization") || "{}");
    setRole(user?.role || "WORKER");
    setOrgName(org?.name || "SachaPay");
  }, []);

  const isAdmin      = role === "ADMIN" || role === "MANAGER";
  const visibleLinks = isAdmin ? adminLinks : workerLinks;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside style={{ width: 240, background: "#0B3D2E", color: "#fff", display: "flex", flexDirection: "column", height: "100vh", position: "fixed", left: 0, top: 0, zIndex: 40 }}>

      <div style={{ padding: "24px 20px 16px" }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Logo size={26} variant="inverted" />
        </Link>
        <p style={{ fontSize: 10, color: "#4ADE80", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginTop: 6, opacity: 0.8 }}>
          {isAdmin ? orgName : "SachaPay Worker"}
        </p>
      </div>

      <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {visibleLinks.map((link) => {
          const Icon     = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link key={link.name} href={link.href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 12,
                fontSize: 13, fontWeight: isActive ? 700 : 500,
                textDecoration: "none",
                background: isActive ? "#C9962A" : "transparent",
                color:      isActive ? "#fff" : "rgba(255,255,255,0.55)",
                transition: "all 0.15s",
                fontFamily: "Outfit, sans-serif",
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}}
            >
              <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "12px 12px 20px" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#4ADE80", letterSpacing: "0.5px" }}>Secured Platform</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, lineHeight: 1.5 }}>
            Bank-grade encryption active. Your financial passport is protected.
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 8 }}>Support ID: SP-2026</p>
        </div>
        <button onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
          <LogOut style={{ width: 14, height: 14 }} /> Sign out
        </button>
      </div>
    </aside>
  );
}
