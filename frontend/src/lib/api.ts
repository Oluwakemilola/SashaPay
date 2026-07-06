// ─────────────────────────────────────────────
// SachaPay — Session helpers
// File: src/lib/api.ts
// ─────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function readLocalJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function getStoredUser() {
  return readLocalJSON<any>("user", null);
}

export function getStoredOrg() {
  return readLocalJSON<any>("organization", null);
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
