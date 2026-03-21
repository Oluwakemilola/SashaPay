"use client";
// ─────────────────────────────────────────────
// SachaPay — Transactions Page (Admin)
// File: src/app/(dashboard)/transactions/page.tsx
// ─────────────────────────────────────────────
// Shows all worker transfers across all payroll runs
// GET /api/payroll/history → then GET /api/payroll/:id for each run

import { useEffect, useState } from "react";
import { getToken } from "@/lib/api";
import { CheckCircle, XCircle, Clock, Search, Download } from "lucide-react";

const API   = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";
const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";

type Transfer = {
  _id:               string;
  worker:            { name: string; email: string; department: string };
  month:             string;
  amountKobo:        number;
  status:            string;
  paidAt:            string;
  paystackReference: string;
};

type RunWithTransfers = {
  _id:        string;
  month:      string;
  status:     string;
  completedAt: string;
  transfers:  Transfer[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  SUCCESS:   { label: "Paid",       color: "#059669", bg: "#F0FDF4", icon: CheckCircle },
  FAILED:    { label: "Failed",     color: "#DC2626", bg: "#FEF2F2", icon: XCircle },
  PENDING:   { label: "Pending",    color: "#D97706", bg: "#FFFBEB", icon: Clock },
  RETRYING:  { label: "Processing", color: "#2563EB", bg: "#EFF6FF", icon: Clock },
};

export default function TransactionsPage() {
  const [runs, setRuns]         = useState<RunWithTransfers[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [activeRun, setActiveRun] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${getToken()}` };

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all runs
        const res  = await fetch(`${API}/api/payroll/history`, { headers });
        const data = await res.json();
        const payrollRuns = data.payrollRuns || [];

        // Fetch transfers for each run
        const runsWithTransfers = await Promise.all(
          payrollRuns.map(async (run: any) => {
            try {
              const r    = await fetch(`${API}/api/payroll/${run._id}`, { headers });
              const d    = await r.json();
              return { ...run, transfers: d.transfers || [] };
            } catch {
              return { ...run, transfers: [] };
            }
          })
        );

        setRuns(runsWithTransfers);
        if (runsWithTransfers.length > 0) setActiveRun(runsWithTransfers[0]._id);
      } catch {
        setError("Could not load transactions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedRun  = runs.find(r => r._id === activeRun);
  const allTransfers = selectedRun?.transfers || [];

  const filtered = allTransfers.filter(t =>
    !search ||
    t.worker?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.worker?.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.month?.includes(search)
  );

  const totalPaid   = filtered.filter(t => t.status === "SUCCESS").reduce((s, t) => s + Math.round(t.amountKobo / 100), 0);
  const successCount = filtered.filter(t => t.status === "SUCCESS").length;
  const failedCount  = filtered.filter(t => t.status === "FAILED").length;

  return (
    <div style={{ fontFamily: "Outfit, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: GREEN, marginBottom: 4 }}>
          Transactions
        </h2>
        <p style={{ fontSize: 14, color: "#6B7B72" }}>
          Full payment history for all payroll disbursements.
        </p>
      </div>

      {error && <div style={{ padding: "12px 16px", background: "#FEF2F2", color: "#DC2626", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9AADA6", fontSize: 14 }}>Loading transactions...</div>
      ) : runs.length === 0 ? (
        <div style={{ padding: 64, textAlign: "center", color: "#9AADA6", fontSize: 14 }}>
          <Clock style={{ width: 40, height: 40, margin: "0 auto 16px", opacity: 0.3 }} />
          <p>No payroll runs yet. Run your first payroll from the dashboard.</p>
        </div>
      ) : (
        <>
          {/* Run selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {runs.map(run => (
              <button key={run._id} onClick={() => setActiveRun(run._id)}
                style={{ padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${activeRun === run._id ? GREEN : "#E8EDE8"}`, background: activeRun === run._id ? GREEN : "#fff", color: activeRun === run._id ? "#F8F5ED" : "#6B7B72", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
                {run.month} · {run.status === "COMPLETED" ? "✓ Completed" : run.status}
              </button>
            ))}
          </div>

          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
            <SummaryCard label="Total Disbursed" value={`₦${totalPaid.toLocaleString()}`} color={GREEN} />
            <SummaryCard label="Workers Paid"    value={String(successCount)}              color="#059669" />
            <SummaryCard label="Failed"          value={String(failedCount)}               color={failedCount > 0 ? "#DC2626" : "#9AADA6"} />
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 16, maxWidth: 400 }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#9AADA6" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by worker name or email..."
              style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #E8EDE8", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "Outfit, sans-serif", color: GREEN }} />
          </div>

          {/* Transactions table */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", overflow: "hidden" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 1.5fr", padding: "12px 20px", background: "#F8F5ED", borderBottom: "1px solid #E8EDE8" }}>
              {["Worker", "Month", "Amount", "Status", "Paid At"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9AADA6", fontSize: 14 }}>
                No transactions found.
              </div>
            ) : (
              filtered.map((t, i) => {
                const cfg     = STATUS_CONFIG[t.status] || STATUS_CONFIG.PENDING;
                const Icon    = cfg.icon;
                const initials = t.worker?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "??";

                return (
                  <div key={t._id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 1.5fr", padding: "14px 20px", borderTop: i === 0 ? "none" : "1px solid #F0EDE6", alignItems: "center" }}>

                    {/* Worker */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: GOLD, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: GREEN }}>{t.worker?.name || "Unknown"}</p>
                        <p style={{ fontSize: 11, color: "#9AADA6" }}>{t.worker?.department || t.worker?.email || ""}</p>
                      </div>
                    </div>

                    {/* Month */}
                    <div style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>{t.month}</div>

                    {/* Amount */}
                    <div style={{ fontSize: 15, fontWeight: 700, color: GREEN }}>
                      ₦{Math.round((t.amountKobo || 0) / 100).toLocaleString()}
                    </div>

                    {/* Status */}
                    <div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                        <Icon style={{ width: 11, height: 11 }} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Paid at */}
                    <div>
                      <p style={{ fontSize: 13, color: "#6B7B72" }}>
                        {t.paidAt ? new Date(t.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </p>
                      {t.paystackReference && (
                        <p style={{ fontSize: 10, color: "#C4CFC8", marginTop: 2, fontFamily: "monospace" }}>
                          {t.paystackReference.slice(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <p style={{ marginTop: 12, fontSize: 12, color: "#C4CFC8" }}>
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} · {selectedRun?.month}
          </p>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8EDE8", padding: "16px 20px" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color, lineHeight: 1 }}>{value}</p>
    </div>
  );
}
