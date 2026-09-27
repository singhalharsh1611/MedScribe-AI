"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PractitionerPatientProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [isConnecting, setIsConnecting] = useState(false);

  const medications = [
    { id: 1, name: 'Cetirizine Hydrochloride • 10mg', desc: 'Oral Tablet • 1 tab PO Daily (Evening) • Allergy maintenance', badge: 'Compliant (94%)', badgeStyle: 'bg-success-bg border-clinical-success/20 text-clinical-success', icon: 'medication', iconColor: 'text-primary' },
    { id: 2, name: 'Albuterol Sulfate HFA Inhaler • 90mcg/actuation', desc: 'Inhalation Aerosol • 2 puffs PRN every 4-6 hrs for dyspnea/cough', badge: 'Active PRN', badgeStyle: 'bg-container-tint border-primary/20 text-primary', icon: 'air', iconColor: 'text-accent-dark' },
    { id: 3, name: 'Adult Multivitamin Complex', desc: 'Over-The-Counter Oral Tablet • 1 tablet PO with breakfast', badge: 'OTC Regimen', badgeStyle: 'bg-surface-container-high border-surface-container text-text-muted', icon: 'nutrition', iconColor: 'text-text-muted' },
  ];

  const handleStartConsultation = () => {
    setIsConnecting(true);
    setTimeout(() => {
      router.push('/practitioner/active-encounter');
    }, 600);
  };

  const tabs = ['Overview', 'Appointments', 'Consultations', 'Prescriptions', 'Vitals', 'Lab Tests', 'Notes'];

  return (
    <div className="flex flex-col w-full pb-20 px-8">
      {/* Top Breadcrumbs & Utility Metabar */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 py-4">
        <nav className="flex items-center gap-2 text-text-muted text-[13px] font-bold tracking-tight">
          <Link href="/practitioner" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">stethoscope</span>
            Doctor Workspace
          </Link>
          <span className="material-symbols-outlined text-[16px] text-surface-container-highest">chevron_right</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Patient Directory</span>
          <span className="material-symbols-outlined text-[16px] text-surface-container-highest">chevron_right</span>
          <span className="text-text-ink font-bold">Maya Lin Harrison</span>
          <span className="bg-container-tint border border-primary/20 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ml-2">UHID-MH-2024-88412</span>
        </nav>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-success-bg border border-clinical-success/20 text-clinical-success text-[11px] font-bold uppercase tracking-wider shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-clinical-success animate-pulse shadow-sm"></span>
            Room 101 Audio Sync Calibrated
          </span>
          <div className="hidden sm:flex items-center gap-1.5 text-text-muted text-[11px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            Intake finished 8 mins ago
          </div>
        </div>
      </div>

      {/* Patient Hero Card & Critical Directives */}
      <section className="mt-2 rounded-xl bg-card-surface shadow-sm p-8 relative overflow-hidden border border-surface-container">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-8">
            {/* Patient Portrait with Status Badge */}
            <div className="relative w-24 h-24 shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary-container to-accent-light flex items-center justify-center text-white text-[32px] font-bold shadow-md border border-primary-container">
                ML
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-card-surface rounded-full shadow-sm border border-surface-container" title="Checked In & Ready">
                <span className="w-4 h-4 rounded-full bg-clinical-success block shadow-sm border border-card-surface"></span>
              </div>
            </div>
            {/* Demographics & Clinical Indicators */}
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h1 className="text-[32px] font-bold text-text-ink tracking-tight leading-none">Maya Lin Harrison</h1>
                <span className="px-2.5 py-1 rounded-md bg-surface-container-low border border-surface-container text-text-ink text-[11px] font-bold uppercase tracking-wider shadow-sm">Checked In • Token #T-107</span>
                <span className="px-2.5 py-1 rounded-md bg-container-tint border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider shadow-sm">Assigned: Dr. Eleanor Vance</span>
              </div>
              {/* Metadata Line */}
              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-text-muted text-[14px] font-medium">
                <span><strong className="text-text-ink font-bold">32 yrs</strong> • Female</span>
                <span>DOB: <strong className="text-text-ink font-bold">Aug 14, 1991</strong></span>
                <span>Blood Group: <strong className="text-primary font-bold">O+</strong></span>
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">call</span>+1 (555) 849-2041</span>
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">mail</span>maya.harrison@email.com</span>
              </div>
              {/* Semantic Alert Chips */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error-bg border border-clinical-error/20 text-clinical-error text-[12px] font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span>Allergy: <strong>Penicillin</strong> (Moderate Urticaria / Rash)</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning-bg border border-clinical-warning/20 text-clinical-warning text-[12px] font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">vital_signs</span>
                  <span>Flag: Seasonal Allergic Rhinitis</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-container-tint border border-primary/20 text-primary text-[12px] font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">file_copy</span>
                  <span>Mild Asthma (Exercise-induced)</span>
                </div>
              </div>
            </div>
          </div>
          {/* Hero Actions */}
          <div className="flex sm:flex-row lg:flex-col xl:flex-row items-center gap-4 shrink-0 mt-4 lg:mt-0">
            <Link
              href="/practitioner/new-encounter"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low text-text-ink text-[14px] font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">draft</span>
              New Blank Intake
            </Link>
            <button
              onClick={handleStartConsultation}
              disabled={isConnecting}
              className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-primary hover:bg-accent-dark text-white text-[14px] font-bold transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer active:scale-95 border border-primary-container disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className={`material-symbols-outlined text-[20px] ${isConnecting ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`}>
                {isConnecting ? 'refresh' : 'clinical_notes'}
              </span>
              <span>{isConnecting ? 'Connecting MedScribe AI...' : 'Start Consultation'}</span>
              {!isConnecting && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </div>
        </div>
      </section>

      {/* Segmented Navigation Bar */}
      <div className="mt-8 bg-surface-container-lowest p-1.5 rounded-xl flex items-center justify-start overflow-x-auto gap-1 border border-surface-container shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-[14px] font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'bg-card-surface border border-surface-container text-text-ink shadow-sm'
                : 'text-text-muted hover:text-text-ink hover:bg-surface-container-low border border-transparent'
            }`}
          >
            {tab === 'Overview' && <span className="material-symbols-outlined text-primary text-[20px]">space_dashboard</span>}
            {tab === 'Appointments' && <span className="material-symbols-outlined text-[20px]">calendar_month</span>}
            {tab === 'Consultations' && <span className="material-symbols-outlined text-[20px]">medical_services</span>}
            {tab === 'Prescriptions' && <span className="material-symbols-outlined text-[20px]">prescriptions</span>}
            {tab === 'Vitals' && <span className="material-symbols-outlined text-[20px]">monitoring</span>}
            {tab === 'Lab Tests' && <span className="material-symbols-outlined text-[20px]">biotech</span>}
            {tab === 'Notes' && <span className="material-symbols-outlined text-[20px]">edit_note</span>}
            <span>{tab}</span>
            {tab === 'Overview' && <span className="w-2 h-2 rounded-full bg-primary shadow-sm"></span>}
            {tab === 'Consultations' && <span className="text-[11px] bg-container-tint border border-primary/20 px-2 py-0.5 rounded-full text-primary font-bold shadow-sm">3</span>}
            {tab === 'Lab Tests' && <span className="text-[11px] bg-warning-bg border border-clinical-warning/20 px-2 py-0.5 rounded-full text-clinical-warning font-bold shadow-sm">1 Flag</span>}
          </button>
        ))}
      </div>

      {/* Primary Overview Grid: 12 Columns */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Active Clinical Intake Summary */}
          <div className="rounded-xl bg-card-surface p-8 shadow-sm border border-surface-container relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-container-tint border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">assignment_late</span>
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[20px] font-bold text-text-ink leading-tight">Today's Intake & Chief Complaint</h2>
                  <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Recorded by Sarah Jenkins, RN • Room 101 • 09:12 AM</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-container-tint border border-primary/20 text-primary text-[11px] rounded-md font-bold uppercase tracking-wider shadow-sm">Priority 2 — Routine Urgent</span>
            </div>
            <div className="p-6 rounded-xl bg-surface-container-lowest mb-6 border border-surface-container shadow-inner">
              <p className="text-[16px] text-text-ink font-medium leading-relaxed italic">
                “Seasonal allergy symptoms and persistent dry cough for 5 days with mild nocturnal wheezing and throat irritation. No reported fever or chills; mild tightness during brisk morning walks.”
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container flex flex-col shadow-sm">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Duration</span>
                <span className="text-[16px] font-bold text-text-ink">5 Continuous Days</span>
              </div>
              <div className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container flex flex-col shadow-sm">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Associated Triggers</span>
                <span className="text-[16px] font-bold text-text-ink">Tree Pollen, Cold Air</span>
              </div>
              <div className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container flex flex-col shadow-sm">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Inhaler Relief</span>
                <span className="text-[16px] font-bold text-clinical-success">Partial / Responsive</span>
              </div>
            </div>
          </div>

          {/* Current Active Medications List */}
          <div className="rounded-xl bg-card-surface p-8 shadow-sm border border-surface-container">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-primary border border-primary-container flex items-center justify-center text-white shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">pill</span>
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[20px] font-bold text-text-ink">Current Active Medications</h2>
                  <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider">3 verified active prescriptions in electronic dispensary</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/practitioner/active-encounter')}
                className="text-[13px] text-primary hover:text-accent-dark flex items-center gap-1.5 font-bold bg-surface-container-lowest border border-surface-container px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Add Rx via Voice
              </button>
            </div>
            <div className="space-y-4">
              {medications.map((med) => (
                <div key={med.id} className="p-4 rounded-xl bg-surface-container-lowest flex items-center justify-between hover:border-primary/30 transition-all border border-surface-container shadow-sm cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-card-surface border border-surface-container flex items-center justify-center ${med.iconColor} shadow-sm group-hover:scale-105 transition-transform`}>
                      <span className="material-symbols-outlined text-[24px]">{med.icon}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[16px] font-bold text-text-ink group-hover:text-primary transition-colors">{med.name}</span>
                      <span className="text-[13px] font-medium text-text-muted">{med.desc}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pl-4">
                    <span className={`px-2.5 py-1 text-[11px] rounded-md font-bold uppercase tracking-wider border shadow-sm whitespace-nowrap ${med.badgeStyle}`}>{med.badge}</span>
                    <button className="p-1.5 text-text-muted hover:text-text-ink rounded-lg hover:bg-surface-container border border-transparent transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Encounter Narrative & History */}
          <div className="rounded-xl bg-card-surface p-8 shadow-sm border border-surface-container">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-container-tint border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">history_edu</span>
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[20px] font-bold text-text-ink">Last Encounter Archive</h2>
                  <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Annual Preventive Health Exam • July 12, 2024</p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-md bg-success-bg border border-clinical-success/20 text-clinical-success text-[11px] flex items-center gap-1.5 font-bold uppercase tracking-wider shadow-sm">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Signed SOAP Note
              </span>
            </div>
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-surface-container pb-3">
                  <span className="text-[16px] font-bold text-text-ink">Attending: Dr. Eleanor Vance, MD</span>
                  <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Metropolitan Internal Clinic #4</span>
                </div>
                <p className="text-[14px] font-medium text-text-muted leading-relaxed">
                  Patient presented for standard yearly wellness review. Blood pressure well-maintained within normotensive brackets. Routine preventive lipid screen ordered and cleared. Discussed asthma action plan for fall transition; renewed emergency albuterol inhaler. Denied cardiovascular symptoms.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="bg-surface-container-low px-2.5 py-1 rounded-md border border-surface-container text-[11px] font-bold uppercase tracking-wider text-text-muted shadow-sm">ICD-10 Z00.00</span>
                  <span className="bg-surface-container-low px-2.5 py-1 rounded-md border border-surface-container text-[11px] font-bold uppercase tracking-wider text-text-muted shadow-sm">ICD-10 J45.20</span>
                  <span className="bg-surface-container-low px-2.5 py-1 rounded-md border border-surface-container text-[11px] font-bold uppercase tracking-wider text-text-muted shadow-sm opacity-60">Lisinopril Protocol: Inactive</span>
                </div>
              </div>
              {/* Preventive Immunization Checklist */}
              <div className="p-5 rounded-xl bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-surface-container shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-success-bg border border-clinical-success/20 flex items-center justify-center text-clinical-success shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[16px] font-bold text-text-ink">Immunization Status</span>
                    <span className="text-[12px] font-bold text-text-muted">Up to date per ACIP 2024 Guidelines</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-container-tint border border-primary/20 text-primary text-[11px] font-bold shadow-sm whitespace-nowrap uppercase tracking-wider">Influenza Quad (Oct 2023)</span>
                  <span className="px-3 py-1 rounded-md bg-container-tint border border-primary/20 text-primary text-[11px] font-bold shadow-sm whitespace-nowrap uppercase tracking-wider">Tdap Booster (2021)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Vital Signs Trends & Latest Logged */}
          <div className="rounded-xl bg-card-surface p-8 shadow-sm border border-surface-container">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-container-tint border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">monitor_heart</span>
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[20px] font-bold text-text-ink">Current Vital Signs</h2>
                  <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Recorded at 09:10 AM by Triage Team</p>
                </div>
              </div>
              <button className="text-[12px] bg-surface-container-lowest border border-surface-container px-3 py-1.5 rounded-lg text-primary hover:text-accent-dark font-bold shadow-sm transition-colors cursor-pointer">History Graph</button>
            </div>
            {/* 2x2 Bento of Vitals */}
            <div className="grid grid-cols-2 gap-4">
              {/* BP */}
              <div className="p-4 rounded-xl bg-surface-container-lowest flex flex-col border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between mb-2">
                  Blood Pressure
                  <span className="w-2.5 h-2.5 rounded-full bg-clinical-success shadow-sm"></span>
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[28px] font-bold text-text-ink tracking-tight leading-none">118/76</span>
                  <span className="text-[12px] font-bold text-text-muted">mmHg</span>
                </div>
                <span className="text-[12px] font-bold text-clinical-success mt-2">Optimal / Resting</span>
              </div>
              {/* HR */}
              <div className="p-4 rounded-xl bg-surface-container-lowest flex flex-col border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between mb-2">
                  Heart Rate
                  <span className="w-2.5 h-2.5 rounded-full bg-clinical-success shadow-sm"></span>
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[28px] font-bold text-text-ink tracking-tight leading-none">72</span>
                  <span className="text-[12px] font-bold text-text-muted">bpm</span>
                </div>
                <span className="text-[12px] font-bold text-clinical-success mt-2">Normal Sinus</span>
              </div>
              {/* SpO2 */}
              <div className="p-4 rounded-xl bg-surface-container-lowest flex flex-col border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between mb-2">
                  SpO2 (Pulse Ox)
                  <span className="w-2.5 h-2.5 rounded-full bg-clinical-success shadow-sm"></span>
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[28px] font-bold text-text-ink tracking-tight leading-none">99%</span>
                  <span className="text-[12px] font-bold text-text-muted">Room Air</span>
                </div>
                <span className="text-[12px] font-bold text-clinical-success mt-2">No supplemental O2</span>
              </div>
              {/* RR & BMI */}
              <div className="p-4 rounded-xl bg-surface-container-lowest flex flex-col border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between mb-2">
                  Resp Rate / BMI
                  <span className="w-2.5 h-2.5 rounded-full bg-clinical-success shadow-sm"></span>
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[28px] font-bold text-text-ink tracking-tight leading-none">16</span>
                  <span className="text-[12px] font-bold text-text-muted">bpm • 22.4</span>
                </div>
                <span className="text-[12px] font-bold text-text-muted mt-2">134 lbs • 5'5" (Norm)</span>
              </div>
            </div>
            {/* Inline Sparkline Representation */}
            <div className="mt-6 p-5 rounded-xl bg-surface-container-lowest flex items-center justify-between border border-surface-container shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-bold text-text-ink">6-Month BP Stability</span>
                <span className="text-[13px] font-medium text-text-muted">Average systolic 119 mmHg</span>
              </div>
              <div className="w-32 h-10 bg-card-surface rounded-lg border border-surface-container p-1 shadow-inner">
                <svg className="w-full h-full text-primary" fill="none" preserveAspectRatio="none" viewBox="0 0 120 30">
                  <path d="M0,20 L24,18 L48,22 L72,15 L96,17 L120,14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                  <circle cx="120" cy="14" fill="#14A38B" r="3.5"></circle>
                </svg>
              </div>
            </div>
          </div>

          {/* Recent Diagnostics & Biomarkers */}
          <div className="rounded-xl bg-card-surface p-8 shadow-sm border border-surface-container">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-primary border border-primary-container flex items-center justify-center text-white shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">science</span>
                </span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[20px] font-bold text-text-ink">Key Diagnostic Panels</h2>
                  <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Metropolitan Central Pathology</p>
                </div>
              </div>
              <button className="text-[12px] font-bold bg-surface-container-lowest border border-surface-container px-3 py-1.5 rounded-lg text-primary hover:text-accent-dark shadow-sm transition-colors cursor-pointer">View All (6)</button>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] font-bold text-text-ink">CBC with Automated Diff</span>
                  <span className="text-[13px] font-medium text-text-muted">July 12, 2024 • WBC 6.8 • Hb 13.9</span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-success-bg border border-clinical-success/20 text-clinical-success text-[11px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap">Within Limits</span>
              </div>
              <div className="p-4 rounded-xl bg-warning-bg/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-clinical-warning/30 shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-bold text-text-ink">Total IgE Antibody Panel</span>
                    <span className="material-symbols-outlined text-clinical-warning text-[20px]">flag</span>
                  </div>
                  <span className="text-[13px] font-medium text-text-muted">July 12, 2024 • <strong className="text-text-ink">180 kU/L</strong> (Ref: &lt;100)</span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-warning-bg border border-clinical-warning/30 text-clinical-warning text-[11px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap">Elevated</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="text-[16px] font-bold text-text-ink">Peak Expiratory Flow (PEF)</span>
                  <span className="text-[13px] font-medium text-text-muted">420 L/min (Predicted: 440 L/min • 95%)</span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-container-tint border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap">Mild Reduction</span>
              </div>
            </div>
          </div>

          {/* Emergency Contacts & Care Coordination */}
          <div className="rounded-xl bg-card-surface p-8 shadow-sm border border-surface-container">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-center text-text-ink shadow-sm">
                <span className="material-symbols-outlined text-[24px]">contacts</span>
              </span>
              <div className="flex flex-col gap-1">
                <h2 className="text-[20px] font-bold text-text-ink">Emergency Contact & Care Team</h2>
                <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Primary Next of Kin & Designated Proxy</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container-lowest flex items-center justify-between border border-surface-container shadow-sm hover:border-primary/20 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-container-tint border border-primary/20 flex items-center justify-center text-primary font-bold text-[14px] shadow-sm">
                    RH
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[16px] font-bold text-text-ink group-hover:text-primary transition-colors">Robert Harrison</span>
                    <span className="text-[13px] font-medium text-text-muted">Spouse • Primary Emergency Proxy</span>
                  </div>
                </div>
                <a className="w-10 h-10 rounded-lg text-primary hover:bg-surface-container flex items-center justify-center transition-colors border border-transparent hover:border-surface-container cursor-pointer" href="tel:+15558492042" title="Call Emergency Contact">
                  <span className="material-symbols-outlined text-[22px]">call</span>
                </a>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-lowest flex items-center justify-between border border-surface-container shadow-sm hover:border-primary/20 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary border border-primary-container flex items-center justify-center text-white font-bold text-[14px] shadow-sm">
                    EV
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[16px] font-bold text-text-ink group-hover:text-primary transition-colors">Dr. Eleanor Vance, MD</span>
                    <span className="text-[13px] font-medium text-text-muted">Internal Medicine • Metropolitan Central</span>
                  </div>
                </div>
                <span className="text-[11px] bg-container-tint border border-primary/20 text-primary px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm">PCP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
