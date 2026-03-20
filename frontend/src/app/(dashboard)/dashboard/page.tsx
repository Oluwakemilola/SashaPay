"use client";
// ─────────────────────────────────────────────
// SachaPay — Dashboard
// File: src/app/(dashboard)/dashboard/page.tsx
// ─────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import { Users, TrendingUp, CalendarCheck, Wallet, ShieldCheck, ArrowRight, Bot, Copy, RefreshCw, Check } from "lucide-react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area
} from "recharts";
import {
  getDashboard, getWorkforceHealth, getStoredUser, getStoredOrg,
  getMyAttendance, getMyPassport, refreshInvite
} from "@/lib/api";

const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";

export default function DashboardPage() {
  const [role, setRole]       = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [dash, setDash]       = useState<any>(null);
  const [health, setHealth]   = useState<any>(null);
  const [myAtt, setMyAtt]     = useState<any[]>([]);
  const [myPass, setMyPass]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const user = getStoredUser();
      setRole(user?.role || "WORKER");
      setUserName(user?.name || "Member");

      if (user?.role === "ADMIN" || user?.role === "MANAGER") {
        const [d, h] = await Promise.all([getDashboard(), getWorkforceHealth()]);
        setDash(d.dashboard);
        setHealth(h.workforceHealth);
      } else {
        const [attRes, passRes] = await Promise.allSettled([
          getMyAttendance(),
          getMyPassport(),
        ]);
        if (attRes.status === "fulfilled") setMyAtt((attRes.value as any).attendance || []);
        if (passRes.status === "fulfilled") setMyPass((passRes.value as any).passport);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (role === "ADMIN" || role === "MANAGER") {
    return <AdminDashboard dash={dash} health={health} loading={loading} error={error} />;
  }
  return <WorkerDashboard att={myAtt} pass={myPass} name={userName} loading={loading} error={error} />;
}

// ─────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────
function AdminDashboard({ dash, health, loading, error }: any) {
  const org                     = getStoredOrg();
  const user                    = getStoredUser();
  const firstName               = (user?.name as string)?.split(" ")[0] || "Admin";
  const [inviteCode, setInviteCode] = useState((org as any)?.inviteCode || "");
  const [copied, setCopied]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await refreshInvite();
      setInviteCode((res as any).inviteCode);
    } catch {}
    setRefreshing(false);
  };

  const attendanceData = [
    { name: "Mon", rate: 0 }, { name: "Tue", rate: 0 }, { name: "Wed", rate: 0 },
    { name: "Thu", rate: 0 }, { name: "Fri", rate: 0 },
  ].map((d, i) => ({
    ...d,
    rate: dash ? Math.min(100, Math.max(60, (dash.attendanceRate || 80) + (i % 3 === 0 ? -5 : i % 2 === 0 ? 3 : 1))) : 0,
  }));

  const deptData = health?.departments?.length > 0
    ? health.departments
    : [{ name: "Unassigned", count: dash?.totalWorkers || 0 }];

  return (
    <div style={{ fontFamily: "Outfit, sans-serif" }}>

      {/* ── Hero banner ── */}
      <div style={{ background: GREEN, borderRadius: 20, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(201,150,42,0.12)" }} />
        <div style={{ position: "absolute", bottom: -40, left: "40%", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, position: "relative" }}>
          <div>
            <p style={{ color: "rgba(248,245,237,0.55)", fontSize: 13, marginBottom: 4 }}>
              {greeting()}, {firstName} 👋
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#F8F5ED", lineHeight: 1.1, marginBottom: 4 }}>
              {(org as any)?.name || "Your Dashboard"}
            </h2>
            <p style={{ color: "rgba(248,245,237,0.45)", fontSize: 13 }}>
              {dash ? `Payroll period: ${dash.currentMonth}` : "Loading..."}
            </p>
          </div>
          <Link href="/payroll" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: GOLD, color: "#fff", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none", fontFamily: "Outfit, sans-serif" }}>
            ▶ Run Payroll
          </Link>
        </div>
      </div>

      {error && !loading && (
        <div style={{ padding: "12px 16px", background: "#FEF2F2", color: "#DC2626", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>⚠ {error}</div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Staff"     value={loading ? "—" : String(dash?.totalWorkers ?? 0)}          sub={`${dash?.activeWorkers ?? 0} active`}   color={GREEN}    icon={Users} />
        <StatCard label="Avg Attendance"  value={loading ? "—" : `${dash?.attendanceRate ?? 0}%`}          sub="Today's rate"                            color="#059669"  icon={CalendarCheck} />
        <StatCard label="Upcoming Payroll" value={loading ? "—" : (dash?.currentPayroll ? `₦${Math.round((dash.currentPayroll.totalAmount || 0) / 100).toLocaleString()}` : "No active run")} sub={dash?.currentPayroll?.status ?? "—"} color={GOLD} icon={Wallet} />
        <StatCard label="Total Disbursed" value={loading ? "—" : `₦${(dash?.totalDisbursedNGN ?? 0).toLocaleString()}`} sub="Lifetime total"             color="#7C3AED"  icon={TrendingUp} />
      </div>

      {/* ── Invite code ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: GREEN }}>Staff Invite Code</h3>
            <p style={{ fontSize: 12, color: "#9AADA6", marginTop: 2 }}>Share with workers to join your organisation</p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: `1px solid ${GREEN}`, borderRadius: 8, background: "transparent", color: GREEN, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
            <RefreshCw style={{ width: 12, height: 12 }} /> {refreshing ? "..." : "Refresh"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, background: "#F0F7F4", borderRadius: 10, padding: "14px 20px", fontFamily: "monospace", fontSize: 28, fontWeight: 800, color: GREEN, textAlign: "center", letterSpacing: 8 }}>
            {inviteCode || "——"}
          </div>
          <button onClick={handleCopy} style={{ width: 48, height: 48, borderRadius: 10, border: `1px solid ${copied ? "#059669" : "#E8EDE8"}`, background: copied ? "#F0FDF4" : "#fff", color: copied ? "#059669" : "#9AADA6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            {copied ? <Check style={{ width: 18, height: 18 }} /> : <Copy style={{ width: 18, height: 18 }} />}
          </button>
        </div>
      </div>

      {/* ── Charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: "20px" }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: GREEN, marginBottom: 16 }}>Attendance Trend</h3>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9AADA6", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9AADA6", fontSize: 11 }} domain={[60, 100]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Line type="monotone" dataKey="rate" stroke={GREEN} strokeWidth={2.5} dot={{ r: 3, fill: GREEN }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: "20px" }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: GREEN, marginBottom: 16 }}>By Department</h3>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9AADA6", fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9AADA6", fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// WORKER DASHBOARD
// ─────────────────────────────────────────────
function WorkerDashboard({ att, pass, name, loading, error }: any) {
  const firstName = (name as string)?.split(" ")[0] || "there";
  const attendanceRate = att?.length > 0
    ? Math.round((att.filter((r: any) => r.status !== "ABSENT").length / att.length) * 100)
    : 0;

  const chartData = [...(att || [])].reverse().slice(-7).map((r: any) => ({
    day:   new Date(r.date).toLocaleDateString("en-NG", { weekday: "short" }),
    hours: r.hoursWorked || 0,
  }));

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  return (
    <div style={{ fontFamily: "Outfit, sans-serif" }}>

      {/* ── Hero ── */}
      <div style={{ background: GREEN, borderRadius: 20, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(201,150,42,0.12)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, position: "relative" }}>
          <div>
            <p style={{ color: "rgba(248,245,237,0.55)", fontSize: 13, marginBottom: 4 }}>{greeting()}, {firstName} 👋</p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#F8F5ED", lineHeight: 1.1, marginBottom: 4 }}>
              Your Financial Wellness
            </h2>
            <p style={{ color: "rgba(248,245,237,0.45)", fontSize: 13 }}>
              {new Date().toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link href="/agent" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "rgba(201,150,42,0.25)", border: "1.5px solid rgba(201,150,42,0.5)", color: GOLD, borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "Outfit, sans-serif" }}>
            <Bot style={{ width: 16, height: 16 }} /> Ask AI Agent
          </Link>
        </div>
      </div>

      {error && !loading && (
        <div style={{ padding: "12px 16px", background: "#FEF2F2", color: "#DC2626", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>⚠ {error}</div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard label="Attendance Rate"   value={loading ? "—" : `${attendanceRate}%`}                      sub="This period"                                           color={GREEN}   icon={CalendarCheck} />
        <StatCard label="Payroll Status"    value={loading ? "—" : (pass ? "Eligible" : "Pending")}           sub={pass ? "Threshold met ✅" : "Keep clocking in"}        color={pass ? "#059669" : GOLD} icon={ShieldCheck} />
        <StatCard label="Verified Income"   value={loading ? "—" : `₦${(pass?.averageMonthlyIncome || 0).toLocaleString()}`} sub="Monthly average"                         color="#7C3AED" icon={Wallet} />
        <StatCard label="Payments"          value={loading ? "—" : String(pass?.payments?.length || 0)}        sub="Verified salary payments"                             color={GOLD}    icon={TrendingUp} />
      </div>

      {/* ── Financial identity card ── */}
      <div style={{ background: GREEN, borderRadius: 16, padding: "24px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <ShieldCheck style={{ position: "absolute", right: -16, bottom: -16, width: 120, height: 120, color: "rgba(255,255,255,0.06)" }} />
        <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#F8F5ED", marginBottom: 8 }}>
          Your Financial Passport
        </h3>
        <p style={{ fontSize: 13, color: "rgba(248,245,237,0.55)", marginBottom: 20, lineHeight: 1.6 }}>
          Every salary payment builds your verified financial identity. Use it with banks, landlords, and lenders.
        </p>
        <Link href="/passport" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: GOLD, color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "Outfit, sans-serif" }}>
          View My Passport <ArrowRight style={{ width: 14, height: 14 }} />
        </Link>
      </div>

      {/* ── Chart ── */}
      {chartData.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: "20px" }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: GREEN, marginBottom: 16 }}>Weekly Hours Logged</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={GREEN} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9AADA6", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9AADA6", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Area type="monotone" dataKey="hours" stroke={GREEN} strokeWidth={2.5} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon: Icon }: any) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon style={{ width: 16, height: 16, color }} />
        </div>
      </div>
      <p style={{ fontSize: 26, fontWeight: 700, color: "#0B3D2E", lineHeight: 1, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 11, color: "#9AADA6" }}>{sub}</p>
    </div>
  );
  }
      
