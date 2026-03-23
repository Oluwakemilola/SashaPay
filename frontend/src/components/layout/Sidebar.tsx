"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, logout } from "@/lib/api";
import Logo from "@/components/brand/Logo";
import {
  LayoutDashboard, Users, CalendarCheck, Wallet,
  ShieldCheck, CreditCard, Bot, Receipt, LogOut, Settings, X,
} from "lucide-react";

const adminLinks = [
  { name: "Dashboard",    href: "/dashboard",   icon: LayoutDashboard },
  { name: "Staff",        href: "/staff",        icon: Users },
  { name: "Attendance",   href: "/attendance",   icon: CalendarCheck },
  { name: "Payroll",      href: "/payroll",      icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "AI Agent",     href: "/agent",        icon: Bot },
  { name: "Settings",     href: "/settings",     icon: Settings },
];

const workerLinks = [
  { name: "Dashboard",          href: "/dashboard", icon: LayoutDashboard },
  { name: "Attendance",         href: "/attendance", icon: CalendarCheck },
  { name: "Financial Passport", href: "/passport",  icon: ShieldCheck },
  { name: "Pay Slips",          href: "/payroll",   icon: Wallet },
  { name: "Bank Accounts",      href: "/bank",      icon: CreditCard },
  { name: "AI Agent",           href: "/agent",     icon: Bot },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
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

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside style={{
      width: 240, background: "#0B3D2E", color: "#fff",
      display: "flex", flexDirection: "column",
      height: "100vh", overflowY: "auto",
    }}>

      {/* Logo + close button */}
      <div style={{ padding: "20px 16px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <Link href="/dashboard" onClick={handleLinkClick} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <Logo size={26} variant="inverted" />
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 4, display: "flex" }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        )}
      </div>

      <p style={{ fontSize: 10, color: "#4ADE80", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", padding: "0 20px 14px", opacity: 0.8, flexShrink: 0 }}>
        {orgName || (isAdmin ? "SachaPay Enterprise" : "SachaPay Worker")}
      </p>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {visibleLinks.map((link) => {
          const Icon     = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link key={link.name} href={link.href} onClick={handleLinkClick}
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

      {/* Bottom */}
      <div style={{ padding: "12px 12px 20px", flexShrink: 0 }}>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#4ADE80", letterSpacing: "0.5px" }}>Secured Platform</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, lineHeight: 1.5 }}>Bank-grade encryption active.</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>Support ID: SP-2026</p>
        </div>
        <button onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
          <LogOut style={{ width: 14, height: 14 }} /> Sign out
        </button>
      </div>
    </aside>
  );
}
