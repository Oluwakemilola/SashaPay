"use client";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/api";
import { CheckCircle, AlertCircle, Shield, CreditCard, Settings2, Eye, EyeOff, Wallet, Building2, Copy, Check, Plus } from "lucide-react";

const API   = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";
const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";

export default function SettingsPage() {
  const [settings, setSettings]           = useState<any>(null);
  const [loading, setLoading]             = useState(true);
  const [paystackKey, setPaystackKey]     = useState("");
  const [showKey, setShowKey]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [success, setSuccess]             = useState("");
  const [error, setError]                 = useState("");
  const [policy, setPolicy]               = useState("FIXED_SALARY");
  const [threshold, setThreshold]         = useState("80");
  const [savingPolicy, setSavingPolicy]   = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "wallet">("paystack");
  const [fundAmount, setFundAmount]       = useState("");
  const [funding, setFunding]             = useState(false);
  const [copied, setCopied]               = useState(false);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };

  const loadSettings = () => {
    fetch(`${API}/api/settings`, { headers })
      .then(r => r.json())
      .then(d => {
        setSettings(d.settings);
        setPolicy(d.settings?.payrollPolicy || "FIXED_SALARY");
        setThreshold(String(d.settings?.thresholdPercent || 80));
        setPaymentMethod(d.settings?.paymentMethod === "WALLET" ? "wallet" : "paystack");
      })
      .catch(() => setError("Could not load settings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSettings(); }, []);

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
      setSuccess("Paystack account connected successfully!");
      setPaystackKey("");
      loadSettings();
    } catch { setError("Could not connect to server."); }
    finally { setSaving(false); }
  };

  const handleFundWallet = async () => {
    const amt = Number(fundAmount);
    if (!amt || amt <= 0) { setError("Please enter a valid amount"); return; }
    setFunding(true); setError(""); setSuccess("");
    try {
      const res  = await fetch(`${API}/api/settings/fund-wallet`, {
        method: "POST", headers,
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess(`✅ Wallet funded with ₦${amt.toLocaleString()}! New balance: ₦${data.walletBalance.toLocaleString()}`);
      setFundAmount("");
      loadSettings();
    } catch { setError("Could not connect to server."); }
    finally { setFunding(false); }
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

  const handleCopy = () => {
    navigator.clipboard.writeText("0123456789");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #E5E7EB",
    borderRadius: 10, fontFamily: "Outfit, sans-serif", fontSize: 14,
    color: GREEN, background: "#fff", outline: "none",
  };

  return (
    <div style={{ fontFamily: "Outfit, sans-serif", maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: GREEN, marginBottom: 4 }}>Settings</h2>
        <p style={{ fontSize: 14, color: "#6B7B72" }}>Manage your organisation's payment setup and payroll configuration.</p>
      </div>

      {success && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, marginBottom: 16, fontSize: 14, color: "#059669" }}><CheckCircle style={{ width: 16, height: 16 }} />{success}</div>}
      {error   && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, marginBottom: 16, fontSize: 14, color: "#DC2626" }}><AlertCircle style={{ width: 16, height: 16 }} />{error}</div>}

      {/* Payment Setup Card */}
      <div style={{ background: "#fff", borderRadius: 16, border: `2px solid ${settings?.isPaymentSetup ? "#BBF7D0" : "#E8EDE8"}`, padding: "24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: settings?.isPaymentSetup ? "#F0FDF4" : "#F8F5ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard style={{ width: 20, height: 20, color: settings?.isPaymentSetup ? "#059669" : GREEN }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: GREEN }}>Payment Setup</h3>
              <p style={{ fontSize: 12, color: "#9AADA6", marginTop: 2 }}>Choose how your organisation funds payroll</p>
            </div>
          </div>
          {settings?.isPaymentSetup && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "#059669" }}>
              <CheckCircle style={{ width: 14, height: 14 }} /> Payment Connected
            </span>
          )}
        </div>

        {/* Method selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { id: "paystack", icon: CreditCard, title: "Paystack API",     desc: "Connect your Paystack account. Best for tech-savvy businesses." },
            { id: "wallet",   icon: Wallet,     title: "SachaPay Wallet",  desc: "Fund via bank transfer. Perfect for any type of business." },
          ].map(opt => (
            <div key={opt.id} onClick={() => setPaymentMethod(opt.id as any)}
              style={{ border: `2px solid ${paymentMethod === opt.id ? GREEN : "#E8EDE8"}`, borderRadius: 12, padding: "14px", cursor: "pointer", background: paymentMethod === opt.id ? "#F0F7F4" : "#fff", transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: paymentMethod === opt.id ? `${GREEN}15` : "#F8F5ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <opt.icon style={{ width: 15, height: 15, color: paymentMethod === opt.id ? GREEN : "#9AADA6" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>{opt.title}</span>
              </div>
              <p style={{ fontSize: 12, color: "#6B7B72", lineHeight: 1.5 }}>{opt.desc}</p>
            </div>
          ))}
        </div>

        {/* Paystack method */}
        {paymentMethod === "paystack" && (
          <div>
            <div style={{ background: "#F8F5ED", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#3A5248", lineHeight: 1.6 }}>
              SachaPay uses your Paystack account to disburse salaries directly. Your Paystack balance is debited — workers receive payment instantly.
              {settings?.mockMode && <span style={{ display: "block", marginTop: 6, color: GOLD, fontWeight: 600 }}>⚡ Demo mode — enter any key to simulate.</span>}
            </div>
            {settings?.isPaymentSetup && settings?.paymentMethod === "PAYSTACK" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#F0FDF4", borderRadius: 10, marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>Paystack Account</p>
                  <p style={{ fontSize: 12, color: "#9AADA6", fontFamily: "monospace", marginTop: 2 }}>{settings.paystackKeyHint}</p>
                </div>
                <Shield style={{ width: 20, height: 20, color: "#059669" }} />
              </div>
            )}
            <form onSubmit={handleConnectPaystack}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Paystack Secret Key {settings?.isPaymentSetup && settings?.paymentMethod === "PAYSTACK" ? "(Update)" : "*"}
                </label>
                <div style={{ position: "relative" }}>
                  <input type={showKey ? "text" : "password"} placeholder={settings?.mockMode ? "Enter any key (demo mode)" : "sk_live_xxxxxx"}
                    value={paystackKey} onChange={e => setPaystackKey(e.target.value)}
                    required={!(settings?.isPaymentSetup && settings?.paymentMethod === "PAYSTACK")}
                    style={{ ...inputStyle, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowKey(!showKey)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9AADA6" }}>
                    {showKey ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "#9AADA6", marginTop: 4 }}>
                  Find your key in <a href="https://dashboard.paystack.com/#/settings/developer" target="_blank" rel="noopener noreferrer" style={{ color: GREEN, textDecoration: "underline" }}>Paystack dashboard → API Keys</a>
                </p>
              </div>
              <button type="submit" disabled={saving || !paystackKey}
                style={{ padding: "11px 24px", background: GREEN, color: "#F8F5ED", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: saving || !paystackKey ? "not-allowed" : "pointer", opacity: saving || !paystackKey ? 0.6 : 1, fontFamily: "Outfit, sans-serif" }}>
                {saving ? "Connecting..." : "Connect Paystack Account"}
              </button>
            </form>
          </div>
        )}

        {/* Wallet method */}
        {paymentMethod === "wallet" && (
          <div>
            <div style={{ background: "#F8F5ED", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#3A5248", lineHeight: 1.6 }}>
              Fund your SachaPay wallet by transferring to the account below. Your balance is used automatically when you run payroll. No Paystack account needed — works for any business.
            </div>

            {/* Current balance */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: (settings?.walletBalance || 0) > 0 ? "#F0FDF4" : "#FEF2F2", borderRadius: 12, marginBottom: 16, border: `1px solid ${(settings?.walletBalance || 0) > 0 ? "#BBF7D0" : "#FECACA"}` }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Wallet Balance</p>
                <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: (settings?.walletBalance || 0) > 0 ? GREEN : "#DC2626", lineHeight: 1 }}>
                  ₦{(settings?.walletBalance || 0).toLocaleString()}
                </p>
                {(settings?.totalFunded || 0) > 0 && <p style={{ fontSize: 11, color: "#9AADA6", marginTop: 4 }}>₦{(settings?.totalFunded || 0).toLocaleString()} total funded</p>}
              </div>
              {(settings?.walletBalance || 0) > 0
                ? <CheckCircle style={{ width: 24, height: 24, color: "#059669" }} />
                : <AlertCircle style={{ width: 24, height: 24, color: "#DC2626" }} />
              }
            </div>

            {/* Virtual account */}
            <div style={{ background: "#F0F7F4", border: "1.5px solid rgba(11,61,46,0.12)", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Building2 style={{ width: 15, height: 15, color: GREEN }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>Your Dedicated Account</span>
                <span style={{ fontSize: 10, padding: "2px 8px", background: `${GOLD}20`, color: GOLD, borderRadius: 99, fontWeight: 700 }}>DEMO</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><p style={{ fontSize: 11, color: "#9AADA6", marginBottom: 2 }}>Bank</p><p style={{ fontSize: 14, fontWeight: 600, color: GREEN }}>Wema Bank (ALAT)</p></div>
                <div><p style={{ fontSize: 11, color: "#9AADA6", marginBottom: 2 }}>Account Name</p><p style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>SACHAPAY/{settings?.orgName?.toUpperCase()}</p></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 11, color: "#9AADA6", marginBottom: 2 }}>Account Number</p>
                  <p style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 800, color: GREEN, letterSpacing: 3 }}>0123456789</p>
                </div>
                <button onClick={handleCopy} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${copied ? "#059669" : "#E8EDE8"}`, background: copied ? "#F0FDF4" : "#fff", color: copied ? "#059669" : "#9AADA6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {copied ? <Check style={{ width: 16, height: 16 }} /> : <Copy style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Fund wallet */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                <Plus style={{ width: 14, height: 14, display: "inline", marginRight: 4 }} />
                Add funds to wallet (₦)
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <input type="number" placeholder="e.g. 500000" value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }} />
                <button onClick={handleFundWallet} disabled={!fundAmount || funding}
                  style={{ padding: "11px 20px", background: GOLD, color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: !fundAmount || funding ? "not-allowed" : "pointer", opacity: !fundAmount ? 0.6 : 1, fontFamily: "Outfit, sans-serif", whiteSpace: "nowrap" as const }}>
                  {funding ? "Processing..." : "Fund Wallet"}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#9AADA6", marginTop: 6 }}>
                In production, balance updates automatically when bank transfer arrives.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Payroll Policy */}
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
              { val: "FIXED_SALARY",     title: "Fixed Salary",     desc: "All workers receive full salary every month regardless of attendance." },
              { val: "ATTENDANCE_BASED", title: "Attendance Based", desc: "Workers must meet a minimum attendance threshold to qualify." },
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
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Minimum Attendance Threshold (%)</label>
            <input type="number" min="1" max="100" value={threshold} onChange={e => setThreshold(e.target.value)} style={{ ...inputStyle, maxWidth: 200 }} />
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
