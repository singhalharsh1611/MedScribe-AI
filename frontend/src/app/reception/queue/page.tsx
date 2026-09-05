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
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [complaint, setComplaint] = useState("");
  const [adding, setAdding] = useState(false);
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
      const [qData, pData] = await Promise.all([
        api.queue.get(clinicId),
        api.patients.list(clinicId),
      ]);
      setQueue(qData.queue);
      setPatients(pData.patients);
    } catch {}
    setLoading(false);
  };

  const addToQueue = async () => {
    if (!selectedPatient || !user?.clinic_id) return;
    setAdding(true);
    try {
      await api.queue.add({
        patient_id: selectedPatient.id,
        clinic_id: user.clinic_id,
        doctor_id: null,
        complaint: complaint || selectedPatient.complaint,
      });
      setToast(`${selectedPatient.first_name} added to queue`);
      setTimeout(() => setToast(""), 3000);
      setShowAdd(false);
      setSelectedPatient(null);
      setComplaint("");
      setSearch("");
      loadData(user.clinic_id);
    } catch (e: any) { setToast("Error: " + e.message); }
    setAdding(false);
  };

  const removeFromQueue = async (id: number) => {
    try {
      await api.queue.remove(id);
      setQueue(q => q.filter(e => e.id !== id));
    } catch {}
  };

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.uhid} ${p.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (s: string) => ({
    waiting: "bg-warning-bg text-clinical-warning",
    called: "bg-primary/10 text-primary",
    in_consultation: "bg-success-bg text-clinical-success",
    completed: "bg-surface-container text-text-muted",
  }[s] || "bg-surface-container text-text-muted");

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-surface border-b border-surface-container px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reception/dashboard" className="text-text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-[16px] font-bold text-text-ink">Today's Queue</h1>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-bold hover:bg-accent-dark transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>Add to Queue
        </button>
      </header>

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-card-surface border border-outline-variant rounded-xl px-4 py-3 shadow-xl flex items-center gap-2 animate-glide-in">
          <span className="material-symbols-outlined text-clinical-success text-[18px]">check_circle</span>
          <span className="text-[13px] font-semibold text-text-ink">{toast}</span>
        </div>
      )}

      {/* Add to Queue Modal */}
      {showAdd && (
        <>
          <div className="fixed inset-0 z-40 bg-text-ink/30 backdrop-blur-sm" onClick={() => setShowAdd(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card-surface rounded-2xl shadow-2xl w-full max-w-md p-6 animate-glide-in opacity-0">
              <h3 className="text-[16px] font-bold text-text-ink mb-4">Add Patient to Queue</h3>
              <input
                className="w-full bg-surface-container-lowest text-text-ink text-[14px] px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all mb-3"
                placeholder="Search patient by name, phone or UHID..."
                value={search} onChange={e => setSearch(e.target.value)} autoFocus
              />
              <div className="max-h-48 overflow-y-auto flex flex-col gap-1 mb-4">
                {filteredPatients.slice(0, 10).map(p => (
                  <button key={p.id} onClick={() => setSelectedPatient(p)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-colors ${selectedPatient?.id === p.id ? "bg-primary text-white" : "hover:bg-surface-container text-text-ink"}`}>
                    <span className={`material-symbols-outlined text-[18px] ${selectedPatient?.id === p.id ? "text-white" : "text-outline"}`}>person</span>
                    <div>
                      <p className="font-semibold text-[13px]">{p.first_name} {p.last_name}</p>
                      <p className={`text-[11px] ${selectedPatient?.id === p.id ? "text-white/70" : "text-text-muted"}`}>{p.uhid} · {p.phone}</p>
                    </div>
                  </button>
                ))}
                {filteredPatients.length === 0 && search && (
                  <p className="text-center text-text-muted text-[13px] py-4">No patients found.{" "}
                    <Link href="/reception/register" className="text-primary font-bold underline">Register new?</Link>
                  </p>
                )}
              </div>
              {selectedPatient && (
                <textarea rows={2} placeholder="Chief complaint (optional)"
                  className="w-full bg-surface-container-lowest text-text-ink text-[13px] px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all mb-4"
                  value={complaint} onChange={e => setComplaint(e.target.value)} />
              )}
              <div className="flex gap-3">
                <button onClick={() => { setShowAdd(false); setSelectedPatient(null); setSearch(""); }}
                  className="flex-1 py-2.5 rounded-lg border border-outline-variant text-text-muted font-bold text-[13px] hover:bg-surface-container transition-colors">
                  Cancel
                </button>
                <button onClick={addToQueue} disabled={!selectedPatient || adding}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white font-bold text-[13px] hover:bg-accent-dark transition-colors disabled:opacity-50">
                  {adding ? "Adding..." : "Add to Queue"}
                </button>
              </div>
            </div>
          </div>
        </>
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
            {queue.map((entry: any, i: number) => (
              <div key={entry.id} className="bg-card-surface rounded-xl border border-surface-container p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-[13px] shrink-0">
                  {entry.token || `T-${i + 101}`}
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
