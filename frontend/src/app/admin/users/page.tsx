
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getUser } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const AVAILABLE_PERMS = [
  { id: "manage_registration", label: "Patient Registration & Intake" },
  { id: "manage_appointments", label: "Appointment Booking" },
  { id: "manage_queue_vitals", label: "Queue Management & Vitals" },
];

const specialtyLabels: Record<string, string> = {
  internal_cardio: "Internal Medicine / Cardiology",
  neuro_surg: "Neurological Surgery",
  emergency_med: "Emergency & Critical Trauma",
  pediatrics_gen: "General Pediatrics",
  oncology_med: "Medical Oncology / Hematology",
  orthopedic: "Orthopedic Surgery",
  family_med: "Family & Ambulatory Practice",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [user, setUser] = useState<any>(null);
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState<any>(null);

  const [form, setForm] = useState({ name: "", phone: "", age: "", gender: "Male", role: "receptionist", permissions: [] as string[] });

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    if (u.clinic_id) {
      loadUsers(u.clinic_id);
    } else setLoading(false);
  }, []);

  const loadUsers = async (clinicId: number) => {
    setLoading(true);
    try {
      const d = await api.clinics.doctors(clinicId);
      setUserList(d.doctors);
    } catch {}
    setLoading(false);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clinic_id) return;
    if (form.phone.length !== 10) { showToast({ title: "Invalid Phone", description: "Must be 10 digits", type: "error" }); return; }
    try {
      const res = await api.staff.add({ ...form, clinic_id: user.clinic_id });
      setUserList([res.staff, ...userList]);
      setShowAddModal(false);
      setForm({ name: "", phone: "", age: "", gender: "Male", role: "receptionist", permissions: [] });
      showToast({ title: "Staff Created", description: `Temporary PIN: ${res.tempPin}`, type: "success" });
    } catch (err: any) {
      showToast({ title: "Error", description: err.message, type: "error" });
    }
  };

  const handleResetPin = async (id: number) => {
    try {
      const res = await api.staff.resetPin(id);
      showToast({ title: "PIN Reset", description: `New Temporary PIN: ${res.tempPin}`, type: "success" });
      setUserList(userList.map(u => u.id === id ? { ...u, pin_reset_required: true } : u));
    } catch (err: any) {
      showToast({ title: "Error", description: err.message, type: "error" });
    }
  };

  const executeRemove = async () => {
    if (!user?.clinic_id || !userToRemove) return;
    try {
      if (userToRemove.role === "doctor" || userToRemove.role === "admin") {
        await api.clinics.removeUser(user.clinic_id, userToRemove.id);
      } else {
        await api.staff.remove(userToRemove.id);
      }
      setUserList(userList.filter(u => u.id !== userToRemove.id));
      showToast({ title: "Removed", description: "User successfully removed", type: "success" });
      setUserToRemove(null);
    } catch (err: any) {
      showToast({ title: "Error", description: err.message, type: "error" });
    }
  };

  const togglePerm = (id: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id) 
        ? prev.permissions.filter(p => p !== id) 
        : [...prev.permissions, id]
    }));
  };

  return (
    <div className="p-10 xl:p-14 flex flex-col gap-10 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-3xl">
          <div className="flex items-center gap-2 text-text-muted text-[11px] uppercase tracking-wider font-bold">
            <span>Administration</span>
            <span>/</span>
            <span className="text-primary">Users & Staff</span>
          </div>
          <h1 className="text-[32px] font-bold text-text-ink tracking-tight">Clinic Users & Personnel</h1>
          <p className="text-[15px] font-medium text-text-muted">
            Manage your clinic doctors, admin staff, and general personnel. Assign roles, handle permissions, and reset credentials.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={() => setShowAddModal(true)} className="h-12 px-6 rounded-lg bg-primary text-white text-[14px] font-bold shadow-md hover:bg-accent-dark transition-all flex items-center gap-2 border border-primary-container cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      <div className="bg-card-surface rounded-xl shadow-sm border border-surface-container overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span></div>
        ) : userList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined text-[48px] text-outline mb-4">group</span>
            <p className="text-text-muted font-medium">No users found.</p>
            <Link href="/admin/join-requests" className="text-primary text-[13px] font-bold hover:underline mt-2 inline-block">
              View Join Requests
            </Link>
          </div>
        ) : (
          <div>
            <div className="px-5 py-3 border-b border-surface-container flex items-center justify-between bg-surface-container-lowest">
              <span className="text-[13px] font-bold text-text-muted uppercase tracking-wider">
                {userList.length} member{userList.length !== 1 ? "s" : ""}
              </span>
              <Link href="/admin/join-requests" className="text-primary text-[13px] font-bold hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">group_add</span>Join Requests
              </Link>
            </div>
            <div className="divide-y divide-surface-container">
              {userList.map((u) => {
                const perms = Array.isArray(u.permissions) ? u.permissions : (
                  typeof u.permissions === "string" ? JSON.parse(u.permissions) : []
                );
                return (
                  <div key={u.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-container-lowest transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary shrink-0 mt-1">
                        {u.name?.[0] || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-text-ink text-[15px]">{u.name}</p>
                        <p className="text-[13px] text-text-muted">
                          {u.phone} 
                          {u.specialty ? `  -  ${specialtyLabels[u.specialty] || u.specialty}` : ""}
                          {u.age ? `  -  ${u.age} yrs` : ""}
                          {u.gender ? `  -  ${u.gender}` : ""}
                        </p>
                        {u.npi && <p className="text-[11px] text-outline mt-0.5 font-semibold tracking-wider">NPI: {u.npi}</p>}
                        {perms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {perms.map((p: string) => (
                              <span key={p} className="text-[10px] font-bold bg-surface-container border border-outline-variant px-1.5 py-0.5 rounded text-text-muted">
                                {AVAILABLE_PERMS.find(ap => ap.id === p)?.label || p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 ml-14 md:ml-0">
                      <span className={`px-2 py-1 rounded-full text-[11px] font-bold capitalize w-28 text-center tracking-wider ${
                        u.role === "admin" ? "bg-primary/10 text-primary" : 
                        u.role === "doctor" ? "bg-surface-container-high text-text-ink" :
                        u.role === "receptionist" ? "bg-clinical-warning/20 text-clinical-warning" :
                        u.role === "nurse" ? "bg-secondary/20 text-secondary" :
                        "bg-accent-light/20 text-accent-dark"}`}>
                        {u.role === "admin" ? "Admin/Doc" : u.role}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-[11px] font-bold capitalize w-20 text-center ${
                        u.verification_status === "approved" ? "bg-success-bg text-clinical-success" :
                        u.verification_status === "rejected" ? "bg-error-bg text-clinical-error" :
                        "bg-warning-bg text-clinical-warning"}`}>
                        {u.verification_status || "Approved"}
                      </span>
                      
                      {u.pin_reset_required && (
                        <span className="text-[11px] font-bold text-error bg-error-bg px-2 py-1 rounded-full" title="User must reset their PIN on next login">Temp PIN</span>
                      )}
                      
                      {u.id !== user?.id && (
                        <div className="flex items-center gap-1 border-l border-surface-container pl-3 ml-1">
                          <button onClick={() => handleResetPin(u.id)} className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer" title="Reset PIN">
                            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                          </button>
                          <button onClick={() => setUserToRemove(u)} className="p-1.5 text-text-muted hover:text-clinical-error hover:bg-error-bg rounded-lg transition-colors cursor-pointer" title="Remove User">
                            <span className="material-symbols-outlined text-[18px]">person_remove</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {userToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-ink/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card-surface border border-surface-container rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col scale-in-center">
            <div className="p-6 flex flex-col gap-3 text-center items-center">
              <div className="w-12 h-12 rounded-full bg-error-bg text-clinical-error flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <h2 className="text-[18px] font-bold text-text-ink">Remove User?</h2>
              <p className="text-[14px] text-text-muted">
                Are you sure you want to remove <strong className="text-text-ink">{userToRemove.name}</strong> from the clinic? They will lose access immediately.
              </p>
            </div>
            <div className="p-4 border-t border-surface-container bg-surface-container-lowest flex gap-3">
              <button onClick={() => setUserToRemove(null)} className="flex-1 py-2.5 rounded-lg font-bold text-[14px] text-text-ink bg-surface-container hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
              <button onClick={executeRemove} className="flex-1 py-2.5 rounded-lg font-bold text-[14px] text-white bg-clinical-error hover:bg-red-700 transition-colors shadow-sm">
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-text-ink/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card-surface border border-surface-container rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col scale-in-center">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container bg-surface-container-lowest shrink-0">
              <h2 className="text-[18px] font-bold text-text-ink">Add Staff Member</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-text-muted hover:text-text-ink transition-colors cursor-pointer"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              <form id="add-staff-form" onSubmit={handleAddStaff} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-text-ink uppercase tracking-wider">Full Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary shadow-sm" placeholder="John Doe" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-text-ink uppercase tracking-wider">Age</label>
                    <input required type="number" min="18" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="w-full bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary shadow-sm" placeholder="30" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-text-ink uppercase tracking-wider">Gender</label>
                    <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-text-ink uppercase tracking-wider">Mobile Number</label>
                  <input required type="tel" minLength={10} maxLength={10} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary shadow-sm" placeholder="9876543210" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-text-ink uppercase tracking-wider">Role Designation</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer">
                    <option value="receptionist">Receptionist</option>
                    <option value="compounder">Compounder</option>
                    <option value="nurse">Nurse</option>
                  </select>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-warning-bg p-3 text-clinical-warning">
                  <span className="material-symbols-outlined text-[20px]">key</span>
                  <div>
                    <p className="text-[13px] font-bold text-text-ink">Initial temporary PIN: 123456</p>
                    <p className="text-[12px] text-on-surface-variant">The staff member must choose a new secure PIN immediately after their first login.</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 mt-2">
                  <label className="text-[13px] font-bold text-text-ink uppercase tracking-wider">Granular Permissions</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVAILABLE_PERMS.map(perm => (
                      <label key={perm.id} className="flex items-center gap-3 p-3 rounded-lg border border-surface-container hover:bg-surface-container-lowest cursor-pointer transition-colors">
                        <div className="relative flex items-center justify-center w-5 h-5">
                          <input 
                            type="checkbox" 
                            className="peer appearance-none w-5 h-5 border-2 border-outline rounded-md checked:bg-primary checked:border-primary transition-all cursor-pointer"
                            checked={form.permissions.includes(perm.id)}
                            onChange={() => togglePerm(perm.id)}
                          />
                          <span className="material-symbols-outlined text-white text-[16px] absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                        </div>
                        <span className="text-[13px] font-semibold text-text-ink select-none">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-surface-container bg-surface-container-lowest shrink-0">
              <button form="add-staff-form" type="submit" className="w-full py-3.5 bg-primary text-white rounded-lg font-bold text-[15px] shadow-sm hover:bg-accent-dark transition-colors cursor-pointer">
                Create Staff Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

