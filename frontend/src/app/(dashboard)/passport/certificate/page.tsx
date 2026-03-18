"use client";
// ─────────────────────────────────────────────
// SachaPay — Financial Passport Certificate
// File: src/app/(dashboard)/passport/certificate/page.tsx
// ─────────────────────────────────────────────
// Opens as a clean printable page.
// Worker clicks "Download PDF" → browser prints to PDF.
// No extra libraries needed.
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import { getMyPassport, getUser, getOrg } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CertificatePage() {
  const router = useRouter();
  const [passport, setPassport] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getUser());
    setOrg(getOrg());
    const load = async () => {
      const res = await getMyPassport();
      if (res?.ok && res.data?.passport) setPassport(res.data.passport);
      setLoading(false);
    };
    load();
  }, []);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p style={{ color: "#9AADA6", fontFamily: "Outfit, sans-serif" }}>Preparing certificate...</p>
      </div>
    );
  }

  if (!passport) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16 }}>
        <p style={{ color: "#0B3D2E", fontFamily: "'DM Serif Display', serif", fontSize: 24 }}>No passport available yet</p>
        <p style={{ color: "#6B7B72", fontFamily: "Outfit, sans-serif" }}>Complete a payroll disbursement to generate your passport.</p>
        <button onClick={() => router.back()} style={{ padding: "10px 24px", background: "#0B3D2E", color: "#F8F5ED", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
          Go Back
        </button>
      </div>
    );
  }

  const worker = passport.worker;
  const name = worker?.name || user?.name || "Worker";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const today = new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
  const score = Math.round((passport.paymentConsistencyScore + passport.incomeStabilityScore) / 2);
  const scoreLabel = score >= 90 ? "Excellent" : score >= 75 ? "Very Good" : score >= 60 ? "Good" : "Fair";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Outfit', sans-serif;
          background: #E8EDE8;
        }

        /* ── Action bar (hidden when printing) ── */
        .action-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          background: #0B3D2E;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          z-index: 100;
        }
        .action-bar p {
          color: rgba(248,245,237,0.6);
          font-size: 13px;
        }
        .action-bar-right { display: flex; gap: 10px; }
        .btn-back {
          padding: 8px 18px;
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.25);
          color: #F8F5ED;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          cursor: pointer;
        }
        .btn-download {
          padding: 8px 18px;
          background: #C9962A;
          border: none;
          color: #fff;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        /* ── Certificate wrapper ── */
        .page-wrap {
          padding: 80px 32px 48px;
          display: flex;
          justify-content: center;
          min-height: 100vh;
        }

        /* ── Certificate card ── */
        .certificate {
          width: 794px;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 48px rgba(0,0,0,0.12);
        }

        /* ── Header band ── */
        .cert-header {
          background: #0B3D2E;
          padding: 40px 48px 36px;
          position: relative;
          overflow: hidden;
        }
        .cert-header::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: rgba(201,150,42,0.12);
        }
        .cert-header::after {
          content: '';
          position: absolute;
          bottom: -40px; left: 40%;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .cert-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 20px;
          color: #F8F5ED;
          margin-bottom: 24px;
          position: relative;
        }
        .cert-logo span { color: #C9962A; }
        .cert-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border: 1px solid rgba(201,150,42,0.5);
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #C9962A;
          margin-bottom: 16px;
          position: relative;
        }
        .cert-badge::before {
          content: '✓';
          width: 14px; height: 14px;
          background: #C9962A;
          color: #fff;
          border-radius: 50%;
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cert-title {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: #F8F5ED;
          line-height: 1.15;
          position: relative;
        }
        .cert-subtitle {
          font-size: 14px;
          color: rgba(248,245,237,0.5);
          margin-top: 6px;
          position: relative;
        }

        /* ── Worker identity section ── */
        .cert-identity {
          padding: 36px 48px;
          border-bottom: 1px solid #F0EDE6;
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .cert-avatar {
          width: 72px; height: 72px;
          border-radius: 16px;
          background: #C9962A;
          color: #fff;
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cert-name {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: #0B3D2E;
          line-height: 1.1;
        }
        .cert-meta {
          font-size: 13px;
          color: #9AADA6;
          margin-top: 4px;
        }
        .cert-meta span {
          margin-right: 16px;
        }

        /* ── Stats row ── */
        .cert-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-bottom: 1px solid #F0EDE6;
        }
        .cert-stat {
          padding: 28px 24px;
          border-right: 1px solid #F0EDE6;
          text-align: center;
        }
        .cert-stat:last-child { border-right: none; }
        .cert-stat-value {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #0B3D2E;
          line-height: 1;
          margin-bottom: 6px;
        }
        .cert-stat-label {
          font-size: 11px;
          color: #9AADA6;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* ── Score section ── */
        .cert-score-section {
          padding: 32px 48px;
          border-bottom: 1px solid #F0EDE6;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }
        .cert-score-left h3 {
          font-family: 'DM Serif Display', serif;
          font-size: 18px;
          color: #0B3D2E;
          margin-bottom: 6px;
        }
        .cert-score-left p {
          font-size: 13px;
          color: #9AADA6;
          max-width: 340px;
          line-height: 1.6;
        }
        .cert-score-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .cert-score-circle {
          width: 90px; height: 90px;
          border-radius: 50%;
          background: #F0F7F4;
          border: 3px solid #0B3D2E;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .cert-score-num {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: #0B3D2E;
          line-height: 1;
        }
        .cert-score-max {
          font-size: 11px;
          color: #9AADA6;
        }
        .cert-score-label {
          font-size: 14px;
          font-weight: 600;
          color: #0B3D2E;
        }

        /* ── Payment history ── */
        .cert-history {
          padding: 32px 48px;
          border-bottom: 1px solid #F0EDE6;
        }
        .cert-history h3 {
          font-family: 'DM Serif Display', serif;
          font-size: 18px;
          color: #0B3D2E;
          margin-bottom: 20px;
        }
        .cert-history-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .cert-payment-item {
          padding: 12px 14px;
          background: #F8F5ED;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cert-payment-month {
          font-size: 12px;
          font-weight: 500;
          color: #0B3D2E;
        }
        .cert-payment-amount {
          font-size: 12px;
          font-weight: 600;
          color: #C9962A;
        }

        /* ── Footer ── */
        .cert-footer {
          padding: 24px 48px;
          background: #F8F5ED;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cert-footer-left p {
          font-size: 12px;
          color: #9AADA6;
          line-height: 1.6;
        }
        .cert-footer-seal {
          width: 64px; height: 64px;
          border-radius: 50%;
          border: 2px solid #0B3D2E;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cert-footer-seal p {
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #0B3D2E;
          text-align: center;
          line-height: 1.4;
        }

        /* ── Print styles ── */
        @media print {
          .action-bar { display: none !important; }
          .page-wrap  { padding: 0; background: none; }
          .certificate {
            box-shadow: none;
            border-radius: 0;
            width: 100%;
          }
          body { background: #fff; }
        }
      `}</style>

      {/* ── Action bar (screen only) ── */}
      <div className="action-bar">
        <p>Financial Passport Certificate · {name}</p>
        <div className="action-bar-right">
          <button className="btn-back" onClick={() => router.back()}>← Back</button>
          <button className="btn-download" onClick={handlePrint}>⬇ Download PDF</button>
        </div>
      </div>

      <div className="page-wrap">
        <div className="certificate">

          {/* ── Header ── */}
          <div className="cert-header">
            <div className="cert-logo">Sacha<span>Pay</span></div>
            <div className="cert-badge">Verified Financial Identity</div>
            <h1 className="cert-title">Financial Passport</h1>
            <p className="cert-subtitle">Issued {today} · Powered by SachaPay</p>
          </div>

          {/* ── Worker identity ── */}
          <div className="cert-identity">
            <div className="cert-avatar">{initials}</div>
            <div>
              <h2 className="cert-name">{name}</h2>
              <p className="cert-meta">
                <span>{worker?.email || user?.email}</span>
                {worker?.department && <span>{worker.department}</span>}
              </p>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="cert-stats">
            <div className="cert-stat">
              <div className="cert-stat-value">₦{(passport.totalIncome || 0).toLocaleString()}</div>
              <div className="cert-stat-label">Total Verified Income</div>
            </div>
            <div className="cert-stat">
              <div className="cert-stat-value">₦{(passport.averageMonthlyIncome || 0).toLocaleString()}</div>
              <div className="cert-stat-label">Monthly Average</div>
            </div>
            <div className="cert-stat">
              <div className="cert-stat-value">{passport.totalMonthsEmployed || 0}</div>
              <div className="cert-stat-label">Months Employed</div>
            </div>
            <div className="cert-stat">
              <div className="cert-stat-value">{passport.payments?.length || 0}</div>
              <div className="cert-stat-label">Payments Received</div>
            </div>
          </div>

          {/* ── Trust score ── */}
          <div className="cert-score-section">
            <div className="cert-score-left">
              <h3>SachaPay Trust Score</h3>
              <p>
                This score reflects payment consistency and income stability
                based on verified salary disbursements through SachaPay.
                It can be used as proof of income for financial services.
              </p>
            </div>
            <div className="cert-score-right">
              <div className="cert-score-circle">
                <span className="cert-score-num">{score}</span>
                <span className="cert-score-max">/100</span>
              </div>
              <div>
                <div className="cert-score-label">{scoreLabel}</div>
              </div>
            </div>
          </div>

          {/* ── Payment history ── */}
          {passport.payments?.length > 0 && (
            <div className="cert-history">
              <h3>Verified Payment History</h3>
              <div className="cert-history-grid">
                {[...passport.payments].reverse().slice(0, 9).map((p: any, i: number) => (
                  <div key={i} className="cert-payment-item">
                    <span className="cert-payment-month">{p.month}</span>
                    <span className="cert-payment-amount">₦{(p.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="cert-footer">
            <div className="cert-footer-left">
              <p>
                This document certifies that the above individual has received verified salary<br />
                payments through SachaPay. Generated on {today}.<br />
                Document ID: SACHAPAY-{passport._id?.toString().slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="cert-footer-seal">
              <p>SACHA<br />PAY<br />✓</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}