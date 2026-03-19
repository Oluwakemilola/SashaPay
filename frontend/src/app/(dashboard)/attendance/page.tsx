"use client";
// ─────────────────────────────────────────────
// SachaPay — Attendance Page
// File: src/app/(dashboard)/attendance/page.tsx
// ─────────────────────────────────────────────
// Workers see their own records via GET /api/attendance/my-records
// Admins see org-wide summary via GET /api/attendance/org-summary
// Role is read from localStorage
// ─────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import { Download, PlayCircle, StopCircle, Loader2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { getMyAttendance, getOrgAttendanceSummary, getStoredUser, clockIn, clockOut } from "@/lib/api";

type AttRecord = {
  _id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "PRESENT" | "LATE" | "ABSENT";
  hoursWorked: number;
};

const STATUS_CLS: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  LATE:    "bg-amber-100 text-amber-700",
  ABSENT:  "bg-destructive/10 text-destructive",
};

function fmt12h(isoStr: string | null): string {
  if (!isoStr) return "—";
  try {
    return new Date(isoStr).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

export default function AttendancePage() {
  const [records,  setRecords]  = useState<AttRecord[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,    setError]    = useState("");
  const [isAdmin,  setIsAdmin]  = useState(false);
  const [todayStatus, setTodayStatus] = useState<"NONE" | "CLOCKED_IN" | "CLOCKED_OUT">("NONE");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const user = getStoredUser();
      const admin = user?.role === "ADMIN" || user?.role === "MANAGER";
      setIsAdmin(!!admin);

      const fetchFunc = admin ? getOrgAttendanceSummary() : getMyAttendance();
      const d = await fetchFunc;
      
      const raw = (d as any).attendance || (d as any).records || (d as any).summary || [];
      const recordsData = Array.isArray(raw) ? (raw as AttRecord[]) : [];
      setRecords(recordsData);

      // Check today's status for workers
      if (!admin) {
        const todayStr = new Date().toDateString();
        const todayRecord = recordsData.find(r => new Date(r.date).toDateString() === todayStr);
        
        if (!todayRecord) {
          setTodayStatus("NONE");
        } else if (todayRecord.checkOut) {
          setTodayStatus("CLOCKED_OUT");
        } else {
          setTodayStatus("CLOCKED_IN");
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      await clockIn();
      await fetchData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setActionLoading(true);
      await clockOut();
      await fetchData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Build chart data from records ────────────
  // Group by date, count present/late/absent
  const chartData = (() => {
    const map: Record<string, { day: string; present: number; late: number; absent: number }> = {};
    records.slice(-14).forEach((r) => {
      const day = new Date(r.date).toLocaleDateString("en-NG", { day: "2-digit" });
      if (!map[day]) map[day] = { day, present: 0, late: 0, absent: 0 };
      if (r.status === "PRESENT") map[day].present++;
      else if (r.status === "LATE") map[day].late++;
      else map[day].absent++;
    });
    return Object.values(map);
  })();

  const attendanceRate =
    records.length > 0
      ? Math.round(
          (records.filter((r) => r.status !== "ABSENT").length / records.length) * 100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">
            {isAdmin ? "Organisation-wide attendance overview." : "Your personal attendance records."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isAdmin && (
            <>
              {todayStatus === "NONE" && (
                <button
                  disabled={actionLoading}
                  onClick={handleClockIn}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 text-sm flex items-center gap-2 shadow-sm"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                  Clock In
                </button>
              )}
              {todayStatus === "CLOCKED_IN" && (
                <button
                  disabled={actionLoading}
                  onClick={handleClockOut}
                  className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md font-medium hover:bg-destructive/90 text-sm flex items-center gap-2 shadow-sm"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4" />}
                  Clock Out
                </button>
              )}
              {todayStatus === "CLOCKED_OUT" && (
                <span className="bg-muted text-muted-foreground px-4 py-2 rounded-md text-sm font-medium border">
                  Today Complete
                </span>
              )}
            </>
          )}
          <button
            className="bg-secondary text-foreground border border-border px-4 py-2 rounded-md font-medium hover:bg-muted text-sm flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* Rate + Chart */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Overall Attendance Rate</h3>
            <p className="text-sm text-muted-foreground">Based on your recent records</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{loading ? "—" : `${attendanceRate}%`}</p>
          </div>
        </div>
        <div className="h-[200px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
              <Area type="monotone" dataKey="present" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-card w-full rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Daily Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Check-In</th>
                <th className="px-6 py-4 font-medium">Check-Out</th>
                <th className="px-6 py-4 font-medium">Hours</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Loading…</td>
                </tr>
              )}
              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No attendance records found yet.
                  </td>
                </tr>
              )}
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    {new Date(r.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4">{fmt12h(r.checkIn)}</td>
                  <td className="px-6 py-4">{fmt12h(r.checkOut)}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.hoursWorked ? `${r.hoursWorked}h` : "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CLS[r.status] ?? ""}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
