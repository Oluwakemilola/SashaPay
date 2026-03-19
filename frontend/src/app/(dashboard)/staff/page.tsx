"use client";
// ─────────────────────────────────────────────
// SachaPay — Staff Management
// File: src/app/(dashboard)/staff/page.tsx
// ─────────────────────────────────────────────
// Admin-only page. Hidden/Blocked for workers.
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import { Users, Filter, Search, Plus, UserCircle, ShieldAlert } from "lucide-react";
import { getStaff, getStoredUser } from "@/lib/api";

type StaffMember = {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  salary: number;
  isActive: boolean;
};

export default function StaffPage() {
  const [staff,   setStaff]   = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [role,    setRole]    = useState("WORKER");

  useEffect(() => {
    const user = getStoredUser();
    setRole(user?.role || "WORKER");

    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
        getStaff()
            .then((d) => setStaff(d.staff as unknown as StaffMember[]))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, []);

  const filteredStaff = staff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.department || "").toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (role === "WORKER") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="bg-[#0B3D2E]/10 p-6 rounded-full animate-pulse border border-[#0B3D2E]/20">
            <ShieldAlert className="w-16 h-16 text-[#0B3D2E]" />
        </div>
        <div className="max-w-md">
            <h2 className="text-3xl font-extrabold text-[#0B3D2E] mb-2 tracking-tight">Privacy Restricted</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
                Management of the staff directory is restricted to administrators. 
                If you believe this is an error, please contact your HR department.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#0B3D2E]">Staff Management</h2>
          <p className="text-muted-foreground">Manage your employees, roles, and compensation.</p>
        </div>
        <button className="bg-[#0B3D2E] text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Staff
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4 text-sm animate-shake">
          ⚠ {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/30 border-none outline-none pl-10 pr-4 py-2 rounded-xl text-sm focus:ring-1 ring-[#C9962A]/50"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-card w-full rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0B3D2E]/5 text-[#0B3D2E] uppercase text-[10px] font-bold tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-[#C9962A] border-t-transparent rounded-full animate-spin" />
                        Scanning staff directory...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-muted-foreground italic">
                    No matching employees found in the directory.
                  </td>
                </tr>
              )}
              {filteredStaff.map((member) => (
                <tr key={member._id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#0B3D2E] font-bold group-hover:scale-110 transition-transform">
                        <UserCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0B3D2E]">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-muted px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight">
                        {member.department || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`text-[11px] font-medium ${member.role === 'ADMIN' ? 'text-[#C9962A]' : 'text-slate-600'}`}>
                        {member.role}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${member.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {member.isActive ? "ACTIVE" : "INACTIVE"}
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