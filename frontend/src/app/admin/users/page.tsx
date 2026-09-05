"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getUser } from "@/lib/api";

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    if (u.clinic_id) {
      api.clinics.doctors(u.clinic_id).then(d => { setDoctors(d.doctors); setLoading(false); }).catch(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const specialtyLabels: Record<string, string> = {
    internal_cardio: "Internal Medicine / Cardiology",
    neuro_surg: "Neurological Surgery",
    emergency_med: "Emergency & Critical Trauma",
    pediatrics_gen: "General Pediatrics",
    oncology_med: "Medical Oncology / Hematology",
    orthopedic: "Orthopedic Surgery",
    family_med: "Family & Ambulatory Practice",
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-surface border-b border-surface-container px-6 py-4 flex items-center gap-4">
        <Link href="/admin/overview" className="text-text-muted hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-[16px] font-bold text-text-ink">Clinic Users</h1>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span></div>
        ) : doctors.length === 0 ? (
          <div className="bg-card-surface rounded-xl border border-surface-container p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline">group</span>
            <p className="text-text-muted mt-3 font-semibold">No users yet</p>
            <Link href="/admin/join-requests" className="text-primary text-[13px] font-bold hover:underline mt-2 inline-block">
              View Join Requests
            </Link>
          </div>
        ) : (
          <div className="bg-card-surface rounded-xl border border-surface-container overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-surface-container flex items-center justify-between">
              <span className="text-[13px] font-bold text-text-muted uppercase tracking-wider">
                {doctors.length} member{doctors.length !== 1 ? "s" : ""}
              </span>
              <Link href="/admin/join-requests" className="text-primary text-[13px] font-bold hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">group_add</span>Join Requests
              </Link>
            </div>
            <div className="divide-y divide-surface-container">
              {doctors.map((doc: any) => (
                <div key={doc.id} className="px-5 py-4 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary shrink-0">
                    {doc.name?.[0] || "D"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-ink text-[14px]">{doc.name}</p>
                    <p className="text-[12px] text-text-muted">{doc.phone} · {specialtyLabels[doc.specialty] || doc.specialty || "—"}</p>
                    {doc.npi && <p className="text-[11px] text-outline mt-0.5">NPI: {doc.npi}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold capitalize ${
                      doc.role === "admin" ? "bg-primary/10 text-primary" : "bg-surface-container text-text-muted"}`}>
                      {doc.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold capitalize ${
                      doc.verification_status === "approved" ? "bg-success-bg text-clinical-success" :
                      doc.verification_status === "rejected" ? "bg-error-bg text-clinical-error" :
                      "bg-warning-bg text-clinical-warning"}`}>
                      {doc.verification_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
