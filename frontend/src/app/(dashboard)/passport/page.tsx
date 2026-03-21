"use client";
import { useEffect, useState } from "react";
import { ShieldCheck, Award, Briefcase, ChevronRight, TrendingUp, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip, ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import { getMyPassport } from "@/lib/api";

const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";

type Payment = {
  month:        string;
  amount:       number;
  organization: { name: string } | null;
  paidAt:       string;
};

type Passport = {
  worker: { name: string; email: string; department: string; salary: number; };
  totalIncome:              number;
  totalMonthsEmployed:      number;
  averageMonthlyIncome:     number;
  paymentConsistencyScore:  number;
  incomeStabilityScore:     number;
  payments:                 Payment[];
  employmentHistory:        any[];
};

function scoreLabel(s: number) {
  if (s >= 95) return "Perfect";
  if (s >= 85) return "Excellent";
  if (s >= 75) return "Very Good";
  if (s >= 60) return "Good";
  return "Fair";
}

export default function PassportPage() {
  const router = useRouter();
  const [passport, setPassport] = useState<Passport | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    getMyPassport()
      .then((d: any) => setPassport(d.passport))
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, color: "#9AADA6", fontFamily: "Outfit, sans-serif" }}>
      Loading Financial Passport...
    </div>
  );

  if (error || !passport) return (
    <div style={{ maxWidth: 520, margin: "64px auto", textAlign: "center", fontFamily: "Outfit, sans-serif" }}>
      <div style={{ width: 64, height: 64, background: "#F0F7F4", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <ShieldCheck style={{ width: 28, height: 28, color: GREEN }} />
      </div>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: GREEN, marginBottom: 12 }}>No Financial Passport Yet</h2>
      <p style={{ fontSize: 14, color: "#6B7B72", lineHeight: 1.7 }}>
        Your financial passport is generated after your first successful salary payment.
      </p>
      {error && <p style={{ fontSize: 13, color: "#DC2626", marginTop: 12 }}>{error}</p>}
    </div>
  );

  const worker   = passport.worker;
  const initials = worker?.name
    ? worker.name.trim().split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  const totalIncome             = passport.totalIncome             || 0;
  const totalMonthsEmployed     = passport.totalMonthsEmployed     || 0;
  const averageMonthlyIncome    = passport.averageMonthlyIncome    || 0;
  const paymentConsistencyScore = passport.paymentConsistencyScore || 0;
  const incomeStabilityScore    = passport.incomeStabilityScore    || 0;
  const payments                = passport.payments                || [];
  const employmentHistory       = passport.employmentHistory       || [];

  const incomeData = payments.slice(-6).map((p) => ({
    month:  p.month,
    amount: p.amount || 0,
  }));

  return (
    <div style={{ fontFamily: "Outfit, sans-serif", maxWidth: 900, margin: "0 auto" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9AADA6", marginBottom: 20 }}>
        <span>Dashboard</span>
        <ChevronRight style={{ width: 14, height: 14 }} />
        <span style={{ color: GREEN, fontWeight: 600 }}>Financial Passport</span>
      </div>

      {/* Profile Card */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8EDE8", padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "rgba(11,61,46,0.04)", borderRadius: "50%" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 72, height: 72, background: "#F0F7F4", color: GREEN, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, border: "1.5px solid rgba(11,61,46,0.15)", flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: GREEN, marginBottom: 6 }}>{worker?.name}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 13, color: "#6B7B72" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Briefcase style={{ width: 13, height: 13 }} />{worker?.department || "Staff"}
                </span>
                <span>{worker?.email}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Monthly Average</p>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: GREEN, marginBottom: 8 }}>
              ₦{averageMonthlyIncome.toLocaleString()}
            </p>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#F0FDF4", color: "#059669", padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
              <ShieldCheck style={{ width: 12, height: 12 }} /> Verified Identity
            </span>
            <p style={{ fontSize: 12, color: "#9AADA6", marginTop: 8 }}>
              {payments.length} payment{payments.length !== 1 ? "s" : ""} · ₦{totalIncome.toLocaleString()} total earned
            </p>
          </div>
        </div>

        {/* Download button — links to certificate page */}
        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => router.push("/passport/certificate")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: GREEN, color: "#F8F5ED", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
            <Download style={{ width: 14, height: 14 }} /> Download Certificate
          </button>
        </div>
      </div>

      {/* Trust Scores */}
      <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: GREEN, marginBottom: 16 }}>Worker Trust Scores</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        <ScoreCard title="Employment Stability"   score={paymentConsistencyScore} icon={Briefcase} />
        <ScoreCard title="Income Consistency"     score={incomeStabilityScore}    icon={TrendingUp} />
        <ScoreCard title="Attendance Reliability" score={Math.min(100, payments.length * 20)} icon={Award} />
      </div>

      {/* Chart + Payment Log */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: GREEN }}>Verified Income History</h3>
            <span style={{ fontSize: 11, background: "#F8F5ED", color: "#9AADA6", padding: "3px 8px", borderRadius: 6 }}>Last {incomeData.length} months</span>
          </div>
          <div style={{ height: 220 }}>
            {incomeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incomeData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={GREEN} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9AADA6", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9AADA6", fontSize: 11 }} tickFormatter={(v) => `₦${v / 1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} formatter={(v: number) => [`₦${v.toLocaleString()}`, "Salary"]} />
                  <Area type="monotone" dataKey="amount" stroke={GREEN} fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9AADA6", fontSize: 13 }}>No payment history yet</div>
            )}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: 20 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: GREEN, marginBottom: 16 }}>Payment Log</h3>
          <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {payments.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9AADA6" }}>No payments on record.</p>
            ) : (
              [...payments].reverse().map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < payments.length - 1 ? "1px solid #F0EDE6" : "none" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: GREEN }}>{p.month}</p>
                    <p style={{ fontSize: 12, color: "#9AADA6" }}>{p.organization?.name || "Your Organisation"}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: GREEN }}>₦{(p.amount || 0).toLocaleString()}</p>
                    <p style={{ fontSize: 11, color: "#9AADA6" }}>
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Employment History */}
      {employmentHistory.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: 20 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: GREEN, marginBottom: 16 }}>Employment History</h3>
          {employmentHistory.map((e: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < employmentHistory.length - 1 ? "1px solid #F0EDE6" : "none" }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: GREEN }}>{e.orgName}</p>
                <p style={{ fontSize: 12, color: "#9AADA6" }}>{e.industry}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: GREEN }}>₦{(e.avgSalary || 0).toLocaleString()}/mo avg</p>
                <p style={{ fontSize: 11, color: "#9AADA6" }}>
                  {new Date(e.from).toLocaleDateString("en-NG", { month: "short", year: "numeric" })} — {new Date(e.to).toLocaleDateString("en-NG", { month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, score, icon: Icon }: { title: string; score: number; icon: React.ElementType }) {
  const safeScore = Math.min(100, Math.max(0, score || 0));
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: "20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -10, bottom: -10, opacity: 0.04 }}>
        <Icon style={{ width: 80, height: 80 }} />
      </div>
      <p style={{ fontSize: 12, fontWeight: 600, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>{title}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 40, color: GREEN, lineHeight: 1 }}>{safeScore}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", background: "#F0FDF4", padding: "3px 8px", borderRadius: 6 }}>{scoreLabel(safeScore)}</span>
      </div>
      <div style={{ width: "100%", height: 6, background: "#F0EDE6", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", background: GREEN, borderRadius: 99, width: `${safeScore}%` }} />
      </div>
    </div>
  );
}

function scoreLabel(s: number) {
  if (s >= 95) return "Perfect";
  if (s >= 85) return "Excellent";
  if (s >= 75) return "Very Good";
  if (s >= 60) return "Good";
  return "Fair";
    }
                     
