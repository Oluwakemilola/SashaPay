"use client";

import { Users, TrendingUp, CalendarCheck, Wallet } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const attendanceData = [
  { name: 'Mon', rate: 85 },
  { name: 'Tue', rate: 88 },
  { name: 'Wed', rate: 92 },
  { name: 'Thu', rate: 89 },
  { name: 'Fri', rate: 95 },
];

const payrollData = [
  { name: 'Engineering', amount: 4500000 },
  { name: 'Sales', amount: 3200000 },
  { name: 'Operations', amount: 2800000 },
  { name: 'Marketing', amount: 1500000 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">Welcome back! Here is what's happening today.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 text-sm">
          Run Payroll
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Staff" value="142" icon={Users} trend="+3 this month" />
        <SummaryCard title="Avg Attendance" value="91.4%" icon={CalendarCheck} trend="+2.1% from last week" />
        <SummaryCard title="Upcoming Payroll" value="₦ 12.4M" icon={Wallet} trend="Due in 4 days" />
        <SummaryCard title="Successful Payouts" value="1,248" icon={TrendingUp} trend="Lifetime total" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-lg">Weekly Attendance Trend</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={-10} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-lg">Payroll by Department</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payrollData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={-10} tickFormatter={(value) => `₦${value/1000000}M`} />
                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-lg">Recent Payroll Eligibility</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Worker Name</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Attendance</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { name: "Chidi Eze", role: "Software Engineer", att: "94%", status: "Eligible", salary: "₦ 450,000" },
                { name: "Aisha Bello", role: "Sales Rep", att: "88%", status: "Eligible", salary: "₦ 200,000" },
                { name: "Kunle Afolayan", role: "Driver", att: "65%", status: "Borderline", salary: "₦ 120,000" },
                { name: "Joy Nnamdi", role: "HR Manager", att: "98%", status: "Eligible", salary: "₦ 350,000" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{row.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{row.role}</td>
                  <td className="px-6 py-4">{row.att}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      row.status === "Eligible" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{row.salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, trend }: any) {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </div>
    </div>
  );
}
