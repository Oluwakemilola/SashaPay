"use client";
// ─────────────────────────────────────────────
// SachaPay — Settings Page (Admin)
// File: src/app/(dashboard)/settings/page.tsx
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import { getToken, getStoredOrg } from "@/lib/api";
import { CheckCircle, AlertCircle, Shield, CreditCard, Settings2, Eye, EyeOff } from "lucide-react";

const API   = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";
const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";

export default function SettingsPage() {
  const [settings, setSettings]         = useState<any>(null);
  const [loading, setLoading]           = useState(true);
  const [paystackKey, setPaystackKey]   = useState("");
  const [showKey, setShowKey]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [success, setSuccess]           = useState("");
  const [error, setError]               = useState("");
  const [policy, setPolicy]             = useState("FIXED_SALARY");
  const [threshold, setThreshold]       = useState("80");
  const [savingPolicy, setSavingPolicy] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };

  useEffect(() => {
    fetch(`${API}/api/settings`, { headers })
      .then(r => r.json())
      .then(d => {
        setSettings(d.settings);
        setPolicy(d.settings?.payrollPolicy || "FIXED_SALARY");
        setThreshold(String(d.settings?.thresholdPercent || 80));
      })
      .catch(() => setError("Could not load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleConnectPaystack = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const res  = await fetch(`${API}/api/settings/payment`, {
        method: "POST", headers,
        body: JSON.stringify({ paystackSecretKey: paystackKey }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess("Payment account connected successfully!");
      setSettings((prev: any) => ({ ...prev, isPaymentSetup: true, paystackKeyHint: "sk_**********************" }));
      setPaystackKey("");
    } catch { setError("Could not connect to server."); }
    finally { setSaving(false); }
  };

  const handleUpdatePolicy = async () => {
    setSavingPolicy(true); setError(""); setSuccess("");
    try {
      const res  = await fetch(`${API}/api/settings/payroll-policy`, {
        method: "PATCH", headers,
        body: JSON.stringify({ payrollPolicy: policy, thresholdPercent: Number(threshold) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess("Payroll policy updated!");
    } catch { setError("Could not connect to server."); }
    finally { setSavingPolicy(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #E5E7EB", borderRadius: 10,
    fontFamily: "Outfit, sans-serif", fontSize: 14,
    color: GREEN, background: "#fff", outline: "none",
  };

  return (
    <div style={{ fontFamily: "Outfit, sans-serif", maxWidth: 680 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: GREEN, marginBottom: 4 }}>Settings</h2>
        <p style={{ fontSize: 14, color: "#6B7B72" }}>Manage your organisation's payment setup and payroll configuration.</p>
      </div>

      {success && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, marginBottom: 16, fontSize: 14, color: "#059669" }}>
          <CheckCircle style={{ width: 16, height: 16 }} /> {success}
        </div>
      )}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, marginBottom: 16, fontSize: 14, color: "#DC2626" }}>
          <AlertCircle style={{ width: 16, height: 16 }} /> {error}
        </div>
      )}

      {/* ── Payment Setup Card ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: `2px solid ${settings?.isPaymentSetup ? "#BBF7D0" : "#E8EDE8"}`, padding: "24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: settings?.isPaymentSetup ? "#F0FDF4" : "#F8F5ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard style={{ width: 20, height: 20, color: settings?.isPaymentSetup ? "#059669" : GREEN }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: GREEN }}>Payment Account</h3>
              <p style={{ fontSize: 12, color: "#9AADA6", marginTop: 2 }}>Connect your Paystack account to disburse salaries</p>
            </div>
          </div>
          {settings?.isPaymentSetup && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "#059669" }}>
              <CheckCircle style={{ width: 14, height: 14 }} /> Connected
            </span>
          )}
        </div>

        {/* Info box */}
        <div style={{ background: "#F8F5ED", borderRadius: 10, padding: "14px 16px", marginBottom: 20, fontSize: 13, color: "#3A5248", lineHeight: 1.6 }}>
          <strong>How it works:</strong> When you run payroll, SachaPay uses your Paystack account to disburse salaries directly to each worker's bank account. Your Paystack balance is debited — workers receive payment instantly.
          {settings?.mockMode && (
            <span style={{ display: "block", marginTop: 8, color: GOLD, fontWeight: 600 }}>
              ⚡ Demo mode active — enter any key to simulate connection. Real disbursements will use your actual Paystack account.
            </span>
          )}
        </div>

        {settings?.isPaymentSetup ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#F0FDF4", borderRadius: 10, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>Paystack Secret Key</p>
                <p style={{ fontSize: 12, color: "#9AADA6", fontFamily: "monospace", marginTop: 2 }}>{settings.paystackKeyHint}</p>
              </div>
              <Shield style={{ width: 20, height: 20, color: "#059669" }} />
            </div>
            <p style={{ fontSize: 12, color: "#9AADA6" }}>To update your key, enter a new one below and save.</p>
          </div>
        ) : (
          <div style={{ padding: "16px", background: "#FEF2F2", borderRadius: 10, marginBottom: 16, fontSize: 13, color: "#DC2626", display: "flex", alignItems: "flex-start", gap: 8 }}>
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
            <span>Payment account not connected. You cannot run payroll until you connect your Paystack account.</span>
          </div>
        )}

        <form onSubmit={handleConnectPaystack}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Paystack Secret Key {settings?.isPaymentSetup ? "(Update)" : "*"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showKey ? "text" : "password"}
                placeholder={settings?.mockMode ? "Enter any key (demo mode)" : "sk_live_xxxxxxxxxxxxxxxxxxxxxx"}
                value={paystackKey}
                onChange={e => setPaystackKey(e.target.value)}
                required={!settings?.isPaymentSetup}
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowKey(!showKey)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9AADA6" }}>
                {showKey ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
            <p style={{ fontSize: 11, color: "#9AADA6", marginTop: 4 }}>
              Find your secret key in your{" "}
              <a href="https://dashboard.paystack.com/#/settings/developer" target="_blank" rel="noopener noreferrer" style={{ color: GREEN, textDecoration: "underline" }}>
                Paystack dashboard → Settings → API Keys
              </a>
            </p>
          </div>
          <button type="submit" disabled={saving || !paystackKey}
            style={{ padding: "11px 24px", background: GREEN, color: "#F8F5ED", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: saving || !paystackKey ? "not-allowed" : "pointer", opacity: saving || !paystackKey ? 0.6 : 1, fontFamily: "Outfit, sans-serif" }}>
            {saving ? "Connecting..." : settings?.isPaymentSetup ? "Update Key" : "Connect Paystack Account"}
          </button>
        </form>
      </div>

      {/* ── Payroll Policy Card ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F8F5ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Settings2 style={{ width: 20, height: 20, color: GREEN }} />
          </div>
          <div>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: GREEN }}>Payroll Policy</h3>
            <p style={{ fontSize: 12, color: "#9AADA6", marginTop: 2 }}>How salaries are calculated for your workers</p>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Payment Type</label>
          <div style={{ border: "1.5px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
            {[
              { val: "FIXED_SALARY",      title: "Fixed Salary",      desc: "All active workers receive their full salary every month regardless of attendance." },
              { val: "ATTENDANCE_BASED",  title: "Attendance Based",  desc: "Workers must meet a minimum attendance threshold to qualify for salary payment." },
            ].map(opt => (
              <div key={opt.val} onClick={() => setPolicy(opt.val)}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 14, cursor: "pointer", background: policy === opt.val ? "#F0F7F4" : "#fff", borderBottom: opt.val === "FIXED_SALARY" ? "1px solid #E5E7EB" : "none", borderLeft: `3px solid ${policy === opt.val ? GREEN : "transparent"}` }}>
                <div style={{ width: 18, height: 18, border: `2px solid ${policy === opt.val ? GREEN : "#E5E7EB"}`, borderRadius: "50%", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {policy === opt.val && <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN }} />}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: GREEN, marginBottom: 2 }}>{opt.title}</div>
                  <div style={{ fontSize: 12, color: "#6B7B72", lineHeight: 1.5 }}>{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {policy === "ATTENDANCE_BASED" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Minimum Attendance Threshold (%)
            </label>
            <input type="number" min="1" max="100" value={threshold} onChange={e => setThreshold(e.target.value)} style={{ ...inputStyle, maxWidth: 200 }} />
            <p style={{ fontSize: 11, color: "#9AADA6", marginTop: 4 }}>Workers below this attendance % will not qualify for payroll</p>
          </div>
        )}

        <button onClick={handleUpdatePolicy} disabled={savingPolicy}
          style={{ padding: "11px 24px", background: GREEN, color: "#F8F5ED", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: savingPolicy ? "not-allowed" : "pointer", opacity: savingPolicy ? 0.6 : 1, fontFamily: "Outfit, sans-serif" }}>
          {savingPolicy ? "Saving..." : "Save Policy"}
        </button>
      </div>
    </div>
  );
}
