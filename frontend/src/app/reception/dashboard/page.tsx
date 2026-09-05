"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getUser } from "@/lib/api";

export default function ReceptionDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [clinic, setClinic] = useState<any>(null);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    if (u.clinic_id) {
      Promise.all([api.clinics.get(u.clinic_id), api.clinics.stats(u.clinic_id)])
        .then(([c, s]) => { setClinic(c.clinic); setStats(s); })
        .catch(() => {});
    }
  }, []);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const firstName = user?.name?.split(" ")[0] || "Staff";

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
      {/* Sub Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap text-[12px]">
            <span className="px-2.5 py-0.5 rounded-full bg-container-tint text-primary font-bold">RECEPTION — ACTIVE</span>
            <span className="text-text-muted flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px] text-primary">domain</span>
              {clinic?.name || "Your Clinic"}
            </span>
            <span className="text-text-muted font-semibold">{today}</span>
          </div>
          <h1 className="text-[24px] font-bold text-text-ink tracking-tight">Good morning, {firstName}</h1>
          <p className="text-[14px] font-medium text-text-muted">Front desk operations active.</p>
        </div>

        <div className="flex items-center gap-3 bg-card-surface px-4 py-2.5 rounded-xl shadow-sm border border-surface-container self-start xl:self-auto">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-primary-container text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[20px]">mic</span>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-light opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-clinical-success"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-text-ink font-bold">Ambient Ear Active</span>
              <span className="px-1.5 py-0.5 rounded bg-success-bg text-clinical-success text-[10px] font-bold uppercase shadow-sm">Listening</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[12px] text-text-muted font-semibold">
              <span className="w-1 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <span className="w-1 h-4 rounded-full bg-primary animate-bounce"></span>
              <span className="w-1 h-1.5 rounded-full bg-primary"></span>
              <span className="w-1 h-3 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[11px] ml-1">Desk MIC: Calibrated</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] text-text-muted uppercase tracking-wider font-bold">Today's Appointments</span>
              <div className="text-[30px] font-bold text-text-ink mt-1 leading-none">{stats.today_appointments ?? "—"}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-container-tint flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">calendar_today</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden flex shadow-inner">
              <div className="bg-clinical-success h-full" style={{ width: "33.3%" }}></div>
              <div className="bg-primary h-full" style={{ width: "22.2%" }}></div>
              <div className="bg-accent-light h-full" style={{ width: "44.5%" }}></div>
            </div>
            <div className="flex items-center justify-between text-text-muted text-[12px] font-semibold pt-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-clinical-success"></span>6 Done</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span>4 In Lobby</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-light"></span>8 Upcoming</span>
            </div>
          </div>
        </div>

        <div className="bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] text-text-muted uppercase tracking-wider font-bold">Lobby Lounge</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[30px] font-bold text-text-ink leading-none">{stats.waiting_queue ?? "—"}</span>
                <span className="text-[12px] text-clinical-warning font-bold">Patients Seated</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-warning-bg flex items-center justify-center text-clinical-warning shadow-sm border border-clinical-warning/20">
              <span className="material-symbols-outlined text-[24px]">airline_seat_recline_normal</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-lg border border-surface-container">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-text-muted">
              <span className="material-symbols-outlined text-clinical-warning text-[16px]">avg_pace</span>
              <span>Avg Wait Time</span>
            </div>
            <span className="text-[14px] font-bold text-text-ink">11 <span className="text-[12px] font-semibold text-text-muted">mins</span></span>
          </div>
        </div>

        <div className="bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] text-text-muted uppercase tracking-wider font-bold">Clinic Queue Engine</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[30px] font-bold text-text-ink leading-none">5</span>
                <span className="text-[12px] text-text-muted font-semibold">active tokens</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-container-tint flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[12px]">
            <div className="flex-1 bg-surface-container-low px-2 py-1 rounded text-center border border-surface-container">
              <span className="text-text-muted text-[10px] block font-bold">Consulting</span>
              <span className="text-primary font-bold">1 (Dr. Vance)</span>
            </div>
            <div className="flex-1 bg-surface-container-low px-2 py-1 rounded text-center border border-surface-container">
              <span className="text-text-muted text-[10px] block font-bold">In Transit</span>
              <span className="text-clinical-warning font-bold">1 Called</span>
            </div>
            <div className="flex-1 bg-surface-container-low px-2 py-1 rounded text-center border border-surface-container">
              <span className="text-text-muted text-[10px] block font-bold">In Queue</span>
              <span className="text-text-ink font-bold">3 Waiting</span>
            </div>
          </div>
        </div>

        <div className="bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] text-text-muted uppercase tracking-wider font-bold">Encounters Signed</span>
              <div className="text-[30px] font-bold text-clinical-success mt-1 leading-none">6</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-success-bg flex items-center justify-center text-clinical-success shadow-sm border border-clinical-success/20">
              <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[12px] font-semibold text-text-muted">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-clinical-success">check_circle</span>
              All 6 checked out cleanly
            </span>
            <span className="font-bold text-primary">EHR Synced</span>
          </div>
        </div>
      </div>

      {/* Quick Dispatch Hub */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-text-ink">Quick Desk Dispatch</h2>
            <span className="px-2 py-0.5 rounded bg-container-tint text-[11px] text-primary font-bold shadow-sm">Accelerated Shortcuts</span>
          </div>
          <span className="text-[12px] font-semibold text-text-muted">Select an action to launch clinical workflow</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Link href="/reception/register" className="group bg-card-surface hover:bg-primary-container p-5 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between min-h-[140px] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-white/20 text-primary group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[24px]">person_add</span>
              </div>
              <span className="text-[12px] px-2 py-0.5 rounded bg-surface-container-high group-hover:bg-white/20 text-text-muted group-hover:text-white font-mono font-bold shadow-sm">Alt+1</span>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-text-ink group-hover:text-white text-[14px]">Register Patient</h3>
              <p className="text-[12px] text-text-muted group-hover:text-white/80 mt-0.5 font-medium">Demographics & auto-generate UHID barcode</p>
            </div>
          </Link>

          <Link href="/reception/directory" className="group bg-card-surface hover:bg-primary-container p-5 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between min-h-[140px] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-white/20 text-primary group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[24px]">person_search</span>
              </div>
              <span className="text-[12px] px-2 py-0.5 rounded bg-surface-container-high group-hover:bg-white/20 text-text-muted group-hover:text-white font-mono font-bold shadow-sm">Alt+2</span>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-text-ink group-hover:text-white text-[14px]">Search Patient</h3>
              <p className="text-[12px] text-text-muted group-hover:text-white/80 mt-0.5 font-medium">Lookup MPI by Name, Phone or UHID barcode</p>
            </div>
          </Link>

          <Link href="/reception/appointments" className="group bg-card-surface hover:bg-primary-container p-5 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between min-h-[140px] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-white/20 text-primary group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[24px]">calendar_month</span>
              </div>
              <span className="text-[12px] px-2 py-0.5 rounded bg-surface-container-high group-hover:bg-white/20 text-text-muted group-hover:text-white font-mono font-bold shadow-sm">Alt+3</span>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-text-ink group-hover:text-white text-[14px]">Create Appointment</h3>
              <p className="text-[12px] text-text-muted group-hover:text-white/80 mt-0.5 font-medium">Book clinician slot & pre-warm voice room node</p>
            </div>
          </Link>

          <Link href="/reception/queue" className="group bg-card-surface hover:bg-primary-container p-5 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between min-h-[140px] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-white/20 text-primary group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[24px]">group</span>
              </div>
              <span className="text-[12px] px-2 py-0.5 rounded bg-surface-container-high group-hover:bg-white/20 text-text-muted group-hover:text-white font-mono font-bold shadow-sm">Alt+4</span>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-text-ink group-hover:text-white text-[14px]">View Queue Manager</h3>
              <p className="text-[12px] text-text-muted group-hover:text-white/80 mt-0.5 font-medium">Real-time triage dispatch & lobby PA broadcaster</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Operational Double Split: Queue Preview + Upcoming Arrivals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-clinical-success animate-pulse"></span>
                  <h3 className="font-bold text-text-ink text-[14px]">Live Lobby & Intake Queue Preview</h3>
                </div>
                <p className="text-[12px] font-semibold text-text-muted mt-0.5">Synced with Dr. Vance (Room 101)</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/reception/queue" className="px-3 py-1.5 rounded-md bg-surface-container-high hover:bg-surface-container text-[12px] font-bold text-text-ink shadow-sm border border-surface-container cursor-pointer">
                  View All
                </Link>
                <Link href="/reception/appointments" className="px-3 py-1.5 rounded-md bg-primary-container hover:bg-accent-dark text-on-primary text-[12px] font-bold shadow-sm cursor-pointer">
                  Call Next
                </Link>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between p-3 bg-warning-bg/70 rounded-lg border border-clinical-warning/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-card-surface flex flex-col items-center justify-center shadow-sm border border-surface-container">
                    <span className="text-[10px] text-clinical-warning font-bold">TOKEN</span>
                    <span className="font-bold text-[12px]">#103</span>
                  </div>
                  <div>
                    <div className="font-bold text-[12px] text-text-ink">Sarah Al-Mansoor</div>
                    <div className="text-[11px] font-medium text-text-muted">Internal Medicine • Follow-up</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-clinical-warning text-white text-[11px] font-bold animate-pulse shadow-sm">
                  CALLED — Room 101
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-surface-container">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-card-surface flex flex-col items-center justify-center shadow-sm border border-surface-container">
                    <span className="text-[10px] text-text-muted font-bold">TOKEN</span>
                    <span className="font-bold text-[12px]">#104</span>
                  </div>
                  <div>
                    <div className="font-bold text-[12px] text-text-ink">Marcus Chen</div>
                    <div className="text-[11px] font-medium text-text-muted">Cardiology • Priority BP</div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-[11px] font-bold text-text-muted block">Wait: 14m</span>
                  <span className="px-2 py-0.5 rounded-full bg-container-tint text-primary text-[10px] font-bold shadow-sm">Next</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-surface-container">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-card-surface flex flex-col items-center justify-center shadow-sm border border-surface-container">
                    <span className="text-[10px] text-text-muted font-bold">TOKEN</span>
                    <span className="font-bold text-[12px]">#105</span>
                  </div>
                  <div>
                    <div className="font-bold text-[12px] text-text-ink">Elena Rostova</div>
                    <div className="text-[11px] font-medium text-text-muted">Comprehensive Blood Panel</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-text-muted">Wait: 08m</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-surface-container-lowest rounded-lg flex items-center justify-between text-[12px] font-semibold text-text-muted border border-surface-container">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">record_voice_over</span>
              Overhead Voice Display: Active on Zone 1 (Front Lobby)
            </span>
            <Link href="/reception/queue" className="text-primary font-bold hover:underline cursor-pointer">Full Queue</Link>
          </div>
        </div>

        <div className="lg:col-span-5 bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">upcoming</span>
                <h3 className="font-bold text-text-ink text-[14px]">Upcoming Arrivals</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-container-tint text-primary text-[11px] font-bold shadow-sm">Next 60 Mins</span>
            </div>

            <div className="mt-3 flex flex-col gap-2.5">
              <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
                <div className="flex items-center gap-3">
                  <div className="w-11 py-1 rounded bg-card-surface text-center shadow-sm border border-surface-container">
                    <span className="text-[12px] font-bold text-primary block">10:00</span>
                    <span className="text-[10px] font-bold text-text-muted">AM</span>
                  </div>
                  <div>
                    <span className="font-bold text-[12px] text-text-ink block">David Kim</span>
                    <span className="text-[11px] font-medium text-text-muted">Dr. Vance (Room 101)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-success-bg text-clinical-success text-[10px] font-bold shadow-sm">Arrived</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
                <div className="flex items-center gap-3">
                  <div className="w-11 py-1 rounded bg-card-surface text-center shadow-sm border border-surface-container">
                    <span className="text-[12px] font-bold text-primary block">10:15</span>
                    <span className="text-[10px] font-bold text-text-muted">AM</span>
                  </div>
                  <div>
                    <span className="font-bold text-[12px] text-text-ink block">Sophia Patel</span>
                    <span className="text-[11px] font-medium text-text-muted">Dr. Anita Roy (Room 2A)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-container-tint text-primary text-[10px] font-bold shadow-sm">Pre-checked</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
                <div className="flex items-center gap-3">
                  <div className="w-11 py-1 rounded bg-card-surface text-center shadow-sm border border-surface-container">
                    <span className="text-[12px] font-bold text-primary block">10:30</span>
                    <span className="text-[10px] font-bold text-text-muted">AM</span>
                  </div>
                  <div>
                    <span className="font-bold text-[12px] text-text-ink block">Maya Lin Harrison</span>
                    <span className="text-[11px] font-medium text-text-muted">Dr. Vance (Room 101)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-warning-bg text-clinical-warning text-[10px] font-bold shadow-sm">Arriving</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[12px] font-semibold text-text-muted">
            <span>Auto-refreshed 12s ago</span>
            <Link href="/reception/appointments" className="text-primary font-bold flex items-center gap-1 hover:underline cursor-pointer">
              Roster Schedule <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
