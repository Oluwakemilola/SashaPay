import { Filter, Search, Plus, MoreHorizontal } from "lucide-react";

export default function StaffPage() {
  const staff = [
    { name: "Chidi Eze", role: "Software Engineer", dept: "Engineering", salary: "₦ 450,000", att: "94%", status: "Active" },
    { name: "Aisha Bello", role: "Sales Rep", dept: "Sales", salary: "₦ 200,000", att: "88%", status: "Active" },
    { name: "Kunle Afolayan", role: "Driver", dept: "Operations", salary: "₦ 120,000", att: "65%", status: "On Leave" },
    { name: "Joy Nnamdi", role: "HR Manager", dept: "HR", salary: "₦ 350,000", att: "98%", status: "Active" },
    { name: "Emeka Chuks", role: "UI Designer", dept: "Design", salary: "₦ 300,000", att: "91%", status: "Active" },
    { name: "Fatima Umar", role: "Marketing Lead", dept: "Marketing", salary: "₦ 400,000", att: "85%", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground">Manage your employees, roles, and compensation.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="bg-card w-full rounded-xl border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search staff..."
              className="w-full bg-background border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button className="border px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-muted/50 transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Salary</th>
                <th className="px-6 py-4 font-medium">Attendance Rate</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {staff.map((s, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.role}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{s.dept}</td>
                  <td className="px-6 py-4 font-medium">{s.salary}</td>
                  <td className="px-6 py-4">{s.att}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      s.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary hover:underline font-medium text-sm mr-4">View Profile</button>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <p>Showing 1 to 6 of 142 entries</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 border rounded hover:bg-muted transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">1</button>
            <button className="px-3 py-1 border rounded hover:bg-muted transition-colors">2</button>
            <button className="px-3 py-1 border rounded hover:bg-muted transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
