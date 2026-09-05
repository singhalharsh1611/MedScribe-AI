"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminSetupDefaultRolesPage() {
  const router = useRouter();
  const [activeModalRole, setActiveModalRole] = useState<string | null>(null);

  const roleMetadata: Record<string, { desc: string; sec: string }> = {
    'Admin': {
      desc: 'Admins hold comprehensive system governance including role assignment, multi-clinic routing, hardware microphone telemetry, and third-party EHR write-back authorization.',
      sec: 'Root Practice Authority · MFA Obligatory'
    },
    'Doctor': {
      desc: 'Authorized to trigger ambient voice-to-SOAP note synthesis, prescribe Schedule II-V therapies, and electronically sign encounters directly into EHR core.',
      sec: 'Level 1 Prescriber & Clinical Signatory'
    },
    'Receptionist': {
      desc: 'Front of house scheduling, demographic verification, and encounter ticket generation without access to sensitive clinical charts or prescription notes.',
      sec: 'Protected Health Info (PHI) Intake Tier'
    },
    'Compounder': {
      desc: 'Dispensary workstation coordinator overseeing batch dispensing, inventory lot alerts, and physician medication reconciliation logs.',
      sec: 'Dispensary & Controlled Substances Monitor'
    },
    'Nurse': {
      desc: 'Clinical patient prep specialist enabled for ambient vitals capture, allergy confirmation dictation, and room status acceleration.',
      sec: 'Care Team Intake & Vital Signatory'
    },
    'Assistant': {
      desc: 'Rooming aide with queue management, exam room turn-over logging, and patient notification dispatch.',
      sec: 'Operational Rooming & Queue Dispatcher'
    }
  };

  const roles = [
    {
      id: 'admin',
      name: 'Admin',
      tier: 'Tier 0',
      icon: 'admin_panel_settings',
      badge: 'Full Authority · 1 Active Member',
      badgeColor: 'bg-container-tint text-primary',
      desc: 'Full practice governance, staff credentialing, and system-wide security controls.',
      scope: 'Unrestricted access to all modules, billing, voice engine tuning, and user management.',
      footerIcon: 'shield',
      footerText: 'Master Key Required',
      footerIconColor: 'text-clinical-success'
    },
    {
      id: 'doctor',
      name: 'Doctor',
      tier: 'Tier 1',
      icon: 'stethoscope',
      badge: 'Clinical Lead',
      badgeColor: 'bg-success-bg text-clinical-success',
      desc: 'Attending physicians, surgeons, and licensed independent clinical practitioners.',
      scope: 'Patient consultations, voice-to-SOAP dictation, e-prescriptions, lab ordering, and clinical chart signing.',
      footerIcon: 'record_voice_over',
      footerText: 'Full Dictation Core',
      footerIconColor: 'text-primary'
    },
    {
      id: 'receptionist',
      name: 'Receptionist',
      tier: 'Tier 3',
      icon: 'desk',
      badge: 'Front Desk',
      badgeColor: 'bg-container-tint text-secondary',
      desc: 'Front-desk administrative coordinators managing patient arrival and intake.',
      scope: 'Patient registration, appointment scheduling, queue management, and basic demographic editing.',
      footerIcon: 'calendar_today',
      footerText: 'Intake & Schedules',
      footerIconColor: 'text-secondary'
    },
    {
      id: 'compounder',
      name: 'Compounder',
      tier: 'Tier 2',
      icon: 'medication',
      badge: 'Dispensary',
      badgeColor: 'bg-warning-bg text-clinical-warning',
      desc: 'Pharmacy assistants and in-house dispensary inventory coordinators.',
      scope: 'Prescription dispensing verification, pharmacy inventory stock, medication batch tracking.',
      footerIcon: 'inventory_2',
      footerText: 'Stock & Dispensing',
      footerIconColor: 'text-clinical-warning'
    },
    {
      id: 'nurse',
      name: 'Nurse',
      tier: 'Tier 1',
      icon: 'vital_signs',
      badge: 'Care Delivery',
      badgeColor: 'bg-success-bg text-clinical-success',
      desc: 'Registered clinical nursing staff and triage care providers.',
      scope: 'Vitals recording, triage note transcription, appointment queue status, patient prep.',
      footerIcon: 'favorite',
      footerText: 'Triage Voice Note',
      footerIconColor: 'text-clinical-success'
    },
    {
      id: 'assistant',
      name: 'Assistant',
      tier: 'Tier 3',
      icon: 'support_agent',
      badge: 'Clinical Support',
      badgeColor: 'bg-container-tint text-primary',
      desc: 'Medical assistants and clinical rooming support specialists.',
      scope: 'Queue updates, room assignments, intake checklist verification, basic patient communication.',
      footerIcon: 'meeting_room',
      footerText: 'Rooming & Checklist',
      footerIconColor: 'text-accent-light'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-10 py-12 flex flex-col gap-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="inline-flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-container-tint text-primary text-[11px] font-bold tracking-wide uppercase border border-primary/10">Setup Wizard</span>
            <span className="text-text-muted text-[11px] font-bold">Step 2 of 3</span>
          </div>
          <h1 className="text-[28px] font-bold text-text-ink tracking-tight">Default Organizational Roles</h1>
          <p className="text-[15px] font-medium text-text-muted">Review SleekCare standard roles calibrated for outpatient clinics and acute care practices.</p>
        </div>
        {/* Linear Stepper */}
        <div className="flex items-center gap-2 bg-card-surface px-4 py-3 rounded-xl shadow-sm border border-surface-container">
          <Link href="/admin/setup" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-6 h-6 rounded-full bg-clinical-success text-white flex items-center justify-center text-[11px] shadow-sm">
              <span className="material-symbols-outlined text-[15px]">check</span>
            </div>
            <span className="text-[12px] text-text-ink font-bold hidden sm:inline">Clinic Core</span>
          </Link>
          <div className="w-8 h-0.5 bg-clinical-success shadow-sm"></div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-bold shadow-sm">2</div>
            <span className="text-[12px] text-primary font-bold">Practice Roles</span>
          </div>
          <div className="w-8 h-0.5 bg-surface-container-highest"></div>
          <Link href="/admin/setup/access-permissions" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-6 h-6 rounded-full bg-surface-container-highest text-text-muted flex items-center justify-center text-[11px] font-bold shadow-sm">3</div>
            <span className="text-[12px] text-text-muted font-bold hidden sm:inline">Permissions</span>
          </Link>
        </div>
      </div>

      {/* Telemetry Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card-surface rounded-xl p-5 shadow-sm flex items-center justify-between border border-surface-container">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase text-text-muted font-bold tracking-wider mb-1">Pre-Packaged Roles</span>
            <span className="text-[22px] font-bold text-text-ink mt-0.5">6 Standard</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[24px]">badge</span>
          </div>
        </div>
        <div className="bg-card-surface rounded-xl p-5 shadow-sm flex items-center justify-between border border-surface-container">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase text-text-muted font-bold tracking-wider mb-1">Clinical Voice Access</span>
            <span className="text-[22px] font-bold text-clinical-success mt-0.5">Enabled (SOAP/EHR)</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-success-bg border border-clinical-success/20 flex items-center justify-center text-clinical-success shadow-sm">
            <span className="material-symbols-outlined text-[24px]">mic</span>
          </div>
        </div>
        <div className="bg-card-surface rounded-xl p-5 shadow-sm flex items-center justify-between border border-surface-container">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase text-text-muted font-bold tracking-wider mb-1">Security Calibration</span>
            <span className="text-[22px] font-bold text-accent-dark mt-0.5">HIPAA Enforced</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-center text-primary-container shadow-sm">
            <span className="material-symbols-outlined text-[24px]">lock_clock</span>
          </div>
        </div>
      </div>

      {/* 6 Clinical Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((r) => (
          <div key={r.id} className="group relative bg-card-surface rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-surface-container hover:border-primary/30">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-surface-container-lowest border border-surface-container text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">{r.icon}</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold shadow-sm ${r.badgeColor}`}>
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {r.badge}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-bold text-text-ink">{r.name}</h2>
                  <span className="text-[11px] font-bold text-text-muted px-2 py-0.5 bg-surface-container rounded-sm">{r.tier}</span>
                </div>
                <p className="text-[13px] font-medium text-text-muted leading-relaxed">{r.desc}</p>
              </div>
              <div className="mt-3 p-4 rounded-lg bg-surface-container-lowest border border-surface-container shadow-inner flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Scope of Operations</span>
                <p className="text-[12px] font-medium text-text-ink leading-relaxed">{r.scope}</p>
              </div>
            </div>
            <div className="mt-6 pt-4 flex items-center justify-between text-text-muted border-t border-surface-container">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[18px] ${r.footerIconColor}`}>{r.footerIcon}</span>
                <span className="text-[11px] font-bold text-text-muted">{r.footerText}</span>
              </div>
              <button 
                onClick={() => setActiveModalRole(r.name)}
                className="inline-flex items-center gap-1 text-[12px] font-bold text-primary hover:text-accent-dark transition-colors cursor-pointer"
              >
                <span>Details</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-6 bg-card-surface shadow-xl border border-surface-container rounded-xl p-5 flex items-center justify-between mt-6 z-30">
        <button 
          onClick={() => router.push('/admin/setup')} 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container-lowest border border-surface-container text-text-ink hover:bg-surface-container transition-colors text-[14px] font-bold shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex items-center gap-1.5 text-text-muted font-bold text-[12px]">
            <span>Ready to configure module-level rights</span>
            <span className="material-symbols-outlined text-[16px] text-clinical-success">verified</span>
          </span>
          <button 
            onClick={() => router.push('/admin/setup/access-permissions')}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary hover:bg-accent-dark text-white font-bold text-[15px] shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer border border-primary-container"
          >
            <span>Continue</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {activeModalRole && (
        <div className="fixed inset-0 z-50 bg-text-ink/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-card-surface rounded-xl shadow-2xl max-w-lg w-full p-8 flex flex-col gap-6 border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest border border-surface-container flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">policy</span>
                </div>
                <h3 className="text-[20px] font-bold text-text-ink">{activeModalRole} Specifications</h3>
              </div>
              <button 
                onClick={() => setActiveModalRole(null)}
                className="w-10 h-10 rounded-lg bg-surface-container-low hover:bg-surface-container border border-surface-container flex items-center justify-center text-text-muted transition-colors cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-4 text-[14px] text-text-muted font-medium">
              <p className="leading-relaxed">{roleMetadata[activeModalRole]?.desc}</p>
              <div className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container shadow-inner flex flex-col gap-1.5 mt-2">
                <span className="text-[11px] text-text-muted uppercase font-bold">Security Level</span>
                <span className="text-[13px] text-text-ink font-bold">{roleMetadata[activeModalRole]?.sec}</span>
              </div>
              <div className="flex items-center gap-2 text-clinical-success text-[12px] font-bold mt-2 bg-success-bg p-3 rounded-lg border border-clinical-success/20">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
                <span>Role mapping conforms to standard HL7/FHIR RBAC guidelines</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setActiveModalRole(null)}
                className="px-6 py-2.5 rounded-lg bg-primary text-white text-[14px] font-bold hover:bg-accent-dark transition-colors cursor-pointer shadow-sm"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
