// ─────────────────────────────────────────────
// SachaPay — Session helpers
// File: src/lib/api.ts
// ─────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getStoredOrg() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("organization");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("organization");
}

// ── Aliases so all pages use the same names ───
export const getUser = getStoredUser;
export const getOrg  = getStoredOrg;
export const logout  = () => {
  clearSession();
  if (typeof window !== "undefined") window.location.href = "/login";
};
