"use client";
import { useEffect, useState } from "react";
import { Search, X, Check, Pencil } from "lucide-react";
import { getToken } from "@/lib/api";

const API   = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";
const GREEN = "#0B3D2E";
const GOLD  = "#C9962A";

type Worker = { _id: string; name: string; email: string; department?: string; salary?: number; isActive: boolean; };
type EditState = { salary: string; department: string; };

export default function StaffPage() {
  const [staff, setStaff]       = useState<Worker[]>([]);
  const [filtered, setFiltered] = useState<Worker[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [editing, setEditing]   = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState>({ salary: "", department: "" });
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");

  useEffect(() => {
    fetch(`${API}/api/staff`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => { setStaff(d.staff || []); setFiltered(d.staff || []); })
      .catch(() => setError("Could not load staff"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(staff.filter(w => w.name.toLowerCase().includes(q) || w.email.toLowerCase().includes(q) || (w.department || "").toLowerCase().includes(q)));
  }, [search, staff]);

  const startEdit = (w: Worker) => { setEditing(w._id); setEditForm({ salary: w.salary ? String(w.salary) : "", department: w.department || "" }); setSaveMsg(""); };
  const cancelEdit = () => { setEditing(null); setSaveMsg(""); };

  const saveEdit = async (workerId: string) => {
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch(`${API}/api/staff/${workerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ salary: editForm.salary ? Number(editForm.salary) : undefined, department: editForm.department || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveMsg(data.message || "Failed to save"); return; }
      setStaff(prev => prev.map(w => w._id === workerId ? { ...w, ...data.worker } : w));
      setEditing(null);
    } catch { setSaveMsg("Could not connect"); }
    finally { setSaving(false); }
  };

  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ fontFamily: "Outfit, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: GREEN, marginBottom: 4 }}>Staff Management</h2>
        <p style={{ fontSize: 14, color: "#6B7B72" }}>Set salaries and departments for your workers.</p>
      </div>

      <div style={{ position: "relative", marginBottom: 20, maxWidth: 400 }}>
        <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9AADA6" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..." style={{ width: "100%", padding: "10px 14px 10px 38px", border: "1.5px solid #E8EDE8", borderRadius: 10, outline: "none", fontSize: 14, color: GREEN, fontFamily: "Outfit, sans-serif" }} />
      </div>

      {error && <div style={{ padding: "12px 16px", background: "#FEF2F2", color: "#DC2626", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
      {saveMsg && <div style={{ padding: "10px 16px", background: "#F0FDF4", color: "#059669", borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 600 }}>{saveMsg}</div>}

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EDE8", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 80px", padding: "12px 20px", background: "#F8F5ED", borderBottom: "1px solid #E8EDE8" }}>
          {["Employee", "Department", "Salary (₦/month)", "Status", ""].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9AADA6", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9AADA6", fontSize: 14 }}>Loading staff...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9AADA6", fontSize: 14 }}>
            {search ? "No staff match your search." : "No workers yet. Share your invite code to add staff."}
          </div>
        ) : filtered.map((w, i) => (
          <div key={w._id} style={{ borderTop: i === 0 ? "none" : "1px solid #F0EDE6", background: editing === w._id ? "#FAFFF9" : "#fff" }}>
            {editing !== w._id ? (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 80px", padding: "14px 20px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: GOLD, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{initials(w.name)}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: GREEN }}>{w.name}</div>
                    <div style={{ fontSize: 12, color: "#9AADA6" }}>{w.email}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: w.department ? "#3A5248" : "#C4CFC8", fontStyle: w.department ? "normal" : "italic" }}>{w.department || "Not set"}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: w.salary ? GREEN : "#C4CFC8", fontStyle: w.salary ? "normal" : "italic" }}>{w.salary ? `₦${w.salary.toLocaleString()}` : "Not set"}</div>
                <div><span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: w.isActive ? "#F0FDF4" : "#F8F5ED", color: w.isActive ? "#059669" : "#9AADA6" }}>{w.isActive ? "Active" : "Inactive"}</span></div>
                <div><button onClick={() => startEdit(w)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", border: `1px solid ${GREEN}`, borderRadius: 8, background: "transparent", color: GREEN, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}><Pencil style={{ width: 12, height: 12 }} /> Edit</button></div>
              </div>
            ) : (
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: GOLD, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{initials(w.name)}</div>
                  <div><div style={{ fontSize: 14, fontWeight: 600, color: GREEN }}>{w.name}</div><div style={{ fontSize: 12, color: "#9AADA6" }}>{w.email}</div></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B7B72", marginBottom: 6 }}>Monthly Salary (₦)</label>
                    <input type="number" placeholder="e.g. 150000" value={editForm.salary} onChange={e => setEditForm({ ...editForm, salary: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${GREEN}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "Outfit, sans-serif", color: GREEN }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B7B72", marginBottom: 6 }}>Department</label>
                    <input type="text" placeholder="e.g. Engineering" value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E8EDE8", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "Outfit, sans-serif", color: GREEN }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => saveEdit(w._id)} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: GREEN, color: "#F8F5ED", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1, fontFamily: "Outfit, sans-serif" }}>
                    <Check style={{ width: 14, height: 14 }} />{saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={cancelEdit} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "transparent", color: "#6B7B72", border: "1px solid #E8EDE8", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
                    <X style={{ width: 14, height: 14 }} /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <p style={{ marginTop: 12, fontSize: 12, color: "#C4CFC8" }}>{filtered.length} worker{filtered.length !== 1 ? "s" : ""} · Salary is used for payroll disbursements</p>
    </div>
  );
               }
        
