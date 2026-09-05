"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

type RequestType = {
  id: string;
  name: string;
  role: string;
  idStr: string;
  time: string;
  verified: string;
  image?: string;
  icon?: string;
  approved: boolean;
};

export default function AdminSetupDashboardPage() {
  const { showToast: addToast } = useApp();
  const [reviewModal, setReviewModal] = useState<RequestType | null>(null);
  const [requests, setRequests] = useState<RequestType[]>([
    {
      id: '1',
      name: 'Dr. Jonathan Miller, MD',
      role: 'Internal Medicine',
      idStr: 'NPI #1982736412',
      time: 'Requested 2h ago',
      verified: 'Verified CA Board',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ2KrcPXzcRINNSDDCqbmqfJxq46jRKRKoO_vu4l-dufe7v6wb3e3umvuD_f24GDmy-KYejdvso3iji5PLOJb5_UrQSZSv8QW_13lHcPxGPoZNj1hdXRxme-QM7xImqBCa_JsykjD7Ztki84e3S17rSxnDJaHVdVD29AElxJqD3OWLICzDpGxhF-5IHAq-nHxQ8yLdBs3tQ_BpqkFf4xQ529xv3jjvxLlPYHSQWYF_lQ32u57hO-OaMg',
      approved: false
    },
    {
      id: '2',
      name: 'Sarah Jenkins, RN',
      role: 'Registered Nurse',
      idStr: 'License #RN-89421',
      time: 'Requested 5h ago',
      verified: 'Triage Certified',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8JgXDflZN-SgDcrUcVFUVrbqxoBMUCaiQSVsmp2eFfMsSO918NvsUne3ipgv80ck7y185V9_ICZ-g91qiJV-0S7Uf_V5KUx1fvvRuWRk6wVo7q1JJj7VKFbsMDLFe3k9UwQl9MuYpLsmnMmiW9A_Y-Gb1juV_euVmlJmqFpMYoPDNUO8H1wYbIhWFIhjpMtD5Rj11R0wO2UfcV3HdEjPhwBQ-051haDBjQbKhf51c8NbVKXZ5kUlGxQ',
      approved: false
    },
    {
      id: '3',
      name: 'David Morales',
      role: 'Clinic Receptionist',
      idStr: 'Front Desk Station 01',
      time: 'Requested Yesterday',
      verified: 'Identity Confirmed',
      icon: 'front_hand',
      approved: false
    }
  ]);

  const handleApprove = () => {
    if (!reviewModal) return;
    setRequests(prev => prev.map(req => req.id === reviewModal.id ? { ...req, approved: true } : req));
    addToast({ title: 'Affiliation Approved', description: `${reviewModal.name} credentials confirmed and added to roster.`, type: 'success' });
    setReviewModal(null);
  };

  const pendingCount = requests.filter(r => !r.approved).length;

  return (
    <div className="px-10 py-10 max-w-[1560px] mx-auto w-full flex flex-col gap-10">
      {/* Header Ribbon */}
      <div className="relative overflow-hidden rounded-xl bg-card-surface p-10 shadow-sm border border-surface-container">
        <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 -bottom-10 w-48 h-48 rounded-full bg-tertiary-container/10 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-container-tint border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">apartment</span>
                Hospital Unit & Outpatient Facility
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container text-text-muted border border-surface-container-highest text-[11px] font-bold">
                <span className="material-symbols-outlined text-[16px]">memory</span>
                Node ID: CLINIC-84920-SF
              </span>
            </div>
            <h1 className="text-[28px] sm:text-[34px] font-bold leading-tight text-text-ink tracking-tight">
              Metropolitan Health Medical Center
            </h1>
            <p className="text-[15px] font-medium text-text-muted max-w-2xl">
              Primary Clinic Administration Portal & Core Voice Node Configuration. Orchestrate practitioner access, medical credentials, and room transcription terminals.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-4 p-4 pl-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
              <div className="flex flex-col text-left">
                <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold mb-0.5">Session Authority</span>
                <span className="text-[15px] font-bold text-text-ink">Dr. Eleanor Vance, MD</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px]">badge</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Administrative Quick Action Dock */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">touch_app</span>
            <span className="text-[12px] uppercase tracking-widest text-text-muted font-bold">Administrative Actions</span>
          </div>
          <span className="text-[13px] font-medium text-text-muted">4 Core Operational Workflows</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Action 1 */}
          <div 
            onClick={() => addToast({ title: 'Manage Users', description: 'Accessing Practitioner Roster and directory provisioning...', type: 'info' })}
            className="group cursor-pointer rounded-xl bg-card-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-6 border border-surface-container hover:border-primary/30"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-xl bg-surface-container-low border border-surface-container group-hover:bg-primary group-hover:text-white text-primary transition-colors flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px]">manage_accounts</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary group-hover:translate-x-1 transition-all text-[24px]">arrow_forward</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[18px] font-bold text-text-ink group-hover:text-primary transition-colors">Manage Users</h3>
              <p className="text-[13px] font-medium text-text-muted leading-snug">Invite and manage practitioners, nurses, and medical support staff.</p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-primary text-[13px] font-bold">
              <span>Launch Roster Directory</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </div>
          </div>

          {/* Action 2 */}
          <Link 
            href="/admin/setup/default-roles"
            className="group cursor-pointer rounded-xl bg-card-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-6 border border-surface-container hover:border-primary/30"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-xl bg-surface-container-low border border-surface-container group-hover:bg-primary group-hover:text-white text-primary transition-colors flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px]">shield_person</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary group-hover:translate-x-1 transition-all text-[24px]">arrow_forward</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[18px] font-bold text-text-ink group-hover:text-primary transition-colors">Manage Roles</h3>
              <p className="text-[13px] font-medium text-text-muted leading-snug">Configure access tiers, custom clinical roles, and prescriber privileges.</p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-primary text-[13px] font-bold">
              <span>Security Matrix</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </div>
          </Link>

          {/* Action 3 */}
          <div 
            onClick={() => {
              const reqEl = document.getElementById('join-requests-section');
              if (reqEl) reqEl.scrollIntoView({ behavior: 'smooth' });
              addToast({ title: 'Join Requests', description: `${pendingCount} pending affiliation applications.`, type: 'info' });
            }}
            className="group cursor-pointer rounded-xl bg-card-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-6 relative overflow-hidden border border-surface-container hover:border-primary/30"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-warning-bg rounded-bl-full pointer-events-none"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="w-14 h-14 rounded-xl bg-warning-bg border border-clinical-warning/20 text-clinical-warning flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px]">assignment_ind</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-warning-bg border border-clinical-warning/20 text-clinical-warning text-[12px] font-bold shadow-sm">
                {pendingCount} Pending
              </span>
            </div>
            <div className="flex flex-col gap-1.5 relative z-10">
              <h3 className="text-[18px] font-bold text-text-ink group-hover:text-primary transition-colors">Join Requests</h3>
              <p className="text-[13px] font-medium text-text-muted leading-snug">{pendingCount} pending practitioner affiliation applications require credential check.</p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-primary text-[13px] font-bold relative z-10">
              <span>Review Applications</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </div>
          </div>

          {/* Action 4 */}
          <Link 
            href="/admin/setup/access-permissions"
            className="group cursor-pointer rounded-xl bg-card-surface p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-6 border border-surface-container hover:border-primary/30"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-xl bg-surface-container-low border border-surface-container group-hover:bg-primary group-hover:text-white text-primary transition-colors flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px]">tune</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary group-hover:translate-x-1 transition-all text-[24px]">arrow_forward</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[18px] font-bold text-text-ink group-hover:text-primary transition-colors">Clinic Settings</h3>
              <p className="text-[13px] font-medium text-text-muted leading-snug">Facility details, voice scribe hardware, and HL7/FHIR EHR sync parameters.</p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-primary text-[13px] font-bold">
              <span>Facility Parameters</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl bg-card-surface shadow-sm flex flex-col justify-between gap-4 border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Active Doctors</span>
            <span className="material-symbols-outlined text-primary text-[24px]">medical_services</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-text-ink">1</span>
            <span className="text-[14px] font-bold text-text-muted">Registered</span>
          </div>
          <div className="flex items-center gap-2 text-text-muted font-bold text-[12px] pt-1 border-t border-surface-container">
            <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
            <span className="truncate">Dr. Vance (Chief Administrator)</span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card-surface shadow-sm flex flex-col justify-between gap-4 border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Staff Members</span>
            <span className="material-symbols-outlined text-text-muted text-[24px]">support_agent</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-text-ink">0</span>
            <span className="text-[14px] font-bold text-text-muted">Added</span>
          </div>
          <div className="flex items-center gap-2 text-text-muted font-bold text-[12px] pt-1 border-t border-surface-container">
            <span className="w-2 h-2 rounded-full bg-surface-container-high"></span>
            <span className="truncate">Invite receptionists, nurses & tech</span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card-surface shadow-sm flex flex-col justify-between gap-4 border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Affiliation Requests</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-warning-bg border border-clinical-warning/20 text-clinical-warning text-[11px] font-bold">Action Req.</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-clinical-warning">{pendingCount}</span>
            <span className="text-[14px] font-bold text-text-muted">Pending</span>
          </div>
          <div className="flex items-center gap-2 text-clinical-warning font-bold text-[12px] pt-1 border-t border-surface-container">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Awaiting license review</span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card-surface shadow-sm flex flex-col justify-between gap-4 border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Today's Queue</span>
            <span className="material-symbols-outlined text-clinical-success text-[24px]">meeting_room</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-text-ink">0</span>
            <span className="text-[14px] font-bold text-text-muted">Active Visits</span>
          </div>
          <div className="flex items-center gap-2 text-clinical-success font-bold text-[12px] pt-1 border-t border-surface-container">
            <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse shadow-sm"></span>
            <span>Lobby station ready</span>
          </div>
        </div>
      </div>

      {/* Two-Column Management Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="join-requests-section">
        {/* Pending Requests Column */}
        <div className="lg:col-span-7 flex flex-col rounded-xl bg-card-surface shadow-sm overflow-hidden border border-surface-container">
          <div className="p-6 flex items-center justify-between bg-surface-container-lowest border-b border-surface-container">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container text-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[24px]">person_add</span>
              </div>
              <div className="flex flex-col">
                <h2 className="text-[18px] font-bold text-text-ink">Pending Practitioner Join Requests</h2>
                <span className="text-[13px] font-medium text-text-muted">{pendingCount} medical personnel applied for affiliation</span>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-container-tint border border-primary/20 text-primary text-[12px] font-bold shadow-sm">
              Live Gatekeeper
            </span>
          </div>

          <div className="p-6 flex flex-col gap-6 divide-y divide-surface-container">
            {requests.map(req => (
              <div 
                key={req.id}
                className={`pt-6 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-200 ${req.approved ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative flex-shrink-0">
                    {req.image ? (
                      <img className="w-14 h-14 rounded-xl object-cover shadow-sm ring-2 ring-primary/10" src={req.image} alt={req.name} />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-center text-text-muted shadow-sm">
                        <span className="material-symbols-outlined text-[28px]">{req.icon}</span>
                      </div>
                    )}
                    {!req.approved && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-warning-bg border border-clinical-warning/20 text-clinical-warning flex items-center justify-center text-[12px] font-bold shadow-sm">!</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[16px] font-bold text-text-ink truncate">{req.name}</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-surface-container text-text-muted text-[11px] font-bold shadow-sm">{req.role}</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-muted font-bold text-[12px] mt-1">
                      <span className="text-text-ink">{req.idStr}</span>
                      <span className="text-surface-container-high">•</span>
                      <span>{req.time}</span>
                      <span className="text-surface-container-high">•</span>
                      <span className="text-clinical-success font-bold inline-flex items-center gap-1 bg-success-bg px-2 py-0.5 rounded-sm border border-clinical-success/20">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> {req.verified}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                  {req.approved ? (
                    <span className="px-4 py-2 rounded-lg bg-success-bg border border-clinical-success/20 text-clinical-success text-[13px] font-bold flex items-center gap-1.5 shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                      Affiliated
                    </span>
                  ) : (
                    <button 
                      onClick={() => setReviewModal(req)}
                      className="px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-accent-dark text-[13px] font-bold transition-all shadow-sm cursor-pointer border border-primary-container"
                    >
                      Review Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto p-5 bg-surface-container-lowest flex items-center justify-between border-t border-surface-container">
            <span className="text-[13px] font-medium text-text-muted">Background verification synced with Federation of State Medical Boards (FSMB).</span>
            <button 
              onClick={() => addToast({ title: 'Full Directory', description: 'Synchronizing with national license registry...', type: 'info' })}
              className="text-[14px] font-bold text-primary hover:text-accent-dark flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View All Affiliations</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Clinic Queue & Today's State */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="rounded-xl bg-card-surface shadow-sm overflow-hidden flex flex-col border border-surface-container">
            <div className="p-6 bg-surface-container-lowest flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container text-primary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">monitor_heart</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-[18px] font-bold text-text-ink">Today's Clinic Queue & Staff</h2>
                  <span className="text-[13px] font-medium text-text-muted">Facility floor state & listening nodes</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-bg border border-clinical-success/20 text-clinical-success text-[12px] font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-clinical-success animate-ping"></span>
                Live Operational
              </span>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="p-5 rounded-lg bg-surface-container-lowest border border-surface-container flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-success-bg border border-clinical-success/20 text-clinical-success flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">door_open</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold mb-0.5">Clinic Status</span>
                  <span className="text-[15px] font-bold text-text-ink">Open • Accepting Ambulatory Patients</span>
                  <span className="text-[13px] font-bold text-text-muted mt-1">Primary intake desk connected. Reception check-in ready.</span>
                </div>
              </div>

              <div className="p-5 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-primary border border-primary-container text-white flex items-center justify-center flex-shrink-0 font-bold text-[15px] shadow-sm">
                    EV
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[15px] font-bold text-text-ink truncate">Dr. Eleanor Vance, MD</span>
                      <span className="inline-flex px-2 py-0.5 rounded bg-success-bg border border-clinical-success/20 text-clinical-success text-[11px] font-bold shadow-sm">On Duty</span>
                    </div>
                    <span className="text-[13px] font-bold text-text-muted">Room 101 • Voice Node Active</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-clinical-success">
                  <span className="material-symbols-outlined text-[24px] animate-pulse">mic</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card-surface border border-surface-container flex items-center justify-between text-[13px] shadow-inner">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">podcasts</span>
                  <span className="font-bold text-text-ink">Ambient Microphone Transcribers</span>
                </div>
                <span className="text-clinical-success font-bold bg-success-bg px-2 py-1 rounded-md border border-clinical-success/20">3 Workstations Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry & EHR Sync Mini Strip */}
      <div className="p-5 rounded-xl bg-card-surface shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border border-surface-container">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-text-muted text-[12px] font-bold">
            <span className="material-symbols-outlined text-[18px] text-clinical-success">shield</span>
            <span>HIPAA Cloud Vault: <strong className="text-text-ink">Active (US-West-1)</strong></span>
          </div>
          <div className="h-5 w-px bg-surface-container hidden md:block"></div>
          <div className="flex items-center gap-2 text-text-muted text-[12px] font-bold">
            <span className="material-symbols-outlined text-[18px] text-primary">swap_calls</span>
            <span>HL7/FHIR EHR Bridge: <strong className="text-text-ink">Epic • Cerner Ready</strong></span>
          </div>
          <div className="h-5 w-px bg-surface-container hidden md:block"></div>
          <div className="flex items-center gap-2 text-text-muted text-[12px] font-bold">
            <span className="material-symbols-outlined text-[18px] text-outline">schedule</span>
            <span>Last Audit Timestamp: <strong className="text-text-ink">Today, 08:30 AM PST</strong></span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-center bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-surface-container shadow-sm">
          <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
          <span className="text-[12px] font-bold text-text-ink">100% Operational Readiness</span>
        </div>
      </div>

      {/* Interactive Credential Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-text-ink/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-card-surface w-full max-w-lg rounded-xl shadow-2xl p-8 flex flex-col gap-8 border border-surface-container">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container text-primary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">verified_user</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[20px] font-bold text-text-ink">Affiliation Review</h3>
                  <span className="text-[13px] font-medium text-text-muted">Verify state licensing & grant clinic voice partition</span>
                </div>
              </div>
              <button 
                onClick={() => setReviewModal(null)}
                className="w-10 h-10 rounded-lg text-text-muted hover:bg-surface-container-lowest border border-transparent hover:border-surface-container flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="p-5 rounded-lg bg-surface-container-lowest border border-surface-container shadow-inner flex flex-col gap-3">
              <div className="flex justify-between items-center pb-2 border-b border-surface-container">
                <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider">Practitioner</span>
                <span className="text-[14px] font-bold text-text-ink">{reviewModal.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-surface-container">
                <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider">Discipline</span>
                <span className="text-[14px] font-bold text-primary">{reviewModal.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider">Identifier</span>
                <span className="text-[14px] font-bold text-text-ink">{reviewModal.idStr}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] uppercase tracking-wider text-text-muted font-bold mb-1">Assign Clinic Role Tier</label>
              <select className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-text-ink text-[14px] border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary font-bold shadow-sm cursor-pointer">
                <option>Attending Physician (Full Prescriptive & Scribe Access)</option>
                <option>Consulting Clinician (Scribe & Narrative Review Only)</option>
                <option>Registered Nurse Practitioner (Clinical Scribe Sub-tier)</option>
                <option>Clinical Support & Medical Assistant</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => setReviewModal(null)}
                className="px-5 py-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-surface-container text-text-ink text-[14px] font-bold transition-colors cursor-pointer shadow-sm"
              >
                Decline
              </button>
              <button 
                onClick={handleApprove}
                className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-accent-dark text-[14px] font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95 cursor-pointer border border-primary-container"
              >
                <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                <span>Approve & Affiliate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
