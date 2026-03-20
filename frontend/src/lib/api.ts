// ─────────────────────────────────────────────
// SachaPay — API Client
// File: src/lib/api.ts
// ─────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";

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

// ── Internal fetch wrapper ────────────────────
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res  = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `API error ${res.status}`);
  return data;
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────
export const getMe = () =>
  apiFetch<{ success: boolean; user: Record<string, unknown> }>("/api/auth/me");

export const refreshInvite = () =>
  apiFetch<{ success: boolean; inviteCode: string; expiresAt: string }>(
    "/api/auth/refresh-invite", { method: "POST" }
  );

// ─────────────────────────────────────────────
// Analytics  (ADMIN / MANAGER)
// ─────────────────────────────────────────────
export const getDashboard = () =>
  apiFetch<{
    success: boolean;
    dashboard: {
      totalWorkers: number; activeWorkers: number;
      todayAttendance: number; attendanceRate: number;
      currentMonth: string; currentPayroll: Record<string, unknown> | null;
      totalDisbursedNGN: number; completedPayrolls: number;
    };
  }>("/api/analytics/dashboard");

export const getWorkforceHealth = (month?: string) =>
  apiFetch<{
    success: boolean;
    workforceHealth: {
      totalWorkers: number; eligibleWorkers: number;
      ineligibleWorkers: number; eligibilityRate: number;
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
  apiFetch<{ success: boolean; message: string }>(
    "/api/attendance/clock-in", { method: "POST" }
  );

export const clockOut = () =>
  apiFetch<{ success: boolean; message: string }>(
    "/api/attendance/clock-out", { method: "POST" }
  );

export const getOrgAttendanceSummary = (month?: string) =>
  apiFetch<{ success: boolean; summary: Record<string, unknown> }>(
    `/api/attendance/org-summary${month ? `?month=${month}` : ""}`
  );

// ─────────────────────────────────────────────
// Eligibility
// ─────────────────────────────────────────────
export const getEligibilitySummary = () =>
  apiFetch<{ success: boolean; qualified: number; total: number }>(
    "/api/eligibility/org-summary"
  );

export const checkMyEligibility = () =>
  apiFetch<{ success: boolean }>("/api/eligibility/check");

// ─────────────────────────────────────────────
// Payroll
// ─────────────────────────────────────────────
export const getPayrollHistory = () =>
  apiFetch<{ success: boolean; payrollRuns: Record<string, unknown>[] }>(
    "/api/payroll/history"
  );

export const createPayrollRun = (month: number, year: number) =>
  apiFetch<{ success: boolean; payrollRun: Record<string, unknown> }>(
    "/api/payroll/run", {
      method: "POST",
      body: JSON.stringify({ month: `${year}-${String(month).padStart(2, "0")}` }),
    }
  );

export const approvePayrollRun = (id: string) =>
  apiFetch<{ success: boolean; payrollRun: Record<string, unknown> }>(
    `/api/payroll/${id}/approve`, { method: "PATCH" }
  );

export const disbursePayroll = (id: string) =>
  apiFetch<{ success: boolean; payrollRun: Record<string, unknown> }>(
    `/api/payroll/${id}/disburse`, { method: "POST" }
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
// Staff  (ADMIN / MANAGER)
// ─────────────────────────────────────────────
export const getStaff = () =>
  apiFetch<{ success: boolean; staff: Record<string, unknown>[] }>("/api/staff");

export const updateStaff = (id: string, data: { salary?: number; department?: string }) =>
  apiFetch<{ success: boolean; worker: Record<string, unknown> }>(
    `/api/staff/${id}`, { method: "PATCH", body: JSON.stringify(data) }
  );

// ─────────────────────────────────────────────
// AI Agent
// ─────────────────────────────────────────────
export const sendChat = (message: string) =>
  apiFetch<{ success: boolean; reply: string }>("/api/agent/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });

// ─────────────────────────────────────────────
// Bank Accounts
// ─────────────────────────────────────────────
export const getMyBankAccounts = () =>
  apiFetch<{ success: boolean }>("/api/bank");

export const addBankAccount = (data: { accountNumber: string; bankCode: string; accountName: string }) =>
  apiFetch<{ success: boolean }>("/api/bank", {
    method: "POST",
    body: JSON.stringify(data),
  });
                                               
