"use client";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy, ArrowRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";
const G = "#0B3D2E";
const GOLD = "#C9962A";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"company" | "join">(searchParams.get("tab") === "join" ? "join" : "company");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);
  const [orgForm, setOrgForm] = useState({ orgName: "", orgEmail: "", orgPhone: "", industry: "", adminName: "", adminEmail: "", adminPassword: "", payrollPolicy: "FIXED_SALARY" });
  const [joinForm, setJoinForm] = useState({ name: "", email: "", password: "", inviteCode: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [regInviteCode, setRegInviteCode] = useState("");

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 860);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleRegisterOrg = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/auth/register-org`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orgForm),
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
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(joinForm),
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

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #E5E7EB",
    borderRadius: 10, outline: "none", fontFamily: "'Outfit', sans-serif",
    fontSize: 14, color: "#1A1A1A", background: "#fff", WebkitAppearance: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6,
  };

  const steps = tab === "company"
    ? [{ n: "1", t: "Register your company", d: "Set up your organisation in seconds" },
       { n: "2", t: "Choose payroll policy", d: "Fixed salary or attendance-based" },
       { n: "3", t: "Invite your team", d: "Share code and run payroll in minutes" }]
    : [{ n: "1", t: "Get invite code", d: "Ask your admin for the current code" },
       { n: "2", t: "Create your account", d: "Join your organisation in seconds" },
       { n: "3", t: "Build financial identity", d: "Every payment builds your history" }];

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#F8F5ED", minHeight: "100vh", display: "flex" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } input:focus, select:focus { border-color: #0B3D2E !important; box-shadow: 0 0 0 3px rgba(11,61,46,0.08) !important; outline: none !important; }`}</style>

      {/* LEFT PANEL — JS controlled, only on desktop */}
      {isDesktop && (
        <div style={{ background: G, padding: "56px", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "50%", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, background: "rgba(201,150,42,0.1)", borderRadius: "50%" }} />
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#F8F5ED", position: "relative" }}>Sasha<span style={{ color: GOLD }}>Pay</span></div>
          <div style={{ position: "relative" }}>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 40, lineHeight: 1.1, color: "#F8F5ED", marginBottom: 16 }}>
              {tab === "company"
                ? <><em style={{ color: GOLD }}>Smarter payroll.</em><br />Zero stress.</>
                : <>Your earnings,<br /><em style={{ color: GOLD }}>your identity.</em></>}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, marginBottom: 32, lineHeight: 1.7 }}>
              {tab === "company"
                ? "Set up your organisation, choose your payroll policy, and pay your team in minutes."
                : "Join with an invite code and start building your verified financial history."}
            </p>
            {steps.map(s => (
              <div key={s.n} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                <div style={{ width: 30, height: 30, background: "rgba(201,150,42,0.2)", border: "1px solid rgba(201,150,42,0.4)", color: GOLD, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: 13 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#F8F5ED", marginBottom: 2 }}>{s.t}</div>
                  <div style={{ fontSize: 13, color: "rgba(248,245,237,0.45)" }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "rgba(248,245,237,0.25)" }}>© 2026 SachaPay</div>
        </div>
      )}

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, padding: isDesktop ? "48px" : "32px 20px", display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto", minHeight: "100vh" }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: isDesktop ? "36px" : "28px 20px", maxWidth: 520, width: "100%", margin: "0 auto", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>

          {!isDesktop && (
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: G, marginBottom: 20 }}>
              Sasha<span style={{ color: GOLD }}>Pay</span>
            </div>
          )}

          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: G, marginBottom: 6 }}>Get Started</h2>
          <p style={{ color: "#6B7B72", fontSize: 14, marginBottom: 24 }}>Join the ecosystem of verified financial identities.</p>

          {/* Tabs */}
          <div style={{ display: "flex", background: "#F3F4F6", padding: 4, borderRadius: 12, marginBottom: 24 }}>
            {(["company", "join"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 14, background: tab === t ? "#fff" : "transparent", color: tab === t ? G : "#6B7280", boxShadow: tab === t ? "0 2px 4px rgba(0,0,0,0.06)" : "none" }}>
                {t === "company" ? "New Company" : "Join Team"}
              </button>
            ))}
          </div>

          {error && <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "12px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14, border: "1px solid #FECACA" }}>{error}</div>}

          {/* COMPANY FORM */}
          {tab === "company" && (
            <form onSubmit={handleRegisterOrg}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                <span style={{ fontSize: 11, color: "#9AADA6", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>Company details</span>
                <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 4 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Company name *</label>
                  <input type="text" required placeholder="Acme Ltd" value={orgForm.orgName} onChange={e => setOrgForm({...orgForm, orgName: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Industry</label>
                  <select value={orgForm.industry} onChange={e => setOrgForm({...orgForm, industry: e.target.value})} style={inputStyle}>
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

              <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 4 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Company email *</label>
                  <input type="email" required placeholder="info@acme.com" value={orgForm.orgEmail} onChange={e => setOrgForm({...orgForm, orgEmail: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Phone number</label>
                  <input type="tel" placeholder="08012345678" value={orgForm.orgPhone} onChange={e => setOrgForm({...orgForm, orgPhone: e.target.value})} style={inputStyle} />
                </div>
              </div>

              {/* Payroll policy */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ ...labelStyle, marginBottom: 10 }}>Payroll policy *</label>
                <div style={{ border: "1.5px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
                  {[
                    { val: "FIXED_SALARY", title: "Fixed Salary", desc: "All workers receive full salary every month regardless of attendance." },
                    { val: "ATTENDANCE_BASED", title: "Attendance Based", desc: "Workers must meet a minimum attendance threshold to qualify." },
                  ].map(opt => (
                    <div key={opt.val} onClick={() => setOrgForm({...orgForm, payrollPolicy: opt.val})}
                      style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 14, cursor: "pointer", background: orgForm.payrollPolicy === opt.val ? "#F0F7F4" : "#fff", borderBottom: opt.val === "FIXED_SALARY" ? "1px solid #E5E7EB" : "none", borderLeft: orgForm.payrollPolicy === opt.val ? `3px solid ${G}` : "3px solid transparent" }}>
                      <div style={{ width: 18, height: 18, border: `2px solid ${orgForm.payrollPolicy === opt.val ? G : "#E5E7EB"}`, borderRadius: "50%", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {orgForm.payrollPolicy === opt.val && <div style={{ width: 8, height: 8, borderRadius: "50%", background: G }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: G, marginBottom: 2 }}>{opt.title}</div>
                        <div style={{ fontSize: 12, color: "#6B7B72", lineHeight: 1.5 }}>{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                <span style={{ fontSize: 11, color: "#9AADA6", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>Admin account</span>
                <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 4 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Your full name *</label>
                  <input type="text" required placeholder="Your name" value={orgForm.adminName} onChange={e => setOrgForm({...orgForm, adminName: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Your email *</label>
                  <input type="email" required placeholder="you@acme.com" value={orgForm.adminEmail} onChange={e => setOrgForm({...orgForm, adminEmail: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Password *</label>
                <input type="password" required minLength={8} placeholder="At least 8 characters" value={orgForm.adminPassword} onChange={e => setOrgForm({...orgForm, adminPassword: e.target.value})} style={inputStyle} />
              </div>

              <button type="submit" disabled={loading}
                style={{ width: "100%", background: G, color: "#F8F5ED", padding: "14px", borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 15, opacity: loading ? 0.6 : 1, marginTop: 8 }}>
                {loading ? "Creating organisation..." : "Create Organisation →"}
              </button>
            </form>
          )}

          {/* JOIN FORM */}
          {tab === "join" && (
            <form onSubmit={handleJoinTeam}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Invite code *</label>
                <input type="text" required placeholder="e.g. AB12CD" value={joinForm.inviteCode} onChange={e => setJoinForm({...joinForm, inviteCode: e.target.value.toUpperCase()})} style={{ ...inputStyle, letterSpacing: "4px", fontWeight: 700, fontSize: 20, textAlign: "center" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
                <span style={{ fontSize: 11, color: "#9AADA6", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>Your details</span>
                <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Full name *</label>
                <input type="text" required placeholder="Your full name" value={joinForm.name} onChange={e => setJoinForm({...joinForm, name: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Email address *</label>
                <input type="email" required placeholder="you@email.com" value={joinForm.email} onChange={e => setJoinForm({...joinForm, email: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Password *</label>
                <input type="password" required minLength={8} placeholder="At least 8 characters" value={joinForm.password} onChange={e => setJoinForm({...joinForm, password: e.target.value})} style={inputStyle} />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: "100%", background: G, color: "#F8F5ED", padding: "14px", borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 15, opacity: loading ? 0.6 : 1, marginTop: 8 }}>
                {loading ? "Joining team..." : "Join Team →"}
              </button>
            </form>
          )}

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#6B7B72" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: G, fontWeight: 700, textDecoration: "none" }}>Login</Link>
          </p>
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
          <div style={{ fontSize: 10, fontWeight: 700, color: "#C9962A", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Invite Code</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#0B3D2E", letterSpacing: 6 }}>{code}</div>
          <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 34, height: 34, borderRadius: 8, background: copied ? "#059669" : "#fff", border: "1px solid #E8EDE8", color: copied ? "#fff" : "#9AADA6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: 14, background: "#0B3D2E", color: "#F8F5ED", border: "none", borderRadius: 12, fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
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
