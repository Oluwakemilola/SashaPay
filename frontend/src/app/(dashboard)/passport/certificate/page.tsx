"use client";
import { useEffect, useState } from "react";
import { getMyPassport, getStoredUser, getStoredOrg } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CertificatePage() {
  const router = useRouter();
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  const user = typeof window !== "undefined" ? getStoredUser() : null;
  const org  = typeof window !== "undefined" ? getStoredOrg()  : null;

  useEffect(() => {
    getMyPassport()
      .then((res: any) => { if (res?.passport) setPassport(res.passport); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Outfit, sans-serif", color: "#9AADA6" }}>
      Preparing certificate...
    </div>
  );

  if (!passport) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16, fontFamily: "Outfit, sans-serif" }}>
      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#0B3D2E" }}>No passport available yet</p>
      <p style={{ color: "#6B7B72" }}>Complete a payroll disbursement to generate your passport.</p>
      <button onClick={() => router.back()} style={{ padding: "10px 24px", background: "#0B3D2E", color: "#F8F5ED", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>Go Back</button>
    </div>
  );

  const worker   = passport.worker;
  const name     = worker?.name || (user as any)?.name || "Worker";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const today    = new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
  const docId    = `SP-${passport._id?.toString().slice(-8).toUpperCase()}`;

  // Correct field names from backend
  const totalIncome          = passport.totalIncome          || 0;
  const averageMonthlyIncome = passport.averageMonthlyIncome || 0;
  const totalMonthsEmployed  = passport.totalMonthsEmployed  || 0;
  const consistencyScore     = passport.paymentConsistencyScore || 0;
  const stabilityScore       = passport.incomeStabilityScore    || 0;
  const payments             = passport.payments || [];
  const trustScore           = Math.round((consistencyScore + stabilityScore) / 2);
  const scoreLabel           = trustScore >= 90 ? "Excellent" : trustScore >= 75 ? "Very Good" : trustScore >= 60 ? "Good" : "Fair";
  const orgName              = worker?.organization?.name || (org as any)?.name || "Organisation";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; background: #E8EDE8; }

        .action-bar {
          position: fixed; top: 0; left: 0; right: 0; height: 56px;
          background: #0B3D2E; display: flex; align-items: center;
          justify-content: space-between; padding: 0 32px; z-index: 100;
        }
        .action-bar p { color: rgba(248,245,237,0.6); font-size: 13px; }
        .btn-back { padding: 8px 18px; background: transparent; border: 1.5px solid rgba(255,255,255,0.25); color: #F8F5ED; border-radius: 8px; font-family: 'Outfit', sans-serif; font-size: 13px; cursor: pointer; }
        .btn-download { padding: 8px 18px; background: #C9962A; border: none; color: #fff; border-radius: 8px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }

        .page-wrap { padding: 72px 24px 48px; display: flex; justify-content: center; min-height: 100vh; }

        .certificate {
          width: 794px; background: #fff;
          border-radius: 12px; overflow: hidden;
          box-shadow: 0 8px 48px rgba(0,0,0,0.12);
        }

        /* Top green band */
        .cert-header {
          background: #0B3D2E; padding: 36px 48px 32px;
          position: relative; overflow: hidden;
        }
        .cert-header::before { content: ''; position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; background: rgba(201,150,42,0.12); }
        .cert-header-row { display: flex; align-items: flex-start; justify-content: space-between; position: relative; }
        .cert-logo { font-family: 'DM Serif Display', serif; font-size: 22px; color: #F8F5ED; }
        .cert-logo span { color: #C9962A; }
        .cert-header-right { text-align: right; }
        .cert-issued { font-size: 11px; color: rgba(248,245,237,0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
        .cert-date { font-size: 13px; color: rgba(248,245,237,0.7); }

        .cert-title-row { margin-top: 24px; position: relative; }
        .cert-verified-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border: 1px solid rgba(201,150,42,0.5);
          border-radius: 99px; font-size: 10px; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase; color: #C9962A; margin-bottom: 10px;
        }
        .cert-main-title { font-family: 'DM Serif Display', serif; font-size: 34px; color: #F8F5ED; line-height: 1.1; }
        .cert-main-sub { font-size: 13px; color: rgba(248,245,237,0.45); margin-top: 6px; }

        /* Worker row */
        .cert-worker {
          padding: 28px 48px; border-bottom: 1px solid #F0EDE6;
          display: flex; align-items: center; justify-content: space-between; gap: 24px;
        }
        .cert-worker-left { display: flex; align-items: center; gap: 18px; }
        .cert-avatar { width: 64px; height: 64px; border-radius: 14px; background: #C9962A; color: #fff; font-size: 22px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cert-name { font-family: 'DM Serif Display', serif; font-size: 24px; color: #0B3D2E; }
        .cert-detail { font-size: 12px; color: #9AADA6; margin-top: 4px; }
        .cert-worker-right { text-align: right; }
        .cert-org-name { font-weight: 700; font-size: 14px; color: #0B3D2E; }
        .cert-org-label { font-size: 11px; color: #9AADA6; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

        /* Stats grid */
        .cert-stats { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 1px solid #F0EDE6; }
        .cert-stat { padding: 24px 20px; border-right: 1px solid #F0EDE6; text-align: center; }
        .cert-stat:last-child { border-right: none; }
        .cert-stat-value { font-family: 'DM Serif Display', serif; font-size: 24px; color: #0B3D2E; line-height: 1; margin-bottom: 6px; }
        .cert-stat-label { font-size: 10px; color: #9AADA6; text-transform: uppercase; letter-spacing: 0.5px; }

        /* Trust score */
        .cert-trust { padding: 28px 48px; border-bottom: 1px solid #F0EDE6; display: flex; align-items: center; justify-content: space-between; gap: 32px; }
        .cert-trust-text h3 { font-family: 'DM Serif Display', serif; font-size: 17px; color: #0B3D2E; margin-bottom: 8px; }
        .cert-trust-text p { font-size: 12px; color: #9AADA6; line-height: 1.65; max-width: 380px; }
        .cert-trust-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
        .cert-score-ring { width: 84px; height: 84px; border-radius: 50%; border: 3px solid #0B3D2E; background: #F0F7F4; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .cert-score-num { font-family: 'DM Serif Display', serif; font-size: 26px; color: #0B3D2E; line-height: 1; }
        .cert-score-denom { font-size: 10px; color: #9AADA6; }
        .cert-score-desc { font-size: 13px; font-weight: 700; color: #0B3D2E; }

        /* Score bars */
        .cert-scores { padding: 0 48px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .score-bar-item { }
        .score-bar-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .score-bar-label { font-size: 11px; color: #9AADA6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .score-bar-value { font-size: 13px; font-weight: 700; color: #0B3D2E; }
        .score-bar-track { height: 6px; background: #F0EDE6; border-radius: 99px; overflow: hidden; }
        .score-bar-fill { height: 100%; background: #0B3D2E; border-radius: 99px; }

        /* Payment history */
        .cert-payments { padding: 24px 48px; border-top: 1px solid #F0EDE6; border-bottom: 1px solid #F0EDE6; }
        .cert-payments h3 { font-family: 'DM Serif Display', serif; font-size: 17px; color: #0B3D2E; margin-bottom: 16px; }
        .cert-payments-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .cert-payment-pill { padding: 10px 12px; background: #F8F5ED; border-radius: 8px; }
        .cert-payment-month { font-size: 11px; color: #9AADA6; margin-bottom: 2px; }
        .cert-payment-amt { font-size: 13px; font-weight: 700; color: #0B3D2E; }

        /* Footer */
        .cert-footer { padding: 20px 48px; background: #F8F5ED; display: flex; align-items: center; justify-content: space-between; }
        .cert-footer-text p { font-size: 11px; color: #9AADA6; line-height: 1.6; }
        .cert-footer-text strong { color: #0B3D2E; }
        .cert-seal { width: 60px; height: 60px; border-radius: 50%; border: 2px solid #0B3D2E; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .cert-seal p { font-size: 7px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #0B3D2E; text-align: center; line-height: 1.5; }

        @media print {
          .action-bar { display: none !important; }
          .page-wrap { padding: 0; background: #fff; }
          .certificate { box-shadow: none; border-radius: 0; width: 100%; }
          body { background: #fff; }
        }
      `}</style>

      {/* Action bar */}
      <div className="action-bar">
        <p>Financial Passport Certificate · {name}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-back" onClick={() => router.back()}>← Back</button>
          <button className="btn-download" onClick={() => window.print()}>⬇ Download PDF</button>
        </div>
      </div>

      <div className="page-wrap">
        <div className="certificate">

          {/* Header */}
          <div className="cert-header">
            <div className="cert-header-row">
              <div className="cert-logo">Sacha<span>Pay</span></div>
              <div className="cert-header-right">
                <div className="cert-issued">Document ID</div>
                <div className="cert-date" style={{ fontFamily: "monospace", fontSize: 12 }}>{docId}</div>
              </div>
            </div>
            <div className="cert-title-row">
              <div className="cert-verified-badge">✓ Verified Financial Identity</div>
              <div className="cert-main-title">Financial Passport</div>
              <div className="cert-main-sub">Issued {today} · Powered by SachaPay Nigeria</div>
            </div>
          </div>

          {/* Worker */}
          <div className="cert-worker">
            <div className="cert-worker-left">
              <div className="cert-avatar">{initials}</div>
              <div>
                <div className="cert-name">{name}</div>
                <div className="cert-detail">{worker?.email || (user as any)?.email} {worker?.department ? `· ${worker.department}` : ""}</div>
              </div>
            </div>
            <div className="cert-worker-right">
              <div className="cert-org-name">{orgName}</div>
              <div className="cert-org-label">Organisation</div>
            </div>
          </div>

          {/* Stats */}
          <div className="cert-stats">
            <div className="cert-stat">
              <div className="cert-stat-value">₦{totalIncome.toLocaleString()}</div>
              <div className="cert-stat-label">Total Verified Income</div>
            </div>
            <div className="cert-stat">
              <div className="cert-stat-value">₦{averageMonthlyIncome.toLocaleString()}</div>
              <div className="cert-stat-label">Monthly Average</div>
            </div>
            <div className="cert-stat">
              <div className="cert-stat-value">{totalMonthsEmployed}</div>
              <div className="cert-stat-label">Months Employed</div>
            </div>
            <div className="cert-stat">
              <div className="cert-stat-value">{payments.length}</div>
              <div className="cert-stat-label">Payments Received</div>
            </div>
          </div>

          {/* Trust score */}
          <div className="cert-trust">
            <div className="cert-trust-text">
              <h3>SachaPay Trust Score</h3>
              <p>
                This score reflects verified payment consistency and income stability
                based on salary disbursements processed through SachaPay. Accepted as
                proof of income by financial institutions and landlords.
              </p>
            </div>
            <div className="cert-trust-right">
              <div className="cert-score-ring">
                <span className="cert-score-num">{trustScore}</span>
                <span className="cert-score-denom">/100</span>
              </div>
              <div className="cert-score-desc">{scoreLabel}</div>
            </div>
          </div>

          {/* Score bars */}
          <div className="cert-scores">
            <div className="score-bar-item">
              <div className="score-bar-header">
                <span className="score-bar-label">Payment Consistency</span>
                <span className="score-bar-value">{consistencyScore}</span>
              </div>
              <div className="score-bar-track"><div className="score-bar-fill" style={{ width: `${consistencyScore}%` }} /></div>
            </div>
            <div className="score-bar-item">
              <div className="score-bar-header">
                <span className="score-bar-label">Income Stability</span>
                <span className="score-bar-value">{stabilityScore}</span>
              </div>
              <div className="score-bar-track"><div className="score-bar-fill" style={{ width: `${stabilityScore}%` }} /></div>
            </div>
          </div>

          {/* Payment history */}
          {payments.length > 0 && (
            <div className="cert-payments">
              <h3>Verified Payment History</h3>
              <div className="cert-payments-grid">
                {[...payments].reverse().slice(0, 8).map((p: any, i: number) => (
                  <div key={i} className="cert-payment-pill">
                    <div className="cert-payment-month">{p.month}</div>
                    <div className="cert-payment-amt">₦{(p.amount || 0).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="cert-footer">
            <div className="cert-footer-text">
              <p>This document certifies that <strong>{name}</strong> has received verified salary payments</p>
              <p>through SachaPay. Generated on {today}. Document ID: <strong>{docId}</strong></p>
              <p style={{ marginTop: 4 }}>This is a computer-generated document. Verify at <strong>sasha-pay.vercel.app</strong></p>
            </div>
            <div className="cert-seal">
              <p>SACHA<br />PAY<br />✓<br />2026</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
      }
      
