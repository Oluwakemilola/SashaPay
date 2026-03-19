"use client";
// ─────────────────────────────────────────────
// File: src/app/register/page.tsx
// SachaPay — Register Page
// ─────────────────────────────────────────────

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy, ArrowRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<"company" | "join">(
    searchParams.get("tab") === "join" ? "join" : "company"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [orgForm, setOrgForm] = useState({
    orgName:       "",
    orgEmail:      "",
    orgPhone:      "",
    industry:      "",
    adminName:     "",
    adminEmail:    "",
    adminPassword: "",
    payrollPolicy: "FIXED_SALARY",
  });

  const [joinForm, setJoinForm] = useState({
    name:       "",
    email:      "",
    password:   "",
    inviteCode: "",
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [regInviteCode, setRegInviteCode]       = useState("");

  const handleRegisterOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/register-org`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(orgForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }
      localStorage.setItem("token",        data.token);
      localStorage.setItem("user",         JSON.stringify(data.user));
      localStorage.setItem("organization", JSON.stringify(data.organization));
      setRegInviteCode(data.organization?.inviteCode || data.inviteCode || "");
      setShowSuccessModal(true);
    } catch {
      setError("Could not connect to server. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(joinForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not join team");
        return;
      }
      localStorage.setItem("token",        data.token);
      localStorage.setItem("user",         JSON.stringify(data.user));
      localStorage.setItem("organization", JSON.stringify(data.organization));
      router.push("/dashboard");
    } catch {
      setError("Could not connect to server. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-container {
          font-family: 'Outfit', sans-serif;
          background: #F8F5ED;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        @media (max-width: 900px) {
          .page-container { grid-template-columns: 1fr; }
          .panel-left { display: none; }
        }

        @media (max-width: 600px) {
          .panel-right { padding: 24px 16px !important; }
          .form-card { padding: 24px !important; border-radius: 20px !important; }
        }

        .panel-left {
          background: #0B3D2E;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: white;
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
          background: rgba(201,150,42,0.1);
          border-radius: 50%;
        }

        .panel-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 24px;
          color: #F8F5ED;
          position: relative;
        }
        .panel-logo span { color: #C9962A; }

        .panel-headline {
          font-family: 'DM Serif Display', serif;
          font-size: 44px;
          line-height: 1.1;
          margin-bottom: 20px;
          position: relative;
        }
        .panel-headline em { color: #C9962A; font-style: italic; }
        .panel-sub { color: rgba(255,255,255,0.6); font-size: 15px; margin-bottom: 40px; line-height: 1.6; }

        .step-item { display: flex; gap: 16px; margin-bottom: 20px; position: relative; }
        .step-icon {
          width: 32px; height: 32px;
          background: rgba(201,150,42,0.2);
          border: 1px solid rgba(201,150,42,0.4);
          color: #C9962A;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-weight: bold;
          font-size: 13px;
        }
        .step-body h4 { font-size: 14px; font-weight: 600; color: #F8F5ED; margin-bottom: 2px; }
        .step-body p  { font-size: 13px; color: rgba(248,245,237,0.5); }

        .panel-right {
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow-y: auto;
        }

        .form-card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          max-width: 520px;
          width: 100%;
          margin: 0 auto;
        }

        .tab-bar {
          display: flex;
          background: #F3F4F6;
          padding: 4px;
          border-radius: 12px;
          margin-bottom: 28px;
        }
        .tab-btn {
          flex: 1; padding: 10px;
          border: none; border-radius: 8px;
          font-weight: 600; cursor: pointer;
          transition: all 0.2s;
          color: #6B7280;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
        }
        .tab-btn.active { background: white; color: #0B3D2E; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .field input, .field select {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: #1A1A1A;
          background: #fff;
        }
        .field input:focus, .field select:focus { border-color: #0B3D2E; box-shadow: 0 0 0 3px rgba(11,61,46,0.08); }
        .field input::placeholder { color: #B0BDB8; }

        .policy-card {
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          overflow: hidden;
        }
        .policy-option {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .policy-option:first-child { border-bottom: 1px solid #E5E7EB; }
        .policy-option:hover { background: #F8F5ED; }
        .policy-option.selected { background: #F0F7F4; border-left: 3px solid #0B3D2E; }
        .policy-radio {
          width: 18px; height: 18px;
          border: 2px solid #E5E7EB;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 2px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .policy-option.selected .policy-radio { border-color: #0B3D2E; }
        .policy-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #0B3D2E;
          display: none;
        }
        .policy-option.selected .policy-dot { display: block; }
        .policy-title { font-size: 14px; font-weight: 600; color: #0B3D2E; margin-bottom: 2px; }
        .policy-desc  { font-size: 12px; color: #6B7B72; line-height: 1.5; }

        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }

        .btn-primary {
          width: 100%;
          background: #0B3D2E;
          color: white;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
        }
        .btn-primary:hover:not(:disabled) { background: #0a3326; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .error-box {
          background: #FEF2F2;
          color: #DC2626;
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          border: 1px solid #FECACA;
        }

        .section-divider {
          display: flex; align-items: center; gap: 10px;
          margin: 20px 0 16px;
        }
        .section-divider::before, .section-divider::after {
          content: ''; flex: 1; height: 1px; background: #E5E7EB;
        }
        .section-divider span { font-size: 11px; color: #9AADA6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
      `}</style>

      {/* ── Left Panel ── */}
      <div className="panel-left">
        <div className="panel-logo">
          Sasha<span>Pay</span>
        </div>

        <div>
          <h1 className="panel-headline">
            {tab === "company" ? (
              <>Scale your team,<br /><em>automate finance.</em></>
            ) : (
              <>Your earnings,<br /><em>your identity.</em></>
            )}
          </h1>
          <p className="panel-sub">
            SachaPay is building the next generation of payroll and financial
            identity infrastructure for Nigerian SMEs.
          </p>

          {tab === "company" ? (
            <>
              <div className="step-item">
                <div className="step-icon">1</div>
                <div className="step-body">
                  <h4>Register your company</h4>
                  <p>Set up your organisation profile in seconds</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-icon">2</div>
                <div className="step-body">
                  <h4>Choose your payroll policy</h4>
                  <p>Fixed salary or attendance-based — you decide</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-icon">3</div>
                <div className="step-body">
                  <h4>Invite your team</h4>
                  <p>Share your code and run payroll in minutes</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="step-item">
                <div className="step-icon">1</div>
                <div className="step-body">
                  <h4>Get invite code from admin</h4>
                  <p>Ask your manager for the current invite code</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-icon">2</div>
                <div className="step-body">
                  <h4>Create your account</h4>
                  <p>Join your organisation in seconds</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-icon">3</div>
                <div className="step-body">
                  <h4>Build your financial identity</h4>
                  <p>Every salary payment builds your verified history</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ fontSize: 12, color: "rgba(248,245,237,0.3)" }}>
          © 2026 SachaPay
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="panel-right">
        <div className="form-card">
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#0B3D2E", marginBottom: 6 }}>
              Get Started
            </h2>
            <p style={{ color: "#6B7B72", fontSize: 14 }}>
              Join the ecosystem of verified financial identities.
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
              Join Team
            </button>
          </div>

          {error && <div className="error-box">{error}</div>}

          {/* ════════════════════════════════
              TAB 1 — Register Company
          ════════════════════════════════ */}
          {tab === "company" && (
            <form onSubmit={handleRegisterOrg}>

              <div className="section-divider"><span>Company details</span></div>

              <div className="field-row">
                <div className="field">
                  <label>Company name *</label>
                  <input
                    type="text" required
                    placeholder="Acme Ltd"
                    value={orgForm.orgName}
                    onChange={e => setOrgForm({ ...orgForm, orgName: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Industry</label>
                  <select value={orgForm.industry} onChange={e => setOrgForm({ ...orgForm, industry: e.target.value })}>
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance & Banking</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Non-Profit">Non-Profit / NGO</option>
                    <option value="General">Other</option>
                  </select>
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Company email *</label>
                  <input
                    type="email" required
                    placeholder="info@acme.com"
                    value={orgForm.orgEmail}
                    onChange={e => setOrgForm({ ...orgForm, orgEmail: e.target.value })}
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

              {/* ── Payroll policy ── */}
              <div className="field" style={{ marginTop: 4 }}>
                <label style={{ marginBottom: 10 }}>Payroll policy *</label>
                <div className="policy-card">
                  <div
                    className={`policy-option ${orgForm.payrollPolicy === "FIXED_SALARY" ? "selected" : ""}`}
                    onClick={() => setOrgForm({ ...orgForm, payrollPolicy: "FIXED_SALARY" })}
                  >
                    <div className="policy-radio"><div className="policy-dot" /></div>
                    <div>
                      <div className="policy-title">Fixed Salary</div>
                      <div className="policy-desc">All active workers receive their full salary every month regardless of attendance.</div>
                    </div>
                  </div>
                  <div
                    className={`policy-option ${orgForm.payrollPolicy === "ATTENDANCE_BASED" ? "selected" : ""}`}
                    onClick={() => setOrgForm({ ...orgForm, payrollPolicy: "ATTENDANCE_BASED" })}
                  >
                    <div className="policy-radio"><div className="policy-dot" /></div>
                    <div>
                      <div className="policy-title">Attendance Based</div>
                      <div className="policy-desc">Workers must meet a minimum attendance threshold to qualify for salary payment.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-divider"><span>Admin account</span></div>

              <div className="field-row">
                <div className="field">
                  <label>Your full name *</label>
                  <input
                    type="text" required
                    placeholder="Oluwakemi Adeyemi"
                    value={orgForm.adminName}
                    onChange={e => setOrgForm({ ...orgForm, adminName: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Your email *</label>
                  <input
                    type="email" required
                    placeholder="you@acme.com"
                    value={orgForm.adminEmail}
                    onChange={e => setOrgForm({ ...orgForm, adminEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="field">
                <label>Password *</label>
                <input
                  type="password" required minLength={8}
                  placeholder="At least 8 characters"
                  value={orgForm.adminPassword}
                  onChange={e => setOrgForm({ ...orgForm, adminPassword: e.target.value })}
                />
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Creating organisation..." : "Create Organisation →"}
              </button>
            </form>
          )}

          {/* ════════════════════════════════
              TAB 2 — Join Team
          ════════════════════════════════ */}
          {tab === "join" && (
            <form onSubmit={handleJoinTeam}>
              <div className="field">
                <label>Invite code *</label>
                <input
                  type="text" required
                  placeholder="e.g. AB12CD"
                  value={joinForm.inviteCode}
                  onChange={e => setJoinForm({ ...joinForm, inviteCode: e.target.value.toUpperCase() })}
                  style={{ letterSpacing: "3px", fontWeight: 700, fontSize: 18 }}
                />
              </div>

              <div className="section-divider"><span>Your details</span></div>

              <div className="field">
                <label>Full name *</label>
                <input
                  type="text" required
                  placeholder="Tunde Okonkwo"
                  value={joinForm.name}
                  onChange={e => setJoinForm({ ...joinForm, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Email address *</label>
                <input
                  type="email" required
                  placeholder="you@email.com"
                  value={joinForm.email}
                  onChange={e => setJoinForm({ ...joinForm, email: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Password *</label>
                <input
                  type="password" required minLength={8}
                  placeholder="At least 8 characters"
                  value={joinForm.password}
                  onChange={e => setJoinForm({ ...joinForm, password: e.target.value })}
                />
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Joining team..." : "Join Team →"}
              </button>
            </form>
          )}

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#6B7B72" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#0B3D2E", fontWeight: 700, textDecoration: "none" }}>
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* ── Success modal ── */}
      {showSuccessModal && (
        <SuccessModal
          code={regInviteCode}
          onClose={() => router.push("/dashboard")}
        />
      )}
    </div>
  );
}

// ── Success modal ─────────────────────────────
function SuccessModal({ code, onClose }: { code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(11,61,46,0.5)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50, padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: 40,
        maxWidth: 420, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72,
          background: "#F0FDF4", color: "#059669",
          borderRadius: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <CheckCircle size={36} />
        </div>

        <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#0B3D2E", marginBottom: 8 }}>
          Organisation created!
        </h3>
        <p style={{ color: "#6B7B72", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Share this invite code with your staff so they can join SachaPay.
        </p>

        <div style={{
          background: "#F8F5ED",
          border: "2px dashed #C9962A",
          borderRadius: 16, padding: 24,
          marginBottom: 24,
          position: "relative",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#C9962A", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
            Invite Code
          </div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: "#0B3D2E", letterSpacing: 6 }}>
            {code}
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              width: 36, height: 36, borderRadius: 10,
              background: copied ? "#059669" : "#fff",
              border: "1px solid #E8EDE8",
              color: copied ? "#fff" : "#9AADA6",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "14px",
            background: "#0B3D2E", color: "#F8F5ED",
            border: "none", borderRadius: 12,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 15, fontWeight: 700,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          Continue to Dashboard <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: "center", fontFamily: "Outfit, sans-serif" }}>Loading...</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
