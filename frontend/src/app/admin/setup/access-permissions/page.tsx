"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminSetupAccessPermissionsPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('Doctor');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    patients: true,
    appointments: true,
    queue: true,
    consultation: true,
    prescription: true,
    voiceAi: true,
    reports: true,
    users: false,
    settings: true
  });

  const roleBannerDetails: Record<string, { icon: string; title: string; desc: string }> = {
    'Admin': {
      icon: 'admin_panel_settings',
      title: 'Administrator (Clinic Owner)',
      desc: 'Unrestricted operational authority, provider billing configuration, security key handling, and role delegations.'
    },
    'Doctor': {
      icon: 'stethoscope',
      title: 'Doctor (Attending Practitioner)',
      desc: 'Full clinical scope authorization including ambient transcription, SOAP generation, and direct e-Rx signing.'
    },
    'Receptionist': {
      icon: 'desk',
      title: 'Receptionist (Front Desk Lead)',
      desc: 'Lobby queue administration, patient registration, calendar scheduling, insurance intake verification.'
    },
    'Compounder': {
      icon: 'medication_liquid',
      title: 'Compounder (Pharmacy Dispatch)',
      desc: 'Medication dispensation queue access, prescription validation check, pharmacy inventory sync.'
    },
    'Nurse': {
      icon: 'health_metrics',
      title: 'Nurse (Triage & Inpatient Care)',
      desc: 'Vital signs entry, patient triage checklist, bedside voice quick-notes, medication administration log.'
    },
    'Assistant': {
      icon: 'support_agent',
      title: 'Clinical Assistant',
      desc: 'Patient intake assistance, room turnover tagging, non-diagnostic chart document upload.'
    }
  };

  const togglePermission = (key: string) => {
    if (key === 'users') return; // locked to admin
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const roleList = ['Admin', 'Doctor', 'Receptionist', 'Compounder', 'Nurse', 'Assistant'];

  return (
    <div className="w-full px-10 py-12 flex flex-col gap-10 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-container-tint text-primary text-[11px] uppercase tracking-wider font-bold border border-primary/20">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Step 3 of 3: Access Control & Permissions Matrix
            </span>
            <span className="text-outline-variant text-[12px]">•</span>
            <span className="text-text-muted text-[12px] font-bold">Provisioning Policy v4.2</span>
          </div>
          <h1 className="text-[32px] font-bold text-text-ink tracking-tight">Verify Clinical Scopes & Access Rights</h1>
          <p className="text-[15px] font-medium text-text-muted max-w-2xl">
            Verify operational scopes per role. Permissions can be customized anytime from Clinic Settings with enterprise audit trails.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-card-surface shadow-sm border border-surface-container">
            <span className="material-symbols-outlined text-clinical-success text-[24px]">lock_clock</span>
            <div className="flex flex-col">
              <span className="text-[12px] text-text-ink font-bold">RBAC Enforcement Active</span>
              <span className="text-[13px] text-text-muted font-medium">Zero-Trust Baseline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Line */}
      <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden shadow-inner">
        <div className="h-full bg-primary rounded-full transition-all duration-500 w-full shadow-sm"></div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Pill Selector */}
        <div className="p-2 bg-card-surface rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border border-surface-container">
          <div className="flex items-center overflow-x-auto w-full sm:w-auto p-1 gap-2">
            {roleList.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`px-5 py-2.5 rounded-lg text-[14px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedRole === r
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-muted hover:text-text-ink hover:bg-surface-container-lowest border border-transparent hover:border-surface-container'
                }`}
              >
                <span>{r}</span>
                {selectedRole === r && <span className="w-2 h-2 rounded-full bg-clinical-success shadow-sm"></span>}
              </button>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-surface-container rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <span className="text-[12px] text-text-muted font-bold">6 standard practice profiles provisioned</span>
          </div>
        </div>

        {/* Active Role Banner */}
        <div className="p-6 rounded-xl bg-card-surface shadow-sm flex items-center justify-between border border-surface-container">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-surface-container-lowest border border-surface-container text-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[32px]">{roleBannerDetails[selectedRole]?.icon || 'verified_user'}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[11px] text-text-muted uppercase font-bold">Target Role Configuration:</span>
                <span className="text-[16px] font-bold text-primary">{roleBannerDetails[selectedRole]?.title}</span>
              </div>
              <span className="text-[13px] font-medium text-text-muted">{roleBannerDetails[selectedRole]?.desc}</span>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1.5 rounded bg-success-bg border border-clinical-success/20 text-clinical-success text-[12px] font-bold shadow-sm">
            HIPAA Level 3 Matched
          </span>
        </div>

        {/* Matrix Table */}
        <div className="bg-card-surface rounded-xl shadow-sm overflow-hidden border border-surface-container">
          <div className="px-6 py-4 bg-surface-container-lowest grid grid-cols-12 gap-6 items-center text-[12px] font-bold text-text-muted uppercase tracking-wider border-b border-surface-container">
            <div className="col-span-12 md:col-span-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">category</span>
              <span>Permission Category & Description</span>
            </div>
            <div className="hidden md:flex md:col-span-3 items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">lock_open</span>
              <span>{selectedRole} Authorization Tier</span>
            </div>
            <div className="hidden md:flex md:col-span-2 items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">rule</span>
              <span>Audit Trigger</span>
            </div>
            <div className="hidden md:flex md:col-span-2 items-center justify-end gap-2">
              <span>Status / Toggle</span>
            </div>
          </div>

          <div className="divide-y divide-surface-container">
            {/* 1. Patients */}
            <div className="p-6 grid grid-cols-12 gap-6 items-center hover:bg-surface-container-lowest transition-colors">
              <div className="col-span-12 md:col-span-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">person_search</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-bold text-text-ink">1. Patients</span>
                    {permissions.patients && <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>}
                  </div>
                  <p className="text-[13px] font-medium text-text-muted">
                    View medical records, create new patient profiles, edit demographic information, export charts
                  </p>
                </div>
              </div>
              <div className="col-span-6 md:col-span-3 flex items-center">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-bold shadow-sm ${permissions.patients ? 'bg-success-bg border border-clinical-success/20 text-clinical-success' : 'bg-container-tint border border-surface-container text-text-muted'}`}>
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {permissions.patients ? 'Full Access' : 'Disabled'}
                </span>
              </div>
              <div className="hidden md:flex col-span-2 items-center">
                <span className="text-[12px] text-text-muted font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  Log PHI Access
                </span>
              </div>
              <div className="col-span-6 md:col-span-2 flex items-center justify-end">
                <button 
                  onClick={() => togglePermission('patients')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shadow-inner border border-surface-container ${permissions.patients ? 'bg-primary' : 'bg-surface-container-high'}`}
                >
                  <span className={`block w-5 h-5 bg-card-surface rounded-full shadow-md transition-transform absolute top-0.5 left-0.5 ${permissions.patients ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>

            {/* 2. Appointments */}
            <div className="p-6 grid grid-cols-12 gap-6 items-center hover:bg-surface-container-lowest transition-colors">
              <div className="col-span-12 md:col-span-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-bold text-text-ink">2. Appointments</span>
                    {permissions.appointments && <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>}
                  </div>
                  <p className="text-[13px] font-medium text-text-muted">
                    Schedule visits, reschedule clinical slots, view doctor calendar, cancel bookings
                  </p>
                </div>
              </div>
              <div className="col-span-6 md:col-span-3 flex items-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-container-tint border border-primary/20 text-primary text-[12px] font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Edit & View
                </span>
              </div>
              <div className="hidden md:flex col-span-2 items-center">
                <span className="text-[12px] text-text-muted font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">sync</span>
                  EHR Cal Synced
                </span>
              </div>
              <div className="col-span-6 md:col-span-2 flex items-center justify-end">
                <button 
                  onClick={() => togglePermission('appointments')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shadow-inner border border-surface-container ${permissions.appointments ? 'bg-primary' : 'bg-surface-container-high'}`}
                >
                  <span className={`block w-5 h-5 bg-card-surface rounded-full shadow-md transition-transform absolute top-0.5 left-0.5 ${permissions.appointments ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>

            {/* 3. Queue */}
            <div className="p-6 grid grid-cols-12 gap-6 items-center hover:bg-surface-container-lowest transition-colors">
              <div className="col-span-12 md:col-span-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">reduce_capacity</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-bold text-text-ink">3. Queue</span>
                    {permissions.queue && <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>}
                  </div>
                  <p className="text-[13px] font-medium text-text-muted">
                    Manage active lobby queue, call next patient, update consultation room status
                  </p>
                </div>
              </div>
              <div className="col-span-6 md:col-span-3 flex items-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-success-bg border border-clinical-success/20 text-clinical-success text-[12px] font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
                  Full Access
                </span>
              </div>
              <div className="hidden md:flex col-span-2 items-center">
                <span className="text-[12px] text-text-muted font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                  Room Audio Ping
                </span>
              </div>
              <div className="col-span-6 md:col-span-2 flex items-center justify-end">
                <button 
                  onClick={() => togglePermission('queue')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shadow-inner border border-surface-container ${permissions.queue ? 'bg-primary' : 'bg-surface-container-high'}`}
                >
                  <span className={`block w-5 h-5 bg-card-surface rounded-full shadow-md transition-transform absolute top-0.5 left-0.5 ${permissions.queue ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>

            {/* 4. Consultation */}
            <div className="p-6 grid grid-cols-12 gap-6 items-center hover:bg-surface-container-lowest transition-colors">
              <div className="col-span-12 md:col-span-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">assignment</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-bold text-text-ink">4. Consultation</span>
                    {permissions.consultation && <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>}
                  </div>
                  <p className="text-[13px] font-medium text-text-muted">
                    Conduct clinical encounter, view historical SOAP notes, create diagnostic assessments
                  </p>
                </div>
              </div>
              <div className="col-span-6 md:col-span-3 flex items-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-success-bg border border-clinical-success/20 text-clinical-success text-[12px] font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
                  Full Access
                </span>
              </div>
              <div className="hidden md:flex col-span-2 items-center">
                <span className="text-[12px] text-text-muted font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  Provider Key
                </span>
              </div>
              <div className="col-span-6 md:col-span-2 flex items-center justify-end">
                <button 
                  onClick={() => togglePermission('consultation')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shadow-inner border border-surface-container ${permissions.consultation ? 'bg-primary' : 'bg-surface-container-high'}`}
                >
                  <span className={`block w-5 h-5 bg-card-surface rounded-full shadow-md transition-transform absolute top-0.5 left-0.5 ${permissions.consultation ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>

            {/* 5. Prescription */}
            <div className="p-6 grid grid-cols-12 gap-6 items-center hover:bg-surface-container-lowest transition-colors">
              <div className="col-span-12 md:col-span-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">prescriptions</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-bold text-text-ink">5. Prescription</span>
                    {permissions.prescription && <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>}
                  </div>
                  <p className="text-[13px] font-medium text-text-muted">
                    Formulate medication orders, authorize e-prescriptions, generate drug schedules
                  </p>
                </div>
              </div>
              <div className="col-span-6 md:col-span-3 flex items-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-success-bg border border-clinical-success/20 text-clinical-success text-[12px] font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">draw</span>
                  Full Access / Direct Signing
                </span>
              </div>
              <div className="hidden md:flex col-span-2 items-center">
                <span className="text-[12px] text-text-muted font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                  DEA / EPCS Token
                </span>
              </div>
              <div className="col-span-6 md:col-span-2 flex items-center justify-end">
                <button 
                  onClick={() => togglePermission('prescription')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shadow-inner border border-surface-container ${permissions.prescription ? 'bg-primary' : 'bg-surface-container-high'}`}
                >
                  <span className={`block w-5 h-5 bg-card-surface rounded-full shadow-md transition-transform absolute top-0.5 left-0.5 ${permissions.prescription ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>

            {/* 6. Voice AI */}
            <div className="p-6 grid grid-cols-12 gap-6 items-center hover:bg-surface-container-lowest transition-colors bg-surface-container-lowest/50">
              <div className="col-span-12 md:col-span-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary border border-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-bold text-text-ink">6. Voice AI</span>
                    {permissions.voiceAi && <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>}
                    <span className="px-2 py-0.5 rounded bg-surface-container border border-primary/20 text-primary text-[11px] font-bold shadow-sm">Core Engine</span>
                  </div>
                  <p className="text-[13px] font-medium text-text-muted">
                    Ambient bedside dictation, voice-driven charting, trigger voice macros, train personal accent model
                  </p>
                </div>
              </div>
              <div className="col-span-6 md:col-span-3 flex items-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-container-tint border border-primary/20 text-primary text-[12px] font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[18px] animate-pulse text-primary">graphic_eq</span>
                  Voice Station Active
                </span>
              </div>
              <div className="hidden md:flex col-span-2 items-center">
                <span className="text-[12px] text-text-muted font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">encrypted</span>
                  AES-256 Audio Bus
                </span>
              </div>
              <div className="col-span-6 md:col-span-2 flex items-center justify-end">
                <button 
                  onClick={() => togglePermission('voiceAi')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shadow-inner border border-surface-container ${permissions.voiceAi ? 'bg-primary' : 'bg-surface-container-high'}`}
                >
                  <span className={`block w-5 h-5 bg-card-surface rounded-full shadow-md transition-transform absolute top-0.5 left-0.5 ${permissions.voiceAi ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>

            {/* 7. Reports */}
            <div className="p-6 grid grid-cols-12 gap-6 items-center hover:bg-surface-container-lowest transition-colors">
              <div className="col-span-12 md:col-span-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">insights</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-bold text-text-ink">7. Reports</span>
                    {permissions.reports && <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>}
                  </div>
                  <p className="text-[13px] font-medium text-text-muted">
                    View clinical diagnostic summaries, patient encounter volume, provider turnaround metrics
                  </p>
                </div>
              </div>
              <div className="col-span-6 md:col-span-3 flex items-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-warning-bg border border-clinical-warning/20 text-clinical-warning text-[12px] font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  Provider Scope Only
                </span>
              </div>
              <div className="hidden md:flex col-span-2 items-center">
                <span className="text-[12px] text-text-muted font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">domain_verification</span>
                  Own NPI Bounds
                </span>
              </div>
              <div className="col-span-6 md:col-span-2 flex items-center justify-end">
                <button 
                  onClick={() => togglePermission('reports')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shadow-inner border border-surface-container ${permissions.reports ? 'bg-primary' : 'bg-surface-container-high'}`}
                >
                  <span className={`block w-5 h-5 bg-card-surface rounded-full shadow-md transition-transform absolute top-0.5 left-0.5 ${permissions.reports ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>

            {/* 8. Users (Admin locked) */}
            <div className="p-6 grid grid-cols-12 gap-6 items-center hover:bg-surface-container-lowest transition-colors opacity-80">
              <div className="col-span-12 md:col-span-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-bold text-text-ink">8. Users</span>
                    <span className="material-symbols-outlined text-clinical-warning text-[20px]">lock</span>
                  </div>
                  <p className="text-[13px] font-medium text-text-muted">
                    View clinic directory, contact fellow staff
                  </p>
                </div>
              </div>
              <div className="col-span-6 md:col-span-3 flex items-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-container border border-surface-container-highest text-text-muted text-[12px] font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                  Restricted • Admin Only for edits
                </span>
              </div>
              <div className="hidden md:flex col-span-2 items-center">
                <span className="text-[12px] text-text-muted font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  Elevated Right
                </span>
              </div>
              <div className="col-span-6 md:col-span-2 flex items-center justify-end">
                <div className="w-12 h-6 bg-surface-container-high border border-surface-container rounded-full relative cursor-not-allowed shadow-inner">
                  <span className="block w-5 h-5 bg-card-surface border border-surface-container rounded-full absolute top-0.5 left-0.5 shadow-sm"></span>
                </div>
              </div>
            </div>

            {/* 9. Settings */}
            <div className="p-6 grid grid-cols-12 gap-6 items-center hover:bg-surface-container-lowest transition-colors">
              <div className="col-span-12 md:col-span-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-bold text-text-ink">9. Settings</span>
                    {permissions.settings && <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>}
                  </div>
                  <p className="text-[13px] font-medium text-text-muted">
                    Personal voice preferences and audio equipment calibration
                  </p>
                </div>
              </div>
              <div className="col-span-6 md:col-span-3 flex items-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-container-tint border border-primary/20 text-primary text-[12px] font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  Personal Settings Only
                </span>
              </div>
              <div className="hidden md:flex col-span-2 items-center">
                <span className="text-[12px] text-text-muted font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">headset_mic</span>
                  Local Mic Calibration
                </span>
              </div>
              <div className="col-span-6 md:col-span-2 flex items-center justify-end">
                <button 
                  onClick={() => togglePermission('settings')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer shadow-inner border border-surface-container ${permissions.settings ? 'bg-primary' : 'bg-surface-container-high'}`}
                >
                  <span className={`block w-5 h-5 bg-card-surface rounded-full shadow-md transition-transform absolute top-0.5 left-0.5 ${permissions.settings ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="p-6 bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-4 text-text-muted border-t border-surface-container">
            <div className="flex items-center gap-3 text-[13px] font-bold">
              <span className="material-symbols-outlined text-clinical-success text-[22px]">lock_reset</span>
              <span>All permission modifications create immutable cryptographic SHA-256 audit log events.</span>
            </div>
            <button 
              onClick={() => alert('HIPAA Security Matrix SHA-256 Verified. Download token generated.')} 
              className="text-[12px] text-primary hover:text-accent-dark font-bold transition-colors cursor-pointer"
            >
              Download HIPAA Security Matrix PDF
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 pb-12 flex flex-col-reverse sm:flex-row items-center justify-between gap-6">
          <Link 
            href="/admin/setup/default-roles" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-card-surface border border-surface-container hover:bg-surface-container-lowest text-text-ink text-[14px] font-bold shadow-sm transition-all group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span>Back to Roles</span>
          </Link>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-2 text-text-muted text-[13px] font-bold">
              <span className="material-symbols-outlined text-[20px] text-clinical-success">check</span>
              <span>Ready to instantiate practice environment</span>
            </div>
            <button 
              onClick={() => router.push('/admin/setup/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-primary hover:bg-accent-dark text-white text-[15px] font-bold shadow-md hover:shadow-lg transition-all active:scale-95 group cursor-pointer border border-primary-container"
            >
              <span>Finish Setup</span>
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">rocket_launch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
