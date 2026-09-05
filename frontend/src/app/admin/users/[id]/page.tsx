"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function AdminUserDetailsPage({ params }: { params: { id: string } }) {
  const { showToast: addToast } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-10 xl:p-14 flex flex-col gap-10 max-w-[1520px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-text-muted font-bold text-[13px]">
          <Link href="/admin/overview" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            Admin Dashboard
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href="/admin/users" className="hover:text-primary transition-colors">Users</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-text-ink">Dr. Kevin Zhao, MD</span>
        </div>
        <div className="flex items-center gap-4 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low border border-surface-container rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-clinical-success shadow-sm"></span>
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Sync: Station 102 Live</span>
          </div>
          <div className="text-[12px] font-bold text-text-muted">FIPS Vault v4.2</div>
        </div>
      </div>

      <div className="relative bg-card-surface rounded-xl p-8 shadow-sm overflow-hidden flex flex-col xl:flex-row xl:items-center justify-between gap-8 border border-surface-container">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 z-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-xl overflow-hidden bg-surface-container-high border border-surface-container shadow-inner relative flex-shrink-0">
              <img className="w-full h-full object-cover" alt="Dr. Kevin Zhao" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3zFwPwSZTWpreK9X70yyM_f51ir1xUyquyV2fNrGHaz2Fp641tLJZzCwYRFyMZPfsXHIlQBCq6yWjwXl276bObWoQrlXnASLzk6ytFb2gb6B_Baf7uR86NPLwHUMnCOoJ4pdT8yjI57nnVOtXochraErPMR8D3puiR7YW1cr4-z1Zd4cEKFgPsKWkjohrILCwk22Yt3RnU7hPBgvYnr_TF_rbrhTZr-VdXFg53zyxx6-XH4vpcO4CJg"/>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-card-surface p-1 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-clinical-success text-[24px] bg-success-bg rounded-full p-1 border border-clinical-success/20">check_circle</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[32px] font-bold text-text-ink tracking-tight">Dr. Kevin Zhao, MD</h1>
              <span className="text-[11px] px-2.5 py-1 bg-container-tint border border-primary/20 text-primary font-bold rounded-md uppercase tracking-wider">Doctor</span>
              <span className="text-[11px] px-2.5 py-1 bg-success-bg border border-clinical-success/20 text-clinical-success font-bold rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-clinical-success animate-pulse shadow-sm"></span>
                Active
              </span>
            </div>
            <p className="text-[15px] text-text-muted font-medium">
              Staff Orthopedic Surgeon & Sports Medicine Specialist
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-text-muted text-[13px] font-bold">
                <span className="material-symbols-outlined text-[18px] text-primary">verified_user</span>
                <span>2FA: <strong className="text-text-ink">Enforced (PIN + FIDO2)</strong></span>
              </div>
              <span className="text-surface-container-highest">•</span>
              <div className="flex items-center gap-1.5 text-text-muted text-[13px] font-bold">
                <span className="material-symbols-outlined text-[18px] text-accent-dark">computer</span>
                <span>Clinical Node: <strong className="text-text-ink">Station 102</strong></span>
              </div>
              <span className="text-surface-container-highest">•</span>
              <div className="flex items-center gap-1.5 text-text-muted text-[13px] font-bold">
                <span className="material-symbols-outlined text-[18px] text-clinical-success">history</span>
                <span>Active 15 mins ago</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 z-10">
          <button onClick={() => setShowModal(true)} className="px-5 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container border border-surface-container text-text-ink text-[14px] font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[20px] text-secondary">swap_horiz</span>
            Change Role
          </button>
          <Link href="/admin/roles/doctor" className="px-5 py-2.5 rounded-lg bg-primary hover:bg-accent-dark text-white text-[14px] font-bold transition-all flex items-center gap-2 shadow-sm border border-primary-container cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">key</span>
            Manage Permissions
          </Link>
          <button onClick={() => addToast({ title: 'Deactivation', description: 'Dr. Kevin Zhao deactivated queued for chief admin approval.', type: 'error' })} className="px-5 py-2.5 rounded-lg bg-error-bg border border-clinical-error/20 hover:bg-error-container text-clinical-error text-[14px] font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">block</span>
            Deactivate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-card-surface rounded-xl p-8 shadow-sm flex flex-col gap-6 border border-surface-container">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[24px]">medical_services</span>
                </div>
                <h2 className="text-[20px] font-bold text-text-ink">Professional Dossier</h2>
              </div>
              <span className="text-[11px] text-clinical-success bg-success-bg border border-clinical-success/20 px-2.5 py-1 rounded-md font-bold shadow-sm uppercase tracking-wider">STATE VERIFIED</span>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col p-4 bg-surface-container-lowest border border-surface-container rounded-lg gap-1 shadow-inner">
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Full Legal Name</span>
                <span className="text-[16px] font-bold text-text-ink">Kevin Ming Zhao, MD, FACS</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col gap-1 shadow-inner">
                  <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Primary Specialty</span>
                  <span className="text-[14px] text-text-ink font-bold">Orthopedic Surgery</span>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col gap-1 shadow-inner">
                  <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Sub-Specialty</span>
                  <span className="text-[14px] text-text-ink font-bold">Joint Reconstruction</span>
                </div>
              </div>
              <div className="p-4 bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col gap-3 shadow-inner">
                <div className="flex justify-between items-center pb-2 border-b border-surface-container">
                  <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Medical License</span>
                  <span className="text-[11px] text-clinical-success font-bold bg-success-bg px-2 py-0.5 rounded-sm border border-clinical-success/20">Valid thru 12/2026</span>
                </div>
                <div className="flex items-center justify-between text-[14px] text-text-ink font-bold">
                  <span>NY #MD-8839102</span>
                  <button onClick={() => addToast({ title: 'Copied', description: 'License copied to clipboard', type: 'info' })} className="material-symbols-outlined text-[20px] text-text-muted hover:text-primary transition-colors cursor-pointer">content_copy</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col gap-1 shadow-inner">
                  <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">NPI Identifier</span>
                  <span className="text-[14px] text-text-ink font-bold font-mono">1982736450</span>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col gap-1 shadow-inner">
                  <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Hospital Staff ID</span>
                  <span className="text-[14px] text-text-ink font-bold font-mono">#STF-8821</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card-surface rounded-xl p-8 shadow-sm flex flex-col gap-6 border border-surface-container">
            <div className="flex items-center gap-3 border-b border-surface-container pb-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-accent-dark text-[24px]">domain</span>
              </div>
              <h2 className="text-[20px] font-bold text-text-ink">Department & Contact</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col gap-1 shadow-inner">
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider mb-1">Clinic Department</span>
                <span className="text-[14px] text-text-ink font-bold">North Pavilion Surgical Suites</span>
                <span className="text-[12px] text-text-muted font-bold">Metropolitan Health Medical Center · Wing C, Floor 4</span>
              </div>
              <div className="p-4 bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col gap-3 shadow-inner">
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider pb-2 border-b border-surface-container">Official Hospital Contact</span>
                <div className="flex items-center gap-3 text-text-ink text-[14px]">
                  <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-primary">alternate_email</span>
                  </div>
                  <span className="font-bold">kevin.zhao@metrohealth.org</span>
                </div>
                <div className="flex items-center gap-3 text-text-ink text-[14px]">
                  <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-primary">call</span>
                  </div>
                  <span className="font-bold">(555) 019-2844</span>
                  <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider ml-auto bg-surface-container px-2 py-0.5 rounded-sm">Ext. #409</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-card-surface rounded-xl p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-surface-container">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary border border-primary-container flex items-center justify-center flex-shrink-0 text-white shadow-md">
                <span className="material-symbols-outlined text-[32px]">shield_person</span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-[20px] font-bold text-text-ink">Doctor (Physician Practitioner)</h2>
                <p className="text-[13px] font-medium text-text-muted">
                  Inherited from default clinic role template <span className="text-text-ink font-bold bg-surface-container-low px-1 rounded-sm border border-surface-container">"Acute & Surgical Specialist v3.1"</span>.
                </p>
              </div>
            </div>
            <Link href="/admin/roles/doctor" className="px-5 py-2.5 bg-surface-container-lowest border border-surface-container hover:bg-surface-container rounded-lg text-primary text-[14px] font-bold transition-colors whitespace-nowrap shadow-sm">
              View Role Spec
            </Link>
          </div>

          <div className="bg-card-surface rounded-xl p-8 shadow-sm flex flex-col gap-6 border border-surface-container">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
                </div>
                <h3 className="text-[20px] font-bold text-text-ink">Active Permissions Breakdown</h3>
              </div>
              <span className="text-[12px] text-text-muted font-bold bg-surface-container-lowest px-3 py-1.5 rounded-md border border-surface-container shadow-sm">14 Granted · 3 Restricted</span>
            </div>

            {/* Patients Section */}
            <div className="bg-surface-container-lowest border border-surface-container rounded-lg p-5 flex flex-col gap-4 shadow-inner">
              <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => toggleSection('perm-patients')}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">groups</span>
                  <span className="text-[16px] font-bold text-text-ink">Patients & Health Records</span>
                </div>
                <span className="material-symbols-outlined text-text-muted text-[24px]">
                  {collapsedSections['perm-patients'] ? 'expand_more' : 'expand_less'}
                </span>
              </div>
              {!collapsedSections['perm-patients'] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-surface-container">
                  <div className="flex items-center justify-between p-3 bg-card-surface border border-surface-container rounded-md shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>
                      <span className="text-[13px] font-bold text-text-ink">View All Patients</span>
                    </div>
                    <span className="text-[11px] text-clinical-success bg-success-bg px-2 py-0.5 rounded-sm font-bold border border-clinical-success/20">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-card-surface border border-surface-container rounded-md shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>
                      <span className="text-[13px] font-bold text-text-ink">Register New Patient</span>
                    </div>
                    <span className="text-[11px] text-clinical-success bg-success-bg px-2 py-0.5 rounded-sm font-bold border border-clinical-success/20">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-card-surface border border-surface-container rounded-md shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-clinical-success text-[20px]">check_circle</span>
                      <span className="text-[13px] font-bold text-text-ink">Edit Medical History</span>
                    </div>
                    <span className="text-[11px] text-clinical-success bg-success-bg px-2 py-0.5 rounded-sm font-bold border border-clinical-success/20">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-card-surface border border-surface-container rounded-md shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-clinical-error text-[20px]">cancel</span>
                      <span className="text-[13px] font-bold text-text-muted">Export Records (Bulk)</span>
                    </div>
                    <span className="text-[11px] text-clinical-error bg-error-bg px-2 py-0.5 rounded-sm font-bold border border-clinical-error/20">Restricted</span>
                  </div>
                </div>
              )}
            </div>

            {/* Queue Section */}
            <div className="bg-surface-container-lowest border border-surface-container rounded-lg p-5 flex flex-col gap-4 shadow-inner">
              <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => toggleSection('perm-queue')}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-[24px]">calendar_today</span>
                  <span className="text-[16px] font-bold text-text-ink">Appointments & Queue Orchestration</span>
                </div>
                <span className="material-symbols-outlined text-text-muted text-[24px]">
                  {collapsedSections['perm-queue'] ? 'expand_more' : 'expand_less'}
                </span>
              </div>
              {!collapsedSections['perm-queue'] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-surface-container">
                  <div className="flex items-center justify-between p-3 bg-card-surface border border-surface-container rounded-md shadow-sm">
                    <span className="text-[13px] font-bold text-text-ink">View Queue</span>
                    <span className="text-[11px] text-clinical-success bg-success-bg px-2 py-0.5 rounded-sm font-bold border border-clinical-success/20">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-card-surface border border-surface-container rounded-md shadow-sm">
                    <span className="text-[13px] font-bold text-text-ink">Call Patient</span>
                    <span className="text-[11px] text-clinical-success bg-success-bg px-2 py-0.5 rounded-sm font-bold border border-clinical-success/20">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-card-surface border border-surface-container rounded-md shadow-sm">
                    <span className="text-[13px] font-bold text-text-ink">Reassign Appointments</span>
                    <span className="text-[11px] text-clinical-success bg-success-bg px-2 py-0.5 rounded-sm font-bold border border-clinical-success/20">Enabled</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-ink/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-card-surface rounded-xl p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">swap_horiz</span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-text-ink">Reassign User Role</h3>
                  <p className="text-[13px] font-medium text-text-muted">Dr. Kevin Zhao, MD (ID #STF-8821)</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-lg text-text-muted hover:bg-surface-container-lowest border border-transparent hover:border-surface-container flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">Select Standard Role Template</label>
              <label className="flex items-center justify-between p-4 bg-container-tint border border-primary/20 rounded-lg cursor-pointer shadow-sm">
                <div className="flex items-center gap-4">
                  <input defaultChecked className="text-primary accent-primary w-5 h-5 cursor-pointer" name="selected_role" type="radio"/>
                  <div>
                    <div className="text-[15px] font-bold text-text-ink">Doctor (Physician Practitioner)</div>
                    <div className="text-[13px] font-medium text-text-muted">Full patient encounters, ambient scribe, DEA Schedule II-V</div>
                  </div>
                </div>
                <span className="text-[11px] text-primary font-bold uppercase tracking-wider">CURRENT</span>
              </label>
              <label className="flex items-center justify-between p-4 bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low rounded-lg cursor-pointer transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                  <input className="text-primary accent-primary w-5 h-5 cursor-pointer" name="selected_role" type="radio"/>
                  <div>
                    <div className="text-[15px] font-bold text-text-ink">Department Clinical Lead</div>
                    <div className="text-[13px] font-medium text-text-muted">Adds department queue reassignments & scheduling</div>
                  </div>
                </div>
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold shadow-sm hover:bg-surface-container transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={() => { setShowModal(false); addToast({ title: 'Role Changed', description: 'Role change recorded in audit log', type: 'success' }); }} className="px-6 py-2.5 rounded-lg bg-primary text-white text-[14px] font-bold shadow-sm hover:bg-accent-dark transition-colors cursor-pointer border border-primary-container">
                Confirm & Sign Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
