"use client";
// ─────────────────────────────────────────────
// SachaPay — Login Page
// File: src/app/login/page.tsx
// ─────────────────────────────────────────────
// Sends email + password to POST /api/auth/login
// On success → saves JWT → redirects to /dashboard
// ─────────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/brand/Logo";

const API = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";

export default function LoginPage() {
  const router = useRouter();

  // ── Form state ────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Form submit ───────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password");
        return;
      }

      // ── Save JWT and user info ─────────────
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.organization) {
        localStorage.setItem("organization", JSON.stringify(data.organization));
      }

      // ── Redirect to dashboard ──────────────
      router.push("/dashboard");
    } catch {
      setError("Could not connect to server. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; background: #F8F5ED; color: #1A1A1A; }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .panel-left { display: none; }
        }

        /* ── Left panel ── */
        .panel-left {
          background: #0B3D2E;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }
        .panel-left::before {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 320px; height: 320px;
          background: rgba(201, 150, 42, 0.1);
          border-radius: 50%;
        }
        .panel-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #F8F5ED;
          text-decoration: none;
        }
        .panel-logo span { color: #C9962A; }

        .panel-quote {
          position: relative;
        }
        .quote-mark {
          font-family: 'DM Serif Display', serif;
          font-size: 80px;
          color: rgba(201, 150, 42, 0.3);
          line-height: 0.8;
          margin-bottom: 12px;
        }
        .quote-text {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: #F8F5ED;
          line-height: 1.3;
          letter-spacing: -0.3px;
          margin-bottom: 16px;
        }
        .quote-text em { font-style: italic; color: #C9962A; }
        .quote-author {
          font-size: 14px;
          color: rgba(248, 245, 237, 0.5);
          font-weight: 300;
        }

        .panel-tagline {
          font-size: 14px;
          color: rgba(248, 245, 237, 0.4);
          font-weight: 300;
          line-height: 1.7;
        }

        /* ── Right form panel ── */
        .panel-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px;
          min-height: 100vh;
        }
        .form-wrap {
          width: 100%;
          max-width: 420px;
        }
        .form-header { margin-bottom: 40px; }
        .mobile-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #0B3D2E;
          text-decoration: none;
          display: block;
          margin-bottom: 32px;
        }
        .mobile-logo span { color: #C9962A; }
        .form-title {
          font-family: 'DM Serif Display', serif;
          font-size: 36px;
          color: #0B3D2E;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .form-sub {
          font-size: 15px;
          color: #6B7B72;
          font-weight: 300;
        }

        /* ── Fields ── */
        .form { display: flex; flex-direction: column; gap: 16px; }
        .field { display: flex; flex-direction: column; gap: 7px; }
        .field label {
          font-size: 13px;
          font-weight: 500;
          color: #3A5248;
        }
        .field input {
          padding: 13px 16px;
          border: 1.5px solid rgba(11, 61, 46, 0.18);
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          color: #1A1A1A;
          background: #fff;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          width: 100%;
        }
        .field input:focus {
          border-color: #0B3D2E;
          box-shadow: 0 0 0 3px rgba(11, 61, 46, 0.08);
        }
        .field input::placeholder { color: #B0BDB8; }

        .field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .field-header a {
          font-size: 12px;
          color: #0B3D2E;
          text-decoration: none;
          font-weight: 400;
        }
        .field-header a:hover { text-decoration: underline; }

        .btn-submit {
          width: 100%;
          padding: 15px;
          background: #0B3D2E;
          color: #F8F5ED;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }
        .btn-submit:hover:not(:disabled) { background: #0a3326; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(11, 61, 46, 0.25); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* ── Error ── */
        .error-box {
          padding: 12px 14px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          font-size: 14px;
          color: #B91C1C;
        }

        /* ── Divider ── */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(11, 61, 46, 0.1);
        }
        .divider span { font-size: 12px; color: #9AADA6; }

        /* ── Footer ── */
        .form-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: #6B7B72;
        }
        .form-footer a { color: #0B3D2E; font-weight: 500; text-decoration: none; }
        .form-footer a:hover { text-decoration: underline; }

        /* ── Back to home ── */
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6B7B72;
          text-decoration: none;
          margin-bottom: 36px;
          transition: color 0.15s;
        }
        .back-link:hover { color: #0B3D2E; }
      `}</style>

      <div className="page">

        <div className="panel-left">
          <Link href="/">
            <Logo size={32} variant="inverted" />
          </Link>

          <div className="panel-quote">
            <div className="quote-mark">"</div>
            <p className="quote-text">
              Every worker deserves a <em>verified</em> financial identity.
            </p>
            <p className="quote-author">SachaPay · Built for Nigerian SMEs</p>
          </div>

          <p className="panel-tagline">
            Salary disbursement + worker financial identity<br />
            for small and medium businesses across Nigeria.
          </p>
        </div>

        {/* ── Right form panel ────────────────────── */}
        <div className="panel-right">
          <div className="form-wrap">
            <Link href="/" className="back-link">
              ← Back to home
            </Link>

            <div className="form-header">
              {/* Mobile-only logo */}
              <Link href="/" style={{ marginBottom: 24, display: 'block' }}>
                <Logo size={28} />
              </Link>

              <h1 className="form-title">Welcome back</h1>
              <p className="form-sub">Sign in to your SachaPay account</p>
            </div>

            {/* ── Error message ── */}
            {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}

            {/* ── Login form ── */}
            <form className="form" onSubmit={handleLogin}>
              <div className="field">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="field">
                <div className="field-header">
                  <label>Password</label>
                  {/* You can add forgot password later */}
                </div>
                <input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="btn-submit" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>

            <div className="divider" style={{ marginTop: 20 }}><span>new to SachaPay?</span></div>

            <p className="form-footer">
              <Link href="/register">Register your company</Link>
              {" · "}
              <Link href="/register?tab=join">Join with invite code</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}