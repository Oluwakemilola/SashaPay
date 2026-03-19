"use client";
// ─────────────────────────────────────────────
// SachaPay — AI Financial Agent
// File: src/app/(dashboard)/agent/page.tsx
// ─────────────────────────────────────────────
// Chat UI that calls POST /api/agent/chat
// The backend uses Claude AI with the worker's
// real payroll/attendance data as context.
// ─────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { sendChat, getStoredUser } from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const SUGGESTED_QUESTIONS = [
  "Am I eligible for payroll this month?",
  "What is my current attendance rate?",
  "When was my last salary payment?",
  "How many days have I been present this month?",
];

export default function AgentPage() {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [userName,  setUserName]  = useState("there");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user?.name) setUserName((user.name as string).split(" ")[0]);
  }, []);

  // Auto-scroll to the bottom after each new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const { reply } = await sendChat(msg);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Sorry, I couldn't reach the server right now. (${errMsg})` },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">

      {/* ── Header ────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">AI Financial Agent</h2>
        </div>
        <p className="text-muted-foreground text-sm ml-[52px]">
          Ask anything about your payroll, attendance, or eligibility. Your real data is used as context.
        </p>
      </div>

      {/* ── Chat area ─────────────────────────── */}
      <div className="flex-1 bg-card border rounded-2xl shadow-sm flex flex-col overflow-hidden">

        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Hey {userName} 👋</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  I&apos;m your SachaPay assistant. I have access to your real attendance and payroll data.
                  Ask me anything.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left px-4 py-3 rounded-xl border text-sm text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mb-1">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm border"
                }`}
              >
                {msg.text}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mb-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-end gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-secondary border rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking…
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ────────────────────────── */}
        <div className="border-t p-4 bg-background/50">
          <div className="flex items-center gap-3 bg-card border rounded-xl px-4 py-2 focus-within:border-primary transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your payroll, attendance or eligibility…"
              disabled={loading}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Responses are based on your real SachaPay data.
          </p>
        </div>
      </div>
    </div>
  );
}