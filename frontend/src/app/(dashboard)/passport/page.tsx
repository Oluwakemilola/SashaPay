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
  month: string;
  amount: number;
  organization: { name: string } | null;
  paidAt: string;
};

type Passport = {
  worker: {
    name: string;
    email: string;
    department: string;
    salary: number;
  };
  totalIncome: number;
  totalMonthsEmployed: number;
  averageMonthlyIncome: number;
  paymentConsistencyScore: number;
  incomeStabilityScore: number;
  payments: Payment[];
  employmentHistory: any[];
};

// ✅ Keep ONLY ONE
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyPassport()
      .then((d: { passport: Passport }) => setPassport(d.passport))
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, color: "#9AADA6", fontFamily: "Outfit, sans-serif" }}>
        Loading Financial Passport...
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div style={{ maxWidth: 520, margin: "64px auto", textAlign: "center", fontFamily: "Outfit, sans-serif" }}>
        <div style={{ width: 64, height: 64, background: "#F0F7F4", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <ShieldCheck style={{ width: 28, height: 28, color: GREEN }} />
        </div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: GREEN, marginBottom: 12 }}>
          No Financial Passport Yet
        </h2>
        <p style={{ fontSize: 14, color: "#6B7B72", lineHeight: 1.7 }}>
          Your financial passport is generated after your first successful salary payment.
        </p>
        {error && <p style={{ fontSize: 13, color: "#DC2626", marginTop: 12 }}>{error}</p>}
      </div>
    );
  }

  const worker = passport?.worker;

  const initials = worker?.name
    ? worker.name.trim().split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  const totalIncome = passport.totalIncome || 0;
  const averageMonthlyIncome = passport.averageMonthlyIncome || 0;
  const paymentConsistencyScore = passport.paymentConsistencyScore || 0;
  const incomeStabilityScore = passport.incomeStabilityScore || 0;
  const payments = passport.payments || [];
  const employmentHistory = passport.employmentHistory || [];

  const incomeData = payments.slice(-6).map((p) => ({
    month: p.month,
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
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8EDE8", padding: "28px 32px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ width: 72, height: 72, background: "#F0F7F4", color: GREEN, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700 }}>
              {initials}
            </div>
            <div>
              <h2 style={{ fontSize: 26, color: GREEN }}>{worker?.name}</h2>
              <p style={{ fontSize: 13, color: "#6B7B72" }}>
                {worker?.department} · {worker?.email}
              </p>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "#9AADA6" }}>Monthly Average</p>
            <p style={{ fontSize: 30, color: GREEN }}>
              ₦{averageMonthlyIncome.toLocaleString()}
            </p>
            <p style={{ fontSize: 12, color: "#9AADA6" }}>
              {payments.length} payments · ₦{totalIncome.toLocaleString()}
            </p>
          </div>

        </div>

        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button
            onClick={() => router.push("/passport/certificate")}
            style={{ padding: "10px 16px", background: GREEN, color: "#fff", border: "none", borderRadius: 8 }}
          >
            <Download size={14} /> Download Certificate
          </button>
        </div>
      </div>

      {/* Scores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <ScoreCard title="Employment Stability" score={paymentConsistencyScore} icon={Briefcase} />
        <ScoreCard title="Income Consistency" score={incomeStabilityScore} icon={TrendingUp} />
        <ScoreCard title="Attendance Reliability" score={Math.min(100, payments.length * 20)} icon={Award} />
      </div>

    </div>
  );
}

function ScoreCard({ title, score, icon: Icon }: { title: string; score: number; icon: React.ElementType }) {
  const safeScore = Math.min(100, Math.max(0, score || 0));

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20 }}>
      <p style={{ fontSize: 12, color: "#9AADA6" }}>{title}</p>
      <h2 style={{ fontSize: 32, color: GREEN }}>{safeScore}</h2>
      <p style={{ fontSize: 12 }}>{scoreLabel(safeScore)}</p>
    </div>
  );
}
