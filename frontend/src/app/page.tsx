"use client";
// ─────────────────────────────────────────────
// SachaPay — Landing Page
// File: src/app/page.tsx
// ─────────────────────────────────────────────
// This is the first page visitors see.
// It has a navbar, hero section, features, and footer.
// The two CTA buttons link to /login and /register.
// ─────────────────────────────────────────────

import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function LandingPage() {
  return (
    <>
      {/* ── Google Fonts ──────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Outfit', sans-serif;
          background: #F8F5ED;
          color: #1A1A1A;
        }

        /* ── Navbar ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 48px;
          background: rgba(248, 245, 237, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(11, 61, 46, 0.08);
          z-index: 100;
        }
        .nav-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #0B3D2E;
          text-decoration: none;
          letter-spacing: -0.3px;
        }
        .nav-logo span { color: #C9962A; }
        .nav-links { display: flex; align-items: center; gap: 12px; }
        .btn-ghost {
          padding: 9px 20px;
          background: transparent;
          border: 1.5px solid #0B3D2E;
          color: #0B3D2E;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .btn-ghost:hover { background: #0B3D2E; color: #F8F5ED; }
        .btn-solid {
          padding: 9px 20px;
          background: #0B3D2E;
          color: #F8F5ED;
          border: 1.5px solid #0B3D2E;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .btn-solid:hover { background: #0a3326; }

        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 24px 80px;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: -200px; right: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(201, 150, 42, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero::after {
          content: '';
          position: absolute;
          bottom: -100px; left: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(11, 61, 46, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(11, 61, 46, 0.07);
          border: 1px solid rgba(11, 61, 46, 0.15);
          border-radius: 99px;
          font-size: 12px;
          font-weight: 500;
          color: #0B3D2E;
          margin-bottom: 32px;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }
        .hero-badge::before {
          content: '';
          width: 6px; height: 6px;
          background: #C9962A;
          border-radius: 50%;
        }
        .hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(42px, 7vw, 80px);
          line-height: 1.08;
          letter-spacing: -1.5px;
          color: #0B3D2E;
          max-width: 820px;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }
        .hero-title em {
          font-style: italic;
          color: #C9962A;
        }
        .hero-sub {
          font-size: 18px;
          font-weight: 300;
          color: #4A6358;
          max-width: 520px;
          line-height: 1.65;
          margin-bottom: 44px;
          position: relative;
          z-index: 1;
        }
        .hero-ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        .btn-hero-primary {
          padding: 14px 32px;
          background: #0B3D2E;
          color: #F8F5ED;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 24px rgba(11, 61, 46, 0.22);
        }
        .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(11, 61, 46, 0.3); background: #0a3326; }
        .btn-hero-secondary {
          padding: 14px 32px;
          background: transparent;
          color: #0B3D2E;
          border: 1.5px solid rgba(11, 61, 46, 0.3);
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-hero-secondary:hover { border-color: #0B3D2E; background: rgba(11, 61, 46, 0.05); }
        .hero-note {
          margin-top: 18px;
          font-size: 13px;
          color: #8A9E94;
          font-weight: 300;
        }

        /* ── Stats strip ── */
        .stats {
          display: flex;
          justify-content: center;
          gap: 0;
          border-top: 1px solid rgba(11, 61, 46, 0.1);
          border-bottom: 1px solid rgba(11, 61, 46, 0.1);
          background: #fff;
          overflow: hidden;
        }
        .stat {
          flex: 1;
          max-width: 240px;
          padding: 32px 24px;
          text-align: center;
          border-right: 1px solid rgba(11, 61, 46, 0.08);
        }
        .stat:last-child { border-right: none; }
        .stat-num {
          font-family: 'DM Serif Display', serif;
          font-size: 36px;
          color: #0B3D2E;
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-num span { color: #C9962A; }
        .stat-label { font-size: 13px; color: #6B7B72; font-weight: 400; }

        /* ── Features ── */
        .features {
          padding: 96px 48px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #C9962A;
          margin-bottom: 16px;
        }
        .section-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(30px, 4vw, 46px);
          color: #0B3D2E;
          line-height: 1.15;
          letter-spacing: -0.5px;
          max-width: 500px;
          margin-bottom: 56px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .feature-card {
          background: #fff;
          border: 1px solid rgba(11, 61, 46, 0.1);
          border-radius: 16px;
          padding: 32px;
          transition: all 0.22s ease;
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(11, 61, 46, 0.1); }
        .feature-icon {
          width: 44px; height: 44px;
          background: rgba(11, 61, 46, 0.07);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          margin-bottom: 20px;
        }
        .feature-title {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #0B3D2E;
          margin-bottom: 10px;
          line-height: 1.2;
        }
        .feature-desc {
          font-size: 15px;
          color: #5A7268;
          line-height: 1.65;
          font-weight: 300;
        }

        /* ── CTA Banner ── */
        .cta-banner {
          margin: 0 48px 96px;
          background: #0B3D2E;
          border-radius: 24px;
          padding: 64px 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
        }
        .cta-banner::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 260px; height: 260px;
          background: rgba(201, 150, 42, 0.15);
          border-radius: 50%;
        }
        .cta-title {
          font-family: 'DM Serif Display', serif;
          font-size: 36px;
          color: #F8F5ED;
          line-height: 1.15;
          max-width: 480px;
          position: relative;
        }
        .cta-title em { font-style: italic; color: #C9962A; }
        .btn-cta {
          padding: 14px 32px;
          background: #C9962A;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          position: relative;
        }
        .btn-cta:hover { background: #b8852a; transform: translateY(-1px); }

        /* ── Footer ── */
        .footer {
          padding: 32px 48px;
          border-top: 1px solid rgba(11, 61, 46, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 18px;
          color: #0B3D2E;
        }
        .footer-logo span { color: #C9962A; }
        .footer-copy { font-size: 13px; color: #8A9E94; font-weight: 300; }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .nav { padding: 16px 20px; }
          .features { padding: 64px 20px; }
          .cta-banner { margin: 0 20px 64px; padding: 40px 28px; }
          .stats { flex-wrap: wrap; }
          .stat { min-width: 150px; }
          .footer { padding: 24px 20px; flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* ── Navbar ──────────────────────────────── */}
      <nav className="nav">
        <Link href="/">
          <Logo size={28} />
        </Link>
        <div className="nav-links">
          <Link href="/login" className="btn-ghost">Sign In</Link>
          <Link href="/register" className="btn-solid">Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────── */}
      <section className="hero">
        <div className="hero-badge">Built for Nigerian SMEs</div>
        <h1 className="hero-title">
          Pay your team.<br />
          Build their <em>financial identity.</em>
        </h1>
        <p className="hero-sub">
          SachaPay handles salary disbursement and creates a verified financial
          record for every worker — from first payment to financial history.
        </p>
        <div className="hero-ctas">
          <Link href="/register" className="btn-hero-primary">Register Your Company</Link>
          <Link href="/register?tab=join" className="btn-hero-secondary">Join Your Team →</Link>
        </div>
        <p className="hero-note">No credit card required</p>
      </section>

      {/* ── Stats ───────────────────────────────── */}
      <div className="stats">
        <div className="stat">
          <div className="stat-num">5<span>min</span></div>
          <div className="stat-label">To run your first payroll</div>
        </div>
        <div className="stat">
          <div className="stat-num">100<span>%</span></div>
          <div className="stat-label">Digital payroll records</div>
        </div>
        <div className="stat">
          <div className="stat-num">₦0</div>
          <div className="stat-label">Setup cost for SMEs</div>
        </div>
      </div>

      {/* ── Features ────────────────────────────── */}
      <section className="features">
        <p className="section-label">What SachaPay does</p>
        <h2 className="section-title">Everything your payroll needs, nothing it doesn't.</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3 className="feature-title">Salary Disbursement</h3>
            <p className="feature-desc">
              Create a payroll run, approve it, and disburse — all from one screen.
              Direct to any Nigerian bank account.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 className="feature-title">Worker Financial Passport</h3>
            <p className="feature-desc">
              Every worker builds a verified payment history. A portable financial
              identity they own — beyond any single employer.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 className="feature-title">Attendance & Eligibility</h3>
            <p className="feature-desc">
              Clock-in records feed directly into payroll eligibility.
              No manual spreadsheets. No disputes.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────── */}
      <div className="cta-banner">
        <h2 className="cta-title">
          Ready to run <em>proper</em> payroll for your team?
        </h2>
        <Link href="/register" className="btn-cta">Start for free →</Link>
      </div>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="footer">
        <Logo size={24} />
        <p className="footer-copy">© 2025 SachaPay · Built for Nigerian SMEs</p>
      </footer>
    </>
  );
}