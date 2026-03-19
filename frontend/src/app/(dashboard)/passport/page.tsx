"use client";
// ─────────────────────────────────────────────
// SachaPay — Financial Passport Page
// File: src/app/(dashboard)/passport/page.tsx
// ─────────────────────────────────────────────
// Fetches GET /api/passport/me and renders the
// worker's verified financial identity card.
// Includes a print-to-PDF download button.
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import { ShieldCheck, Award, Briefcase, ChevronRight, TrendingUp, Download } from "lucide-react";
import {
  Tooltip, ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import { getMyPassport } from "@/lib/api";

type Payment = {
  month: string;
  amountKobo: number;
  organization: { name: string };
  paidAt: string;
};

type Passport = {
  worker: { name: string; email: string; department: string; salary: number };
  totalPaid: number;
  totalPayments: number;
  employmentScore: number;
  incomeScore: number;
  attendanceScore: number;
  payments: Payment[];
};

function scoreLabel(s: number) {
  if (s >= 95) return "Perfect";
  if (s >= 85) return "Excellent";
  if (s >= 75) return "Very Good";
  if (s >= 60) return "Good";
  return "Fair";
}

export default function PassportPage() {
  const [passport, setPassport] = useState<Passport | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    getMyPassport()
      .then((d) => setPassport(d.passport as unknown as Passport))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const incomeData = (passport?.payments ?? []).slice(-6).map((p) => ({
    month: p.month,
    amount: Math.round(p.amountKobo / 100),
  }));

  const worker   = passport?.worker;
  const initials = worker?.name
    ? worker.name.trim().split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        Loading Financial Passport…
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">No Financial Passport Yet</h2>
        <p className="text-muted-foreground leading-relaxed">
          Your financial passport is generated after your first successful salary payment.
          Once your organisation runs and disburses payroll, your passport will appear here.
        </p>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Dashboard</span>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-foreground">Financial Passport</span>
      </div>

      {/* Profile Card */}
      <div id="passport-card" className="bg-card w-full rounded-2xl border shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="flex items-start justify-between relative z-10 flex-wrap gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl font-bold border border-primary/20">
              {initials}
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{worker?.name}</h2>
              <div className="flex items-center gap-3 mt-2 text-muted-foreground text-sm flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {worker?.department || "Staff"}
                </span>
                <span>{worker?.email}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Monthly Salary</p>
              <p className="text-3xl font-bold text-primary mt-1">
                ₦{(worker?.salary ?? 0).toLocaleString()}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Identity
            </span>
            <p className="text-xs text-muted-foreground">
              {passport.totalPayments} payment{passport.totalPayments !== 1 ? "s" : ""} ·{" "}
              ₦{Math.round(passport.totalPaid / 100).toLocaleString()} total earned
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Trust Scores */}
      <h3 className="text-xl font-bold tracking-tight mt-8 mb-4">Worker Trust Scores</h3>
      <div className="grid gap-6 md:grid-cols-3">
        <ScoreCard title="Employment Stability"   score={passport.employmentScore ?? 0} desc={scoreLabel(passport.employmentScore)} icon={Briefcase} />
        <ScoreCard title="Income Consistency"     score={passport.incomeScore ?? 0}     desc={scoreLabel(passport.incomeScore)}     icon={TrendingUp} />
        <ScoreCard title="Attendance Reliability" score={passport.attendanceScore ?? 0} desc={scoreLabel(passport.attendanceScore)} icon={Award} />
      </div>

      {/* Charts + Payment Log */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            Verified Income History{" "}
            <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground font-normal">
              Last {incomeData.length} months
            </span>
          </h3>
          <div className="h-[250px] w-full">
            {incomeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incomeData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} dx={-10} tickFormatter={(v) => `₦${v / 1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(v: number) => [`₦${v.toLocaleString()}`, "Salary"]} />
                  <Area type="step" dataKey="amount" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No payment history yet</div>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Payment Log</h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {passport.payments.length === 0 && (
              <p className="text-muted-foreground text-sm">No payments on record.</p>
            )}
            {passport.payments.slice().reverse().map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{p.month}</p>
                  <p className="text-xs text-muted-foreground">{p.organization?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">₦{Math.round(p.amountKobo / 100).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #passport-card, #passport-card * { visibility: visible; }
          #passport-card { position: fixed; left: 0; top: 0; width: 100%; padding: 40px; }
        }
      `}</style>
    </div>
  );
}

function ScoreCard({ title, score, desc, icon: Icon }: {
  title: string; score: number; desc: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
      <div className="absolute right-0 bottom-0 opacity-5 w-32 h-32 -mr-8 -mb-8 pointer-events-none transition-transform group-hover:scale-110">
        <Icon className="w-full h-full" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-4">{title}</p>
      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-extrabold tracking-tighter text-primary">{score}</span>
        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{desc}</span>
      </div>
      <div className="w-full bg-muted h-2 rounded-full mt-5 overflow-hidden">
        <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}