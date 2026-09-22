"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getUser } from "@/lib/api";

export default function ReceptionQueuePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
            const [toast, setToast] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    if (u.clinic_id) loadData(u.clinic_id);
    else setLoading(false);
  }, []);

  const loadData = async (clinicId: number) => {
    try {
      const [qData, pData, dData] = await Promise.all([
        api.queue.get(clinicId),
        api.patients.list(clinicId),
        api.clinics.doctors(clinicId),
      ]);
      setQueue(qData.queue);
      setPatients(pData.patients);
      setDoctors((dData.doctors || []).filter((d: any) => d.role === "doctor" || d.role === "admin"));
    } catch {}
    setLoading(false);
  };

  
  const removeFromQueue = async (id: number) => {
    try {
      await api.queue.remove(id);
      setQueue(q => q.filter(e => e.id !== id));
    } catch {}
  };

  
  const statusBadge = (s: string) => ({
    waiting: "bg-warning-bg text-clinical-warning",
    called: "bg-primary/10 text-primary",
    in_consultation: "bg-success-bg text-clinical-success",
    completed: "bg-surface-container text-text-muted",
  }[s] || "bg-surface-container text-text-muted");

  return (
    <div className="min-h-screen bg-app-bg">

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-card-surface border border-outline-variant rounded-xl px-4 py-3 shadow-xl flex items-center gap-2 animate-glide-in">
          <span className="material-symbols-outlined text-clinical-success text-[18px]">check_circle</span>
          <span className="text-[13px] font-semibold text-text-ink">{toast}</span>
        </div>
      )}

      

      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span></div>
        ) : queue.length === 0 ? (
          <div className="bg-card-surface rounded-xl border border-surface-container p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline">queue</span>
            <p className="text-text-muted mt-3 font-semibold">Queue is empty</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {queue.map((entry: any) => (
              <div key={entry.id} className="bg-card-surface rounded-xl border border-surface-container p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-[13px] shrink-0">
                  {entry.token || "T-"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-ink text-[14px]">{entry.first_name} {entry.last_name}</p>
                  <p className="text-[12px] text-text-muted">{entry.phone}</p>
                  {entry.complaint && <p className="text-[12px] text-on-surface-variant mt-0.5 truncate">{entry.complaint}</p>}
                </div>
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold capitalize ${statusBadge(entry.status)}`}>{entry.status}</span>
                <button onClick={() => removeFromQueue(entry.id)}
                  className="text-text-muted hover:text-clinical-error transition-colors">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
