"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PractitionerNewEncounterPage() {
  const router = useRouter();
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (total: number) => {
    const mins = Math.floor(total / 60).toString().padStart(2, '0');
    const secs = (total % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleCancel = () => {
    if (confirm('Discard this new encounter session for Maya Lin Harrison?')) {
      router.push('/practitioner');
    }
  };

  return (
    <div className="flex flex-col w-full pb-32 px-8">
      {/* Breadcrumb & Encounter Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2 text-text-muted text-[11px] uppercase tracking-wider font-bold">
          <Link href="/practitioner" className="hover:text-primary transition-colors">Doctor Workspace</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Consultations</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-bold">New Encounter</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-bg text-clinical-success shadow-sm border border-clinical-success/20">
            <span className="w-2.5 h-2.5 rounded-full bg-clinical-success animate-pulse shadow-sm"></span>
            <span className="text-[12px] font-bold uppercase tracking-wider">Room 101 Mic Standby</span>
          </div>
          <span className="text-surface-container-highest">•</span>
          <div className="flex items-center gap-2 text-text-muted text-[12px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span className="font-mono">Encounter Timer: {formatTime(timerSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Patient Identity & Master Action Bar */}
      <div className="relative bg-card-surface rounded-xl p-6 shadow-sm mb-8 border border-surface-container">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Left: Patient Avatar & Key Telemetry */}
          <div className="flex items-start sm:items-center gap-6 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-container-tint border border-primary/20 flex items-center justify-center text-primary font-bold text-[24px] shadow-inner">
                ML
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-clinical-success border-2 border-card-surface shadow-sm"></span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[24px] font-bold text-text-ink truncate leading-none">Maya Lin Harrison</h2>
                <span className="px-2.5 py-1 rounded-md bg-container-tint border border-primary/20 text-[11px] text-primary font-bold shadow-sm uppercase tracking-wider">32 yrs • Female</span>
                <span className="px-2.5 py-1 rounded-md bg-warning-bg border border-clinical-warning/20 text-[11px] text-clinical-warning font-bold shadow-sm uppercase tracking-wider">Penicillin Allergy</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 mt-2 text-text-muted text-[13px]">
                <span className="flex items-center gap-1.5">
                  <span className="font-medium">UHID:</span>
                  <span className="text-text-ink font-bold">MH-2024-88412</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="font-medium">DOB:</span>
                  <span className="text-text-ink font-bold">Aug 14, 1991</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="font-medium">Phone:</span>
                  <span className="text-text-ink font-bold">+1 (555) 849-2041</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Encounter Initiator Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2 xl:pt-0">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low text-text-ink text-[13px] font-bold transition-all shadow-sm cursor-pointer"
            >
              Cancel Encounter
            </button>
            <Link
              href="/practitioner/active-encounter"
              className="px-5 py-2.5 rounded-lg bg-surface-container-lowest hover:bg-container-tint border border-surface-container hover:border-primary/30 text-text-ink text-[13px] font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Add Medication Manually
            </Link>
            <Link
              href="/practitioner/active-encounter"
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-accent-dark text-white text-[14px] font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 border border-primary-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
              Start Voice Prescription
            </Link>
          </div>
        </div>
      </div>

      {/* Split Grid: Patient EHR History Context vs Clinical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT SIDEBAR: Patient Chronic Profile & History (4 cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-card-surface rounded-xl p-6 shadow-sm border border-surface-container">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[24px]">folder_shared</span>
                <span className="text-[18px] font-bold text-text-ink">Patient Context</span>
              </div>
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Chart View</span>
            </div>
            <p className="text-[13px] font-medium text-text-muted mt-4 leading-relaxed">
              Baseline physiological data and recurring clinical alerts synced from Primary Care records.
            </p>

            {/* Red Allergy Alert Container */}
            <div className="mt-6 p-4 rounded-xl bg-error-bg flex items-start gap-4 border border-clinical-error/30 shadow-inner">
              <span className="material-symbols-outlined text-clinical-error text-[24px] mt-0.5">warning</span>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-clinical-error font-bold uppercase tracking-wider">Critical Allergy Alert</span>
                <span className="text-[14px] text-text-ink font-bold">Penicillin / Beta-lactams</span>
                <span className="text-[12px] font-medium text-text-muted mt-1 leading-relaxed">Causes severe angioedema and anaphylactoid hives. Flagged July 2021.</span>
              </div>
            </div>

            {/* Chronic Conditions List */}
            <div className="mt-6">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold block mb-3">Chronic Diagnostics</span>
              <div className="flex flex-col gap-2.5">
                <div className="p-3 rounded-lg bg-surface-container-lowest flex items-center justify-between border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-clinical-warning shadow-sm"></span>
                    <span className="text-[13px] text-text-ink font-bold">Mild Persistent Asthma</span>
                  </div>
                  <span className="text-[12px] text-text-muted font-mono font-bold bg-surface-container-low px-2 py-0.5 rounded border border-surface-container">J45.20</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-lowest flex items-center justify-between border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-light shadow-sm"></span>
                    <span className="text-[13px] text-text-ink font-bold">Allergic Rhinitis</span>
                  </div>
                  <span className="text-[12px] text-text-muted font-mono font-bold bg-surface-container-low px-2 py-0.5 rounded border border-surface-container">J30.9</span>
                </div>
              </div>
            </div>

            {/* Active Maintenance Medications */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Active Rx Regimen</span>
                <span className="text-[11px] text-primary font-bold uppercase tracking-wider bg-container-tint px-2.5 py-1 rounded-md border border-primary/20 shadow-sm">2 Active</span>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="p-4 rounded-lg bg-surface-container-lowest flex flex-col gap-2 border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-text-ink font-bold">Cetirizine HCl</span>
                    <span className="px-2 py-1 rounded-md bg-container-tint border border-primary/20 text-[10px] text-primary font-bold uppercase tracking-wider shadow-sm">Daily</span>
                  </div>
                  <span className="text-[12px] font-medium text-text-muted">10 mg Oral Tablet • 1 tab at bedtime</span>
                </div>
                <div className="p-4 rounded-lg bg-surface-container-lowest flex flex-col gap-2 border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-text-ink font-bold">Albuterol Sulfate HFA</span>
                    <span className="px-2 py-1 rounded-md bg-warning-bg border border-clinical-warning/20 text-[10px] text-clinical-warning font-bold uppercase tracking-wider shadow-sm">PRN</span>
                  </div>
                  <span className="text-[12px] font-medium text-text-muted">90 mcg Inhalation • 1-2 puffs q4h as needed</span>
                </div>
              </div>
            </div>

            {/* Historical Prior Encounter Info */}
            <div className="mt-8 pt-6 border-t border-surface-container">
              <div className="flex items-center justify-between text-text-muted mb-3">
                <span className="text-[11px] uppercase tracking-wider font-bold">Last Encounter</span>
                <span className="text-[13px] text-text-ink font-bold">July 12, 2024</span>
              </div>
              <p className="text-[13px] font-medium text-text-muted leading-relaxed">
                Routine check-up with Dr. Eleanor Vance. Spirometry within normal parameters (FEV1 88%). Refilled rescue inhaler.
              </p>
            </div>
          </div>

          {/* Quick Telemetry Mini Card */}
          <div className="bg-card-surface rounded-xl p-6 shadow-sm border border-surface-container">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-container">
              <span className="text-[16px] font-bold text-text-ink">Baseline Vitals</span>
              <span className="text-[11px] text-clinical-success bg-success-bg border border-clinical-success/20 px-2.5 py-1 rounded-full font-bold shadow-sm uppercase tracking-wider">3 Months Ago</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-container-lowest rounded-lg flex flex-col gap-1 border border-surface-container shadow-sm">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Blood Pressure</span>
                <span className="text-[20px] font-bold text-text-ink tracking-tight">118/74</span>
                <span className="text-[11px] font-bold text-clinical-success">mmHg (Optimal)</span>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-lg flex flex-col gap-1 border border-surface-container shadow-sm">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Resting HR</span>
                <span className="text-[20px] font-bold text-text-ink tracking-tight">72</span>
                <span className="text-[11px] font-bold text-text-muted">bpm regular</span>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-lg flex flex-col gap-1 border border-surface-container shadow-sm">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">BMI</span>
                <span className="text-[20px] font-bold text-text-ink tracking-tight">22.4</span>
                <span className="text-[11px] font-bold text-clinical-success">Normal wt.</span>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-lg flex flex-col gap-1 border border-surface-container shadow-sm">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">SpO2</span>
                <span className="text-[20px] font-bold text-text-ink tracking-tight">99%</span>
                <span className="text-[11px] font-bold text-clinical-success">Ambient air</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT / MAIN AREA: Interactive Empty State Documentation Canvas (8 cols) */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          {/* Guided Hero Prompt Banner */}
          <div className="relative overflow-hidden bg-card-surface rounded-xl p-8 shadow-sm border border-surface-container">
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary border border-primary-container text-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">clinical_notes</span>
                </div>
                <span className="text-[24px] font-bold text-text-ink tracking-tight">New Clinical Visit Initiated</span>
              </div>
              <p className="text-[15px] font-medium text-text-muted max-w-2xl leading-relaxed mt-2">
                Choose an intake method or follow the guided steps below to build today's encounter record. Ambient voice scribe is armed and listening on Station 101.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/practitioner/active-encounter"
                  className="px-6 py-2.5 rounded-lg bg-primary hover:bg-accent-dark text-white text-[14px] font-bold flex items-center gap-2 shadow-md transition-all border border-primary-container"
                >
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                  Start Ambient Voice Dictation
                </Link>
                <Link
                  href="/practitioner/active-encounter"
                  className="px-6 py-2.5 rounded-lg bg-surface-container-lowest hover:bg-container-tint text-text-ink text-[14px] font-bold flex items-center gap-2 shadow-sm transition-all border border-surface-container hover:border-primary/30"
                >
                  <span className="material-symbols-outlined text-[20px]">assignment</span>
                  Use Standard SOAP Template
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success-bg border border-clinical-success/20 rounded-md">
                  <span className="material-symbols-outlined text-[18px] text-clinical-success">check_circle</span>
                  <span className="text-[11px] font-bold text-clinical-success uppercase tracking-wider">Audio Array Calibrated</span>
                </div>
              </div>
            </div>
            {/* Faint Background Ambient Graphic */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-center">
              <span className="material-symbols-outlined text-[200px] text-primary">graphic_eq</span>
            </div>
          </div>

          {/* Section 1: Chief Complaints (Empty State) */}
          <div className="bg-card-surface rounded-xl p-6 shadow-sm transition-all hover:shadow-md border border-surface-container hover:border-primary/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">stethoscope</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[18px] font-bold text-text-ink">Chief Complaints & Symptoms</h3>
                  <p className="text-[13px] font-medium text-text-muted">
                    No symptoms recorded yet for today's visit.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/practitioner/active-encounter"
                  className="px-5 py-2 rounded-lg bg-surface-container-lowest hover:bg-container-tint text-primary text-[13px] font-bold flex items-center gap-2 transition-colors border border-surface-container hover:border-primary/30 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Symptoms / Reason for Visit
                </Link>
                <Link
                  href="/practitioner/active-encounter"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-lowest hover:bg-primary hover:text-white text-text-muted transition-colors border border-surface-container shadow-sm cursor-pointer"
                  title="Click to Speak Reason"
                >
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Diagnosis & Assessment (Empty State) */}
          <div className="bg-card-surface rounded-xl p-6 shadow-sm transition-all hover:shadow-md border border-surface-container hover:border-primary/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">fact_check</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[18px] font-bold text-text-ink">Clinical Diagnosis</h3>
                  <p className="text-[13px] font-medium text-text-muted">
                    No diagnostic codes or clinical assessments assigned.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/practitioner/active-encounter"
                  className="px-5 py-2 rounded-lg bg-surface-container-lowest hover:bg-container-tint text-primary text-[13px] font-bold flex items-center gap-2 transition-colors border border-surface-container hover:border-primary/30 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">post_add</span>
                  Add Diagnosis
                </Link>
              </div>
            </div>
          </div>

          {/* Section 3: Encounter Vitals & Biometrics (Empty State) */}
          <div className="bg-card-surface rounded-xl p-6 shadow-sm transition-all hover:shadow-md border border-surface-container hover:border-clinical-warning/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container text-clinical-warning flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">vital_signs</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[18px] font-bold text-text-ink">Encounter Vitals</h3>
                  <p className="text-[13px] font-medium text-text-muted">
                    Awaiting triage vitals sync from nurse intake node or manual bedside reading.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/practitioner/active-encounter"
                  className="px-4 py-2 rounded-lg bg-surface-container-lowest hover:bg-container-tint border border-surface-container text-text-ink text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">sync</span>
                  Fetch Triage Vitals
                </Link>
                <Link
                  href="/practitioner/active-encounter"
                  className="px-5 py-2 rounded-lg bg-surface-container-lowest hover:bg-container-tint border border-surface-container text-primary hover:border-primary/30 text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add_chart</span>
                  Record Vitals Now
                </Link>
              </div>
            </div>
          </div>

          {/* Section 4: Prescriptions & Orders (Hero Highlighted Empty State) */}
          <div className="relative bg-card-surface rounded-xl p-8 shadow-sm border border-surface-container border-l-4 border-l-primary overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-container-tint border border-primary/20 text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">prescriptions</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[20px] font-bold text-text-ink">Prescriptions & Orders</h3>
                      <span className="px-2.5 py-1 rounded-md bg-container-tint border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider shadow-sm">Voice Accelerated</span>
                    </div>
                    <p className="text-[13px] font-medium text-text-muted">
                      Zero prescriptions initiated for this encounter.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Link
                    href="/practitioner/active-encounter"
                    className="px-5 py-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-text-ink text-[13px] font-bold flex items-center gap-2 transition-colors border border-surface-container shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Medication Manually
                  </Link>
                  <Link
                    href="/practitioner/active-encounter"
                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-accent-dark text-white text-[14px] font-bold flex items-center gap-2 shadow-md transition-all border border-primary-container"
                  >
                    <span className="material-symbols-outlined text-[20px]">mic</span>
                    Start Voice Prescription
                  </Link>
                </div>
              </div>
              {/* Empty Interactive Suggestion Pills */}
              <div className="pt-4 border-t border-surface-container flex flex-wrap items-center gap-3 text-text-muted">
                <span className="text-[11px] font-bold uppercase tracking-wider">Quick Suggestions:</span>
                <button 
                  onClick={() => router.push('/practitioner/active-encounter')}
                  className="px-3 py-1.5 rounded-md bg-surface-container-lowest hover:bg-container-tint hover:border-primary/30 text-[12px] font-bold text-text-ink transition-colors border border-surface-container shadow-sm cursor-pointer"
                >
                  + Refill Cetirizine 10mg
                </button>
                <button 
                  onClick={() => router.push('/practitioner/active-encounter')}
                  className="px-3 py-1.5 rounded-md bg-surface-container-lowest hover:bg-container-tint hover:border-primary/30 text-[12px] font-bold text-text-ink transition-colors border border-surface-container shadow-sm cursor-pointer"
                >
                  + Refill Albuterol HFA Inhaler
                </button>
                <button 
                  onClick={() => router.push('/practitioner/active-encounter')}
                  className="px-3 py-1.5 rounded-md bg-surface-container-lowest hover:bg-container-tint hover:border-primary/30 text-[12px] font-bold text-text-ink transition-colors border border-surface-container shadow-sm cursor-pointer"
                >
                  + Acute Bronchitis Regimen
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Lab Tests & Diagnostics (Empty State) */}
          <div className="bg-card-surface rounded-xl p-6 shadow-sm transition-all hover:shadow-md border border-surface-container hover:border-primary/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">science</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[18px] font-bold text-text-ink">Lab Tests & Diagnostics</h3>
                    <span className="px-2.5 py-1 rounded-md bg-surface-container-low border border-surface-container text-[10px] font-bold text-text-muted uppercase tracking-wider shadow-sm">Diagnostic Pipeline</span>
                  </div>
                  <p className="text-[13px] font-medium text-text-muted">
                    No laboratory or imaging orders placed.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/practitioner/active-encounter"
                  className="px-5 py-2 rounded-lg bg-surface-container-lowest hover:bg-container-tint border border-surface-container hover:border-primary/30 text-primary text-[13px] font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">biotech</span>
                  Order Lab Test
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Persistent Floating Bottom Voice Action Dock */}
      <div className="fixed bottom-6 left-[calc(50%+144px)] -translate-x-1/2 z-40 bg-card-surface/95 backdrop-blur-md rounded-full px-6 py-3 shadow-xl border border-primary/20 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-clinical-success animate-ping shadow-sm border border-card-surface"></span>
          <span className="text-[14px] font-bold text-text-ink">Station 101 Armed</span>
        </div>
        <div className="h-6 w-px bg-surface-container-highest"></div>
        <Link
          href="/practitioner/active-encounter"
          className="flex items-center gap-2 bg-primary hover:bg-accent-dark text-white px-6 py-2.5 rounded-full text-[15px] font-bold shadow-md transition-all active:scale-95 border border-primary-container"
        >
          <span className="material-symbols-outlined text-[20px]">mic</span>
          <span>Speak to Chart</span>
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low border border-surface-container rounded-full shadow-inner">
          <div className="w-1.5 h-3 bg-clinical-success rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1.5 h-4 bg-clinical-success rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1.5 h-2 bg-clinical-success rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-1.5 h-5 bg-clinical-success rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
        </div>
      </div>
    </div>
  );
}
