"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, PlayCircle, Clock } from "lucide-react";
import { getUser } from "@/lib/api";
import { hasBeenPrompted, markPrompted } from "@/lib/feedbackPrompt";
import { payrollService, passportService, feedbackService, FeedbackContextType } from "@/services";
import FeedbackModal from "@/components/feedback/FeedbackModal";

const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";

type PayrollRun = {
  _id: string; month: string;
  status: "DRAFT" | "APPROVED" | "DISBURSING" | "COMPLETED" | "FAILED" | "PARTIAL_FAILURE";
  totalAmount: number; eligibleWorkers: number; createdAt: string;
};

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  DRAFT:           { label: "Draft",      bg: "#F8F5ED", color: "#9AADA6" },
  APPROVED:        { label: "Approved",   bg: "#FFFBEB", color: "#D97706" },
  DISBURSING:      { label: "Disbursing", bg: "#EFF6FF", color: "#2563EB" },
  COMPLETED:       { label: "Completed",  bg: "#F0FDF4", color: "#059669" },
  FAILED:          { label: "Failed",     bg: "#FEF2F2", color: "#DC2626" },
  PARTIAL_FAILURE: { label: "Partial",    bg: "#FEF2F2", color: "#D97706" },
};

export default function PayrollPage() {
  const [runs, setRuns]           = useState<PayrollRun[]>([]);
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [role, setRole]           = useState("WORKER");
  const [acting, setActing]       = useState<string | null>(null);

  const [feedbackContext, setFeedbackContext] = useState<{ type: FeedbackContextType; id: string } | null>(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const isAdmin = role === "ADMIN" || role === "MANAGER";

  useEffect(() => {
    const user = getUser();
    const r = user?.role || "WORKER";
    setRole(r);

    if (r === "ADMIN" || r === "MANAGER") {
      payrollService.getPayrollHistory()
        .then(d => {
          const fetchedRuns = d.payrollRuns as PayrollRun[] || [];
          setRuns(fetchedRuns);
          const latestCompleted = fetchedRuns.find(run => run.status === "COMPLETED");
          if (latestCompleted && !hasBeenPrompted("PAYROLL_RUN", latestCompleted._id)) {
            setFeedbackContext({ type: "PAYROLL_RUN", id: latestCompleted._id });
          }
        })
        .catch(() => setError("Could not load payroll history"))
        .finally(() => setLoading(false));
    } else {
      passportService.getMyPassport()
        .then(d => {
          const payments = (d.passport as any)?.payments || [];
          setMyHistory(payments);
          const latestPayment = payments[payments.length - 1];
          if (latestPayment?.month && !hasBeenPrompted("PAYMENT", latestPayment.month)) {
            setFeedbackContext({ type: "PAYMENT", id: latestPayment.month });
          }
        })
        .catch(() => setMyHistory([]))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleFeedbackSubmit = async (rating: number, message: string) => {
    if (!feedbackContext) return;
    setFeedbackSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        contextType: feedbackContext.type,
        contextId: feedbackContext.id,
        rating,
        message: message || undefined,
      });
    } catch {
      // Feedback failing to save shouldn't block the page — fail silently.
    } finally {
      markPrompted(feedbackContext.type, feedbackContext.id);
      setFeedbackSubmitting(false);
      setFeedbackContext(null);
    }
  };

  const handleFeedbackDismiss = () => {
    if (!feedbackContext) return;
    markPrompted(feedbackContext.type, feedbackContext.id);
    setFeedbackContext(null);
  };

  const handleApprove = async (id: string) => {
    setActing(id);
    try {
      await payrollService.approvePayrollRun(id);
      setRuns(prev => prev.map(r => r._id === id ? { ...r, status: "APPROVED" } : r));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not approve payroll run");
    }
    setActing(null);
  };

  const handleDisburse = async (id: string) => {
    setActing(id);
    try {
      const d = await payrollService.disbursePayroll(id);
      setRuns(prev => prev.map(r => r._id === id ? { ...r, status: (d.payrollRun as any)?.status || "COMPLETED" } : r));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not disburse payroll run");
    }
    setActing(null);
  };

  const completed = isAdmin ? runs.filter(r => r.status === "COMPLETED").length : myHistory.length;
  const pending   = runs.filter(r => ["DRAFT", "APPROVED"].includes(r.status)).length;
  const failed    = runs.filter(r => ["FAILED", "PARTIAL_FAILURE"].includes(r.status)).length;

  return (
    <div style={{ fontFamily: "Outfit, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: GREEN, marginBottom: 4 }}>Payroll</h2>
        <p style={{ fontSize: 14, color: "#6B7B72" }}>{isAdmin ? "Manage and disburse payroll runs." : "Your salary payment history."}</p>
      </div>

      {error && <div style={{ padding: "12px 16px", background: "#FEF2F2", color: "#DC2626", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label={isAdmin ? "Completed" : "Payments"} value={completed} color="#059669" />
        {isAdmin && <StatCard label="Pending" value={pending} color={GOLD} />}
        {isAdmin && <StatCard label="Failed" value={failed} color="#DC2626" />}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8EDE8", fontFamily: "'DM Serif Display', serif", fontSize: 18, color: GREEN }}>
          {isAdmin ? "All Payroll Runs" : "Salary History"}
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9AADA6", fontSize: 14 }}>Loading...</div>
        ) : (isAdmin ? runs : myHistory).length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9AADA6", fontSize: 14 }}>
            {isAdmin ? "No payroll runs yet. Click Run Payroll on the dashboard." : "No salary payments yet."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8F5ED" }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Month</th>
                  {isAdmin && <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Workers</th>}
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                  {isAdmin && <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {isAdmin ? runs.map((run, i) => {
                  const s = STATUS_MAP[run.status] || STATUS_MAP.DRAFT;
                  const isActing = acting === run._id;
                  return (
                    <tr key={run._id} style={{ borderTop: i === 0 ? "none" : "1px solid #F0EDE6" }}>
                      <td style={{ padding: "14px 20px", fontWeight: 600, color: GREEN }}>{run.month}</td>
                      <td style={{ padding: "14px 20px", color: "#6B7B72" }}>{run.eligibleWorkers ?? "—"}</td>
                      <td style={{ padding: "14px 20px", fontWeight: 600 }}>₦{Math.round((run.totalAmount || 0) / 100).toLocaleString()}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        {run.status === "DRAFT" && (
                          <button onClick={() => handleApprove(run._id)} disabled={!!isActing} style={{ padding: "6px 14px", background: GOLD, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: isActing ? 0.6 : 1, fontFamily: "Outfit, sans-serif" }}>
                            {isActing ? "..." : "Approve"}
                          </button>
                        )}
                        {run.status === "APPROVED" && (
                          <button onClick={() => handleDisburse(run._id)} disabled={!!isActing} style={{ padding: "6px 14px", background: GREEN, color: "#F8F5ED", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: isActing ? 0.6 : 1, fontFamily: "Outfit, sans-serif" }}>
                            {isActing ? "..." : "Disburse"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }) : myHistory.map((pay, i) => (
                  <tr key={i} style={{ borderTop: i === 0 ? "none" : "1px solid #F0EDE6" }}>
                    <td style={{ padding: "14px 20px", fontWeight: 600, color: GREEN }}>{pay.month}</td>
                    <td style={{ padding: "14px 20px", fontWeight: 600, color: "#059669" }}>₦{(pay.amount || 0).toLocaleString()}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "#F0FDF4", color: "#059669" }}>✓ Verified</span>
                    </td>
                    <td style={{ padding: "14px 20px", color: "#9AADA6", fontSize: 12 }}>
                      {pay.paidAt ? new Date(pay.paidAt).toLocaleDateString("en-NG") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {feedbackContext && (
        <FeedbackModal
          title={isAdmin ? "How was running payroll?" : "How was receiving your payment?"}
          subtitle={isAdmin
            ? "Your payroll run just completed — let us know how the experience was for you."
            : "Your salary just landed — tell us about your experience receiving it."}
          submitting={feedbackSubmitting}
          onSubmit={handleFeedbackSubmit}
          onDismiss={handleFeedbackDismiss}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <p style={{ fontSize: 12, color: "#9AADA6", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 700, color, fontFamily: "'DM Serif Display', serif" }}>{value}</p>
    </div>
  );
      }
                    
