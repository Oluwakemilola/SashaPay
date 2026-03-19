// ─────────────────────────────────────────────
// SachaPay — API Client
// File: src/lib/api.ts
// ─────────────────────────────────────────────
// Single source of truth for all backend calls.
// Reads the JWT from localStorage and attaches it
// to every protected request automatically.
// ─────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Token helpers ─────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredOrg() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("organization");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("organization");
}

// ── Internal fetch wrapper ────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `API error ${res.status}`);
  }

  return data;
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export const getMe = () =>
  apiFetch<{ success: boolean; user: Record<string, unknown> }>("/api/auth/me");

// ─────────────────────────────────────────────
// Analytics  (ADMIN / MANAGER)
// ─────────────────────────────────────────────

export const getDashboard = () =>
  apiFetch<{
    success: boolean;
    dashboard: {
      totalWorkers: number;
      activeWorkers: number;
      todayAttendance: number;
      attendanceRate: number;
      currentMonth: string;
      currentPayroll: Record<string, unknown> | null;
      totalDisbursedNGN: number;
      completedPayrolls: number;
    };
  }>("/api/analytics/dashboard");

export const getWorkforceHealth = (month?: string) =>
  apiFetch<{
    success: boolean;
    workforceHealth: {
      totalWorkers: number;
      eligibleWorkers: number;
      ineligibleWorkers: number;
      eligibilityRate: number;
      avgAttendancePercent: number;
      departments: { name: string; count: number }[];
    };
  }>(`/api/analytics/workforce-health${month ? `?month=${month}` : ""}`);

// ─────────────────────────────────────────────
// Attendance
// ─────────────────────────────────────────────

export const getMyAttendance = () =>
  apiFetch<{ success: boolean; attendance: Record<string, unknown>[] }>(
    "/api/attendance/my-records"
  );

export const clockIn = () =>
  apiFetch<{ success: boolean; message: string }>("/api/attendance/clock-in", {
    method: "POST",
  });

export const clockOut = () =>
  apiFetch<{ success: boolean; message: string }>("/api/attendance/clock-out", {
    method: "POST",
  });

export const getOrgAttendanceSummary = (month?: string) =>
  apiFetch<{ success: boolean; summary: Record<string, unknown> }>(
    `/api/attendance/org-summary${month ? `?month=${month}` : ""}`
  );

// ─────────────────────────────────────────────
// Payroll  (ADMIN / MANAGER)
// ─────────────────────────────────────────────

export const getPayrollHistory = () =>
  apiFetch<{ success: boolean; runs: Record<string, unknown>[] }>(
    "/api/payroll/history"
  );

// ─────────────────────────────────────────────
// Financial Passport
// ─────────────────────────────────────────────

export const getMyPassport = () =>
  apiFetch<{ success: boolean; passport: Record<string, unknown> }>(
    "/api/passport/me"
  );

export const getWorkerPassport = (workerId: string) =>
  apiFetch<{ success: boolean; passport: Record<string, unknown> }>(
    `/api/passport/${workerId}`
  );

// ─────────────────────────────────────────────
export const getStaff = () =>
  apiFetch<{ success: boolean; staff: Record<string, unknown>[] }>("/api/staff");

// AI Agent
// ─────────────────────────────────────────────

export const sendChat = (message: string) =>
  apiFetch<{ success: boolean; reply: string }>("/api/agent/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
