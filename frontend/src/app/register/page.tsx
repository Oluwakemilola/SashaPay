"use client";
// ─────────────────────────────────────────────
// File: src/app/register/page.tsx
// SachaPay — Register Page
// ─────────────────────────────────────────────
// This page handles TWO types of registration:
//   Tab 1: "New Company"  → POST /api/auth/register-org
//   Tab 2: "Join Team"    → POST /api/auth/register
//
// After success → saves JWT to localStorage → redirects to /dashboard
// ─────────────────────────────────────────────

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy, ArrowRight, Building2, UserPlus, Mail, Lock, User, Briefcase } from "lucide-react";
import Logo from "@/components/brand/Logo";

const API = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";

function RegisterFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ── Which tab is active: "company" or "join" ──
    const [tab, setTab] = useState<"company" | "join">(
        searchParams.get("tab") === "join" ? "join" : "company"
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [orgForm, setOrgForm] = useState({
        orgName: "",
        orgEmail: "",
        orgPhone: "",
        industry: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        payrollPolicy: "FIXED_SALARY",
    });

    const [joinForm, setJoinForm] = useState({
        name: "",
        email: "",
        password: "",
        inviteCode: "",
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [regInviteCode, setRegInviteCode] = useState("");

    const handleRegisterOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API}/api/auth/register-org`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orgForm),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Registration failed");
                return;
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("organization", JSON.stringify(data.organization));
            setRegInviteCode(data.organization?.inviteCode || data.inviteCode || "");
            setShowSuccessModal(true);
        } catch {
            setError("Could not connect to server. Is your backend running?");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(joinForm),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Could not join team");
                return;
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("organization", JSON.stringify(data.organization));
            router.push("/dashboard");
        } catch {
            setError("Could not connect to server. Is your backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap');
                
                .page-container { 
                    font-family: 'Outfit', sans-serif; 
                    background: #F8F5ED; 
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }
                
                @media (max-width: 900px) {
                    .page-container { grid-template-columns: 1fr; }
                    .panel-left { display: none; }
                }

                .panel-left {
                    background: #0B3D2E;
                    padding: 60px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    color: white;
                    position: sticky;
                    top: 0;
                    height: 100vh;
                }

                .panel-headline {
                    font-family: 'DM Serif Display', serif;
                    font-size: 48px;
                    line-height: 1.1;
                    margin-bottom: 24px;
                }
                .panel-headline em { color: #C9962A; font-style: italic; }
                .panel-sub { color: rgba(255,255,255,0.7); font-size: 16px; margin-bottom: 40px; }

                .panel-right {
                    padding: 60px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    max-width: 600px;
                    margin: 0 auto;
                    width: 100%;
                }

                .form-card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                
                .tab-bar {
                    display: flex;
                    background: #F3F4F6;
                    padding: 4px;
                    border-radius: 12px;
                    margin-bottom: 32px;
                }
                .tab-btn {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #6B7280;
                }
                .tab-btn.active { background: white; color: #0B3D2E; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

                .field { margin-bottom: 20px; }
                .field label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; }
                .field input, .field select {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1.5px solid #E5E7EB;
                    border-radius: 12px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .field input:focus { border-color: #0B3D2E; }

                .btn-primary {
                    width: 100%;
                    background: #0B3D2E;
                    color: white;
                    padding: 16px;
                    border-radius: 12px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: opacity 0.2s;
                    margin-top: 10px;
                }
                .btn-primary:hover { opacity: 0.9; }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

                .error-box { background: #FEF2F2; color: #DC2626; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }

                .step-item { display: flex; gap: 16px; margin-bottom: 24px; }
                .step-icon { width: 32px; height: 32px; background: rgba(201, 150, 42, 0.2); color: #C9962A; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: bold; }
            `}</style>

            {/* Left Panel */}
            <div className="panel-left">
                <Logo size={40} variant="inverted" />
                
                <div>
                    <h1 className="panel-headline">
                        {tab === "company" ? (
                            <>Scale your team,<br /><em>automate finance.</em></>
                        ) : (
                            <>Your earnings,<br /><em>your identity.</em></>
                        )}
                    </h1>
                    <p className="panel-sub">
                        SachaPay is building the next generation of financial infrastructure for emerging markets.
                    </p>

                    <div className="steps-list">
                        {tab === "company" ? (
                            <>
                                <div className="step-item">
                                    <div className="step-icon">1</div>
                                    <div>
                                        <h4 className="font-bold">Register Org</h4>
                                        <p className="text-sm opacity-60">Set up your company profile in seconds.</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-icon">2</div>
                                    <div>
                                        <h4 className="font-bold">Instant Invite</h4>
                                        <p className="text-sm opacity-60">Get a code to share with your staff.</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="step-item">
                                    <div className="step-icon">1</div>
                                    <div>
                                        <h4 className="font-bold">Join Team</h4>
                                        <p className="text-sm opacity-60">Enter the code provided by your admin.</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-icon">2</div>
                                    <div>
                                        <h4 className="font-bold">Build Credit</h4>
                                        <p className="text-sm opacity-60">Your salary history becomes your credit score.</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="text-sm opacity-40">© 2026 SachaPay Technical Assessment</div>
            </div>

            {/* Right Panel */}
            <div className="panel-right">
                <div className="form-card">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#0B3D2E] mb-2">Get Started</h2>
                        <p className="text-gray-500 text-sm">Join the ecosystem of verified financial identities.</p>
                    </div>

                    <div className="tab-bar">
                        <button className={`tab-btn ${tab === "company" ? "active" : ""}`} onClick={() => setTab("company")}>New Company</button>
                        <button className={`tab-btn ${tab === "join" ? "active" : ""}`} onClick={() => setTab("join")}>Join Team</button>
                    </div>

                    {error && <div className="error-box">{error}</div>}

                    {tab === "company" ? (
                        <form onSubmit={handleRegisterOrg}>
                            <div className="field">
                                <label>Company Name</label>
                                <input type="text" required placeholder="Acme Ltd" value={orgForm.orgName} onChange={e => setOrgForm({...orgForm, orgName: e.target.value})} />
                            </div>
                            <div className="field">
                                <label>Industry</label>
                                <select value={orgForm.industry} onChange={e => setOrgForm({...orgForm, industry: e.target.value})}>
                                    <option value="">Select industry</option>
                                    <option value="Tech">Technology & Software</option>
                                    <option value="Finance">Finance & Banking</option>
                                    <option value="Healthcare">Healthcare & Medical</option>
                                    <option value="Education">Education & Training</option>
                                    <option value="Retail">Retail & Ecommerce</option>
                                    <option value="Agriculture">Agriculture & Agritech</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Logistics">Logistics & Transport</option>
                                    <option value="Construction">Construction & Real Estate</option>
                                    <option value="Hospitality">Hospitality & Tourism</option>
                                    <option value="Legal">Legal Services</option>
                                    <option value="Non-Profit">Non-Profit / NGO</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="field">
                                <label>Admin Full Name</label>
                                <input type="text" required placeholder="John Doe" value={orgForm.adminName} onChange={e => setOrgForm({...orgForm, adminName: e.target.value})} />
                            </div>
                            <div className="field">
                                <label>Admin Email</label>
                                <input type="email" required placeholder="admin@acme.com" value={orgForm.adminEmail} onChange={e => setOrgForm({...orgForm, adminEmail: e.target.value})} />
                            </div>
                            <div className="field">
                                <label>Password</label>
                                <input type="password" required minLength={8} value={orgForm.adminPassword} onChange={e => setOrgForm({...orgForm, adminPassword: e.target.value})} />
                            </div>
                            <button className="btn-primary" type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Organization →"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleJoinTeam}>
                            <div className="field">
                                <label>Invite Code</label>
                                <input type="text" required placeholder="ABC-123" value={joinForm.inviteCode} onChange={e => setJoinForm({...joinForm, inviteCode: e.target.value.toUpperCase()})} style={{ letterSpacing: '2px', fontWeight: 'bold' }} />
                            </div>
                            <div className="field">
                                <label>Full Name</label>
                                <input type="text" required placeholder="Jane Doe" value={joinForm.name} onChange={e => setJoinForm({...joinForm, name: e.target.value})} />
                            </div>
                            <div className="field">
                                <label>Email</label>
                                <input type="email" required placeholder="jane@email.com" value={joinForm.email} onChange={e => setJoinForm({...joinForm, email: e.target.value})} />
                            </div>
                            <div className="field">
                                <label>Password</label>
                                <input type="password" required minLength={8} value={joinForm.password} onChange={e => setJoinForm({...joinForm, password: e.target.value})} />
                            </div>
                            <button className="btn-primary" type="submit" disabled={loading}>
                                {loading ? "Joining..." : "Join Team →"}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account? <Link href="/login" className="text-[#0B3D2E] font-bold">Login</Link>
                    </div>
                </div>
            </div>

            {showSuccessModal && (
                <SuccessModal code={regInviteCode} onClose={() => router.push("/dashboard")} />
            )}
        </div>
    );
}

function SuccessModal({ code, onClose }: { code: string; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    return (
        <div className="fixed inset-0 bg-[#0B3D2E]/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center transform animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-[#0B3D2E] mb-2">Registration Success!</h3>
                <p className="text-gray-500 mb-8">Your organization is ready. Share this code with your team to bring them onboard.</p>
                
                <div className="bg-[#F8F5ED] border-2 border-dashed border-[#C9962A] rounded-2xl p-6 mb-8 relative">
                    <div className="text-[10px] font-bold text-[#C9962A] uppercase tracking-widest mb-2">Invite Code</div>
                    <div className="text-3xl font-black text-[#0B3D2E] tracking-tighter">{code}</div>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-white border text-gray-400'}`}
                    >
                        {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                    </button>
                </div>

                <button onClick={onClose} className="w-full bg-[#0B3D2E] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    Continue to Dashboard <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
            <RegisterFormContent />
        </Suspense>
    );
}