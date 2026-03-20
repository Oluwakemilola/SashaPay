"use client";
// ─────────────────────────────────────────────
// SachaPay — AI Financial Agent
// File: src/app/(dashboard)/agent/page.tsx
// ─────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, AlertCircle, DollarSign, Clock, HelpCircle } from "lucide-react";
import { sendChat, getStoredUser, getStoredOrg } from "@/lib/api";

type Message = { role: "user" | "assistant"; text: string; loading?: boolean; };

const SUGGESTIONS = [
  { icon: DollarSign, text: "Am I eligible for salary this month?",     color: "#0B3D2E" },
  { icon: Clock,      text: "What is my attendance rate?",               color: "#059669" },
  { icon: DollarSign, text: "When was my last salary payment?",          color: "#C9962A" },
  { icon: AlertCircle,text: "I wasn't paid this month, what happened?",  color: "#DC2626" },
  { icon: HelpCircle, text: "How many days have I worked this month?",   color: "#7C3AED" },
  { icon: AlertCircle,text: "My salary seems wrong, can you check?",     color: "#D97706" },
];

const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const [user]                  = useState(getStoredUser());
  const [org]                   = useState(getStoredOrg());
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  const firstName = (user?.name as string)?.split(" ")[0] || "there";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return `Good morning, ${firstName} ☀️`;
    if (h < 17) return `Good afternoon, ${firstName} 👋`;
    return `Good evening, ${firstName} 🌙`;
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || sending) return;

    setMessages(prev => [...prev, { role: "user", text }, { role: "assistant", text: "", loading: true }]);
    setInput("");
    setSending(true);

    try {
      const { reply } = await sendChat(text);
      setMessages(prev => [...prev.slice(0, -1), { role: "assistant", text: reply }]);
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { role: "assistant", text: `Sorry ${firstName}, I'm having trouble connecting right now. Please try again in a moment.` }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const initials = (user?.name as string)
    ? (user.name as string).split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 5rem)", maxWidth: 720, margin: "0 auto", fontFamily: "Outfit, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles style={{ width: 20, height: 20, color: GOLD }} />
          </div>
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: GREEN, lineHeight: 1.1 }}>HR Assistant</h2>
            <p style={{ fontSize: 12, color: "#9AADA6", marginTop: 2 }}>
              {org?.name ? `${org.name} · ` : ""}Knows your real attendance, salary & eligibility
            </p>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingBottom: 16 }}>

        {/* Welcome state */}
        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", gap: 20, padding: "20px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles style={{ width: 28, height: 28, color: GOLD }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: GREEN, marginBottom: 8 }}>
                {greeting()}
              </h3>
              <p style={{ fontSize: 14, color: "#6B7B72", maxWidth: 380, lineHeight: 1.6 }}>
                I have access to your real attendance records, salary details, and payroll eligibility. Ask me anything or raise a concern.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", maxWidth: 500 }}>
              {SUGGESTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button key={s.text} onClick={() => send(s.text)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fff", border: "1px solid #E8EDE8", borderRadius: 12, cursor: "pointer", textAlign: "left", fontSize: 13, color: GREEN, lineHeight: 1.4, fontFamily: "Outfit, sans-serif", transition: "all 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = GREEN)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#E8EDE8")}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ width: 14, height: 14, color: s.color }} />
                    </div>
                    {s.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat bubbles */}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: 10, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>
            <div style={{ flexShrink: 0 }}>
              {msg.role === "assistant" ? (
                <div style={{ width: 32, height: 32, borderRadius: 10, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot style={{ width: 16, height: 16, color: GOLD }} />
                </div>
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: 10, background: GOLD, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                  {initials}
                </div>
              )}
            </div>

            <div style={{
              maxWidth: "78%", padding: "12px 16px", fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              ...(msg.role === "user"
                ? { background: GREEN, color: "#F8F5ED" }
                : { background: "#fff", color: "#1A1A1A", border: "1px solid #E8EDE8" }
              ),
            }}>
              {msg.loading ? (
                <span style={{ display: "flex", gap: 4, alignItems: "center", height: 20 }}>
                  {[0, 150, 300].map(delay => (
                    <span key={delay} style={{ width: 6, height: 6, borderRadius: "50%", background: "#9AADA6", display: "inline-block", animation: "bounce 1s infinite", animationDelay: `${delay}ms` }} />
                  ))}
                </span>
              ) : msg.text}
            </div>
          </div>
        ))}

        {/* Show suggestions again after first exchange */}
        {messages.length > 0 && messages.length <= 2 && !sending && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 4 }}>
            {SUGGESTIONS.slice(3).map(s => (
              <button key={s.text} onClick={() => send(s.text)}
                style={{ fontSize: 12, padding: "6px 12px", background: "#F8F5ED", border: "1px solid #E8EDE8", borderRadius: 99, cursor: "pointer", color: GREEN, fontFamily: "Outfit, sans-serif" }}>
                {s.text}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <form onSubmit={e => { e.preventDefault(); send(input); }}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#fff", border: "1.5px solid #E8EDE8", borderRadius: 16 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask anything, ${firstName}...`}
          disabled={sending}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: GREEN, background: "transparent", fontFamily: "Outfit, sans-serif" }}
        />
        <button type="submit" disabled={!input.trim() || sending}
          style={{ width: 36, height: 36, borderRadius: 10, background: GREEN, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: !input.trim() || sending ? 0.4 : 1, flexShrink: 0 }}>
          <Send style={{ width: 16, height: 16, color: "#F8F5ED" }} />
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 11, color: "#C4CFC8", marginTop: 8, paddingBottom: 4 }}>
        Responses are based on your real SachaPay data
      </p>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  );
      }
                                        
