"use client";

import { Download, CalendarIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyAttendance = [
  { day: '01', present: 135, late: 5, absent: 2 },
  { day: '02', present: 138, late: 3, absent: 1 },
  { day: '03', present: 140, late: 2, absent: 0 },
  { day: '04', present: 130, late: 8, absent: 4 },
  { day: '05', present: 141, late: 1, absent: 0 },
  { day: '06', present: 139, late: 2, absent: 1 },
  { day: '07', present: 142, late: 0, absent: 0 },
];

export default function AttendancePage() {
  const records = [
    { name: "Chidi Eze", date: "Oct 24, 2023", checkIn: "08:15 AM", checkOut: "05:30 PM", status: "Present" },
    { name: "Aisha Bello", date: "Oct 24, 2023", checkIn: "09:05 AM", checkOut: "06:00 PM", status: "Late" },
    { name: "Kunle Afolayan", date: "Oct 24, 2023", checkIn: "-", checkOut: "-", status: "Absent" },
    { name: "Joy Nnamdi", date: "Oct 24, 2023", checkIn: "08:00 AM", checkOut: "05:00 PM", status: "Present" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">Monitor daily check-ins and late arrivals.</p>
        </div>
        <div className="flex gap-3">
          <button className="border px-4 py-2 rounded-md font-medium hover:bg-muted/50 text-sm flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" /> This Week
          </button>
          <button className="bg-secondary text-foreground border border-border px-4 py-2 rounded-md font-medium hover:bg-muted text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Overall Attendance Rate</h3>
            <p className="text-sm text-muted-foreground">Tracking compliance across all departments</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">94.2%</p>
            <p className="text-xs text-emerald-600 font-medium">+1.2% from last week</p>
          </div>
        </div>
        <div className="h-[200px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyAttendance} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="present" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card w-full rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Daily Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Check-In</th>
                <th className="px-6 py-4 font-medium">Check-Out</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((r, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{r.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.date}</td>
                  <td className="px-6 py-4 font-medium">{r.checkIn}</td>
                  <td className="px-6 py-4 font-medium">{r.checkOut}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      r.status === "Present" ? "bg-emerald-100 text-emerald-700" : 
                      r.status === "Late" ? "bg-amber-100 text-amber-700" : 
                      "bg-destructive/10 text-destructive"
                    }`}>
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
