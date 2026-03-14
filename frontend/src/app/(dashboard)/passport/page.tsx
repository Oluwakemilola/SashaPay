"use client";

import { ShieldCheck, Award, Briefcase, ChevronRight, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const incomeData = [
  { month: 'May', amount: 450000 },
  { month: 'Jun', amount: 450000 },
  { month: 'Jul', amount: 450000 },
  { month: 'Aug', amount: 450000 },
  { month: 'Sep', amount: 450000 },
  { month: 'Oct', amount: 450000 },
];

const attData = [
  { month: 'May', score: 92 },
  { month: 'Jun', score: 95 },
  { month: 'Jul', score: 88 },
  { month: 'Aug', score: 96 },
  { month: 'Sep', score: 98 },
  { month: 'Oct', score: 94 },
];

export default function PassportPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <span>Staff</span>
        <ChevronRight className="w-4 h-4" />
        <span>Chidi Eze</span>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-foreground">Financial Passport</span>
      </div>

      {/* Header Profile Card */}
      <div className="bg-card w-full rounded-2xl border shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl font-bold border border-primary/20">
              CE
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Chidi Eze</h2>
              <div className="flex items-center gap-3 mt-2 text-muted-foreground text-sm">
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> Software Engineer</span>
                <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                <span>Engineering Dept.</span>
                <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                <span>ID: EMP-042</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Monthly Salary</p>
            <p className="text-3xl font-bold text-primary mt-1">₦ 450,000</p>
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold mt-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Identity
            </span>
          </div>
        </div>
      </div>

      {/* Trust Scores */}
      <h3 className="text-xl font-bold tracking-tight mt-8 mb-4">Worker Trust Scores</h3>
      <div className="grid gap-6 md:grid-cols-3">
        <ScoreCard title="Employment Stability" score="98" desc="Excellent" icon={Briefcase} />
        <ScoreCard title="Income Consistency" score="100" desc="Perfect" icon={TrendingUp} />
        <ScoreCard title="Attendance Reliability" score="93" desc="Very Good" icon={Award} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            Verified Income History <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground font-normal">6 Months</span>
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={-10} tickFormatter={(val) => `₦${val/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="step" dataKey="amount" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            Attendance Consistency <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground font-normal">6 Months</span>
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={-10} domain={[60, 100]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, fill: "hsl(var(--primary))", strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ title, score, desc, icon: Icon }: any) {
  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
      <div className="absolute right-0 bottom-0 opacity-5 w-32 h-32 -mr-8 -mb-8 pointer-events-none transition-transform group-hover:scale-110">
        <Icon className="w-full h-full" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-4">{title}</p>
      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-extrabold tracking-tighter text-primary">{score}</span>
        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{desc}</span>
      </div>
      <div className="w-full bg-muted h-2 rounded-full mt-5 overflow-hidden">
        <div className="bg-primary h-full rounded-full" style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
}
