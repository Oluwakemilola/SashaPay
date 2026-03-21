"use client";
import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { getStoredUser, getStoredOrg } from "@/lib/api";

export function TopNav({ onMenuClick, showMenu }: { onMenuClick?: () => void; showMenu?: boolean }) {
  const [userName, setUserName] = useState("");
  const [orgName, setOrgName]   = useState("");
  const [initials, setInitials] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    const org  = getStoredOrg();
    const name = (user as any)?.name || "";
    setUserName(name);
    setOrgName((org as any)?.name || "");
    setInitials(name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase());
  }, []);

  return (
    <header style={{
      height: 60, background: "#fff",
      borderBottom: "1px solid #E8EDE8",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      position: "sticky", top: 0, zIndex: 30,
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {showMenu && (
          <button onClick={onMenuClick}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#0B3D2E", display: "flex", padding: 4 }}>
            <Menu style={{ width: 22, height: 22 }} />
          </button>
        )}
        <p style={{ fontSize: 14, color: "#6B7B72", fontFamily: "Outfit, sans-serif" }}>
          Welcome back, <strong style={{ color: "#0B3D2E" }}>{userName?.split(" ")[0]}</strong>
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", cursor: "pointer" }}>
          <Bell style={{ width: 20, height: 20, color: "#9AADA6" }} />
          <div style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, background: "#C9962A", borderRadius: "50%", border: "1.5px solid #fff" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0B3D2E", fontFamily: "Outfit, sans-serif", lineHeight: 1.2 }}>{userName}</span>
            <span style={{ fontSize: 11, color: "#9AADA6", fontFamily: "Outfit, sans-serif" }}>{orgName}</span>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0B3D2E", color: "#F8F5ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: "Outfit, sans-serif", flexShrink: 0 }}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
