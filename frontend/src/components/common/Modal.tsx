"use client";
import { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  maxWidth?: number;
  padding?: number;
}

export default function Modal({ children, maxWidth = 420, padding = 32 }: ModalProps) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,61,46,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding, maxWidth, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "Outfit, sans-serif", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}
