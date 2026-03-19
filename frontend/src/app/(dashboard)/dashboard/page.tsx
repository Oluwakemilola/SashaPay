"use client";
// ─────────────────────────────────────────────
// SachaPay — Dashboard Overview
// File: src/app/(dashboard)/dashboard/page.tsx
// ─────────────────────────────────────────────
// Role-aware dashboard that shows different metrics
// for Admins vs Workers.
// ─────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import { Users, TrendingUp, CalendarCheck, Wallet, ShieldCheck, ArrowRight, Bot } from "lucide-react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  AreaChart, Area
} from "recharts";
import { getDashboard, getWorkforceHealth, getStoredUser, getMyAttendance, getMyPassport } from "@/lib/api";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  // Admin States
  const [dash, setDash] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);

  // Worker States
  const [myAtt, setMyAtt] = useState<any[]>([]);
  const [myPass, setMyPass] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        // Workers: Fetch attendance and passport (handle passport 404 gracefully)
        const [attRes, passRes] = await Promise.allSettled([
          getMyAttendance(),
          getMyPassport()
        ]);

        if (attRes.status === "fulfilled") {
          setMyAtt(attRes.value.attendance || []);
        }

        if (passRes.status === "fulfilled") {
          setMyPass(passRes.value.passport);
        } else {
          // If passport is not found, it's just a new worker
          setMyPass(null);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (role === "ADMIN" || role === "MANAGER") {
    return <AdminDashboard dash={dash} health={health} loading={loading} error={error} />;
  }

  return <WorkerDashboard att={myAtt} pass={myPass} name={userName} loading={loading} error={error} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKER DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function WorkerDashboard({ att, pass, name, loading, error }: any) {
  const latestAtt = att?.[0] || null;
  const attendanceRate = att?.length > 0
    ? Math.round((att.filter((r: any) => r.status !== "ABSENT").length / att.length) * 100)
    : 0;

  const chartData = [...att].reverse().slice(-7).map((r: any) => ({
    day: new Date(r.date).toLocaleDateString("en-NG", { weekday: "short" }),
    hours: r.hoursWorked || 0
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Wellness</h2>
          <p className="text-muted-foreground">Welcome back, {name.split(" ")[0]}! Here is your status.</p>
        </div>
        <Link href="/agent" className="bg-[#C9962A] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
          <Bot className="w-4 h-4" /> Ask AI Agent
        </Link>
      </div>

      {error && !loading && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4 text-sm animate-pulse">
          ⚠ {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard
          title="Attendance Rate"
          value={loading ? "—" : `${attendanceRate}%`}
          icon={CalendarCheck}
          trend={latestAtt ? `Last check-in: ${new Date(latestAtt.date).toLocaleDateString()}` : "No records yet"}
        />
        <SummaryCard
          title="Payroll Eligibility"
          value={loading ? "—" : (pass?.isEligible ? "ELIGIBLE" : "PENDING")}
          icon={ShieldCheck}
          trend={pass?.isEligible ? "Threshold met ✅" : "Keep clocking in!"}
          highlight={pass?.isEligible ? "text-emerald-500" : "text-amber-500"}
        />
        <SummaryCard
          title="Verified Salary"
          value={loading ? "—" : `₦${(pass?.salaryNGN || 0).toLocaleString()}`}
          icon={Wallet}
          trend="Monthly base pay"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Progress */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0B3D2E]" />
            Weekly Hours Logged
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B3D2E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0B3D2E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="hours" stroke="#0B3D2E" fillOpacity={1} fill="url(#colorHours)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-[#0B3D2E] text-white rounded-2xl p-6 shadow-lg shadow-[#0B3D2E]/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Financial Identity</h3>
              <p className="text-emerald-100/60 text-sm leading-relaxed mb-6">
                Every clock-in builds your SachaPay score. High activity unlocks lower interest rates and higher loan limits.
              </p>
              <Link href="/passport" className="inline-flex items-center gap-2 bg-[#C9962A] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gold-600 transition-colors">
                View Identity <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ShieldCheck className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10" />
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-[#0B3D2E] lowercase tracking-wider text-[10px] uppercase font-bold">Verification Status</h3>
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <span className="text-sm text-muted-foreground">Verification Streak</span>
              <span className="font-bold text-lg text-emerald-600">5 Days 🔥</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trust Tier</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">PLATINUM MEMBER</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function AdminDashboard({ dash, health, loading, error }: any) {
  const attendanceData = [
    { name: "Mon", rate: 70 }, { name: "Tue", rate: 85 }, { name: "Wed", rate: 90 },
    { name: "Thu", rate: 88 }, { name: "Fri", rate: 92 },
  ].map(d => ({ ...d, rate: dash ? Math.max(60, dash.attendanceRate + (d.rate % 5)) : 0 }));

  const deptData = health?.departments || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#0B3D2E]">Enterprise Overview</h2>
          <p className="text-muted-foreground">{dash ? `Current payroll period: ${dash.currentMonth}` : "Loading insights…"}</p>
        </div>
      </div>

      {error && !loading && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4 text-sm">
          ⚠ {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Staff" value={loading ? "—" : String(dash?.totalWorkers ?? 0)} icon={Users} trend={`${dash?.activeWorkers ?? 0} active`} />
        <SummaryCard title="Avg Attendance" value={loading ? "—" : `${dash?.attendanceRate ?? 0}%`} icon={CalendarCheck} trend="Today's rate" />
        <SummaryCard title="Upcoming Payroll" value={loading ? "—" : (dash?.currentPayroll ? `₦${(dash.currentPayroll.totalAmount / 100).toLocaleString()}` : "No active run")} icon={Wallet} trend={dash?.currentPayroll?.status ?? "—"} />
        <SummaryCard title="Total Disbursed" value={loading ? "—" : `₦${(dash?.totalDisbursedNGN ?? 0).toLocaleString()}`} icon={TrendingUp} trend="Lifetime total" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-lg">Organisation Attendance</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} domain={[60, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#0B3D2E" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-lg">Staff by Department</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#C9962A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SummaryCard({ title, value, icon: Icon, trend, highlight }: any) {
  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-[#C9962A]/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</h3>
        <div className="p-2 bg-emerald-50 rounded-xl text-[#0B3D2E] group-hover:bg-[#0B3D2E] group-hover:text-white transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className={`text-3xl font-bold tracking-tight ${highlight || "text-[#0B3D2E]"}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground mt-1 opacity-70 italic">{trend}</p>
      </div>
    </div>
  );
}
