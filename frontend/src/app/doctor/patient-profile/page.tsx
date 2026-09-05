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
      api.patients.get(parseInt(patientId)).then(data => {
        setPatient(data.patient);
        setEncounters(data.encounters || []);
        setAppointments(data.appointments || []);
      }).catch(() => {}).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const handleStartConsultation = () => {
    setIsConnecting(true);
    setTimeout(() => { router.push("/doctor/encounter/new"); }, 600);
  };

  // Prescriptions from encounters (static fallback until prescription API is implemented)
  const medications = encounters.flatMap((enc: any) =>
    enc.prescription ? [{ id: enc.id, name: enc.prescription, desc: `Encounter on ${new Date(enc.started_at).toLocaleDateString('en-IN')}`, badge: enc.status === 'completed' ? 'Completed' : 'Active', badgeStyle: enc.status === 'completed' ? 'bg-success-bg text-clinical-success' : 'bg-container-tint text-primary', icon: 'medication', iconColor: 'text-primary' }] : []
  );

  const tabs = ["Overview", "Appointments", "Consultations", "Prescriptions", "Vitals", "Lab Tests", "Notes"];

  return (
    <div className="flex flex-col w-full pb-space-3xl gap-space-md">
      {/* Top Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-y-space-xs py-space-sm">
        <nav className="flex items-center gap-space-xs text-on-surface-variant text-[13px] font-semibold tracking-tight">
          <Link href="/doctor/dashboard" className="hover:text-primary transition-colors flex items-center gap-1 no-underline">
            <span className="material-symbols-outlined text-[16px]">stethoscope</span>
            Doctor Workspace
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-muted">Patient Directory</span>
          <span className="text-text-muted">/</span>
          <span className="text-text-ink font-semibold">Maya Lin Harrison</span>
          <span className="bg-container-tint text-on-primary-fixed-variant px-space-xs py-0.5 rounded-full text-[11px] font-semibold">UHID-MH-2024-88412</span>
        </nav>
        <div className="flex items-center gap-space-sm">
          <span className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-success-bg text-clinical-success text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
            Room 101 Audio Sync Calibrated
          </span>
          <div className="hidden sm:flex items-center gap-1 text-text-muted text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[15px]">schedule</span>
            Intake finished 8 mins ago
          </div>
        </div>
      </div>

      {/* Patient Hero Card */}
      <section className="rounded-xl bg-card-surface shadow-sm p-space-lg relative overflow-hidden border border-surface-container">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-space-lg">
            <div className="relative w-20 h-20 shrink-0">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-tr from-primary-container to-accent-light flex items-center justify-center text-white text-[28px] font-bold shadow-sm">
                ML
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-card-surface rounded-full shadow-sm">
                <span className="w-3.5 h-3.5 rounded-full bg-clinical-success block"></span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-x-space-sm gap-y-space-2xs">
                <h1 className="text-[28px] font-bold text-text-ink tracking-tight">Maya Lin Harrison</h1>
                <span className="px-space-xs py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">Checked In • Token #T-107</span>
                <span className="px-space-xs py-0.5 rounded-md bg-container-tint text-on-primary-fixed-variant text-[11px] font-semibold">Assigned: Dr. Eleanor Vance</span>
              </div>
              <div className="mt-space-2xs flex flex-wrap items-center gap-x-space-md gap-y-1 text-on-surface-variant text-[12px] font-semibold">
                <span><strong className="text-text-ink font-semibold">32 yrs</strong> • Female</span>
                <span>DOB: <strong className="text-text-ink font-semibold">Aug 14, 1991</strong></span>
                <span>Blood Group: <strong className="text-primary font-bold">O+</strong></span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">call</span>+1 (555) 849-2041</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">mail</span>maya.harrison@email.com</span>
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
            <button onClick={() => router.push("/doctor/encounter/new")} className="w-full sm:w-auto px-space-md py-3 rounded-lg bg-surface-container-high hover:bg-surface-dim text-text-ink text-[13px] font-semibold transition-all flex items-center justify-center gap-2 border border-surface-container-highest cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">draft</span>
              New Blank Intake
            </button>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
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
                <button onClick={() => router.push("/doctor/encounter/active")} className="text-[13px] font-semibold text-primary hover:text-accent-dark flex items-center gap-1 cursor-pointer">
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
                    <p className="text-[11px] font-semibold text-text-muted">Annual Preventive Health Exam • July 12, 2024</p>
                  </div>
                </div>
                <span className="px-space-xs py-1 rounded-full bg-success-bg text-clinical-success text-[11px] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Signed SOAP Note
                </span>
              </div>
              <div className="space-y-space-sm">
                <div className="p-space-md rounded-lg bg-surface-container-low border border-surface-container">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[15px] font-bold text-text-ink">Attending: Dr. Eleanor Vance, MD</span>
                    <span className="text-[11px] font-semibold text-text-muted">Metropolitan Internal Clinic #4</span>
                  </div>
                  <p className="text-[14px] text-on-surface-variant font-medium leading-relaxed">
                    Patient presented for standard yearly wellness review. Blood pressure well-maintained within normotensive brackets. Routine preventive lipid screen ordered and cleared. Discussed asthma action plan for fall transition; renewed emergency albuterol inhaler. Denied cardiovascular symptoms.
                  </p>
                  <div className="mt-space-sm flex flex-wrap items-center gap-space-xs text-[12px] font-semibold text-text-muted">
                    <span className="bg-surface-bright px-2 py-0.5 rounded border border-surface-container">ICD-10 Z00.00</span>
                    <span className="bg-surface-bright px-2 py-0.5 rounded border border-surface-container">ICD-10 J45.20</span>
                    <span className="bg-surface-bright px-2 py-0.5 rounded border border-surface-container">Lisinopril Protocol: Inactive</span>
                  </div>
                </div>
                <div className="p-space-md rounded-lg bg-surface-bright flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border border-surface-container">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-clinical-success text-[20px]">shield_with_heart</span>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-text-ink">Immunization Status</span>
                      <span className="text-[12px] font-semibold text-text-muted">Up to date per ACIP 2024</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="px-space-xs py-1 rounded bg-container-tint text-primary text-[11px] font-semibold">Influenza Quad (Oct 2023)</span>
                    <span className="px-space-xs py-1 rounded bg-container-tint text-primary text-[11px] font-semibold">Tdap Booster (2021)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="rounded-xl bg-card-surface p-space-lg shadow-sm border border-surface-container">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-8 h-8 rounded-lg bg-container-tint flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">monitor_heart</span>
                  </span>
                  <div>
                    <h2 className="text-[18px] font-bold text-text-ink">Current Vital Signs</h2>
                    <p className="text-[11px] font-semibold text-text-muted">Recorded at 09:10 AM by Triage</p>
                  </div>
                </div>
                <button className="text-[11px] font-semibold text-primary hover:text-accent-dark">History Graph</button>
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col border border-surface-container">
                  <span className="text-[11px] font-semibold text-text-muted flex items-center justify-between">
                    Blood Pressure
                    <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-[28px] font-bold text-text-ink">118/76</span>
                    <span className="text-[11px] font-semibold text-text-muted">mmHg</span>
                  </div>
                  <span className="text-[12px] font-semibold text-clinical-success mt-0.5">Optimal / Resting</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col border border-surface-container">
                  <span className="text-[11px] font-semibold text-text-muted flex items-center justify-between">
                    Heart Rate
                    <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-[28px] font-bold text-text-ink">72</span>
                    <span className="text-[11px] font-semibold text-text-muted">bpm</span>
                  </div>
                  <span className="text-[12px] font-semibold text-clinical-success mt-0.5">Normal Sinus</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col border border-surface-container">
                  <span className="text-[11px] font-semibold text-text-muted flex items-center justify-between">
                    SpO2 (Pulse Ox)
                    <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-[28px] font-bold text-text-ink">99%</span>
                    <span className="text-[11px] font-semibold text-text-muted">Room Air</span>
                  </div>
                  <span className="text-[12px] font-semibold text-clinical-success mt-0.5">No O2</span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col border border-surface-container">
                  <span className="text-[11px] font-semibold text-text-muted flex items-center justify-between">
                    Resp Rate / BMI
                    <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-[28px] font-bold text-text-ink">16</span>
                    <span className="text-[11px] font-semibold text-text-muted">bpm • 22.4</span>
                  </div>
                  <span className="text-[12px] font-semibold text-text-muted mt-0.5">134 lbs • 5&apos;5&quot;</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-card-surface p-space-lg shadow-sm border border-surface-container">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">science</span>
                  </span>
                  <div>
                    <h2 className="text-[18px] font-bold text-text-ink">Key Diagnostic Panels</h2>
                    <p className="text-[11px] font-semibold text-text-muted">Metropolitan Central Pathology</p>
                  </div>
                </div>
                <button className="text-[11px] font-semibold text-primary hover:text-accent-dark">View All</button>
              </div>
              <div className="space-y-space-xs">
                <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-text-ink">CBC with Automated Diff</span>
                    <span className="text-[12px] font-semibold text-text-muted">July 12, 2024 • WBC 6.8 • Hb 13.9</span>
                  </div>
                  <span className="px-space-xs py-1 rounded bg-success-bg text-clinical-success text-[11px] font-semibold">Within Limits</span>
                </div>
                <div className="p-space-sm rounded-lg bg-warning-bg/40 flex items-center justify-between border border-clinical-warning/20">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-[15px] font-bold text-text-ink">Total IgE Antibody Panel</span>
                      <span className="material-symbols-outlined text-clinical-warning text-[16px]">flag</span>
                    </div>
                    <span className="text-[12px] font-semibold text-on-surface-variant">July 12, 2024 • <strong>180 kU/L</strong> (Ref: &lt;100)</span>
                  </div>
                  <span className="px-space-xs py-1 rounded bg-warning-bg text-clinical-warning text-[11px] font-bold">Elevated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
