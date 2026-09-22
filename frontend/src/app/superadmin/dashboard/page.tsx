"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, clearUser, getSuperAdmin } from "@/lib/api";
import { useTheme } from "next-themes";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [admin, setAdmin] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const a = getSuperAdmin();
    if (!a) { router.push("/superadmin"); return; }
    setAdmin(a);
    loadData();
  }, []);

  useEffect(() => { loadDoctors(); }, [filter]);

  const loadData = async () => {
    try {
      const [s] = await Promise.all([api.superAdmin.stats()]);
      setStats(s);
    } catch {}
    await loadDoctors();
    setLoading(false);
  };

  const loadDoctors = async () => {
    try {
      const d = await api.superAdmin.doctors(filter !== "all" ? filter : undefined);
      setDoctors(d.doctors);
    } catch {}
  };

  const handleVerify = async (id: number, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      await api.superAdmin.verifyDoctor(id, action);
      setToast(action === "approve" ? "Doctor approved ✓" : "Doctor rejected");
      setTimeout(() => setToast(""), 3000);
      await loadDoctors();
      await api.superAdmin.stats().then(s => setStats(s));
    } catch (e: any) { setToast("Error: " + e.message); }
    setActionLoading(null);
  };

  const specialtyLabels: Record<string, string> = {
    internal_cardio: "Internal Medicine / Cardiology",
    neuro_surg: "Neurological Surgery",
    emergency_med: "Emergency & Critical Trauma",
    pediatrics_gen: "General Pediatrics",
    oncology_med: "Medical Oncology / Hematology",
    orthopedic: "Orthopedic Surgery",
    family_med: "Family & Ambulatory Practice",
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <header className="bg-card-surface border-b border-surface-container px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">admin_panel_settings</span>
          </div>
          <div>
            <span className="text-[15px] font-bold text-text-ink">SleekCare Platform Admin</span>
            <p className="text-[11px] text-text-muted">Logged in as {admin?.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 text-[13px] text-text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span className="hidden sm:inline">Theme</span>
          </button>
          <button onClick={() => { clearUser(); router.replace("/superadmin"); router.refresh(); }}
            className="flex items-center gap-2 text-[13px] text-text-muted hover:text-clinical-error transition-colors">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-card-surface border border-outline-variant rounded-xl px-4 py-3 shadow-xl flex items-center gap-2 animate-glide-in">
          <span className="material-symbols-outlined text-clinical-success text-[18px]">check_circle</span>
          <span className="text-[13px] font-semibold text-text-ink">{toast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Doctors", value: stats.total_doctors ?? 0, icon: "stethoscope", color: "text-primary" },
            { label: "Total Clinics", value: stats.total_clinics ?? 0, icon: "local_hospital", color: "text-tertiary" },
            { label: "Total Patients", value: stats.total_patients ?? 0, icon: "people", color: "text-secondary" },
            { label: "Pending Verifications", value: stats.pending_verifications ?? 0, icon: "pending_actions", color: "text-clinical-warning" },
          ].map(s => (
            <div key={s.label} className="bg-card-surface rounded-xl p-4 border border-surface-container shadow-sm">
              <span className={`material-symbols-outlined ${s.color} text-[24px]`}>{s.icon}</span>
              <p className="text-[28px] font-bold text-text-ink mt-1">{s.value}</p>
              <p className="text-[12px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Doctor verification */}
        <div className="bg-card-surface rounded-xl border border-surface-container shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-[16px] font-bold text-text-ink flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              Doctor Verification Queue
            </h2>
            <div className="flex gap-2">
              {["pending", "approved", "rejected", "all"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-colors ${filter === f ? "bg-primary text-on-primary" : "bg-surface-container text-text-muted hover:bg-surface-container-high"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {doctors.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline">check_circle</span>
              <p className="text-text-muted mt-2 font-semibold">No {filter} doctors</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-container">
              {doctors.map((doc: any) => (
                <div key={doc.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-surface-container-lowest transition-colors">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                      <span className="text-[16px] font-bold text-primary">{doc.name?.[0] || "D"}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-text-ink text-[14px]">{doc.name}</p>
                      <p className="text-[12px] text-text-muted">{doc.phone} • {specialtyLabels[doc.specialty] || doc.specialty || "—"}</p>
                      {doc.npi && <p className="text-[11px] text-outline mt-0.5">NPI: {doc.npi}</p>}
                      {doc.clinic_name && <p className="text-[11px] text-primary mt-0.5">{doc.clinic_name}</p>}
                      <p className="text-[10px] text-text-muted mt-0.5">Registered: {new Date(doc.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold capitalize ${
                      doc.verification_status === "approved" ? "bg-success-bg text-clinical-success" :
                      doc.verification_status === "rejected" ? "bg-error-bg text-clinical-error" :
                      "bg-warning-bg text-clinical-warning"
                    }`}>
                      {doc.verification_status}
                    </span>
                    {doc.verification_status === "pending" && (
                      <>
                        <button onClick={() => handleVerify(doc.id, "approve")}
                          disabled={actionLoading === doc.id}
                          className="px-3 py-1.5 rounded-lg bg-clinical-success/10 text-clinical-success border border-clinical-success/30 text-[12px] font-bold hover:bg-clinical-success/20 transition-colors disabled:opacity-50">
                          {actionLoading === doc.id ? "..." : "Approve"}
                        </button>
                        <button onClick={() => handleVerify(doc.id, "reject")}
                          disabled={actionLoading === doc.id}
                          className="px-3 py-1.5 rounded-lg bg-error-bg text-clinical-error border border-clinical-error/30 text-[12px] font-bold hover:bg-clinical-error/10 transition-colors disabled:opacity-50">
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
