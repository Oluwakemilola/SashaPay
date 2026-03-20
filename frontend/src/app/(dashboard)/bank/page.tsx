"use client";
// ─────────────────────────────────────────────
// SachaPay — Bank Account Page
// File: src/app/(dashboard)/bank/page.tsx
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import { getToken } from "@/lib/api";
import { Plus, Trash2, Star, CheckCircle, AlertCircle, Building2 } from "lucide-react";

const API  = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";
const G    = "#0B3D2E";
const GOLD = "#C9962A";

const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "First Bank", code: "011" },
  { name: "GTBank", code: "058" },
  { name: "Zenith Bank", code: "057" },
  { name: "UBA", code: "033" },
  { name: "Fidelity Bank", code: "070" },
  { name: "Union Bank", code: "032" },
  { name: "Stanbic IBTC", code: "221" },
  { name: "Sterling Bank", code: "232" },
  { name: "Wema Bank", code: "035" },
  { name: "Ecobank", code: "050" },
  { name: "Keystone Bank", code: "082" },
  { name: "Polaris Bank", code: "076" },
  { name: "Unity Bank", code: "215" },
  { name: "Opay", code: "100004" },
  { name: "Kuda Bank", code: "090267" },
  { name: "Moniepoint", code: "090405" },
  { name: "PalmPay", code: "100033" },
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
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ UPDATED FORM STATE
  const [form, setForm] = useState({
    accountNumber: "",
    bankCode: "",
    bankName: "",
    accountName: ""
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`
  };

  const load = async () => {
    try {
      const res = await fetch(`${API}/api/bank`, { headers });
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
      const res = await fetch(`${API}/api/bank`, {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not add account");
        return;
      }
      setSuccess("Bank account added successfully!");
      setShowForm(false);

      // reset form (kept consistent with updated state)
      setForm({
        accountNumber: "",
        bankCode: "",
        bankName: "",
        accountName: ""
      });

      load();
    } catch {
      setError("Could not connect to server.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/bank/${id}/set-primary`, {
        method: "PATCH",
        headers
      });
      if (res.ok) {
        load();
        setSuccess("Primary account updated!");
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this bank account?")) return;
    try {
      const res = await fetch(`${API}/api/bank/${id}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        load();
        setSuccess("Account removed.");
      }
    } catch {}
  };

  return (
    <div style={{ fontFamily: "Outfit, sans-serif", maxWidth: 680 }}>

      {/* Add account form */}
      {showForm && (
        <div>
          <form onSubmit={handleAdd}>

            {/* ✅ UPDATED onChange */}
            <select
              required
              value={form.bankCode}
              onChange={e => {
                const bank = NIGERIAN_BANKS.find(b => b.code === e.target.value);
                setForm({
                  ...form,
                  bankCode: e.target.value,
                  bankName: bank?.name || ""
                });
              }}
            >
              <option value="">Select your bank</option>
              {NIGERIAN_BANKS.map(b => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>

          </form>
        </div>
      )}
    </div>
  );
            }
