"use client";
// ─────────────────────────────────────────────
// File: src/app/register/page.tsx
// SachaPay — Register Page
// ─────────────────────────────────────────────
// This page handles TWO types of registration:
//   Tab 1: "New Company"  → POST /api/auth/register-org
//   Tab 2: "Join Team"    → POST /api/auth/register
//
// After success → saves JWT to localStorage → redirects to /dashboard
//
// HOW TO READ THIS FILE:
//   1. State variables (useState) — track what's typed in the form
//   2. handleRegisterOrg — sends the "new company" form to your backend
//   3. handleJoinTeam — sends the "join with invite code" form
//   4. The return() block is the actual HTML/UI
// ─────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Logo from "@/components/brand/Logo";

// ── Your backend URL ─────────────────────────
// Make sure you have NEXT_PUBLIC_API_URL in your .env.local file
// e.g.: NEXT_PUBLIC_API_URL=http://localhost:3000
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─────────────────────────────────────────────
// Inner component (needs useSearchParams)
// ─────────────────────────────────────────────
function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ── Which tab is active: "company" or "join" ──
    const [tab, setTab] = useState<"company" | "join">(
        searchParams.get("tab") === "join" ? "join" : "company"
    );

    // ── Loading & error state ─────────────────
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ── "Register Company" form fields ────────
    const [orgForm, setOrgForm] = useState({
        orgName: "",
        orgEmail: "",
        orgPhone: "",
        industry: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
    });

    // ── "Join Team" form fields ────────────────
    const [joinForm, setJoinForm] = useState({
        name: "",
        email: "",
        password: "",
        inviteCode: "",
    });

    // ── Handle "Register Company" submit ──────
    const handleRegisterOrg = async (e: React.FormEvent) => {
        e.preventDefault();   // stops page from refreshing
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API}/api/auth/register-org`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Send your form data to the backend
                body: JSON.stringify(orgForm),
            });

            const data = await res.json();

            if (!res.ok) {
                // Backend returned an error (e.g. email already exists)
                setError(data.message || "Registration failed");
                return;
            }

            // ── Success: save the JWT and user info ──
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("organization", JSON.stringify(data.organization));

            // ── Show the invite code before redirecting ──
            alert(`✅ Company registered!\n\nYour invite code: ${data.inviteCode}\n\nShare this with your staff so they can join.`);

            // ── Go to dashboard ──────────────────────
            router.push("/dashboard");
        } catch {
            setError("Could not connect to server. Is your backend running?");
        } finally {
            setLoading(false);
        }
    };

    // ── Handle "Join Team" submit ──────────────
    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(joinForm),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Could not join team");
                return;
            }

            // Save JWT
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("organization", JSON.stringify(data.organization));

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

        /* ── Page layout ── */
        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .panel-left { display: none; }
        }

        /* ── Left decorative panel ── */
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
          top: -80px; right: -80px;
          width: 300px; height: 300px;
          background: rgba(201, 150, 42, 0.12);
          border-radius: 50%;
        }
        .panel-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #F8F5ED;
          text-decoration: none;
        }
        .panel-logo span { color: #C9962A; }
        .panel-headline {
          font-family: 'DM Serif Display', serif;
          font-size: 42px;
          color: #F8F5ED;
          line-height: 1.12;
          letter-spacing: -0.5px;
          position: relative;
        }
        .panel-headline em { font-style: italic; color: #C9962A; }
        .panel-headline p {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: rgba(248, 245, 237, 0.65);
          margin-top: 16px;
          line-height: 1.6;
        }
        .panel-steps { position: relative; }
        .step {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 20px;
          position: relative;
        }
        .step:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 15px;
          top: 32px;
          width: 1px;
          height: calc(100% + 4px);
          background: rgba(248, 245, 237, 0.15);
        }
        .step-num {
          width: 32px; height: 32px;
          background: rgba(201, 150, 42, 0.2);
          border: 1px solid rgba(201, 150, 42, 0.4);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #C9962A;
          flex-shrink: 0;
        }
        .step-body h4 {
          font-size: 14px;
          font-weight: 500;
          color: #F8F5ED;
          margin-bottom: 3px;
        }
        .step-body p {
          font-size: 13px;
          color: rgba(248, 245, 237, 0.5);
          font-weight: 300;
          line-height: 1.5;
        }

        /* ── Right form panel ── */
        .panel-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px;
          overflow-y: auto;
          max-height: 100vh;
        }
        .form-header { margin-bottom: 32px; }
        .form-header a {
          font-family: 'DM Serif Display', serif;
          font-size: 20px;
          color: #0B3D2E;
          text-decoration: none;
          display: block;
          margin-bottom: 24px;
        }
        .form-header a span { color: #C9962A; }
        .form-title {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: #0B3D2E;
          line-height: 1.15;
          margin-bottom: 8px;
        }
        .form-sub {
          font-size: 15px;
          color: #6B7B72;
          font-weight: 300;
        }

        /* ── Tab switcher ── */
        .tab-bar {
          display: flex;
          gap: 0;
          background: rgba(11, 61, 46, 0.06);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 28px;
        }
        .tab-btn {
          flex: 1;
          padding: 10px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #6B7B72;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .tab-btn.active {
          background: #0B3D2E;
          color: #F8F5ED;
        }

        /* ── Form fields ── */
        .form { display: flex; flex-direction: column; gap: 14px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field label {
          font-size: 13px;
          font-weight: 500;
          color: #3A5248;
        }
        .field input, .field select {
          padding: 12px 14px;
          border: 1.5px solid rgba(11, 61, 46, 0.18);
          border-radius: 9px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          color: #1A1A1A;
          background: #fff;
          outline: none;
          transition: border-color 0.18s;
          width: 100%;
        }
        .field input:focus, .field select:focus {
          border-color: #0B3D2E;
          box-shadow: 0 0 0 3px rgba(11, 61, 46, 0.08);
        }
        .field input::placeholder { color: #B0BDB8; }

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

        /* ── Submit button ── */
        .btn-submit {
          width: 100%;
          padding: 14px;
          background: #0B3D2E;
          color: #F8F5ED;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 6px;
        }
        .btn-submit:hover:not(:disabled) { background: #0a3326; transform: translateY(-1px); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* ── Error box ── */
        .error-box {
          padding: 12px 14px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          font-size: 14px;
          color: #B91C1C;
          line-height: 1.5;
        }

        /* ── Footer link ── */
        .form-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #6B7B72;
        }
        .form-footer a { color: #0B3D2E; font-weight: 500; text-decoration: none; }
        .form-footer a:hover { text-decoration: underline; }
      `}</style>

            <div className="page">

                {/* ── Left decorative panel ──────────────── */}
                <div className="panel-left">
                    <Link href="/">
                        <Logo size={32} variant="inverted" />
                    </Link>

                    <div className="panel-headline">
                        {tab === "company" ? (
                            <>Your business,<br /><em>properly paid.</em></>
                        ) : (
                            <>Your team,<br /><em>your passport.</em></>
                        )}
                        <p>
                            {tab === "company"
                                ? "Register your SME and run payroll in minutes. Your staff get a financial identity with every payment."
                                : "Join your organisation with an invite code. Start building your verified payment history today."}
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="panel-steps">
                        {tab === "company" ? (
                            <>
                                <div className="step">
                                    <div className="step-num">1</div>
                                    <div className="step-body">
                                        <h4>Register your company</h4>
                                        <p>Fill in your org details and create your admin account</p>
                                    </div>
                                </div>
                                <div className="step">
                                    <div className="step-num">2</div>
                                    <div className="step-body">
                                        <h4>Share the invite code</h4>
                                        <p>Send your team the code to join your organisation</p>
                                    </div>
                                </div>
                                <div className="step">
                                    <div className="step-num">3</div>
                                    <div className="step-body">
                                        <h4>Run payroll</h4>
                                        <p>Create a run, approve it, disburse. Done.</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="step">
                                    <div className="step-num">1</div>
                                    <div className="step-body">
                                        <h4>Get invite code from your admin</h4>
                                        <p>Ask your manager or HR for the current invite code</p>
                                    </div>
                                </div>
                                <div className="step">
                                    <div className="step-num">2</div>
                                    <div className="step-body">
                                        <h4>Create your account</h4>
                                        <p>Fill in your details to join your organisation</p>
                                    </div>
                                </div>
                                <div className="step">
                                    <div className="step-num">3</div>
                                    <div className="step-body">
                                        <h4>Add your bank account</h4>
                                        <p>Link your account to receive salary payments</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Right form panel ────────────────────── */}
                <div className="panel-right">
                    <div className="form-header">
                        {/* Show logo on mobile since left panel is hidden */}
                        <Link href="/" style={{ marginBottom: 24, display: 'block' }}>
                            <Logo size={28} />
                        </Link>
                        <h1 className="form-title">
                            {tab === "company" ? "Register your company" : "Join your team"}
                        </h1>
                        <p className="form-sub">
                            {tab === "company"
                                ? "Set up your organisation in under 2 minutes"
                                : "Enter your invite code to get started"}
                        </p>
                    </div>

                    {/* ── Tab switcher ── */}
                    <div className="tab-bar">
                        <button
                            className={`tab-btn ${tab === "company" ? "active" : ""}`}
                            onClick={() => { setTab("company"); setError(""); }}
                        >
                            New Company
                        </button>
                        <button
                            className={`tab-btn ${tab === "join" ? "active" : ""}`}
                            onClick={() => { setTab("join"); setError(""); }}
                        >
                            Join with Invite
                        </button>
                    </div>

                    {/* ── Error message ── */}
                    {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}

                    {/* ════════════════════════════════════════
              TAB 1: Register Company form
              Calls POST /api/auth/register-org
          ════════════════════════════════════════ */}
                    {tab === "company" && (
                        <form className="form" onSubmit={handleRegisterOrg}>
                            <div className="divider"><span>Organisation details</span></div>

                            <div className="field-row">
                                <div className="field">
                                    <label>Company name *</label>
                                    <input
                                        type="text"
                                        placeholder="Acme Nigeria Ltd"
                                        value={orgForm.orgName}
                                        onChange={e => setOrgForm({ ...orgForm, orgName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>Industry</label>
                                    <select
                                        value={orgForm.industry}
                                        onChange={e => setOrgForm({ ...orgForm, industry: e.target.value })}
                                    >
                                        <option value="">Select industry</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Education">Education</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Agriculture">Agriculture</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                            </div>

                            <div className="field-row">
                                <div className="field">
                                    <label>Company email *</label>
                                    <input
                                        type="email"
                                        placeholder="info@acme.com"
                                        value={orgForm.orgEmail}
                                        onChange={e => setOrgForm({ ...orgForm, orgEmail: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>Phone number</label>
                                    <input
                                        type="tel"
                                        placeholder="08012345678"
                                        value={orgForm.orgPhone}
                                        onChange={e => setOrgForm({ ...orgForm, orgPhone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="divider"><span>Admin account</span></div>

                            <div className="field-row">
                                <div className="field">
                                    <label>Your full name *</label>
                                    <input
                                        type="text"
                                        placeholder="Oluwakemi Adeyemi"
                                        value={orgForm.adminName}
                                        onChange={e => setOrgForm({ ...orgForm, adminName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>Your email *</label>
                                    <input
                                        type="email"
                                        placeholder="you@acme.com"
                                        value={orgForm.adminEmail}
                                        onChange={e => setOrgForm({ ...orgForm, adminEmail: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label>Password *</label>
                                <input
                                    type="password"
                                    placeholder="At least 8 characters"
                                    value={orgForm.adminPassword}
                                    onChange={e => setOrgForm({ ...orgForm, adminPassword: e.target.value })}
                                    required
                                    minLength={8}
                                />
                            </div>

                            <button className="btn-submit" type="submit" disabled={loading}>
                                {loading ? "Creating organisation..." : "Register Company →"}
                            </button>
                        </form>
                    )}

                    {/* ════════════════════════════════════════
              TAB 2: Join Team form
              Calls POST /api/auth/register
          ════════════════════════════════════════ */}
                    {tab === "join" && (
                        <form className="form" onSubmit={handleJoinTeam}>
                            <div className="field">
                                <label>Invite code *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. AB12CD"
                                    value={joinForm.inviteCode}
                                    onChange={e => setJoinForm({ ...joinForm, inviteCode: e.target.value.toUpperCase() })}
                                    required
                                    style={{ textTransform: "uppercase", letterSpacing: "3px", fontWeight: 600, fontSize: 18 }}
                                />
                            </div>

                            <div className="divider"><span>Your details</span></div>

                            <div className="field">
                                <label>Full name *</label>
                                <input
                                    type="text"
                                    placeholder="Tunde Okonkwo"
                                    value={joinForm.name}
                                    onChange={e => setJoinForm({ ...joinForm, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>Email address *</label>
                                <input
                                    type="email"
                                    placeholder="you@email.com"
                                    value={joinForm.email}
                                    onChange={e => setJoinForm({ ...joinForm, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>Password *</label>
                                <input
                                    type="password"
                                    placeholder="At least 8 characters"
                                    value={joinForm.password}
                                    onChange={e => setJoinForm({ ...joinForm, password: e.target.value })}
                                    required
                                    minLength={8}
                                />
                            </div>

                            <button className="btn-submit" type="submit" disabled={loading}>
                                {loading ? "Joining team..." : "Join Team →"}
                            </button>
                        </form>
                    )}

                    <p className="form-footer">
                        Already have an account? <Link href="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────
// Wrapper with Suspense (required for useSearchParams in Next.js)
// ─────────────────────────────────────────────
export default function RegisterPage() {
    return (
        <Suspense>
            <RegisterForm />
        </Suspense>
    );
}