"use client";
import { useEffect, useState, useCallback } from "react";
import { Download, PlayCircle, StopCircle, Loader2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { getMyAttendance, getOrgAttendanceSummary, getStoredUser, clockIn, clockOut } from "@/lib/api";

const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";

type AttRecord = {
  _id:         string;
  date:        string;
  checkIn:     string | null;
  checkOut:    string | null;
  status:      "PRESENT" | "LATE" | "ABSENT";
  hoursWorked: number;
  worker?:     { name: string; email: string; department: string };
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PRESENT: { bg: "#F0FDF4", color: "#059669" },
  LATE:    { bg: "#FFFBEB", color: "#D97706" },
  ABSENT:  { bg: "#FEF2F2", color: "#DC2626" },
};

function fmt(isoStr: string | null): string {
  if (!isoStr) return "—";
  try { return new Date(isoStr).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }); }
  catch { return "—"; }
}

export default function AttendancePage() {
  const [records,       setRecords]       = useState<AttRecord[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [isAdmin,       setIsAdmin]       = useState(false);
  const [todayStatus,   setTodayStatus]   = useState<"NONE" | "CLOCKED_IN" | "CLOCKED_OUT">("NONE");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const user  = getStoredUser();
      const admin = user?.role === "ADMIN" || user?.role === "MANAGER";
      setIsAdmin(!!admin);

      const d   = await (admin ? getOrgAttendanceSummary() : getMyAttendance());
      const raw = (d as any).attendance || [];
      setRecords(Array.isArray(raw) ? raw : []);

      if (!admin) {
        const todayStr    = new Date().toDateString();
        const todayRecord = raw.find((r: AttRecord) => new Date(r.date).toDateString() === todayStr);
        setTodayStatus(!todayRecord ? "NONE" : todayRecord.checkOut ? "CLOCKED_OUT" : "CLOCKED_IN");
      }
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClockIn  = async () => { try { setActionLoading(true); await clockIn();  await fetchData(); } catch (e: any) { alert(e.message); } finally { setActionLoading(false); } };
  const handleClockOut = async () => { try { setActionLoading(true); await clockOut(); await fetchData(); } catch (e: any) { alert(e.message); } finally { setActionLoading(false); } };

  const attendanceRate = records.length > 0
    ? Math.round((records.filter(r => r.status !== "ABSENT").length / records.length) * 100)
    : 0;

  const chartData = (() => {
    const map: Record<string, { day: string; present: number }> = {};
    records.slice(-14).forEach(r => {
      const day = new Date(r.date).toLocaleDateString("en-NG", { day: "2-digit", month: "short" });
      if (!map[day]) map[day] = { day, present: 0 };
      if (r.status !== "ABSENT") map[day].present++;
    });
    return Object.values(map);
  })();

  return (
    <div style={{ fontFamily: "Outfit, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: GREEN, marginBottom: 4 }}>Attendance</h2>
          <p style={{ fontSize: 14, color: "#6B7B72" }}>
            {isAdmin ? "Organisation-wide attendance overview." : "Your personal attendance records."}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isAdmin && todayStatus === "NONE" && (
            <button onClick={handleClockIn} disabled={actionLoading}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: GREEN, color: "#F8F5ED", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
              {actionLoading ? <Loader2 style={{ width: 14, height: 14 }} /> : <PlayCircle style={{ width: 14, height: 14 }} />}
              Clock In
            </button>
          )}
          {!isAdmin && todayStatus === "CLOCKED_IN" && (
            <button onClick={handleClockOut} disabled={actionLoading}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#DC2626", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
              {actionLoading ? <Loader2 style={{ width: 14, height: 14 }} /> : <StopCircle style={{ width: 14, height: 14 }} />}
              Clock Out
            </button>
          )}
          {!isAdmin && todayStatus === "CLOCKED_OUT" && (
            <span style={{ padding: "10px 20px", background: "#F0F7F4", color: GREEN, borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
              ✓ Today Complete
            </span>
          )}
          <button onClick={() => window.print()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "#fff", border: "1.5px solid #E8EDE8", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", color: GREEN, fontFamily: "Outfit, sans-serif" }}>
            <Download style={{ width: 14, height: 14 }} /> Export
          </button>
        </div>
      </div>

      {error && <div style={{ padding: "12px 16px", background: "#FEF2F2", color: "#DC2626", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>⚠ {error}</div>}

      {/* Rate + Chart */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: GREEN }}>Overall Attendance Rate</h3>
            <p style={{ fontSize: 13, color: "#9AADA6", marginTop: 2 }}>Based on last 30 days</p>
          </div>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: GREEN }}>
            {loading ? "—" : `${attendanceRate}%`}
          </p>
        </div>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={GREEN} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE6" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9AADA6", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9AADA6", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
              <Area type="monotone" dataKey="present" stroke={GREEN} fillOpacity={1} fill="url(#grad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Logs Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #E8EDE8" }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: GREEN }}>Daily Logs</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#F8F5ED" }}>
                {isAdmin && <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Worker</th>}
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</th>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Check-In</th>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Check-Out</th>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Hours</th>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={isAdmin ? 6 : 5} style={{ padding: "40px", textAlign: "center", color: "#9AADA6" }}>Loading...</td></tr>
              )}
              {!loading && records.length === 0 && (
                <tr><td colSpan={isAdmin ? 6 : 5} style={{ padding: "40px", textAlign: "center", color: "#9AADA6" }}>No attendance records found yet.</td></tr>
              )}
              {records.map((r, i) => {
                const s = STATUS_STYLE[r.status] || STATUS_STYLE.PRESENT;
                return (
                  <tr key={r._id} style={{ borderTop: i === 0 ? "none" : "1px solid #F0EDE6" }}>
                    {isAdmin && (
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: GREEN }}>{r.worker?.name || "—"}</p>
                        <p style={{ fontSize: 11, color: "#9AADA6" }}>{r.worker?.department || ""}</p>
                      </td>
                    )}
                    <td style={{ padding: "12px 16px", color: GREEN, fontWeight: 500 }}>
                      {new Date(r.date).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6B7B72" }}>{fmt(r.checkIn)}</td>
                    <td style={{ padding: "12px 16px", color: "#6B7B72" }}>{fmt(r.checkOut)}</td>
                    <td style={{ padding: "12px 16px", color: "#6B7B72" }}>{r.hoursWorked ? `${r.hoursWorked}h` : "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
      }
        
