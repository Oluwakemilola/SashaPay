"use client";
// ─────────────────────────────────────────────
// SachaPay — Payroll History Page
// File: src/app/(dashboard)/payroll/page.tsx
// ─────────────────────────────────────────────
// Fetches real payroll runs from GET /api/payroll/history
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, PlayCircle, Clock } from "lucide-react";
import { getPayrollHistory, getStoredUser } from "@/lib/api";

type PayrollRun = {
  _id: string;
  month: string;
  status: "PENDING" | "APPROVED" | "DISBURSING" | "COMPLETED" | "FAILED";
  totalAmount: number;   // kobo
  workerCount: number;
  createdAt: string;
};

const STATUS_CONFIG = {
  PENDING:    { label: "Pending",    icon: Clock,          cls: "bg-muted text-muted-foreground" },
  APPROVED:   { label: "Approved",   icon: CheckCircle2,   cls: "bg-amber-100 text-amber-700" },
  DISBURSING: { label: "Disbursing", icon: PlayCircle,      cls: "bg-blue-100 text-blue-700" },
  COMPLETED:  { label: "Completed",  icon: CheckCircle2,   cls: "bg-emerald-100 text-emerald-700" },
  FAILED:     { label: "Failed",     icon: XCircle,         cls: "bg-destructive/10 text-destructive" },
};

export default function PayrollPage() {
  const [runs, setRuns]       = useState<PayrollRun[]>([]);
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [role, setRole]       = useState("WORKER");

  const isAdmin = role === "ADMIN" || role === "MANAGER";

  useEffect(() => {
    const user = getStoredUser();
    const currentRole = user?.role || "WORKER";
    setRole(currentRole);

    if (currentRole === "ADMIN" || currentRole === "MANAGER") {
        getPayrollHistory()
          .then((d) => setRuns(d.runs as unknown as PayrollRun[]))
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false));
    } else {
        // Fetch worker the financial passport for history
        import("@/lib/api").then(api => {
            api.getMyPassport()
                .then(d => {
                    const pass = d.passport as any;
                    setMyHistory(pass?.payments || []);
                })
                .catch(err => {
                    // Graceful: no passport yet means no history
                    if (err.message.includes("404") || err.message.includes("not found")) {
                        setMyHistory([]);
                    } else {
                        setError(err.message);
                    }
                })
                .finally(() => setLoading(false));
        });
    }
  }, []);

  const completed  = isAdmin 
    ? runs.filter((r) => r.status === "COMPLETED").length
    : myHistory.length;
    
  const pending    = runs.filter((r) => ["PENDING", "APPROVED"].includes(r.status)).length;
  const failed     = runs.filter((r) => r.status === "FAILED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll</h2>
          <p className="text-muted-foreground">History of all payroll runs for your organisation.</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatusCard title={isAdmin ? "Completed" : "Total Payments"} count={completed} icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-50" />
        {isAdmin && (
          <>
            <StatusCard title="Pending" count={pending} icon={AlertCircle} color="text-amber-500" bg="bg-amber-50" />
            <StatusCard title="Failed" count={failed} icon={XCircle} color="text-destructive" bg="bg-destructive/10" />
          </>
        )}
      </div>

      {/* Runs / History Table */}
      <div className="bg-card w-full rounded-xl border shadow-sm">
        <div className="p-4 border-b text-emerald-400 font-semibold uppercase text-xs tracking-widest">
          {isAdmin ? "All Payroll Runs" : "Your Salary History"}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Month</th>
                {isAdmin && <th className="px-6 py-4 font-bold">Workers</th>}
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold">{isAdmin ? "Created" : "Pay Date"}</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y relative min-h-[100px]">
              {loading && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                       <Clock className="w-4 h-4 animate-spin" /> Loading data…
                    </div>
                  </td>
                </tr>
              )}
              {!loading && (isAdmin ? runs.length === 0 : myHistory.length === 0) && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-muted-foreground italic">
                    No payroll data found.
                  </td>
                </tr>
              )}

              {/* ADMIN ROWS */}
              {isAdmin && runs.map((run) => {
                const cfg = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.PENDING;
                const StatusIcon = cfg.icon;
                return (
                  <tr key={run._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold">{run.month}</td>
                    <td className="px-6 py-4 text-muted-foreground">{run.workerCount ?? "—"}</td>
                    <td className="px-6 py-4 font-medium">
                      ₦{Math.round((run.totalAmount ?? 0) / 100).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(run.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${cfg.cls}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* WORKER ROWS */}
              {!isAdmin && myHistory.map((pay, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-semibold uppercase">{pay.month}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">
                    ₦{(pay.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground italic">
                    {pay.date || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-tight">
                      VERIFIED ✅
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, count, icon: Icon, color, bg }: {
  title: string; count: number; icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-xl ${bg} ${color}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{count}</p>
      </div>
    </div>
  );
}
