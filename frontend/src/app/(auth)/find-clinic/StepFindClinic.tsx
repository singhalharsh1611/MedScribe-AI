"use client";
import { useState, useEffect } from "react";
import { api, getUser } from "@/lib/api";

export default function FindClinicPage({ onNext }: { onNext: (step: string, data?: any) => void }) {
    const [user, setUser] = useState<any>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) { onNext('login'); return; }
    setUser(u);
    api.clinics.list().then(d => { setClinics(d.clinics); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const requestJoin = async (clinic: any) => {
    if (!user) return;
    setRequesting(clinic.id);
    try {
      await api.joinRequests.create(user.id, clinic.id, `${user.name} is requesting to join ${clinic.name}`);
      localStorage.setItem("joinClinic", JSON.stringify(clinic));
      setToast(`Join request sent to ${clinic.name}`);
      setTimeout(() => onNext('request-pending'), 1500);
    } catch (e: any) { setToast("Error: " + e.message); setTimeout(() => setToast(""), 3000); }
    setRequesting(null);
  };

  const filtered = clinics.filter(c =>
    `${c.name} ${c.address || ""} ${c.type || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl animate-glide-in opacity-0">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNext('choose-path')} className="text-text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-[22px] font-bold text-text-ink">Find a Clinic</h1>
            <p className="text-[13px] text-text-muted">Search and request to join an existing clinic</p>
          </div>
        </div>

        {toast && (
          <div className="mb-4 p-3 rounded-lg bg-success-bg border border-clinical-success/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-clinical-success text-[18px]">check_circle</span>
            <span className="text-[13px] text-clinical-success font-semibold">{toast}</span>
          </div>
        )}

        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            className="w-full bg-surface-container-lowest text-text-ink text-[14px] pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            placeholder="Search clinics by name or city..."
            value={search} onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span></div>
        ) : filtered.length === 0 ? (
          <div className="bg-card-surface rounded-xl border border-surface-container p-8 text-center">
            <span className="material-symbols-outlined text-[40px] text-outline">search_off</span>
            <p className="text-text-muted mt-2 font-semibold">No clinics found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((clinic: any) => (
              <div key={clinic.id} className="bg-card-surface rounded-xl border border-surface-container p-4 flex items-start gap-4 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">local_hospital</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-ink text-[14px]">{clinic.name}</p>
                  {clinic.type && <p className="text-[12px] text-text-muted">{clinic.type}</p>}
                  {clinic.address && <p className="text-[12px] text-text-muted mt-0.5">{clinic.address}</p>}
                </div>
                <button onClick={() => requestJoin(clinic)} disabled={requesting === clinic.id}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-[12px] font-bold hover:bg-accent-dark transition-colors disabled:opacity-50 shrink-0">
                  {requesting === clinic.id ? "..." : "Request Join"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
