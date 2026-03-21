"use client";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/api";
import { CheckCircle, XCircle, Clock, Search, Download, FileText } from "lucide-react";

const API   = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";
const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";

type Transfer = {
  _id: string;
  worker: { name: string; email: string; department: string };
  month: string;
  amountKobo: number;
  status: string;
  paidAt: string;
  paystackReference: string;
};

type Run = {
  _id: string;
  month: string;
  status: string;
  completedAt: string;
  transfers: Transfer[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  SUCCESS:  { label: "Paid",       color: "#059669", bg: "#F0FDF4", icon: CheckCircle },
  FAILED:   { label: "Failed",     color: "#DC2626", bg: "#FEF2F2", icon: XCircle },
  PENDING:  { label: "Pending",    color: "#D97706", bg: "#FFFBEB", icon: Clock },
  RETRYING: { label: "Processing", color: "#2563EB", bg: "#EFF6FF", icon: Clock },
};

export default function TransactionsPage() {
  const [runs, setRuns]           = useState<Run[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [activeRun, setActiveRun] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${getToken()}` };

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API}/api/payroll/history`, { headers });
        const data = await res.json();
        const payrollRuns = data.payrollRuns || [];
        const runsWithTransfers = await Promise.all(
          payrollRuns.map(async (run: any) => {
            try {
              const r = await fetch(`${API}/api/payroll/${run._id}`, { headers });
              const d = await r.json();
              return { ...run, transfers: d.transfers || [] };
            } catch { return { ...run, transfers: [] }; }
          })
        );
        setRuns(runsWithTransfers);
        if (runsWithTransfers.length > 0) setActiveRun(runsWithTransfers[0]._id);
      } catch { setError("Could not load transactions"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const selectedRun  = runs.find(r => r._id === activeRun);
  const allTransfers = selectedRun?.transfers || [];
  const filtered     = allTransfers.filter(t =>
    !search ||
    t.worker?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.worker?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid    = filtered.filter(t => t.status === "SUCCESS").reduce((s, t) => s + Math.round(t.amountKobo / 100), 0);
  const successCount = filtered.filter(t => t.status === "SUCCESS").length;
  const failedCount  = filtered.filter(t => t.status === "FAILED").length;

  // ── Export to CSV ──────────────────────────
  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Worker Name", "Email", "Department", "Month", "Amount (NGN)", "Status", "Paid At", "Reference"];
    const rows    = filtered.map(t => [
      t.worker?.name || "",
      t.worker?.email || "",
      t.worker?.department || "",
      t.month,
      Math.round((t.amountKobo || 0) / 100),
      t.status,
      t.paidAt ? new Date(t.paidAt).toLocaleDateString("en-NG") : "",
      t.paystackReference || "",
    ]);
    const csv     = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob    = new Blob([csv], { type: "text/csv" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = url;
    a.download    = `SachaPay_Transactions_${selectedRun?.month || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Export to printable receipt ──────────────
  const exportPrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const org = JSON.parse(localStorage.getItem("organization") || "{}");
    win.document.write(`
      <html><head><title>Payment Receipt — ${selectedRun?.month}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #0B3D2E; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        .subtitle { color: #6B7B72; font-size: 14px; margin-bottom: 32px; }
        .meta { display: flex; gap: 40px; margin-bottom: 32px; background: #F0F7F4; padding: 16px 20px; border-radius: 8px; }
        .meta-item label { font-size: 11px; color: #9AADA6; text-transform: uppercase; letter-spacing: 1px; }
        .meta-item p { font-size: 18px; font-weight: bold; margin: 4px 0 0; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: 11px; color: #9AADA6; text-transform: uppercase; letter-spacing: 1px; padding: 10px 12px; border-bottom: 2px solid #E8EDE8; }
        td { padding: 12px; border-bottom: 1px solid #F0EDE6; font-size: 14px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: bold; background: #F0FDF4; color: #059669; }
        .badge.failed { background: #FEF2F2; color: #DC2626; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8EDE8; font-size: 12px; color: #9AADA6; text-align: center; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <h1>SachaPay — Payment Receipt</h1>
      <p class="subtitle">${org.name || "Organisation"} · Generated on ${new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</p>
      <div class="meta">
        <div class="meta-item"><label>Payroll Period</label><p>${selectedRun?.month}</p></div>
        <div class="meta-item"><label>Total Disbursed</label><p>₦${totalPaid.toLocaleString()}</p></div>
        <div class="meta-item"><label>Workers Paid</label><p>${successCount}</p></div>
        <div class="meta-item"><label>Status</label><p>${selectedRun?.status}</p></div>
      </div>
      <table>
        <thead><tr>
          <th>Worker</th><th>Department</th><th>Amount</th><th>Status</th><th>Paid At</th><th>Reference</th>
        </tr></thead>
        <tbody>
          ${filtered.map(t => `<tr>
            <td><strong>${t.worker?.name || "—"}</strong><br><small style="color:#9AADA6">${t.worker?.email || ""}</small></td>
            <td>${t.worker?.department || "—"}</td>
            <td><strong>₦${Math.round((t.amountKobo || 0) / 100).toLocaleString()}</strong></td>
            <td><span class="badge ${t.status === "FAILED" ? "failed" : ""}">${t.status === "SUCCESS" ? "✓ Paid" : t.status}</span></td>
            <td>${t.paidAt ? new Date(t.paidAt).toLocaleDateString("en-NG") : "—"}</td>
            <td style="font-family:monospace;font-size:11px;color:#9AADA6">${(t.paystackReference || "").slice(0, 24)}...</td>
          </tr>`).join("")}
        </tbody>
      </table>
      <div class="footer">SachaPay · Payroll & Financial Identity · SP-2026 · This document is computer generated</div>
      <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div style={{ fontFamily: "Outfit, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: GREEN, marginBottom: 4 }}>Transactions</h2>
          <p style={{ fontSize: 14, color: "#6B7B72" }}>Full payment history for all payroll disbursements.</p>
        </div>
        {filtered.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportCSV}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: `1px solid ${GREEN}`, borderRadius: 10, background: "#fff", color: GREEN, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
              <Download style={{ width: 14, height: 14 }} /> Export CSV
            </button>
            <button onClick={exportPrint}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: "none", borderRadius: 10, background: GREEN, color: "#F8F5ED", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
              <FileText style={{ width: 14, height: 14 }} /> Print Receipt
            </button>
          </div>
        )}
      </div>

      {error && <div style={{ padding: "12px 16px", background: "#FEF2F2", color: "#DC2626", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9AADA6" }}>Loading transactions...</div>
      ) : runs.length === 0 ? (
        <div style={{ padding: 64, textAlign: "center", color: "#9AADA6" }}>
          <Clock style={{ width: 40, height: 40, margin: "0 auto 16px", opacity: 0.3 }} />
          <p>No payroll runs yet.</p>
        </div>
      ) : (
        <>
          {/* Run selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {runs.map(run => (
              <button key={run._id} onClick={() => setActiveRun(run._id)}
                style={{ padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${activeRun === run._id ? GREEN : "#E8EDE8"}`, background: activeRun === run._id ? GREEN : "#fff", color: activeRun === run._id ? "#F8F5ED" : "#6B7B72", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
                {run.month} · {run.status === "COMPLETED" ? "✓" : run.status}
              </button>
            ))}
          </div>

          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Total Disbursed", value: `₦${totalPaid.toLocaleString()}`, color: GREEN },
              { label: "Workers Paid",    value: String(successCount),              color: "#059669" },
              { label: "Failed",          value: String(failedCount),               color: failedCount > 0 ? "#DC2626" : "#9AADA6" },
            ].map(c => (
              <div key={c.label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8EDE8", padding: "16px 20px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{c.label}</p>
                <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: c.color, lineHeight: 1 }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 16, maxWidth: 400 }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#9AADA6" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by worker name..."
              style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #E8EDE8", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "Outfit, sans-serif", color: GREEN }} />
          </div>

          {/* Table */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 1.5fr", padding: "12px 20px", background: "#F8F5ED", borderBottom: "1px solid #E8EDE8" }}>
              {["Worker", "Month", "Amount", "Status", "Paid At"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9AADA6", fontSize: 14 }}>No transactions found.</div>
            ) : filtered.map((t, i) => {
              const cfg     = STATUS_CONFIG[t.status] || STATUS_CONFIG.PENDING;
              const Icon    = cfg.icon;
              const initials = t.worker?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "??";
              return (
                <div key={t._id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr 1.5fr", padding: "14px 20px", borderTop: i === 0 ? "none" : "1px solid #F0EDE6", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: GOLD, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: GREEN }}>{t.worker?.name || "Unknown"}</p>
                      <p style={{ fontSize: 11, color: "#9AADA6" }}>{t.worker?.department || t.worker?.email || ""}</p>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>{t.month}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: GREEN }}>₦{Math.round((t.amountKobo || 0) / 100).toLocaleString()}</div>
                  <div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                      <Icon style={{ width: 11, height: 11 }} />{cfg.label}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: "#6B7B72" }}>{t.paidAt ? new Date(t.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
                    {t.paystackReference && <p style={{ fontSize: 10, color: "#C4CFC8", marginTop: 2, fontFamily: "monospace" }}>{t.paystackReference.slice(0, 20)}...</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: "#C4CFC8" }}>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""} · {selectedRun?.month}</p>
        </>
      )}
    </div>
  );
}
