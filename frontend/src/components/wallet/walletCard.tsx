"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { getToken } from "@/lib/api";

const API   = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";
const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";

export function WalletCard() {
  const router = useRouter();
  const [balance, setBalance]           = useState(0);
  const [isPaymentSetup, setIsPaymentSetup] = useState(false);
  const [paymentMethod, setPaymentMethod]   = useState("");
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetch(`${API}/api/settings`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(d => {
        setBalance(d.settings?.walletBalance || 0);
        setIsPaymentSetup(d.settings?.isPaymentSetup || false);
        setPaymentMethod(d.settings?.paymentMethod || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div
      onClick={() => router.push("/settings")}
      style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #0a4a36 100%)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, position: "relative", overflow: "hidden", cursor: "pointer" }}>

      <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(201,150,42,0.15)" }} />
      <div style={{ position: "absolute", bottom: -20, left: "30%", width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(201,150,42,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wallet style={{ width: 16, height: 16, color: GOLD }} />
            </div>
            <span style={{ fontSize: 12, color: "rgba(248,245,237,0.55)", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>SachaPay Wallet</span>
          </div>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#F8F5ED", lineHeight: 1, marginBottom: 4 }}>
            ₦{balance.toLocaleString()}
          </p>
          <p style={{ fontSize: 12, color: "rgba(248,245,237,0.4)" }}>
            {paymentMethod === "WALLET" ? "Wallet balance" : paymentMethod === "PAYSTACK" ? "Paystack connected" : "Not configured"}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: GOLD, color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "Outfit, sans-serif" }}>
            {isPaymentSetup ? "Manage" : "Setup Payment"}
            <ArrowRight style={{ width: 14, height: 14 }} />
          </div>
          {isPaymentSetup && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#4ADE80" }}>
              <CheckCircle style={{ width: 11, height: 11 }} /> Connected
            </span>
          )}
        </div>
      </div>

      {!isPaymentSetup && (
        <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, fontSize: 12, color: "#FCA5A5", display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
          <AlertCircle style={{ width: 13, height: 13, flexShrink: 0 }} />
          Payment not connected — click to setup before running payroll
        </div>
      )}

      {isPaymentSetup && paymentMethod === "WALLET" && balance < 50000 && (
        <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(217,119,6,0.15)", border: "1px solid rgba(217,119,6,0.3)", borderRadius: 8, fontSize: 12, color: "#FCD34D", position: "relative" }}>
          ⚠ Low wallet balance — fund before running payroll
        </div>
      )}
    </div>
  );
}
