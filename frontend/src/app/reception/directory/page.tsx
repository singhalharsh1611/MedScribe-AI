"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getUser } from "@/lib/api";

export default function ReceptionDirectoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    if (u.clinic_id) {
      api.patients.list(u.clinic_id).then(d => setPatients(d.patients || [])).catch(() => {}).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.uhid} ${p.phone} ${p.email || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const bloodGroupColor = (bg: string) => ({
    "A+": "text-clinical-error", "B+": "text-primary", "O+": "text-clinical-success",
    "AB+": "text-tertiary", "A-": "text-clinical-warning", "B-": "text-secondary",
    "O-": "text-text-muted", "AB-": "text-outline",
  }[bg] || "text-text-muted");

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-surface border-b border-surface-container px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reception/dashboard" className="text-text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-[16px] font-bold text-text-ink">Patient Directory</h1>
        </div>
        <Link href="/reception/register"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-bold hover:bg-accent-dark transition-colors">
          <span className="material-symbols-outlined text-[18px]">person_add</span>New Patient
        </Link>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            className="w-full bg-card-surface border border-surface-container text-text-ink text-[14px] pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
            placeholder="Search by name, UHID, or phone..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span></div>
        ) : filtered.length === 0 ? (
          <div className="bg-card-surface rounded-xl border border-surface-container p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline">{search ? "search_off" : "people"}</span>
            <p className="text-text-muted mt-3 font-semibold">{search ? "No patients found" : "No patients registered yet"}</p>
            {!search && <Link href="/reception/register" className="text-primary font-bold text-[13px] mt-2 inline-block hover:underline">Register first patient</Link>}
          </div>
        ) : (
          <div className="bg-card-surface rounded-xl border border-surface-container overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-surface-container">
              <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">{filtered.length} patient{filtered.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-surface-container">
              {filtered.map((p: any) => (
                <div key={p.id}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors cursor-pointer"
                  onClick={() => { localStorage.setItem("activePatientId", p.id); router.push("/doctor/patient-profile"); }}>
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary shrink-0">
                    {p.first_name?.[0]}{p.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-ink text-[14px]">{p.first_name} {p.last_name}</p>
                    <p className="text-[12px] text-text-muted">{p.uhid} · {p.phone}</p>
                    {p.complaint && <p className="text-[12px] text-on-surface-variant mt-0.5 truncate">{p.complaint}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {p.blood_group && <span className={`text-[13px] font-bold ${bloodGroupColor(p.blood_group)}`}>{p.blood_group}</span>}
                    {p.gender && <span className="text-[12px] text-text-muted">{p.gender}</span>}
                    <span className="material-symbols-outlined text-outline text-[18px]">arrow_forward_ios</span>
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
