"use client";
// ─────────────────────────────────────────────
// SachaPay — Landing Page
// File: src/app/page.tsx
// ─────────────────────────────────────────────

import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; background: #F8F5ED; color: #1A1A1A; }

        /* ── Navbar ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 48px;
          background: rgba(248,245,237,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(11,61,46,0.08);
          z-index: 100;
        }
        @media (max-width: 640px) { .nav { padding: 16px 20px; } }
        .nav-links { display: flex; align-items: center; gap: 12px; }
        .btn-ghost { padding: 9px 20px; background: transparent; border: 1.5px solid #0B3D2E; color: #0B3D2E; border-radius: 8px; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500; text-decoration: none; transition: all 0.18s; }
        .btn-ghost:hover { background: #0B3D2E; color: #F8F5ED; }
        .btn-solid { padding: 9px 20px; background: #0B3D2E; color: #F8F5ED; border: 1.5px solid #0B3D2E; border-radius: 8px; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500; text-decoration: none; transition: all 0.18s; }
        .btn-solid:hover { background: #0a3326; }

        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 120px 64px 80px;
          gap: 56px;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; padding: 100px 24px 60px; }
          .hero-image { order: -1; height: 280px !important; }
          .hero-ctas { flex-wrap: wrap; }
        }
        @media (max-width: 640px) {
          .hero { padding: 90px 20px 48px; gap: 32px; }
        }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; background: rgba(11,61,46,0.07);
          border: 1px solid rgba(11,61,46,0.15); border-radius: 99px;
          font-size: 12px; font-weight: 600; color: #0B3D2E;
          margin-bottom: 24px; letter-spacing: 0.4px; text-transform: uppercase;
        }
        .hero-badge::before { content: ''; width: 6px; height: 6px; background: #C9962A; border-radius: 50%; }

        .hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(38px, 5vw, 62px);
          line-height: 1.08; letter-spacing: -1px;
          color: #0B3D2E; margin-bottom: 20px;
        }
        .hero-title em { font-style: italic; color: #C9962A; }

        .hero-sub {
          font-size: 17px; font-weight: 300; color: #4A6358;
          max-width: 480px; line-height: 1.75; margin-bottom: 36px;
        }

        .hero-ctas { display: flex; gap: 12px; margin-bottom: 20px; }
        .btn-hero-primary { padding: 14px 28px; background: #0B3D2E; color: #F8F5ED; border: none; border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; transition: all 0.2s; box-shadow: 0 4px 24px rgba(11,61,46,0.22); display: inline-block; }
        .btn-hero-primary:hover { transform: translateY(-2px); background: #0a3326; }
        .btn-hero-secondary { padding: 14px 28px; background: transparent; color: #0B3D2E; border: 1.5px solid rgba(11,61,46,0.3); border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 500; text-decoration: none; transition: all 0.2s; display: inline-block; }
        .btn-hero-secondary:hover { border-color: #0B3D2E; }

        .hero-note { font-size: 12px; color: #8A9E94; }

        /* ── Hero image ── */
        .hero-image {
          border-radius: 24px; overflow: hidden;
          height: 480px; box-shadow: 0 24px 80px rgba(11,61,46,0.18);
          position: relative;
        }
        .hero-image img { width: 100%; height: 100%; object-fit: cover; }
        .hero-image-overlay { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(11,61,46,0.25) 0%, transparent 50%); }
        .hero-image-card {
          position: absolute; bottom: 20px; left: 20px; right: 20px;
          background: rgba(11,61,46,0.88); backdrop-filter: blur(12px);
          border-radius: 14px; padding: 16px 20px;
          border: 1px solid rgba(201,150,42,0.25);
          display: flex; align-items: center; justify-content: space-between;
        }
        .hero-image-card p { color: #F8F5ED; font-size: 14px; font-weight: 600; }
        .hero-image-card span { color: #C9962A; font-size: 12px; }
        .hero-image-badge { background: rgba(201,150,42,0.2); border: 1px solid rgba(201,150,42,0.4); border-radius: 99px; padding: 4px 12px; color: #C9962A; font-size: 11px; font-weight: 700; white-space: nowrap; }

        /* ── Why section ── */
        .why { background: #0B3D2E; padding: 72px 48px; }
        @media (max-width: 640px) { .why { padding: 56px 24px; } }
        .why-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        @media (max-width: 768px) { .why-inner { grid-template-columns: 1fr; gap: 40px; } }
        .why-title { font-family: 'DM Serif Display', serif; font-size: clamp(28px, 4vw, 42px); color: #F8F5ED; line-height: 1.15; margin-bottom: 16px; }
        .why-title em { color: #C9962A; font-style: italic; }
        .why-sub { font-size: 15px; color: rgba(248,245,237,0.55); line-height: 1.75; }
        .why-list { display: flex; flex-direction: column; gap: 16px; }
        .why-item { display: flex; align-items: flex-start; gap: 14px; }
        .why-check { width: 24px; height: 24px; background: rgba(201,150,42,0.2); border: 1px solid rgba(201,150,42,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #C9962A; font-size: 12px; font-weight: 700; margin-top: 1px; }
        .why-item-text h4 { font-size: 15px; font-weight: 600; color: #F8F5ED; margin-bottom: 3px; }
        .why-item-text p { font-size: 13px; color: rgba(248,245,237,0.5); line-height: 1.6; }

        /* ── Stats ── */
        .stats { background: #fff; display: flex; justify-content: center; border-bottom: 1px solid rgba(11,61,46,0.08); flex-wrap: wrap; }
        .stat { flex: 1; min-width: 150px; max-width: 240px; padding: 32px 24px; text-align: center; border-right: 1px solid rgba(11,61,46,0.08); }
        .stat:last-child { border-right: none; }
        .stat-num { font-family: 'DM Serif Display', serif; font-size: 36px; color: #0B3D2E; line-height: 1; margin-bottom: 6px; }
        .stat-num span { color: #C9962A; }
        .stat-label { font-size: 13px; color: #6B7B72; }

        /* ── Features ── */
        .features { padding: 96px 48px; max-width: 1100px; margin: 0 auto; }
        @media (max-width: 640px) { .features { padding: 64px 20px; } }
        .section-label { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #C9962A; margin-bottom: 12px; }
        .section-title { font-family: 'DM Serif Display', serif; font-size: clamp(26px, 4vw, 40px); color: #0B3D2E; line-height: 1.15; max-width: 520px; margin-bottom: 48px; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .feature-card { background: #fff; border: 1px solid rgba(11,61,46,0.1); border-radius: 20px; padding: 32px; transition: all 0.22s; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(11,61,46,0.09); border-color: rgba(201,150,42,0.3); }
        .feature-icon { width: 48px; height: 48px; background: rgba(11,61,46,0.07); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; }
        .feature-title { font-family: 'DM Serif Display', serif; font-size: 21px; color: #0B3D2E; margin-bottom: 10px; }
        .feature-sub { font-size: 12px; font-weight: 700; color: #C9962A; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .feature-desc { font-size: 14px; color: #5A7268; line-height: 1.7; font-weight: 300; }

        /* ── CTA ── */
        .cta-section { padding: 0 48px 96px; }
        @media (max-width: 640px) { .cta-section { padding: 0 20px 64px; } }
        .cta-banner { background: #0B3D2E; border-radius: 24px; padding: 64px 56px; display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap; position: relative; overflow: hidden; }
        @media (max-width: 640px) { .cta-banner { padding: 40px 28px; } }
        .cta-banner::before { content: ''; position: absolute; top: -80px; right: -80px; width: 300px; height: 300px; background: rgba(201,150,42,0.12); border-radius: 50%; }
        .cta-content { position: relative; }
        .cta-title { font-family: 'DM Serif Display', serif; font-size: clamp(26px, 3.5vw, 38px); color: #F8F5ED; line-height: 1.2; margin-bottom: 10px; }
        .cta-title em { color: #C9962A; font-style: italic; }
        .cta-sub { font-size: 15px; color: rgba(248,245,237,0.5); }
        .btn-cta { padding: 16px 32px; background: #C9962A; color: #fff; border: none; border-radius: 12px; font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700; text-decoration: none; white-space: nowrap; position: relative; transition: all 0.2s; display: inline-block; }
        .btn-cta:hover { background: #b8852a; transform: translateY(-2px); }

        /* ── Footer ── */
        .footer { padding: 28px 48px; border-top: 1px solid rgba(11,61,46,0.1); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        @media (max-width: 640px) { .footer { padding: 24px 20px; flex-direction: column; align-items: flex-start; } }
        .footer-copy { font-size: 13px; color: #8A9E94; }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="nav">
        <Logo size={28} />
        <div className="nav-links">
          <Link href="/login" className="btn-ghost">Sign In</Link>
          <Link href="/register" className="btn-solid">Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: "#F8F5ED" }}>
        <div className="hero">
          <div>
            <div className="hero-badge">Payroll · Financial Identity · Nigeria</div>
            <h1 className="hero-title">
              Smarter Payroll.<br />
              <em>Zero Stress.</em>
            </h1>
            <p className="hero-sub">
              Manage salaries, track attendance, and pay your team — fast and accurately with SachaPay. Every worker gets a verified financial identity with every payment.
            </p>
            <div className="hero-ctas">
              <Link href="/register" className="btn-hero-primary">Get Started Free →</Link>
              <Link href="/register?tab=join" className="btn-hero-secondary">Join as Worker</Link>
            </div>
            <p className="hero-note">Free to set up · No credit card needed · Takes 2 minutes</p>
          </div>

          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80" alt="Team at work" />
            <div className="hero-image-overlay" />
            <div className="hero-image-card">
              <div>
                <p>March 2026 Payroll</p>
                <span>18 workers paid successfully</span>
              </div>
              <div className="hero-image-badge">₦2.4M disbursed ✓</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why SachaPay ── */}
      <div className="why">
        <div className="why-inner">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9962A", marginBottom: 12 }}>Why SachaPay</p>
            <h2 className="why-title">
              Everything your business needs<br />to <em>pay with confidence.</em>
            </h2>
            <p className="why-sub">
              Built specifically for Nigerian SMEs who want to move beyond manual bank transfers and give their workers the financial recognition they deserve.
            </p>
          </div>
          <div className="why-list">
            {[
              { title: "Automated salary calculations", desc: "Set salaries once. SachaPay handles the rest — no spreadsheets, no errors." },
              { title: "Attendance or fixed payment options", desc: "Choose between fixed monthly salary or attendance-based pay. You decide the rules." },
              { title: "Fast, secure, and reliable", desc: "Bulk disbursements processed in one click. Full audit trail for every payment." },
              { title: "Workers build financial history", desc: "Every payment creates a verified income record workers can use for loans and credit." },
            ].map(item => (
              <div key={item.title} className="why-item">
                <div className="why-check">✓</div>
                <div className="why-item-text">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats">
        <div className="stat"><div className="stat-num">5<span>min</span></div><div className="stat-label">To run your first payroll</div></div>
        <div className="stat"><div className="stat-num">₦<span>0</span></div><div className="stat-label">Setup cost for SMEs</div></div>
        <div className="stat"><div className="stat-num">100<span>%</span></div><div className="stat-label">Digital payment records</div></div>
      </div>

      {/* ── Core Features ── */}
      <section className="features">
        <p className="section-label">Core Features</p>
        <h2 className="section-title">Everything in one place. Nothing left out.</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💸</div>
            <p className="feature-sub">Smart Payroll</p>
            <h3 className="feature-title">Flexible payment systems</h3>
            <p className="feature-desc">Fixed salary or attendance-based pay — your choice. Create a run, approve it, and disburse to all workers in one click.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <p className="feature-sub">Attendance Tracking</p>
            <h3 className="feature-title">Real-time insights</h3>
            <p className="feature-desc">Workers clock in and out from their phones. Attendance data feeds directly into payroll eligibility — no manual counting.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🪪</div>
            <p className="feature-sub">Accurate Payments</p>
            <h3 className="feature-title">No errors, no delays</h3>
            <p className="feature-desc">Every worker gets paid the right amount, on time. And each payment builds their verified financial identity — a portable record they own.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <p className="feature-sub">AI Assistant</p>
            <h3 className="feature-title">Workers get answers instantly</h3>
            <p className="feature-desc">Workers can ask "Am I getting paid this month?" and get a real answer based on their actual data. No more chasing HR.</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-section">
        <div className="cta-banner">
          <div className="cta-content">
            <h2 className="cta-title">
              Simplify your payroll <em>today.</em>
            </h2>
            <p className="cta-sub">Start using SachaPay now — free setup, no credit card required.</p>
          </div>
          <Link href="/register" className="btn-cta">Start Free →</Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <Logo size={24} />
        <p className="footer-copy">© 2026 SachaPay · Payroll & Financial Identity for Nigerian SMEs</p>
      </footer>
    </>
  );
      }
