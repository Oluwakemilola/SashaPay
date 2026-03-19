"use client";
// ─────────────────────────────────────────────
// SachaPay — Top Navigation Bar
// File: src/components/layout/TopNav.tsx
// ─────────────────────────────────────────────
// Reads the real logged-in user and their organisation
// name from localStorage. Also wires the logout button.
// ─────────────────────────────────────────────

import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getStoredOrg, getStoredUser } from "@/lib/api";

export function TopNav() {
  const router = useRouter();
  const [userName, setUserName] = useState("...");
  const [orgName, setOrgName] = useState("...");
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    const user = getStoredUser();
    const org  = getStoredOrg();

    if (user?.name) {
      setUserName(user.name as string);
      // Build initials from the first two name parts
      const parts = (user.name as string).trim().split(" ");
      setInitials(
        parts.length >= 2
          ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
          : parts[0].slice(0, 2).toUpperCase()
      );
    }

    if (org?.name) {
      setOrgName(org.name as string);
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      {/* Left — breadcrumb / page label placeholder */}
      <div className="flex items-center gap-4 flex-1">
        <p className="text-sm text-muted-foreground hidden sm:block">
          Welcome back, <span className="font-semibold text-foreground">{userName.split(" ")[0]}</span>
        </p>
      </div>

      {/* Right — bell + user */}
      <div className="flex items-center gap-5">
        <button className="relative text-muted-foreground hover:text-foreground transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground mt-1">{orgName}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {initials}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive transition-colors ml-1"
          aria-label="Logout"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
