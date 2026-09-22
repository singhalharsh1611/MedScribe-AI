"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { api, getUser } from "@/lib/api";

const hasClinicalValue = (value: unknown) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized !== "" && normalized !== "n/a" && normalized !== "null" && normalized !== "undefined";
};

const prescriptionSummary = (value: unknown) => {
  if (!value) return "None";
  let prescription: any = value;
  if (typeof value === "string") {
    try {
      prescription = JSON.parse(value);
    } catch {
      return value.length > 80 ? "Prescription recorded" : value;
    }
  }
  const medications = Array.isArray(prescription?.medications) ? prescription.medications : [];
  if (medications.length === 0) return "None";
  const names = medications
    .map((medication: any) => medication?.medicine || medication?.name)
    .filter(Boolean);
  if (names.length === 0) return `${medications.length} medication${medications.length === 1 ? "" : "s"}`;
  const visible = names.slice(0, 2).join(", ");
  return names.length > 2 ? `${visible} +${names.length - 2} more` : visible;
};

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [callingId, setCallingId] = useState<string | number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [liveQueue, setLiveQueue] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setCurrentUser(u);
    const load = () => {
      if (u.clinic_id) {
        Promise.all([
          api.clinics.stats(u.clinic_id),
          api.queue.get(u.clinic_id, u.id),
          api.appointments.list(u.clinic_id, u.id),
          api.encounters.list({ doctorId: u.id, clinicId: u.clinic_id })
        ]).then(([s, q, a, e]) => {
          setStats(s);
          setLiveQueue(q.queue || []);
          setAppointments(a.appointments || []);
          setEncounters(e.encounters || []);
          setIsLoading(false);
        }).catch(() => {
          setIsLoading(false);
        });
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const waitingPatients = liveQueue.filter((p: any) => p.status === "waiting");
  const inConsultationPatient = liveQueue.find((p: any) => p.status === "called" || p.status === "in_consultation");
  const completedCount = liveQueue.filter((p: any) => p.status === "completed").length;
  // Only count appointments not yet arrived (excludes checked_in/completed)
  const upcomingCount = appointments.filter((a: any) => a.status === "scheduled" || a.status === "confirmed").length;

  const handleCall = async (id: string | number, name: string) => {
    setCallingId(id);
    try {
      const response = await api.queue.updateStatus(Number(id), "called");
      const selectedPatient = liveQueue.find((entry: any) => String(entry.id) === String(id));
      if (!selectedPatient) throw new Error("Patient is no longer in the queue");
      const calledPatient = { ...selectedPatient, ...response.entry, status: "called" };
      setLiveQueue((current) => current.map((entry) =>
        String(entry.id) === String(id) ? calledPatient : entry
      ));
      localStorage.setItem("activeQueueEntry", JSON.stringify(calledPatient));
      localStorage.setItem("activePatientId", String(calledPatient.patient_id));
      showToast(`Calling ${name} to Room 101`, "campaign");
      router.push("/doctor/patient-called");
    } catch (error: any) {
      showToast({ title: "Could not call patient", description: error.message, type: "error" });
    } finally {
      setCallingId(null);
    }
  };

  const handleStartConsultation = () => {
    if (inConsultationPatient) {
      localStorage.setItem("activeQueueEntry", JSON.stringify(inConsultationPatient));
      localStorage.setItem("activePatientId", String(inConsultationPatient.patient_id));
      router.push("/doctor/patient-called");
      return;
    }
    if (waitingPatients[0]) {
      void handleCall(
        waitingPatients[0].id,
        `${waitingPatients[0].first_name} ${waitingPatients[0].last_name}`.trim(),
      );
      return;
    }
    showToast({
      title: "No patient available",
      description: "The queue is empty. Ask reception to add a patient first.",
      type: "warning",
    });
  };

  const todayEncounters = encounters.filter((encounter: any) => {
    if (!encounter.started_at) return false;
    return new Date(encounter.started_at).toDateString() === new Date().toDateString();
  });

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const getStatusLabel = (status: string) => {
    if (status === "checked_in") return "In Queue";
    if (status === "completed") return "Done";
    if (status === "confirmed") return "Confirmed";
    return status || "Upcoming";
  };

  const getStatusClass = (status: string) => {
    if (status === "completed") return "bg-success-bg text-clinical-success";
    if (status === "checked_in") return "bg-warning-bg text-clinical-warning font-bold";
    if (status === "confirmed") return "bg-success-bg text-clinical-success";
    return "bg-container-tint text-primary";
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Greeting Banner */}
      <section className="bg-card-surface rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-surface-container">
        <div>
          <h1 className="text-[24px] font-bold text-text-ink tracking-tight">
            Good morning, {currentUser?.name?.split(" ")[0] ? `Dr. ${currentUser.name.split(" ")[0]}` : "Doctor"}
          </h1>
          <p className="text-[14px] text-text-muted mt-1 font-medium">{today}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleStartConsultation} disabled={callingId !== null} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-text-ink font-bold text-[14px] transition-all shadow-sm border border-surface-container disabled:opacity-60">
            <span className="material-symbols-outlined text-[18px] text-primary">add_notes</span>
            <span>Start Consultation</span>
          </button>
          <Link href="/doctor/walk-in" className="group flex items-center gap-3 rounded-xl border border-primary/20 bg-gradient-to-br from-primary to-accent-dark px-4 py-2.5 text-white shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <span className="material-symbols-outlined text-[22px]">person_add</span>
            <span className="flex flex-col leading-tight">
              <span className="text-[14px] font-bold">Start Walk-in</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {[
          { label: "Waiting Room", value: waitingPatients.length, color: "clinical-warning", bgColor: "warning-bg", icon: "hourglass_top", sub: `${waitingPatients.length} in lobby`, href: "/doctor/queue" },
          { label: "In Consultation", value: inConsultationPatient ? 1 : 0, color: "clinical-success", bgColor: "success-bg", icon: "stethoscope", sub: inConsultationPatient ? `Rm 101: ${inConsultationPatient.first_name || inConsultationPatient.name}` : "No active consultation", href: "/doctor/queue" },
          { label: "Encounter Completed", value: completedCount, color: "primary", bgColor: "surface-container-high", icon: "task_alt", sub: `${completedCount} charts signed & filed`, href: "#" },
          { label: "Upcoming Today", value: upcomingCount, color: "primary", bgColor: "container-tint", icon: "event_upcoming", sub: upcomingCount > 0 ? "Check schedule" : "No upcoming", href: "/doctor/schedule" },
        ].map(({ label, value, color, bgColor, icon, sub, href }) => (
          <Link key={label} href={href} className="bg-card-surface rounded-xl p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow no-underline">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">{label}</span>
                {isLoading ? (
                  <div className="h-9 w-16 bg-surface-container-highest rounded mt-1 animate-pulse"></div>
                ) : (
                  <span className={`text-[36px] font-bold text-${color} mt-1`}>{value}</span>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl bg-${bgColor} flex items-center justify-center text-${color}`}>
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-space-sm pt-space-xs text-on-surface-variant">
              {isLoading ? (
                <div className="h-4 w-20 bg-surface-container-highest rounded animate-pulse"></div>
              ) : (
                <span className={`px-2 py-0.5 rounded bg-${bgColor} text-${color} text-[11px] font-semibold`}>{sub}</span>
              )}
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
                <span className="px-2.5 py-0.5 rounded-full bg-warning-bg text-clinical-warning text-[11px] font-semibold">
                  {isLoading ? (
                    <span className="h-5 w-24 bg-surface-container-highest rounded animate-pulse inline-block"></span>
                  ) : (
                    `${waitingPatients.length} in waiting room`
                  )}
                </span>
              </div>
              <Link href="/doctor/queue" className="flex items-center gap-1 text-primary hover:text-accent-dark text-[13px] font-semibold transition-colors no-underline">
                <span>View Full Queue</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>

            {isLoading ? (
              <>
                <div className="p-space-md rounded-xl bg-surface-container-lowest animate-pulse">
                  <div className="h-6 w-48 bg-surface-container-highest rounded mb-2"></div>
                  <div className="h-4 w-64 bg-surface-container-highest rounded"></div>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low animate-pulse">
                  <div className="h-6 w-48 bg-surface-container-highest rounded mb-2"></div>
                  <div className="h-4 w-64 bg-surface-container-highest rounded"></div>
                </div>
                <div className="flex flex-col gap-space-xs">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-space-md rounded-lg bg-surface-container-lowest animate-pulse">
                      <div className="h-4 w-32 bg-surface-container-highest rounded mb-1"></div>
                      <div className="h-3 w-48 bg-surface-container-highest rounded"></div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {inConsultationPatient && (
                  <div className="p-space-md rounded-xl bg-surface-container-lowest border border-clinical-success/30 flex flex-col md:flex-row md:items-center justify-between gap-space-md shadow-sm mb-4">
                    <div className="flex items-center gap-space-md min-w-0">
                      <div className="min-w-[48px] px-3 h-12 rounded-xl bg-success-bg text-clinical-success flex items-center justify-center shrink-0 font-bold text-[15px]">
                        #{inConsultationPatient.token || "T-"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-clinical-success uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-clinical-success animate-pulse"></span>ACTIVE CONSULTATION
                        </span>
                        <span className="text-[18px] font-bold text-text-ink truncate">{inConsultationPatient.first_name} {inConsultationPatient.last_name}</span>
                        <p className="text-[12px] text-on-surface-variant truncate">{inConsultationPatient.complaint || "No complaint recorded"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem("activeQueueEntry", JSON.stringify(inConsultationPatient));
                        router.push("/doctor/patient-called");
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-clinical-success hover:bg-clinical-success/90 text-white font-bold text-[15px] transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                      <span>Resume Encounter</span>
                    </button>
                  </div>
                )}

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
                        <div className="min-w-[48px] px-3 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[15px]">
                          #{waitingPatients[0]?.token || "T-"}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">NEXT IN QUEUE</span>
                          <span className="text-[18px] font-bold text-text-ink truncate">{waitingPatients[0]?.first_name} {waitingPatients[0]?.last_name}</span>
                          <p className="text-[12px] text-on-surface-variant truncate">{waitingPatients[0]?.complaint || "No complaint recorded"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => waitingPatients[0] && handleCall(waitingPatients[0].id, `${waitingPatients[0].first_name} ${waitingPatients[0].last_name}`)}
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
                            <span className="min-w-[44px] px-2.5 py-1 rounded-lg bg-container-tint text-[13px] font-bold text-text-ink shrink-0 text-center">{p.token || `T-${p.id}`}</span>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-[15px] text-text-ink">{p.first_name} {p.last_name}</span>
                              <div className="flex items-center gap-2 text-on-surface-variant text-[12px] mt-0.5">
                                <span className="truncate">{p.complaint || "No complaint"}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleCall(p.id, `${p.first_name} ${p.last_name}`)} disabled={callingId === p.id} className="px-3.5 py-1.5 rounded-lg bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim text-[13px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0">
                            <span className="material-symbols-outlined text-[16px]">campaign</span>
                            <span>Call Patient</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Today's Schedule */}
          <div className="bg-card-surface rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <h2 className="text-[22px] font-bold text-text-ink">Today&apos;s Appointments</h2>
                <span className="text-[12px] text-on-surface-variant">Shift Progress: {completedCount} of {appointments.length} Encounters</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-clinical-success"></span>
                <span className="text-[11px] font-semibold text-text-ink">On Time Schedule</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-surface-container-lowest animate-pulse">
                    <div className="flex flex-col items-center shrink-0 w-20">
                      <div className="h-4 w-16 bg-surface-container-highest rounded"></div>
                      <div className="h-3 w-20 bg-surface-container-highest rounded mt-1"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 w-32 bg-surface-container-highest rounded"></div>
                      <div className="h-3 w-48 bg-surface-container-highest rounded mt-1"></div>
                    </div>
                  </div>
                ))
              ) : appointments.length === 0 ? (
                <p className="text-[14px] text-text-muted">No appointments scheduled for today.</p>
              ) : appointments.map((apt: any, i: number) => {
                const isNow = i === 0 && apt.status !== "completed";
                return (
                  <div key={apt.id} className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${isNow ? "bg-surface-container-high relative overflow-hidden shadow-sm" : "bg-surface-container-lowest hover:bg-surface-container-low"}`}>
                    {isNow && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                    <div className="flex flex-col items-center shrink-0 w-20">
                      <span className={`text-[13px] font-semibold ${isNow ? "text-primary" : "text-on-surface-variant"}`}>{new Date(apt.appointment_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[11px] mt-1 ${getStatusClass(apt.status)}`}>{getStatusLabel(apt.status)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-[15px] text-text-ink">{apt.first_name ? `${apt.first_name} ${apt.last_name}` : `Patient #${apt.patient_id}`}</span>
                      <p className="text-[12px] text-on-surface-variant mt-0.5">{apt.reason_for_visit || "Routine visit"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right: Recent Patients */}
        <section className="lg:col-span-4 flex flex-col gap-space-lg">
          <div className="bg-card-surface rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <h3 className="font-bold text-[18px] text-text-ink">Recent Patients</h3>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">Today</span>
              </div>
              <Link href="/doctor/queue" className="text-primary hover:text-accent-dark text-[13px] font-semibold transition-colors no-underline">View All</Link>
            </div>

            <div className="flex flex-col gap-space-sm">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-space-md rounded-lg bg-surface-container-low animate-pulse">
                    <div className="h-4 w-32 bg-surface-container-highest rounded mb-2"></div>
                    <div className="h-3 w-48 bg-surface-container-highest rounded"></div>
                  </div>
                ))
              ) : todayEncounters.length === 0 ? (
                <p className="text-[14px] text-text-muted">No patients seen today.</p>
              ) : todayEncounters.slice(0, 3).map((enc) => (
                <div key={enc.id} className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors flex flex-col gap-2">
                  <div>
                    <span className="font-bold text-[15px] text-text-ink">{[enc.first_name, enc.last_name].filter(Boolean).join(" ") || enc.patient_name || `Patient #${enc.patient_id}`}</span>
                    <p className="text-[12px] text-on-surface-variant">{new Date(enc.started_at).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-1 text-[12px]">
                    <div className="flex items-center gap-1 text-on-surface-variant">
                      <span className="text-text-ink font-semibold">Diagnosis:</span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container text-text-ink text-[11px]">{hasClinicalValue(enc.diagnosis) ? enc.diagnosis : "Pending"}</span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant mt-1">
                      <span className="text-clinical-success font-semibold truncate" title={prescriptionSummary(enc.prescription)}>Rx: {prescriptionSummary(enc.prescription)}</span>
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
