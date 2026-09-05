"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { api, getUser } from "@/lib/api";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { queue, callPatient, showToast } = useApp();
  const [callingId, setCallingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [liveQueue, setLiveQueue] = useState<any[]>([]);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setCurrentUser(u);
    if (u.clinic_id) {
      Promise.all([
        api.clinics.stats(u.clinic_id),
        api.queue.get(u.clinic_id, u.id),
      ]).then(([s, q]) => {
        setStats(s);
        setLiveQueue(q.queue || []);
      }).catch(() => {});
    }
  }, []);

  const waitingPatients = liveQueue.filter((p: any) => p.status === "waiting");
  const inConsultationPatient = liveQueue.find((p: any) => p.status === "called" || p.status === "in_consultation");
  const completedCount = liveQueue.filter((p: any) => p.status === "completed").length;

  const handleCall = (id: string, name: string) => {
    setCallingId(id);
    setTimeout(() => {
      setCallingId(null);
      callPatient(id);
      showToast(`Calling ${name} to Room 101`, "campaign");
      router.push("/doctor/patient-called");
    }, 1000);
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Greeting Banner */}
      <section className="bg-card-surface rounded-xl p-space-lg shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="text-[28px] font-bold text-text-ink tracking-tight">Good morning, {currentUser?.name?.split(" ")[0] ? `Dr. ${currentUser.name.split(" ")[0]}` : "Doctor"}</span>
            <span className="px-2.5 py-1 rounded-full bg-container-tint text-primary text-[11px] font-semibold">{today}</span>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs text-on-surface-variant text-[14px]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low text-text-ink font-semibold text-[13px]">
              <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
              <span>Shift: Morning Outpatient (08:00 – 13:00)</span>
            </div>
            <span className="text-outline-variant">•</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low text-text-ink font-semibold text-[13px]">
              <span className="material-symbols-outlined text-[16px] text-clinical-success">meeting_room</span>
              <span>Consultation Room 101</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface-container-low text-text-ink shadow-sm">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-clinical-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-clinical-success"></span>
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">mic</span>
            <span className="font-semibold text-[13px] text-text-ink">Voice Node: Ready</span>
          </div>

          <button onClick={() => router.push("/doctor/patient-called")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-text-ink font-bold text-[15px] transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">add_notes</span>
            <span>Start Consultation</span>
          </button>

          <Link href="/doctor/queue" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-accent-dark text-on-primary font-bold text-[15px] transition-all shadow-md shadow-primary/20 no-underline">
            <span>View Queue</span>
            <span className="px-2 py-0.5 rounded-full bg-on-primary/20 text-on-primary text-[11px] font-semibold">{waitingPatients.length} Waiting</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {[
          { label: "Waiting Room", value: waitingPatients.length, color: "clinical-warning", bgColor: "warning-bg", icon: "hourglass_top", sub: "Avg wait: 14 min", href: "/doctor/queue" },
          { label: "In Consultation", value: inConsultationPatient ? 1 : 0, color: "clinical-success", bgColor: "success-bg", icon: "stethoscope", sub: inConsultationPatient ? `Rm 101: ${inConsultationPatient.name}` : "No active consultation", href: "/doctor/queue" },
          { label: "Encounter Completed", value: completedCount, color: "primary", bgColor: "surface-container-high", icon: "task_alt", sub: `${completedCount} charts signed & filed`, href: "#" },
          { label: "Upcoming Today", value: 8, color: "primary", bgColor: "container-tint", icon: "event_upcoming", sub: "Next at 10:15 AM", href: "/doctor/schedule" },
        ].map(({ label, value, color, bgColor, icon, sub, href }) => (
          <Link key={label} href={href} className={`bg-card-surface rounded-xl p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow no-underline`}>
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">{label}</span>
                <span className={`text-[36px] font-bold text-${color} mt-1`}>{value}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-${bgColor} flex items-center justify-center text-${color}`}>
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-space-sm pt-space-xs text-on-surface-variant">
              <span className={`px-2 py-0.5 rounded bg-${bgColor} text-${color} text-[11px] font-semibold`}>{sub}</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Main Two-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left: Queue Preview + Schedule */}
        <section className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
          {/* Queue Preview */}
          <div className="bg-card-surface rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <h2 className="text-[22px] font-bold text-text-ink">Patient Queue</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-warning-bg text-clinical-warning text-[11px] font-semibold">{waitingPatients.length} in waiting room</span>
              </div>
              <Link href="/doctor/queue" className="flex items-center gap-1 text-primary hover:text-accent-dark text-[13px] font-semibold transition-colors no-underline">
                <span>View Full Queue</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>

            {waitingPatients.length === 0 ? (
              <div className="p-space-xl flex flex-col items-center justify-center gap-space-md text-center">
                <span className="material-symbols-outlined text-[48px] text-outline-variant">sentiment_satisfied</span>
                <p className="text-[16px] font-semibold text-text-ink">Queue is clear</p>
                <p className="text-[14px] text-text-muted">All patients have been seen for this shift.</p>
              </div>
            ) : (
              <>
                {/* Next Up */}
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-space-md shadow-sm">
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[15px]">
                      #{waitingPatients[0]?.token}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider">NEXT IN QUEUE</span>
                      <span className="text-[18px] font-bold text-text-ink truncate">{waitingPatients[0]?.name} • {waitingPatients[0]?.age}</span>
                      <p className="text-[12px] text-on-surface-variant truncate">{waitingPatients[0]?.timeSlot} • {waitingPatients[0]?.complaint}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => waitingPatients[0] && handleCall(waitingPatients[0].id, waitingPatients[0].name)}
                    disabled={callingId === waitingPatients[0]?.id}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-accent-dark text-on-primary font-bold text-[15px] transition-all shadow-md shadow-primary/25 shrink-0 cursor-pointer"
                  >
                    <span className={`material-symbols-outlined text-[20px] ${callingId ? "animate-spin" : ""}`}>{callingId ? "sync" : "volume_up"}</span>
                    <span>{callingId ? "Calling Room 101..." : "Call Next Patient"}</span>
                  </button>
                </div>

                {/* Queue List */}
                <div className="flex flex-col gap-space-xs">
                  {waitingPatients.slice(0, 3).map((p) => (
                    <div key={p.id} className="p-space-md rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex flex-col md:flex-row md:items-center justify-between gap-space-sm shadow-sm">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="px-2.5 py-1 rounded bg-container-tint text-[13px] font-bold text-text-ink shrink-0">{p.token}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[15px] text-text-ink">{p.name}, {p.age}</span>
                          <div className="flex items-center gap-2 text-on-surface-variant text-[12px] mt-0.5">
                            <span>{p.timeSlot}</span>
                            <span>•</span>
                            <span className="truncate">{p.complaint}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleCall(p.id, p.name)} disabled={callingId === p.id} className="px-3.5 py-1.5 rounded-lg bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim text-[13px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
                        <span className="material-symbols-outlined text-[16px]">campaign</span>
                        <span>Call Patient</span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Today's Schedule */}
          <div className="bg-card-surface rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <h2 className="text-[22px] font-bold text-text-ink">Today&apos;s Appointments</h2>
                <span className="text-[12px] text-on-surface-variant">Shift Progress: 6 of 15 Encounters</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-clinical-success"></span>
                <span className="text-[11px] font-semibold text-text-ink">On Time Schedule</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { time: "08:30 AM", name: "Clara Oswald • 64F", status: "Done", statusClass: "bg-success-bg text-clinical-success", complaint: "Annual Wellness Exam", isNow: false },
                { time: "09:00 AM", name: "Robert Miller • 49M", status: "Done", statusClass: "bg-success-bg text-clinical-success", complaint: "Asthma Routine Review", isNow: false },
                { time: "09:30 AM", name: "Marcus Chen • 42M", status: "Now", statusClass: "bg-warning-bg text-clinical-warning font-bold", complaint: "Hypertension follow-up & chest tightness", isNow: true },
                { time: "10:15 AM", name: "Sophia Patel • 37F", status: "Upcoming", statusClass: "bg-container-tint text-primary", complaint: "Type II Diabetes Management & A1C Review", isNow: false },
                { time: "11:00 AM", name: "James Okafor • 71M", status: "Upcoming", statusClass: "bg-container-tint text-primary", complaint: "Post-hip replacement physical therapy review", isNow: false },
              ].map(({ time, name, status, statusClass, complaint, isNow }) => (
                <div key={time} className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${isNow ? "bg-surface-container-high relative overflow-hidden shadow-sm" : "bg-surface-container-lowest hover:bg-surface-container-low"}`}>
                  {isNow && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                  <div className="flex flex-col items-center shrink-0 w-20">
                    <span className={`text-[13px] font-semibold ${isNow ? "text-primary" : "text-on-surface-variant"}`}>{time}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[11px] mt-1 ${statusClass}`}>{status}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-[15px] text-text-ink">{name}</span>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">{complaint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right: Voice Station + Recent Patients */}
        <section className="lg:col-span-4 flex flex-col gap-space-lg">
          <div className="bg-card-surface rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-container-tint text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">mic_double</span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-text-ink">Voice Scribe Station</h3>
                  <p className="text-[12px] text-on-surface-variant">Real-time Clinical Capture</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-success-bg text-clinical-success text-[11px] font-semibold">Calibrated</span>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-container-low flex flex-col gap-2">
              <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-semibold">
                <span>Ambient Noise Floor</span>
                <span className="text-clinical-success font-bold">22 dB (Ultra Low)</span>
              </div>
              <div className="h-10 w-full flex items-center justify-between px-2 bg-surface-container-high/60 rounded gap-1">
                {[3, 5, 8, 4, 2, 6, 7, 3, 5, 4, 2, 8, 6].map((h, i) => (
                  <div key={i} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 80}ms` }}></div>
                ))}
              </div>
            </div>

            <Link href="/consultation/voice/listening" className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-accent-dark text-on-primary text-[13px] font-semibold transition-colors shadow-sm no-underline">
              <span className="material-symbols-outlined text-[16px]">mic</span>
              <span>Start Voice Recording</span>
            </Link>
          </div>

          <div className="bg-card-surface rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <h3 className="font-bold text-[18px] text-text-ink">Recent Patients</h3>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">Today</span>
              </div>
              <Link href="/doctor/queue" className="text-primary hover:text-accent-dark text-[13px] font-semibold transition-colors no-underline">View All</Link>
            </div>

            <div className="flex flex-col gap-space-sm">
              {[
                { name: "Clara Oswald, 64F", time: "Seen Today • 08:30 AM", dx: "Essential Hypertension (I10)", audio: "3m 42s Audio recorded" },
                { name: "Robert Miller, 49M", time: "Seen Today • 09:00 AM", dx: "Mild Asthma (J45.30)", rx: "Albuterol Inhaler Renewed" },
              ].map(({ name, time, dx, audio, rx }) => (
                <div key={name} className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors flex flex-col gap-2">
                  <div>
                    <span className="font-bold text-[15px] text-text-ink">{name}</span>
                    <p className="text-[12px] text-on-surface-variant">{time}</p>
                  </div>
                  <div className="flex flex-col gap-1 text-[12px]">
                    <div className="flex items-center gap-1 text-on-surface-variant">
                      <span className="text-text-ink font-semibold">Primary DX:</span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container text-text-ink text-[11px]">{dx}</span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant mt-1">
                      {audio ? (
                        <span className="flex items-center gap-1 text-primary">
                          <span className="material-symbols-outlined text-[14px]">mic</span>
                          {audio}
                        </span>
                      ) : (
                        <span className="text-clinical-success font-semibold">Rx: {rx}</span>
                      )}
                      <Link href="/consultation/review/document" className="text-primary hover:underline text-[11px] font-bold cursor-pointer no-underline">Review SOAP</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
