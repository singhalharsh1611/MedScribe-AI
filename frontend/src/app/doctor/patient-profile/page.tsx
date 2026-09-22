"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api, getUser } from "@/lib/api";

export default function PatientProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");
  const [isConnecting, setIsConnecting] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const patientId = localStorage.getItem("activePatientId");
    if (patientId) {
      const user = getUser();
      api.patients.get(parseInt(patientId), user?.id).then(data => {
        setPatient(data.patient);
        setEncounters(data.encounters || []);
        setAppointments(data.appointments || []);
      }).catch(() => {}).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const handleStartConsultation = async () => {
    setIsConnecting(true);
    try {
      const user = getUser();
      if (!user?.id || !user?.clinic_id || !patient?.id) {
        setIsConnecting(false);
        return;
      }
      const response = await api.encounters.create({
        patient_id: patient.id,
        doctor_id: user.id,
        clinic_id: user.clinic_id,
        chief_complaint: "",
      });
      localStorage.setItem("activeQueueEntry", JSON.stringify({ ...patient, status: "in_consultation" }));
      localStorage.setItem("activeEncounter", JSON.stringify(response.encounter));
      router.push("/doctor/encounter/new");
    } catch (error) {
      console.error(error);
      setIsConnecting(false);
    }
  };

  // Prescriptions from encounters (static fallback until prescription API is implemented)
  const medications = encounters.flatMap((enc: any) =>
    enc.prescription ? [{ id: enc.id, name: enc.prescription, desc: `Encounter on ${new Date(enc.started_at).toLocaleDateString('en-IN')}`, badge: enc.status === 'completed' ? 'Completed' : 'Active', badgeStyle: enc.status === 'completed' ? 'bg-success-bg text-clinical-success' : 'bg-container-tint text-primary', icon: 'medication', iconColor: 'text-primary' }] : []
  );

  const tabs = ["Overview", "Appointments", "Consultations", "Prescriptions", "Vitals", "Lab Tests", "Notes"];

  return (
    <div className="flex flex-col w-full pb-space-3xl gap-space-md">

      {/* Patient Hero Card */}
      <section className="rounded-xl bg-card-surface shadow-sm p-space-lg relative overflow-hidden border border-surface-container">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-space-lg">
            <div className="relative w-20 h-20 shrink-0">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-tr from-primary-container to-accent-light flex items-center justify-center text-white text-[28px] font-bold shadow-sm">
                {patient ? `${patient.first_name?.[0] || ""}${patient.last_name?.[0] || ""}` : ""}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-card-surface rounded-full shadow-sm">
                <span className="w-3.5 h-3.5 rounded-full bg-clinical-success block"></span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-x-space-sm gap-y-space-2xs">
                <h1 className="text-[28px] font-bold text-text-ink tracking-tight">{patient ? `${patient.first_name} ${patient.last_name}` : "Loading..."}</h1>
                <span className="px-space-xs py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">Checked In</span>
              </div>
              <div className="mt-space-2xs flex flex-wrap items-center gap-x-space-md gap-y-1 text-on-surface-variant text-[12px] font-semibold">
                <span>{patient?.gender || "Unknown Gender"}</span>
                <span>DOB: <strong className="text-text-ink font-semibold">{patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : "N/A"}</strong></span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">call</span>{patient?.phone || "No phone"}</span>
              </div>
              <div className="mt-space-sm flex flex-wrap items-center gap-space-xs">
                <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-md bg-error-bg text-clinical-error text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[15px]">warning</span>
                  <span>Allergy: <strong>Penicillin</strong> (Moderate Urticaria / Rash)</span>
                </div>
                <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-md bg-warning-bg text-clinical-warning text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[15px]">vital_signs</span>
                  <span>Flag: Seasonal Allergic Rhinitis</span>
                </div>
                <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-md bg-container-tint text-primary text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[15px]">file_copy</span>
                  <span>Mild Asthma (Exercise-induced)</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex sm:flex-row lg:flex-col xl:flex-row items-center gap-space-sm shrink-0">
            <button onClick={handleStartConsultation} disabled={isConnecting} className="w-full sm:w-auto px-space-lg py-3 rounded-lg bg-primary hover:bg-accent-dark text-on-primary text-[15px] font-bold transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer">
              <span className={`material-symbols-outlined text-[20px] ${isConnecting ? "animate-spin" : "group-hover:rotate-12 transition-transform"}`}>
                {isConnecting ? "refresh" : "clinical_notes"}
              </span>
              <span>{isConnecting ? "Connecting..." : "Start Consultation"}</span>
              {!isConnecting && <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </div>
        </div>
      </section>

      {/* Segmented Navigation */}
      <div className="bg-surface-container-low p-1.5 rounded-xl flex items-center justify-start overflow-x-auto gap-1 border border-surface-container hide-scrollbar">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-space-md py-2 rounded-lg text-[15px] font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === tab ? "bg-card-surface text-text-ink shadow-sm" : "text-on-surface-variant hover:text-text-ink hover:bg-surface-container-high"}`}>
            {tab === "Overview" && <span className="material-symbols-outlined text-primary text-[18px]">space_dashboard</span>}
            {tab === "Appointments" && <span className="material-symbols-outlined text-[18px]">calendar_month</span>}
            {tab === "Consultations" && <span className="material-symbols-outlined text-[18px]">medical_services</span>}
            {tab === "Prescriptions" && <span className="material-symbols-outlined text-[18px]">prescriptions</span>}
            {tab === "Vitals" && <span className="material-symbols-outlined text-[18px]">monitoring</span>}
            {tab === "Lab Tests" && <span className="material-symbols-outlined text-[18px]">biotech</span>}
            {tab === "Notes" && <span className="material-symbols-outlined text-[18px]">edit_note</span>}
            <span>{tab}</span>
            {tab === "Overview" && <span className="w-2 h-2 rounded-full bg-primary"></span>}
            {tab === "Consultations" && <span className="text-[11px] font-semibold bg-container-tint px-1.5 py-0.5 rounded-full text-primary">3</span>}
            {tab === "Lab Tests" && <span className="text-[11px] font-semibold bg-warning-bg px-1.5 py-0.5 rounded-full text-clinical-warning">1 Flag</span>}
          </button>
        ))}
      </div>

      {/* Grid */}
      {activeTab === "Overview" && (
        <div>
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="rounded-xl bg-card-surface p-space-lg shadow-sm border border-surface-container relative overflow-hidden">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">assignment_late</span>
                  </span>
                  <div>
                    <h2 className="text-[18px] font-bold text-text-ink leading-tight">Today&apos;s Intake & Chief Complaint</h2>
                    <p className="text-[11px] font-semibold text-text-muted">Recorded by Sarah Jenkins, RN • Room 101 • 09:12 AM</p>
                  </div>
                </div>
                <span className="px-space-xs py-1 bg-container-tint text-primary text-[11px] font-semibold rounded-md">Priority 2 — Urgent</span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-container-low mb-space-sm border border-surface-container">
                <p className="text-[16px] text-text-ink font-medium leading-relaxed">
                  &quot;Seasonal allergy symptoms and persistent dry cough for 5 days with mild nocturnal wheezing and throat irritation. No reported fever or chills; mild tightness during brisk morning walks.&quot;
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs pt-space-2xs">
                <div className="p-space-xs rounded-lg bg-surface-bright flex flex-col border border-surface-container">
                  <span className="text-[11px] font-semibold text-text-muted uppercase">Duration</span>
                  <span className="text-[15px] font-bold text-text-ink mt-0.5">5 Continuous Days</span>
                </div>
                <div className="p-space-xs rounded-lg bg-surface-bright flex flex-col border border-surface-container">
                  <span className="text-[11px] font-semibold text-text-muted uppercase">Associated Triggers</span>
                  <span className="text-[15px] font-bold text-text-ink mt-0.5">Tree Pollen, Cold Air</span>
                </div>
                <div className="p-space-xs rounded-lg bg-surface-bright flex flex-col border border-surface-container">
                  <span className="text-[11px] font-semibold text-text-muted uppercase">Inhaler Relief</span>
                  <span className="text-[15px] font-bold text-clinical-success mt-0.5">Partial / Responsive</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card-surface p-space-lg shadow-sm border border-surface-container">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">pill</span>
                  </span>
                  <div>
                    <h2 className="text-[18px] font-bold text-text-ink">Current Active Medications</h2>
                    <p className="text-[11px] font-semibold text-text-muted">3 verified active prescriptions</p>
                  </div>
                </div>
                <button onClick={() => router.push("/doctor/encounter/new")} className="text-[13px] font-semibold text-primary hover:text-accent-dark flex items-center gap-1 cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  Add Rx via Voice
                </button>
              </div>
              <div className="space-y-space-xs">
                {medications.map((med) => (
                  <div key={med.id} className="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between hover:bg-surface-container transition-all border border-surface-container">
                    <div className="flex items-center gap-space-sm">
                      <div className={`w-10 h-10 rounded-lg bg-card-surface flex items-center justify-center ${med.iconColor} shadow-sm`}>
                        <span className="material-symbols-outlined text-[20px]">{med.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-text-ink">{med.name}</span>
                        <span className="text-[12px] font-semibold text-text-muted">{med.desc}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-sm">
                      <span className={`px-space-xs py-1 text-[11px] font-semibold rounded-md ${med.badgeStyle}`}>{med.badge}</span>
                      <button className="p-1 text-on-surface-variant hover:text-text-ink rounded-lg"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-card-surface p-space-lg shadow-sm border border-surface-container">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-8 h-8 rounded-lg bg-container-tint flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">history_edu</span>
                  </span>
                  <div>
                    <h2 className="text-[18px] font-bold text-text-ink">Last Encounter Archive</h2>
                    <p className="text-[11px] font-semibold text-text-muted">{encounters.length > 0 ? new Date(encounters[0].started_at).toLocaleDateString() : "No past encounters"}</p>
                  </div>
                </div>
                {encounters.length > 0 && encounters[0].status === 'completed' && (
                  <span className="px-space-xs py-1 rounded-full bg-success-bg text-clinical-success text-[11px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Signed SOAP Note
                  </span>
                )}
              </div>
              {encounters.length > 0 ? (
                <div className="space-y-space-sm">
                  <div className="p-space-md rounded-lg bg-surface-container-low border border-surface-container">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[15px] font-bold text-text-ink">Attending: Dr. {encounters[0].doctor_id}</span>
                      <span className="text-[11px] font-semibold text-text-muted">Status: {encounters[0].status}</span>
                    </div>
                    <p className="text-[14px] text-on-surface-variant font-medium leading-relaxed">
                      {encounters[0].notes || "No notes available for this encounter."}
                    </p>
                    <div className="mt-space-sm flex flex-wrap items-center gap-space-xs text-[12px] font-semibold text-text-muted">
                      {encounters[0].diagnosis && <span className="bg-surface-bright px-2 py-0.5 rounded border border-surface-container">Dx: {encounters[0].diagnosis}</span>}
                      {encounters[0].prescription && <span className="bg-surface-bright px-2 py-0.5 rounded border border-surface-container">Rx: {encounters[0].prescription}</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[14px] text-on-surface-variant">No encounter history found for this patient.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Appointments" && (
        <div className="rounded-xl border border-surface-container bg-card-surface p-6 shadow-sm">
          <h3 className="mb-4 text-[16px] font-bold text-text-ink">Recent Appointments</h3>
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-surface-container bg-surface-container-lowest p-4">
                  <div>
                    <div className="font-bold text-text-ink">
                      {new Date(appointment.appointment_time).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                    </div>
                    <div className="text-[13px] text-text-muted">
                      Dr. {appointment.doctor_name || "Any"} - {appointment.reason_for_visit || appointment.reason || "General"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${appointment.status === "completed" ? "bg-success-bg text-clinical-success" : "bg-container-tint text-primary"}`}>
                      {appointment.status}
                    </span>
                    {appointment.prescription_id && (
                      <Link
                        href={`/consultation/review/document?id=${appointment.prescription_id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-bold text-on-primary shadow-sm transition-colors hover:bg-accent-dark"
                      >
                        <span className="material-symbols-outlined text-[16px]">prescriptions</span>
                        View Prescription
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-[14px] text-text-muted">No appointments found.</p>
          )}
        </div>
      )}

      {activeTab === "Prescriptions" && (
        <div className="rounded-xl border border-surface-container bg-card-surface p-6 shadow-sm">
          <h3 className="mb-4 text-[16px] font-bold text-text-ink">Saved Prescriptions</h3>
          {encounters.some((encounter) => encounter.prescription_id) ? (
            <div className="space-y-3">
              {encounters.filter((encounter) => encounter.prescription_id).map((encounter) => (
                <div key={encounter.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-surface-container bg-surface-container-lowest p-4">
                  <div>
                    <p className="font-bold text-text-ink">{encounter.diagnosis || "Prescription"}</p>
                    <p className="text-[12px] text-text-muted">
                      {new Date(encounter.ended_at || encounter.started_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      {encounter.doctor_name ? ` · Dr. ${encounter.doctor_name}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/consultation/review/document?id=${encounter.prescription_id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-bold text-on-primary shadow-sm transition-colors hover:bg-accent-dark"
                  >
                    <span className="material-symbols-outlined text-[16px]">prescriptions</span>
                    View Prescription
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-[14px] text-text-muted">No saved prescriptions from your consultations.</p>
          )}
        </div>
      )}
    </div>
  );
}
