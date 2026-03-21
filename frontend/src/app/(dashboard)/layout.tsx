"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop]     = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login");
    }
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [router]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F5ED", fontFamily: "Outfit, sans-serif" }}>

      {/* Mobile overlay */}
      {!isDesktop && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(11,61,46,0.5)", zIndex: 39, backdropFilter: "blur(4px)" }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 40,
        transform: isDesktop || sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
        width: 240,
      }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: isDesktop ? 240 : 0,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        transition: "margin-left 0.25s ease",
      }}>
        <TopNav onMenuClick={() => setSidebarOpen(true)} showMenu={!isDesktop} />
        <main style={{
          flex: 1,
          padding: isDesktop ? "28px 32px" : "16px",
          overflowX: "hidden",
          maxWidth: "100%",
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
