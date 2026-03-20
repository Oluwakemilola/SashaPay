"use client";
// ─────────────────────────────────────────────
// SachaPay — Bank Account Page
// File: src/app/(dashboard)/bank/page.tsx
// ─────────────────────────────────────────────
// Workers add and manage bank accounts here.
// POST /api/bank       — add account
// GET  /api/bank       — list accounts
// PATCH /api/bank/:id/set-primary — set primary
// DELETE /api/bank/:id — remove account

import { useEffect, useState } from "react";
import { getToken } from "@/lib/api";
import { Plus, Trash2, Star, CheckCircle, AlertCircle, Building2 } from "lucide-react";

const API  = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";
const G    = "#0B3D2E";
const GOLD = "#C9962A";

const NIGERIAN_BANKS = [
  { name: "Access Bank",         code: "044" },
  { name: "First Bank",          code: "011" },
  { name: "GTBank",              code: "058" },
  { name: "Zenith Bank",         code: "057" },
  { name: "UBA",                 code: "033" },
  { name: "Fidelity Bank",       code: "070" },
  { name: "Union Bank",          code: "032" },
  { name: "Stanbic IBTC",        code: "221" },
  { name: "Sterling Bank",       code: "232" },
  { name: "Wema Bank",           code: "035" },
  { name: "Ecobank",             code: "050" },
  { name: "Keystone Bank",       code: "082" },
  { name: "Polaris Bank",        code: "076" },
  { name: "Unity Bank",          code: "215" },
  { name: "Opay",                code: "100004" },
  { name: "Kuda Bank",           code: "090267" },
  { name: "Moniepoint",          code: "090405" },
  { name: "PalmPay",             code: "100033" },
];

type BankAccount = {
  _id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isPrimary: boolean;
  verificationStatus: string;
};

export default function BankPage() {
  const [accounts, setAccounts]   = useState<BankAccount[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [form, setForm]           = useState({ accountNumber: "", bankCode: "", accountName: "" });

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };

  const load = async () => {
    try {
      const res  = await fetch(`${API}/api/bank`, { headers });
      const data = await res.json();
      setAccounts(data.accounts || data.bankAccounts || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const res  = await fetch(`${API}/api/bank`, {
        method: "POST", headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Could not add account"); return; }
      setSuccess("Bank account added successfully!");
      setShowForm(false);
      setForm({ accountNumber: "", bankCode: "", accountName: "" });
      load();
    } catch { setError("Could not connect to server."); }
    finally { setSaving(false); }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/bank/${id}/set-primary`, { method: "PATCH", headers });
      if (res.ok) { load(); setSuccess("Primary account updated!"); }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this bank account?")) return;
    try {
      const res = await fetch(`${API}/api/bank/${id}`, { method: "DELETE", headers });
      if (res.ok) { load(); setSuccess("Account removed."); }
    } catch {}
  };

  const selectedBank = NIGERIAN_BANKS.find(b => b.code === form.bankCode);

  return (
    <div style={{ fontFamily: "Outfit, sans-serif", maxWidth: 680 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: G, marginBottom: 4 }}>
          Bank Accounts
        </h2>
        <p style={{ fontSize: 14, color: "#6B7B72" }}>
          Add your bank account to receive salary payments. Your primary account is used for all disbursements.
        </p>
      </div>

      {success && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, marginBottom: 16, fontSize: 14, color: "#059669" }}>
          <CheckCircle style={{ width: 16, height: 16, flexShrink: 0 }} /> {success}
        </div>
      )}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, marginBottom: 16, fontSize: 14, color: "#DC2626" }}>
          <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} /> {error}
        </div>
      )}

      {/* Account list */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9AADA6", fontSize: 14 }}>Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: 48, textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, background: "#F0F7F4", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Building2 style={{ width: 24, height: 24, color: G }} />
          </div>
          <p style={{ fontWeight: 600, color: G, marginBottom: 6, fontSize: 16 }}>No bank accounts yet</p>
          <p style={{ fontSize: 13, color: "#9AADA6" }}>Add your bank account to receive salary payments</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {accounts.map((acc) => (
            <div key={acc._id} style={{ background: "#fff", borderRadius: 14, border: `1.5px solid ${acc.isPrimary ? GOLD : "#E8EDE8"}`, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, background: acc.isPrimary ? `${GOLD}18` : "#F8F5ED", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Building2 style={{ width: 20, height: 20, color: acc.isPrimary ? GOLD : G }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: G }}>{acc.bankName}</p>
                  {acc.isPrimary && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: `${GOLD}20`, color: GOLD, textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>
                      Primary
                    </span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: acc.verificationStatus === "VERIFIED" ? "#F0FDF4" : "#FFFBEB", color: acc.verificationStatus === "VERIFIED" ? "#059669" : "#D97706", textTransform: "uppercase" as const }}>
                    {acc.verificationStatus === "VERIFIED" ? "✓ Verified" : "Pending"}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#6B7B72" }}>{acc.accountNumber} · {acc.accountName}</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {!acc.isPrimary && (
                  <button onClick={() => handleSetPrimary(acc._id)}
                    title="Set as primary"
                    style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${GOLD}`, background: "transparent", color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Star style={{ width: 14, height: 14 }} />
                  </button>
                )}
                {!acc.isPrimary && (
                  <button onClick={() => handleDelete(acc._id)}
                    title="Remove account"
                    style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #FECACA", background: "transparent", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add account button */}
      {!showForm && (
        <button onClick={() => { setShowForm(true); setError(""); setSuccess(""); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: G, color: "#F8F5ED", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
          <Plus style={{ width: 16, height: 16 }} /> Add Bank Account
        </button>
      )}

      {/* Add account form */}
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: "24px", marginTop: 8 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: G, marginBottom: 20 }}>Add New Account</h3>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Bank *</label>
              <select required value={form.bankCode} onChange={e => setForm({...form, bankCode: e.target.value})}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontFamily: "Outfit, sans-serif", fontSize: 14, color: "#1A1A1A", background: "#fff", outline: "none" }}>
                <option value="">Select your bank</option>
                {NIGERIAN_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Account Number *</label>
              <input type="text" required maxLength={10} placeholder="0123456789" value={form.accountNumber}
                onChange={e => setForm({...form, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10)})}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontFamily: "Outfit, sans-serif", fontSize: 15, letterSpacing: "2px", color: G, outline: "none" }} />
              <p style={{ fontSize: 12, color: "#9AADA6", marginTop: 4 }}>10-digit NUBAN account number</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Account Name *</label>
              <input type="text" required placeholder="As it appears on your bank account" value={form.accountName}
                onChange={e => setForm({...form, accountName: e.target.value.toUpperCase()})}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontFamily: "Outfit, sans-serif", fontSize: 14, color: G, outline: "none", textTransform: "uppercase" as const }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={saving}
                style={{ flex: 1, padding: "13px", background: G, color: "#F8F5ED", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "Outfit, sans-serif", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Adding account..." : "Add Account"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(""); }}
                style={{ padding: "13px 20px", background: "transparent", color: "#6B7B72", border: "1px solid #E8EDE8", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "Outfit, sans-serif" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginTop: 24, padding: "14px 16px", background: "#F0F7F4", borderRadius: 10, fontSize: 13, color: "#3A5248", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <CheckCircle style={{ width: 16, height: 16, color: G, flexShrink: 0, marginTop: 1 }} />
        <span>Your <strong>primary account</strong> receives all salary payments. You can have multiple accounts but only one can be primary at a time.</span>
      </div>
    </div>
  );
}
