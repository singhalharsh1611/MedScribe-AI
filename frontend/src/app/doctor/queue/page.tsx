"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getUser } from "@/lib/api";

export default function DoctorQueuePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    if (u.clinic_id) loadQueue(u.clinic_id, u.id);
    else setLoading(false);
  }, []);

  const loadQueue = async (clinicId: number, doctorId: number) => {
    try {
      const data = await api.queue.get(clinicId, doctorId);
      setQueue(data.queue);
    } catch {}
    setLoading(false);
  };

  const callPatient = async (entry: any) => {
    setActionId(entry.id);
    try {
      await api.queue.updateStatus(entry.id, "called");
      localStorage.setItem("activeQueueEntry", JSON.stringify(entry));
      localStorage.setItem("activePatientId", entry.patient_id);
      setToast(`Calling ${entry.first_name} ${entry.last_name}...`);
      setTimeout(() => setToast(""), 2500);
      setQueue(q => q.map(e => e.id === entry.id ? { ...e, status: "called" } : e));
      router.push("/doctor/patient-called");
    } catch (e: any) { setToast("Error: " + e.message); }
    setActionId(null);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      waiting: "bg-warning-bg text-clinical-warning",
      called: "bg-primary/10 text-primary",
      in_consultation: "bg-success-bg text-clinical-success",
      completed: "bg-surface-container text-text-muted",
    };
    return map[status] || "bg-surface-container text-text-muted";
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-surface border-b border-surface-container px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/doctor/dashboard" className="text-text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <h1 className="text-[16px] font-bold text-text-ink">Patient Queue</h1>
        </div>
        <button onClick={() => user && loadQueue(user.clinic_id, user.id)}
          className="flex items-center gap-1 text-[13px] text-primary font-semibold hover:underline">
          <span className="material-symbols-outlined text-[16px]">refresh</span>Refresh
        </button>
      </header>

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
            <p className="text-text-muted mt-3 font-semibold">No patients in queue</p>
            <p className="text-[12px] text-text-muted mt-1">Patients will appear here when added by reception</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {queue.map((entry: any, i: number) => (
              <div key={entry.id}
                className="bg-card-surface rounded-xl border border-surface-container p-4 flex items-center gap-4 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary shrink-0">
                  {entry.token || `T-${i + 101}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-ink text-[15px]">{entry.first_name} {entry.last_name}</p>
                  <p className="text-[12px] text-text-muted">{entry.phone} · {entry.gender}</p>
                  {entry.complaint && <p className="text-[12px] text-on-surface-variant mt-0.5 truncate">{entry.complaint}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-1 rounded-full text-[11px] font-bold capitalize ${statusBadge(entry.status)}`}>{entry.status}</span>
                  {entry.status === "waiting" && (
                    <button onClick={() => callPatient(entry)} disabled={actionId === entry.id}
                      className="px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-bold hover:bg-accent-dark transition-colors disabled:opacity-50">
                      {actionId === entry.id ? "..." : "Call"}
                    </button>
                  )}
                  {entry.status === "called" && (
                    <button onClick={() => { localStorage.setItem("activeQueueEntry", JSON.stringify(entry)); router.push("/doctor/patient-called"); }}
                      className="px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/30 text-[13px] font-bold hover:bg-primary/20 transition-colors">
                      Resume
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
