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
  const [queue, setQueue] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  let perms = [];
  try { perms = Array.isArray(user?.permissions) ? user.permissions : JSON.parse(user?.permissions || "[]"); } catch(e) {}
  const hasPerm = (p: string) => user?.role === "admin" || user?.role === "doctor" || perms.includes(p);


  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    if (u.clinic_id) {
      const refreshQueue = () => {
        api.queue.get(u.clinic_id).then((qRes) => {
          const currentQueue = qRes?.queue || [];
          setQueue(currentQueue);
          setStats((current: any) => ({
            ...current,
            waiting_queue: currentQueue.filter((entry: any) => entry.status === "waiting").length,
          }));
        }).catch(() => {});
      };

      Promise.all([
        api.clinics.get(u.clinic_id),
        api.queue.get(u.clinic_id),
        api.appointments.list(u.clinic_id)
      ])
        .then(([c, qRes, aRes]) => {
          setClinic(c?.clinic || null);
          const q = qRes?.queue || [];
          const a = aRes?.appointments || [];
          setQueue(q);
          setAppointments(a);
          setStats({
            today_appointments: a.length,
            waiting_queue: q.filter((entry: any) => entry.status === 'waiting').length,
          });
        })
        .catch(() => {});

      const interval = window.setInterval(refreshQueue, 5000);
      window.addEventListener("focus", refreshQueue);
      return () => {
        window.clearInterval(interval);
        window.removeEventListener("focus", refreshQueue);
      };
    }
  }, [router]);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const firstName = user?.name?.split(" ")[0] || "Staff";

  // Dynamic calculations
  const doneAppts = appointments.filter(a => a.status === 'completed').length;
  const upcomingAppts = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
  const checkedInAppts = appointments.filter(a => a.status === 'checked_in').length;
  const inLobbyCount = queue.filter(q => q.status === 'waiting').length;
  const activeQueue = queue.filter(q => ['waiting', 'called', 'in_consultation'].includes(q.status));
  const totalApptCalc = doneAppts + upcomingAppts + checkedInAppts + inLobbyCount || 1;
  const donePct = (doneAppts / totalApptCalc) * 100;
  const lobbyPct = (inLobbyCount / totalApptCalc) * 100;
  const upcomingPct = (upcomingAppts / totalApptCalc) * 100;



  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
      {/* Sub Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap text-[12px]">
            <span className="px-2.5 py-0.5 rounded-full bg-container-tint text-primary font-bold">RECEPTION - ACTIVE</span>
            <span className="text-text-muted flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px] text-primary">domain</span>
              {clinic?.name || "Your Clinic"}
            </span>
            <span className="text-text-muted font-semibold">{today}</span>
          </div>
          <h1 className="text-[24px] font-bold text-text-ink tracking-tight">Good morning, {firstName}</h1>
          <p className="text-[14px] font-medium text-text-muted">Front desk operations active.</p>
        </div>

      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] text-text-muted uppercase tracking-wider font-bold">Today's Appointments</span>
              <div className="text-[30px] font-bold text-text-ink mt-1 leading-none">{stats.today_appointments ?? 0}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-container-tint flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">calendar_today</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-[12px] font-semibold text-text-muted">
            <span className="text-clinical-success">{doneAppts} Done</span>
            <span className="text-primary">{inLobbyCount} Waiting</span>
            <span className="text-accent-dark">{upcomingAppts} Upcoming</span>
          </div>
        </div>

        <div className="bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] text-text-muted uppercase tracking-wider font-bold">Waiting in Lobby</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[30px] font-bold text-text-ink leading-none">{stats.waiting_queue ?? 0}</span>
                <span className="text-[12px] text-clinical-warning font-bold">Patients</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-warning-bg flex items-center justify-center text-clinical-warning shadow-sm border border-clinical-warning/20">
              <span className="material-symbols-outlined text-[24px]">airline_seat_recline_normal</span>
            </div>
          </div>

        </div>

        <div className="bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] text-text-muted uppercase tracking-wider font-bold">Active Consultations</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[30px] font-bold text-text-ink leading-none">{queue.filter(q => q.status === 'in_consultation').length}</span>
                <span className="text-[12px] text-primary font-bold">With Doctors</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
              <span className="material-symbols-outlined text-[24px]">stethoscope</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[12px] font-bold text-text-muted">
            <span>In Transit (Called):</span>
            <span className="text-[14px] text-text-ink">{queue.filter(q => q.status === 'called').length}</span>
          </div>
        </div>

        <div className="bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] text-text-muted uppercase tracking-wider font-bold">Completed Visits</span>
              <div className="text-[30px] font-bold text-clinical-success mt-1 leading-none">{queue.filter(q => q.status === 'completed').length}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-success-bg flex items-center justify-center text-clinical-success shadow-sm border border-clinical-success/20">
              <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-[12px] font-semibold text-text-muted gap-1">
            <span className="material-symbols-outlined text-[16px] text-clinical-success">check_circle</span>
            Checked out today
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
          {hasPerm("manage_registration") ? <Link href="/reception/register" className="group bg-card-surface hover:bg-primary-container p-5 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between min-h-[140px] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-white/20 text-primary group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[24px]">person_add</span>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-text-ink group-hover:text-white text-[14px]">Register Patient</h3>
              <p className="text-[12px] text-text-muted group-hover:text-white/80 mt-0.5 font-medium">Demographics & auto-generate UHID barcode</p>
            </div>
          </Link> : <div className="group bg-surface-container opacity-50 p-5 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between min-h-[140px] cursor-not-allowed">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-white/20 text-primary group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[24px]">person_add</span>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-text-ink group-hover:text-white text-[14px]">Register Patient</h3>
              <p className="text-[12px] text-text-muted group-hover:text-white/80 mt-0.5 font-medium">Demographics & auto-generate UHID barcode</p>
            </div>
          </div>}

          <Link href="/reception/directory" className="group bg-card-surface hover:bg-primary-container p-5 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between min-h-[140px] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-white/20 text-primary group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[24px]">person_search</span>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-text-ink group-hover:text-white text-[14px]">Search Patient</h3>
              <p className="text-[12px] text-text-muted group-hover:text-white/80 mt-0.5 font-medium">Lookup MPI by Name, Phone or UHID barcode</p>
            </div>
          </Link>

          {hasPerm("manage_appointments") ? <Link href="/reception/appointments" className="group bg-card-surface hover:bg-primary-container p-5 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between min-h-[140px] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-white/20 text-primary group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[24px]">calendar_month</span>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-text-ink group-hover:text-white text-[14px]">Create Appointment</h3>
              <p className="text-[12px] text-text-muted group-hover:text-white/80 mt-0.5 font-medium">Manage upcoming patient appointments</p>
            </div>
          </Link> : <div className="group bg-surface-container opacity-50 p-5 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between min-h-[140px] cursor-not-allowed">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-white/20 text-primary group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[24px]">calendar_month</span>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-text-ink group-hover:text-white text-[14px]">Create Appointment</h3>
              <p className="text-[12px] text-text-muted group-hover:text-white/80 mt-0.5 font-medium">Manage upcoming patient appointments</p>
            </div>
          </div>}

          {hasPerm("manage_queue_vitals") ? <Link href="/reception/queue" className="group bg-card-surface hover:bg-primary-container p-5 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between min-h-[140px] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-white/20 text-primary group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[24px]">group</span>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-text-ink group-hover:text-white text-[14px]">View Queue Manager</h3>
              <p className="text-[12px] text-text-muted group-hover:text-white/80 mt-0.5 font-medium">Manage daily patient queue</p>
            </div>
          </Link> : <div className="group bg-surface-container opacity-50 p-5 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between min-h-[140px] cursor-not-allowed">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-white/20 text-primary group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[24px]">group</span>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-text-ink group-hover:text-white text-[14px]">View Queue Manager</h3>
              <p className="text-[12px] text-text-muted group-hover:text-white/80 mt-0.5 font-medium">Manage daily patient queue</p>
            </div>
          </div>}
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
              </div>
              <div className="flex items-center gap-2">
                <Link href="/reception/queue" className="px-3 py-1.5 rounded-md bg-surface-container-high hover:bg-surface-container text-[12px] font-bold text-text-ink shadow-sm border border-surface-container cursor-pointer">
                  View All
                </Link>
                <Link href="/reception/queue" className="px-3 py-1.5 rounded-md bg-primary-container hover:bg-accent-dark text-on-primary text-[12px] font-bold shadow-sm cursor-pointer">Manage Queue</Link>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2.5">
              {activeQueue.slice(0, 3).map((q, i) => (
                <div key={q.id || i} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-surface-container">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-card-surface flex flex-col items-center justify-center shadow-sm border border-surface-container">
                      <span className="text-[10px] text-text-muted font-bold">TOKEN</span>
                      <span className="font-bold text-[12px]">#{q.token || (i + 103)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-[12px] text-text-ink">{q.first_name} {q.last_name}</div>
                      <div className="text-[11px] font-medium text-text-muted">{q.complaint || "General"}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm ${
                    q.status === 'called' ? 'bg-clinical-warning text-white animate-pulse' :
                    q.status === 'in_consultation' ? 'bg-clinical-success text-white' :
                    'bg-container-tint text-primary'
                  }`}>
                    {q.status === 'called' ? 'CALLED' : q.status === 'in_consultation' ? 'CONSULTING' : 'WAITING'}
                  </span>
                </div>
              ))}
              {activeQueue.length === 0 && (
                <div className="p-4 text-center text-text-muted text-[13px]">Queue is empty</div>
              )}
            </div>
          </div>

          
        </div>

        <div className="lg:col-span-5 bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">upcoming</span>
                <h3 className="font-bold text-text-ink text-[14px]">Upcoming Arrivals</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-container-tint text-primary text-[11px] font-bold shadow-sm">Today</span>
            </div>

            <div className="mt-3 flex flex-col gap-2.5">
              {appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').slice(0, 3).map((appt, i) => (
                <div key={appt.id || i} className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
                  <div className="flex items-center gap-3">
                    <div className="w-11 py-1 rounded bg-card-surface text-center shadow-sm border border-surface-container">
                      <span className="text-[12px] font-bold text-primary block">
                        {new Date(appt.appointment_time).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-[12px] text-text-ink block">{appt.first_name} {appt.last_name}</span>
                      <span className="text-[11px] font-medium text-text-muted">{appt.doctor_name ? `Dr. ${appt.doctor_name}` : 'Any Doctor'}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
                    appt.status === 'confirmed' ? 'bg-success-bg text-clinical-success' :
                    'bg-container-tint text-primary'
                  }`}>
                    {appt.status}
                  </span>
                </div>
              ))}
              {appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length === 0 && (
                <div className="p-4 text-center text-text-muted text-[13px]">No upcoming arrivals</div>
              )}
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}
