"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";

const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";
const CREAM = "#F8F5ED";

// Nigerian business Unsplash photos
const HERO_IMAGE = "/hero.jpg";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onScroll(); onResize();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div style={{ fontFamily: "Outfit, sans-serif", background: CREAM, color: GREEN, overflowX: "hidden" }}>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 20px 0 20px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        background: isScrolled ? "rgba(248,245,237,0.95)" : "transparent",
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        borderBottom: isScrolled ? "1px solid rgba(11,61,46,0.1)" : "none",
        transition: "all 0.3s ease",
      }}>
        <Logo size={28} />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/login" style={{ padding: "9px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: GREEN, textDecoration: "none", border: `1.5px solid ${GREEN}` }}>
            Login
          </Link>
          <Link href="/register" style={{ padding: "9px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, background: GREEN, color: CREAM, textDecoration: "none" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column-reverse" : "row", alignItems: "center", paddingTop: 64 }}>

        {/* Left */}
        <div style={{ flex: 1, padding: isMobile ? "32px 24px 28px" : "80px 64px", maxWidth: isMobile ? "100%" : 600 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: `${GOLD}20`, borderRadius: 99, fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 24, letterSpacing: "0.5px", textTransform: "uppercase" as const }}>
            🇳🇬 Built for Nigerian SMEs
          </div>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: isMobile ? "36px" : "52px",
            lineHeight: 1.1, color: GREEN, marginBottom: 24,
          }}>
            Smarter Payroll.<br />
            <span style={{ color: GOLD }}>Zero Stress.</span>
          </h1>

          <p style={{ fontSize: isMobile ? 15 : 17, color: "#3A5248", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
            Stop paying workers one by one. SachaPay automates bulk salary disbursement and builds every worker a verified financial identity — their Financial Passport.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/register" style={{ padding: "14px 28px", background: GREEN, color: CREAM, borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
              Start for Free →
            </Link>
            <Link href="/login" style={{ padding: "14px 28px", border: `2px solid ${GREEN}`, color: GREEN, borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
              Sign In
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 20, marginTop: 40, flexWrap: "wrap" }}>
            {["🔒 Bank-grade security", "⚡ Instant disbursement", "📋 Financial Passport"].map(badge => (
              <span key={badge} style={{ fontSize: 12, color: "#6B7B72", fontWeight: 500 }}>{badge}</span>
            ))}
          </div>
        </div>

        {/* Right — Nigerian image */}
        {!isMobile && (
          <div style={{ flex: 1, height: "100vh", position: "relative", overflow: "hidden" }}>
            <img
              src={HERO_IMAGE}
              alt="Nigerian business professionals"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(248,245,237,0.3) 0%, transparent 40%)" }} />

            {/* Floating card */}
            <div style={{ position: "absolute", bottom: 48, left: -24, background: "#fff", borderRadius: 16, padding: "16px 20px", boxShadow: "0 20px 60px rgba(11,61,46,0.15)", minWidth: 200 }}>
              <p style={{ fontSize: 11, color: "#9AADA6", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 4 }}>This Month</p>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: GREEN }}>₦2.4M Disbursed</p>
              <p style={{ fontSize: 12, color: "#059669", marginTop: 4, fontWeight: 600 }}>✓ 48 workers paid on time</p>
            </div>
          </div>
        )}

        {/* Mobile image */}
        {isMobile && (
          <div style={{ width: "100%", height: 340, position: "relative", overflow: "hidden" }}>
            <img src={HERO_IMAGE} alt="Nigerian business professionals" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(248,245,237,1) 100%)" }} />
          </div>
        )}
      </section>

      {/* Why SachaPay */}
      <section style={{ background: GREEN, padding: isMobile ? "60px 24px" : "80px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: isMobile ? 28 : 38, color: CREAM, marginBottom: 12 }}>
              Why SachaPay?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(248,245,237,0.6)", maxWidth: 480, margin: "0 auto" }}>
              The problem is simple: paying 20 workers manually every month is slow, error-prone and humiliating.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
            {[
              { icon: "😤", title: "The Old Way", desc: "Log into your bank. Enter 20 account numbers one by one. Transfer manually to each worker. Hope you made no mistakes.", bad: true },
              { icon: "⚡", title: "The SachaPay Way", desc: "Fund your wallet once. Set salaries once. Click Disburse. All 20 workers paid in seconds with full records.", good: true },
              { icon: "📋", title: "The Bonus", desc: "Every payment builds workers' Financial Passports — verifiable income proof they can use for loans, rent, anything.", neutral: true },
            ].map((item, i) => (
              <div key={i} style={{ background: item.good ? GOLD : "rgba(255,255,255,0.06)", borderRadius: 16, padding: "28px 24px", border: item.good ? "none" : "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: item.good ? "#fff" : CREAM, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: item.good ? "rgba(255,255,255,0.85)" : "rgba(248,245,237,0.55)", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: isMobile ? "60px 24px" : "80px 64px", background: CREAM }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: isMobile ? 28 : 38, color: GREEN, textAlign: "center", marginBottom: 8 }}>
            Everything You Need
          </h2>
          <p style={{ fontSize: 15, color: "#6B7B72", textAlign: "center", marginBottom: 48 }}>
            Built specifically for Nigerian SMEs
          </p>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 16 }}>
            {[
              { icon: "💰", title: "Smart Payroll", desc: "Automated bulk salary disbursement with one click" },
              { icon: "📍", title: "Attendance", desc: "Real-time clock-in/out with location tracking" },
              { icon: "🛡️", title: "Financial Passport", desc: "Portable, verifiable income history for workers" },
              { icon: "🤖", title: "AI Assistant", desc: "Ask questions about payroll, attendance, policies" },
            ].map((f, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "24px 20px", border: "1px solid #E8EDE8", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: GREEN, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#6B7B72", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section style={{ padding: isMobile ? "48px 24px" : "60px 64px", background: "#F0F7F4" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: isMobile ? 20 : 26, color: GREEN, lineHeight: 1.5, fontStyle: "italic" }}>
            "The worker who can prove their income will always get the loan."
          </p>
          <p style={{ fontSize: 13, color: "#9AADA6", marginTop: 12 }}>— The SachaPay Promise</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? "60px 24px" : "80px 64px", background: GREEN, textAlign: "center" }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: isMobile ? 28 : 40, color: CREAM, marginBottom: 16 }}>
          Ready to modernize your payroll?
        </h2>
        <p style={{ fontSize: 16, color: "rgba(248,245,237,0.6)", marginBottom: 32 }}>
          Free to start. No account numbers to enter. No manual transfers.
        </p>
        <Link href="/register" style={{ display: "inline-block", padding: "16px 40px", background: GOLD, color: "#fff", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
          Create Your Organisation →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: "#071f17", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "rgba(248,245,237,0.3)" }}>
          © 2026 SachaPay · Smarter Payroll for Nigerian Businesses · Built for 3MTT Nigeria Hackathon
        </p>
      </footer>
    </div>
  );
}
