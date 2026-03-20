"use client";
// ─────────────────────────────────────────────
// SachaPay — Register Page
// File: src/app/register/page.tsx
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
    orgName: "", orgEmail: "", orgPhone: "", industry: "",
    adminName: "", adminEmail: "", adminPassword: "", payrollPolicy: "FIXED_SALARY",
  });
  const [joinForm, setJoinForm] = useState({ name: "", email: "", password: "", inviteCode: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [regInviteCode, setRegInviteCode] = useState("");

  const handleRegisterOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/auth/register-org`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orgForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("organization", JSON.stringify(data.organization));
      setRegInviteCode(data.organization?.inviteCode || data.inviteCode || "");
      setShowSuccessModal(true);
    } catch { setError("Could not connect to server. Please try again."); }
    finally { setLoading(false); }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(joinForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Could not join team"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("organization", JSON.stringify(data.organization));
      router.push("/dashboard");
    } catch { setError("Could not connect to server. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      fontFamily: "'Outfit', sans-serif",
      background: "#F8F5ED",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }

        @media screen and (max-width: 860px) {
          .reg-layout { grid-template-columns: 1fr !important; }
          .reg-panel-left { display: none !important; }
          .reg-panel-right { padding: 32px 20px !important; }
          .reg-card { padding: 28px 20px !important; }
          .reg-field-row { grid-template-columns: 1fr !important; }
        }

        .reg-panel-left {
          background: #0B3D2E;
          padding: 56px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
        }
        .reg-panel-left::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 300px; height: 300px;
          background: rgba(201,150,42,0.1);
          border-radius: 50%;
        }
        .reg-logo { font-family: 'DM Serif Display', serif; font-size: 24px; color: #F8F5ED; position: relative; }
        .reg-logo span { color: #C9962A; }
        .reg-headline { font-family: 'DM Serif Display', serif; font-size: 40px; line-height: 1.1; margin-bottom: 16px; color: #F8F5ED; position: relative; }
        .reg-headline em { color: #C9962A; font-style: italic; }
        .reg-sub { color: rgba(255,255,255,0.55); font-size: 14px; margin-bottom: 36px; line-height: 1.7; }
        .reg-step { display: flex; gap: 14px; margin-bottom: 18px; }
        .reg-step-num { width: 30px; height: 30px; background: rgba(201,150,42,0.2); border: 1px solid rgba(201,150,42,0.4); color: #C9962A; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 700; font-size: 13px; }
        .reg-step-title { font-size: 14px; font-weight: 600; color: #F8F5ED; margin-bottom: 2px; }
        .reg-step-desc { font-size: 13px; color: rgba(248,245,237,0.45); }

        .reg-panel-right {
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow-y: auto;
        }

        .reg-card {
          background: #fff;
          padding: 36px;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.06);
          max-width: 520px;
          width: 100%;
          margin: 0 auto;
        }

        .reg-tabs { display: flex; background: #F3F4F6; padding: 4px; border-radius: 12px; margin-bottom: 28px; }
        .reg-tab { flex: 1; padding: 10px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #6B7280; font-family: 'Outfit', sans-serif; font-size: 14px; background: transparent; }
        .reg-tab.active { background: white; color: #0B3D2E; box-shadow: 0 2px 4px rgba(0,0,0,0.06); }

        .reg-field { margin-bottom: 14px; }
        .reg-field label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .reg-field input, .reg-field select {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #E5E7EB; border-radius: 10px;
          outline: none; font-family: 'Outfit', sans-serif;
          font-size: 14px; color: #1A1A1A; background: #fff;
          transition: border-color 0.2s;
          -webkit-appearance: none;
        }
        .reg-field input:focus, .reg-field select:focus { border-color: #0B3D2E; box-shadow: 0 0 0 3px rgba(11,61,46,0.08); }
        .reg-field input::placeholder { color: #B0BDB8; }

        .reg-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .reg-policy { border: 1.5px solid #E5E7EB; border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
        .reg-policy-opt { display: flex; align-items: flex-start; gap: 12px; padding: 14px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #E5E7EB; }
        .reg-policy-opt:last-child { border-bottom: none; }
        .reg-policy-opt:hover { background: #F8F5ED; }
        .reg-policy-opt.selected { background: #F0F7F4; border-left: 3px solid #0B3D2E; }
        .reg-policy-radio { width: 18px; height: 18px; border: 2px solid #E5E7EB; border-radius: 50%; flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; }
        .reg-policy-opt.selected .reg-policy-radio { border-color: #0B3D2E; }
        .reg-policy-dot { width: 8px; height: 8px; border-radius: 50%; background: #0B3D2E; display: none; }
        .reg-policy-opt.selected .reg-policy-dot { display: block; }
        .reg-policy-title { font-size: 14px; font-weight: 600; color: #0B3D2E; margin-bottom: 2px; }
        .reg-policy-desc { font-size: 12px; color: #6B7B72; line-height: 1.5; }

        .reg-divider { display: flex; align-items: center; gap: 10px; margin: 16px 0; }
        .reg-divider::before, .reg-divider::after { content: ''; flex: 1; height: 1px; background: #E5E7EB; }
        .reg-divider span { font-size: 11px; color: #9AADA6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

        .reg-btn { width: 100%; background: #0B3D2E; color: white; padding: 14px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; margin-top: 8px; font-family: 'Outfit', sans-serif; font-size: 15px; }
        .reg-btn:hover:not(:disabled) { background: #0a3326; transform: translateY(-1px); }
        .reg-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .reg-error { background: #FEF2F2; color: #DC2626; padding: 12px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; border: 1px solid #FECACA; }
      `}</style>

      <div className="reg-layout">

        {/* ── Left Panel ── */}
        <div className="reg-panel-left">
          <div className="reg-logo">Sasha<span>Pay</span></div>
          <div>
            <h1 className="reg-headline">
              {tab === "company" ? <><em>Smarter payroll.</em><br />Zero stress.</> : <>Your earnings,<br /><em>your identity.</em></>}
            </h1>
            <p className="reg-sub">
              {tab === "company"
                ? "Set up your organisation, choose your payroll policy, and pay your team in minutes."
                : "Join your organisation with an invite code and start building your verified financial history."}
            </p>
            {(tab === "company" ? [
              { n: "1", t: "Register your company", d: "Set up your organisation profile" },
              { n: "2", t: "Choose payroll policy", d: "Fixed salary or attendance-based" },
              { n: "3", t: "Invite your team", d: "Share code and run payroll in minutes" },
            ] : [
              { n: "1", t: "Get invite code from admin", d: "Ask your manager for the code" },
              { n: "2", t: "Create your account", d: "Join your organisation in seconds" },
              { n: "3", t: "Build financial identity", d: "Every payment builds your history" },
            ]).map(s => (
              <div key={s.n} className="reg-step">
                <div className="reg-step-num">{s.n}</div>
                <div>
                  <div className="reg-step-title">{s.t}</div>
                  <div className="reg-step-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "rgba(248,245,237,0.25)" }}>© 2026 SachaPay</div>
        </div>

        {/* ── Right Panel ── */}
        <div className="reg-panel-right">
          <div className="reg-card">

            {/* Mobile logo */}
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#0B3D2E", marginBottom: 20 }}>
              Sasha<span style={{ color: "#C9962A" }}>Pay</span>
            </div>

            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#0B3D2E", marginBottom: 6 }}>Get Started</h2>
            <p style={{ color: "#6B7B72", fontSize: 14, marginBottom: 24 }}>Join the ecosystem of verified financial identities.</p>

            <div className="reg-tabs">
              <button className={`reg-tab ${tab === "company" ? "active" : ""}`} onClick={() => { setTab("company"); setError(""); }}>New Company</button>
              <button className={`reg-tab ${tab === "join" ? "active" : ""}`} onClick={() => { setTab("join"); setError(""); }}>Join Team</button>
            </div>

            {error && <div className="reg-error">{error}</div>}

            {tab === "company" && (
              <form onSubmit={handleRegisterOrg}>
                <div className="reg-divider"><span>Company details</span></div>
                <div className="reg-field-row">
                  <div className="reg-field">
                    <label>Company name *</label>
                    <input type="text" required placeholder="Acme Ltd" value={orgForm.orgName} onChange={e => setOrgForm({...orgForm, orgName: e.target.value})} />
                  </div>
                  <div className="reg-field">
                    <label>Industry</label>
                    <select value={orgForm.industry} onChange={e => setOrgForm({...orgForm, industry: e.target.value})}>
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
                <div className="reg-field-row">
                  <div className="reg-field">
                    <label>Company email *</label>
                    <input type="email" required placeholder="info@acme.com" value={orgForm.orgEmail} onChange={e => setOrgForm({...orgForm, orgEmail: e.target.value})} />
                  </div>
                  <div className="reg-field">
                    <label>Phone number</label>
                    <input type="tel" placeholder="08012345678" value={orgForm.orgPhone} onChange={e => setOrgForm({...orgForm, orgPhone: e.target.value})} />
                  </div>
                </div>

                <div className="reg-field" style={{ marginBottom: 8 }}>
                  <label style={{ marginBottom: 8, display: "block" }}>Payroll policy *</label>
                  <div className="reg-policy">
                    <div className={`reg-policy-opt ${orgForm.payrollPolicy === "FIXED_SALARY" ? "selected" : ""}`} onClick={() => setOrgForm({...orgForm, payrollPolicy: "FIXED_SALARY"})}>
                      <div className="reg-policy-radio"><div className="reg-policy-dot" /></div>
                      <div><div className="reg-policy-title">Fixed Salary</div><div className="reg-policy-desc">All workers receive full salary every month regardless of attendance.</div></div>
                    </div>
                    <div className={`reg-policy-opt ${orgForm.payrollPolicy === "ATTENDANCE_BASED" ? "selected" : ""}`} onClick={() => setOrgForm({...orgForm, payrollPolicy: "ATTENDANCE_BASED"})}>
                      <div className="reg-policy-radio"><div className="reg-policy-dot" /></div>
                      <div><div className="reg-policy-title">Attendance Based</div><div className="reg-policy-desc">Workers must meet a minimum attendance threshold to qualify.</div></div>
                    </div>
                  </div>
                </div>

                <div className="reg-divider"><span>Admin account</span></div>
                <div className="reg-field-row">
                  <div className="reg-field">
                    <label>Your full name *</label>
                    <input type="text" required placeholder="Your name" value={orgForm.adminName} onChange={e => setOrgForm({...orgForm, adminName: e.target.value})} />
                  </div>
                  <div className="reg-field">
                    <label>Your email *</label>
                    <input type="email" required placeholder="you@acme.com" value={orgForm.adminEmail} onChange={e => setOrgForm({...orgForm, adminEmail: e.target.value})} />
                  </div>
                </div>
                <div className="reg-field">
                  <label>Password *</label>
                  <input type="password" required minLength={8} placeholder="At least 8 characters" value={orgForm.adminPassword} onChange={e => setOrgForm({...orgForm, adminPassword: e.target.value})} />
                </div>
                <button className="reg-btn" type="submit" disabled={loading}>
                  {loading ? "Creating organisation..." : "Create Organisation →"}
                </button>
              </form>
            )}

            {tab === "join" && (
              <form onSubmit={handleJoinTeam}>
                <div className="reg-field">
                  <label>Invite code *</label>
                  <input type="text" required placeholder="e.g. AB12CD" value={joinForm.inviteCode} onChange={e => setJoinForm({...joinForm, inviteCode: e.target.value.toUpperCase()})} style={{ letterSpacing: "3px", fontWeight: 700, fontSize: 18 }} />
                </div>
                <div className="reg-divider"><span>Your details</span></div>
                <div className="reg-field">
                  <label>Full name *</label>
                  <input type="text" required placeholder="Your full name" value={joinForm.name} onChange={e => setJoinForm({...joinForm, name: e.target.value})} />
                </div>
                <div className="reg-field">
                  <label>Email address *</label>
                  <input type="email" required placeholder="you@email.com" value={joinForm.email} onChange={e => setJoinForm({...joinForm, email: e.target.value})} />
                </div>
                <div className="reg-field">
                  <label>Password *</label>
                  <input type="password" required minLength={8} placeholder="At least 8 characters" value={joinForm.password} onChange={e => setJoinForm({...joinForm, password: e.target.value})} />
                </div>
                <button className="reg-btn" type="submit" disabled={loading}>
                  {loading ? "Joining team..." : "Join Team →"}
                </button>
              </form>
            )}

            <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#6B7B72" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#0B3D2E", fontWeight: 700, textDecoration: "none" }}>Login</Link>
            </p>
          </div>
        </div>
      </div>

      {showSuccessModal && <SuccessModal code={regInviteCode} onClose={() => router.push("/dashboard")} />}
    </div>
  );
}

function SuccessModal({ code, onClose }: { code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,61,46,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 36, maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ width: 64, height: 64, background: "#F0FDF4", color: "#059669", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <CheckCircle size={32} />
        </div>
        <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#0B3D2E", marginBottom: 8 }}>Organisation created!</h3>
        <p style={{ color: "#6B7B72", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Share this invite code with your staff so they can join SachaPay.</p>
        <div style={{ background: "#F8F5ED", border: "2px dashed #C9962A", borderRadius: 14, padding: 20, marginBottom: 20, position: "relative" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#C9962A", textTransform: "uppercase", letterSpacing: 2, marginBo
