"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";
const G = "#0B3D2E";
const GOLD = "#C9962A";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Invalid email or password"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.organization) localStorage.setItem("organization", JSON.stringify(data.organization));
      router.push("/dashboard");
    } catch { setError("Could not connect to server. Please try again."); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px",
    border: "1.5px solid rgba(11,61,46,0.18)", borderRadius: 10,
    fontFamily: "'Outfit', sans-serif", fontSize: 15,
    color: "#1A1A1A", background: "#fff", outline: "none",
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#F8F5ED", minHeight: "100vh", display: "flex" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } input:focus { border-color: #0B3D2E !important; box-shadow: 0 0 0 3px rgba(11,61,46,0.08) !important; outline: none !important; }`}</style>

      {/* LEFT PANEL — JS controlled */}
      {isDesktop && (
        <div style={{ background: G, padding: "56px", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "50%", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: -80, left: -80, width: 320, height: 320, background: "rgba(201,150,42,0.1)", borderRadius: "50%" }} />
          <a href="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#F8F5ED", textDecoration: "none", position: "relative" }}>
            Sasha<span style={{ color: GOLD }}>Pay</span>
          </a>
          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 72, color: "rgba(201,150,42,0.25)", lineHeight: 0.8, marginBottom: 16 }}>"</div>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#F8F5ED", lineHeight: 1.35, marginBottom: 20 }}>
              The worker who can <em style={{ color: GOLD }}>prove their income</em> will always get the loan.
            </p>
            <p style={{ fontSize: 14, color: "rgba(248,245,237,0.45)", lineHeight: 1.7 }}>
              SachaPay gives every Nigerian worker a verified financial identity — built from every salary payment they have ever received.
            </p>
          </div>
          <p style={{ fontSize: 12, color: "rgba(248,245,237,0.25)", position: "relative" }}>© 2026 SachaPay · Payroll & Financial Identity</p>
        </div>
      )}

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: isDesktop ? "48px" : "32px 20px", minHeight: "100vh" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280", textDecoration: "none", marginBottom: 32 }}>
            ← Back to home
          </Link>

          {!isDesktop && (
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: G, marginBottom: 24 }}>
              Sasha<span style={{ color: GOLD }}>Pay</span>
            </div>
          )}

          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, color: G, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ fontSize: 15, color: "#6B7B72", fontWeight: 300, marginBottom: 32 }}>Sign in to your SachaPay account</p>

          {error && (
            <div style={{ padding: "12px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 14, color: "#B91C1C", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#3A5248", marginBottom: 7 }}>Email address</label>
              <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#3A5248", marginBottom: 7 }}>Password</label>
              <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px", background: G, color: "#F8F5ED", border: "none", borderRadius: 10, fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 8, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(11,61,46,0.1)" }} />
            <span style={{ fontSize: 12, color: "#9AADA6" }}>new to SachaPay?</span>
            <div style={{ flex: 1, height: 1, background: "rgba(11,61,46,0.1)" }} />
          </div>

          <p style={{ textAlign: "center", fontSize: 14, color: "#6B7B72" }}>
            <Link href="/register" style={{ color: G, fontWeight: 600, textDecoration: "none" }}>Register your company</Link>
            {" · "}
            <Link href="/register?tab=join" style={{ color: G, fontWeight: 600, textDecoration: "none" }}>Join with invite code</Link>
          </p>
        </div>
      </div>
    </div>
  );
            }
        
