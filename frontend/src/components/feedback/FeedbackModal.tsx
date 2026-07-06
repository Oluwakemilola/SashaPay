"use client";
import { useState } from "react";
import { Star, X } from "lucide-react";
import Modal from "@/components/common/Modal";

const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";

interface FeedbackModalProps {
  title: string;
  subtitle: string;
  submitting: boolean;
  error?: string;
  onSubmit: (rating: number, message: string) => void;
  onDismiss: () => void;
}

export default function FeedbackModal({ title, subtitle, submitting, error, onSubmit, onDismiss }: FeedbackModalProps) {
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, message);
  };

  return (
    <Modal maxWidth={420} padding={32}>
      <button onClick={onDismiss} disabled={submitting}
        style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9AADA6", display: "flex" }}>
        <X style={{ width: 18, height: 18 }} />
      </button>

      <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: GREEN, marginBottom: 6, paddingRight: 24 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "#6B7B72", marginBottom: 20, lineHeight: 1.5 }}>{subtitle}</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
            <Star style={{ width: 30, height: 30 }}
              fill={n <= (hovered || rating) ? GOLD : "none"}
              color={n <= (hovered || rating) ? GOLD : "#E5E7EB"} />
          </button>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tell us about your experience (optional)"
        rows={3}
        style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontFamily: "Outfit, sans-serif", fontSize: 14, color: GREEN, outline: "none", resize: "none", marginBottom: 16 }}
      />

      {error && (
        <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 13, color: "#B91C1C", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={handleSubmit} disabled={rating === 0 || submitting}
          style={{ flex: 1, padding: "13px", background: GREEN, color: "#F8F5ED", border: "none", borderRadius: 10, fontWeight: 700, cursor: rating === 0 || submitting ? "not-allowed" : "pointer", fontSize: 14, fontFamily: "Outfit, sans-serif", opacity: rating === 0 || submitting ? 0.5 : 1 }}>
          {submitting ? "Submitting..." : error ? "Try Again" : "Submit Feedback"}
        </button>
        <button type="button" onClick={onDismiss} disabled={submitting}
          style={{ padding: "13px 20px", background: "transparent", color: "#6B7B72", border: "1px solid #E8EDE8", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "Outfit, sans-serif" }}>
          Not now
        </button>
      </div>
    </Modal>
  );
}
