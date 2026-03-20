"use client";
// ─────────────────────────────────────────────
// SachaPay — Login Page
// File: src/app/login/page.tsx
// ─────────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

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
      if (!res.ok) { setError(data.message || "Invalid email or password"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.organization) localStorage.setItem("organization", JSON.stringify(data.organization));
      router.push("/dashboard");
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; background: #F8F5ED; }

        .page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .panel-left { display: none; }
          .panel-right { padding: 32px 20px !important; }
        }

        .panel-left {
          background: #0B3D2E; padding: 56px;
          display: flex; flex-direction: column; justify-content: space-between;
          position: sticky; top: 0; height: 100vh; overflow: hidden;
        }
        .panel-left::before {
          content: ''; position: absolute; bottom: -80px; left: -80px;
          width: 320px; height: 320px; background: rgba(201,150,42,0.1); border-radius: 50%;
        }
        .logo { font-family: 'DM Serif Display', serif; font-size: 24px; color: #F8F5ED; text-decoration: none; position: relative; }
        .logo span { color: #C9962A; }

        .panel-content { position: relative; }
        .quote-mark { font-family: 'DM Serif Display', serif; font-size: 72px; color: rgba(201,150,42,0.25); line-height: 0.8; margin-bottom: 16px; }
        .quote-text { font-family: 'DM Serif Display', serif; font-size: 26px; color: #F8F5ED; line-height: 1.35; margin-bottom: 20px; }
        .quote-text em { color: #C9962A; font-style: italic; }
        .quote-sub { font-size: 14px; color: rgba(248,245,237,0.45); line-height: 1.7; }

        .panel-footer { font-size: 12px; color: rgba(248,245,237,0.25); position: relative; }

        .panel-right {
          display: flex; flex-direction: column; justify-content: center;
          align-items: center; padding: 48px; min-height: 100vh;
        }
        .form-wrap { width: 100%; max-width: 420px; }

        .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #6B7280; text-decoration: none; margin-bottom: 40px; }
        .back-link:hover { color: #0B3D2E; }

        .mobile-logo { font-family: 'DM Serif Display', serif; font-size: 22px; color: #0B3D2E; text-decoration: none; display: none; margin-bottom: 28px; }
        .mobile-logo span { color: #C9962A; }
        @media (max-width: 768px) { .mobile-logo { display: block; } }

        .form-title { font-family: 'DM Serif Display', serif; font-size: 34px; color: #0B3D2E; margin-bottom: 8px; }
        .form-sub { font-size: 15px; color: #6B7B72; font-weight: 300; margin-bottom: 32px; }

        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 13px; font-weight: 600; color: #3A5248; margin-bottom: 7px; }
        .field input { width: 100%; padding: 13px 16px; border: 1.5px solid rgba(11,61,46,0.18); border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 15px; color: #1A1A1A; background: #fff; outline: none; transition: all 0.18s; }
        .field input:focus { border-color: #0B3D2E; box-shadow: 0 0 0 3px rgba(11,61,46,0.08); }
        .field input::placeholder { color: #B0BDB8; }

        .btn-submit { width: 100%; padding: 14px; background: #0B3D2E; color: #F8F5ED; border: none; border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
        .btn-submit:hover:not(:disabled) { background: #0a3326; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(11,61,46,0.25); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .error-box { padding: 12px 14px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; font-size: 14px; color: #B91C1C; margin-bottom: 16px; }

        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(11,61,46,0.1); }
        .divider span { font-size: 12px; color: #9AADA6; }

        .form-footer { text-align: center; font-size: 14px; color: #6B7B72; }
        .form-footer a { color: #0B3D2E; font-weight: 600; text-decoration: none; }
        .form-footer a:hover { text-decoration: underline; }
      `}</style>

      <div className="page">

        {/* ── Left Panel ── */}
        <div className="panel-left">
          <a href="/" className="logo">Sasha<span>Pay</span></a>

          <div className="panel-content">
            <div className="quote-mark">"</div>
            <p className="quote-text">
              The worker who can <em>prove their income</em><br />
              will always get the loan.
            </p>
            <p className="quote-sub">
              SachaPay gives every Nigerian worker a verified financial identity — built from every salary payment they've ever received.
            </p>
          </div>

          <p className="panel-footer">© 2026 SachaPay · Payroll & Financial Identity</p>
        </div>

        {/* ── Right Panel ── */}
        <div className="panel-right">
          <div className="form-wrap">

            <Link href="/" className="back-link">← Back to home</Link>
            <Link href="/" className="mobile-logo">Sasha<span>Pay</span></Link>

            <h1 className="form-title">Welcome back</h1>
            <p className="form-sub">Sign in to your SachaPay account</p>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Email address</label>
                <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="btn-submit" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>

            <div className="divider"><span>new to SachaPay?</span></div>

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
