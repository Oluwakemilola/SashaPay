"use client";

import { CheckCircle2, AlertCircle, XCircle, PlayCircle } from "lucide-react";

export default function PayrollPage() {
  const payroll = [
    { name: "Chidi Eze", base: "₦ 450,000", score: "94%", ded: "₦ 0", final: "₦ 450,000", status: "Qualified" },
    { name: "Aisha Bello", base: "₦ 200,000", score: "88%", ded: "₦ 0", final: "₦ 200,000", status: "Qualified" },
    { name: "Kunle Afolayan", base: "₦ 120,000", score: "65%", ded: "₦ 42,000", final: "₦ 78,000", status: "Borderline" },
    { name: "Joy Nnamdi", base: "₦ 350,000", score: "98%", ded: "₦ 0", final: "₦ 350,000", status: "Qualified" },
    { name: "Ahmed Musa", base: "₦ 150,000", score: "45%", ded: "₦ 150,000", final: "₦ 0", status: "Not Qualified" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payroll Cycle</h2>
          <p className="text-muted-foreground">Review eligibility and process payouts for October 2023.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatusCard title="Qualified Staff" count="128" icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-50" />
        <StatusCard title="Borderline Staff" count="12" icon={AlertCircle} color="text-amber-500" bg="bg-amber-50" />
        <StatusCard title="Not Qualified" count="2" icon={XCircle} color="text-destructive" bg="bg-destructive/10" />
      </div>

      <div className="bg-card w-full rounded-xl border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            October Payroll Draft <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Pending Review</span>
          </h3>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <PlayCircle className="w-4 h-4" /> Run Payroll (₦ 12.4M)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Staff Name</th>
                <th className="px-6 py-4 font-medium">Base Salary</th>
                <th className="px-6 py-4 font-medium">Attendance Score</th>
                <th className="px-6 py-4 font-medium">Deductions</th>
                <th className="px-6 py-4 font-medium">Final Salary</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payroll.map((p, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{p.base}</td>
                  <td className="px-6 py-4 font-medium">{p.score}</td>
                  <td className="px-6 py-4 text-destructive">{p.ded}</td>
                  <td className="px-6 py-4 font-bold">{p.final}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                      p.status === "Qualified" ? "bg-emerald-100 text-emerald-700" : 
                      p.status === "Borderline" ? "bg-amber-100 text-amber-700" : 
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {p.status === "Qualified" && <CheckCircle2 className="w-3 h-3" />}
                      {p.status === "Borderline" && <AlertCircle className="w-3 h-3" />}
                      {p.status === "Not Qualified" && <XCircle className="w-3 h-3" />}
                      {p.status}
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

function StatusCard({ title, count, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-xl ${bg} ${color}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{count}</p>
      </div>
    </div>
  );
}
