"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function AdminRoleDetailsPage({ params }: { params: { id: string } }) {
  const { showToast: addToast } = useApp();
  const router = useRouter();

  const handleSave = () => {
    addToast({ title: 'Permissions Updated', description: 'Permissions updated successfully across MedScribe AI cluster', type: 'success' });
  };

  return (
    <div className="px-10 xl:px-14 py-10 flex flex-col gap-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-[13px] font-bold text-text-muted">
          <Link href="/admin/overview" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            Admin Dashboard
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
          <Link href="/admin/roles-and-permissions" className="hover:text-primary transition-colors">Roles & Permissions</Link>
          <span className="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
          <span className="text-text-ink">Doctor (Physician)</span>
        </nav>
        <div className="flex items-center gap-2 bg-container-tint px-4 py-1.5 rounded-full border border-primary/20 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-clinical-success shadow-sm"></span>
          <span className="text-[11px] text-primary font-bold tracking-tight uppercase">System Role (Protected Standard)</span>
          <span className="text-[12px] text-text-muted font-bold mx-1">·</span>
          <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">12 Active Users Assigned</span>
        </div>
      </div>

      <div className="bg-card-surface border border-surface-container rounded-xl p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
        <div className="flex items-start gap-6 min-w-0">
          <div className="w-16 h-16 rounded-xl bg-primary border border-primary-container flex items-center justify-center shrink-0 shadow-md">
            <span className="material-symbols-outlined text-white text-[32px]">stethoscope</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[28px] font-bold text-text-ink tracking-tight">Doctor (Physician)</h1>
              <span className="bg-success-bg border border-clinical-success/20 text-clinical-success text-[11px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">verified</span> Legal Signoff Capable
              </span>
            </div>
            <p className="text-[14px] font-medium text-text-muted max-w-2xl mt-1">
              Attending clinicians and staff physicians with legal prescription and ambient voice consultation privileges.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          <button onClick={() => router.push('/admin/create-custom-role')} className="px-5 py-2.5 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container text-text-ink text-[14px] font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[20px] text-text-muted">content_copy</span>
            <span>Clone Role as Template</span>
          </button>
          <button onClick={handleSave} className="px-6 py-2.5 rounded-lg bg-primary hover:bg-accent-dark text-white text-[14px] font-bold transition-colors flex items-center gap-2 shadow-md border border-primary-container cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">save</span>
            <span>Save Role</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card-surface border border-surface-container rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-center shrink-0 text-primary shadow-sm">
            <span className="material-symbols-outlined text-[24px]">mic</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">MedScribe AI</span>
            <span className="text-[14px] font-bold text-text-ink truncate">Ambient Direct · High FID</span>
          </div>
        </div>
        <div className="bg-card-surface border border-surface-container rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-center shrink-0 text-clinical-success shadow-sm">
            <span className="material-symbols-outlined text-[24px]">prescriptions</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Prescription Tier</span>
            <span className="text-[14px] font-bold text-text-ink truncate">DEA Schedule II - V</span>
          </div>
        </div>
        <div className="bg-card-surface border border-surface-container rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-center shrink-0 text-primary shadow-sm">
            <span className="material-symbols-outlined text-[24px]">key</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Digital Signature</span>
            <span className="text-[14px] font-bold text-text-ink truncate">FIPS 140-3 Hardware Token</span>
          </div>
        </div>
        <div className="bg-card-surface border border-surface-container rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-center shrink-0 text-accent-dark shadow-sm">
            <span className="material-symbols-outlined text-[24px]">group</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Cohort Scope</span>
            <span className="text-[14px] font-bold text-text-ink truncate">Pulmonology & Gen Med</span>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Patients */}
        <div className="bg-card-surface border border-surface-container rounded-xl p-8 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">personal_injury</span>
                </div>
                <h3 className="text-[18px] font-bold text-text-ink">1. Patients</h3>
              </div>
              <span className="bg-success-bg border border-clinical-success/20 text-clinical-success text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider">3 / 4 Enabled</span>
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm group">
                <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">View Patient Directory</span>
                <input defaultChecked className="w-5 h-5 rounded accent-primary cursor-pointer" type="checkbox"/>
              </label>
              <label className="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm group">
                <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">Register New Patients</span>
                <input defaultChecked className="w-5 h-5 rounded accent-primary cursor-pointer" type="checkbox"/>
              </label>
              <label className="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm group">
                <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">Edit Demographics & History</span>
                <input defaultChecked className="w-5 h-5 rounded accent-primary cursor-pointer" type="checkbox"/>
              </label>
              <label className="flex items-center justify-between p-4 rounded-lg bg-warning-bg border border-clinical-warning/20 cursor-pointer shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-text-ink">Export Patient Records</span>
                  <span className="material-symbols-outlined text-clinical-warning text-[20px]">lock</span>
                </div>
                <input className="w-5 h-5 rounded accent-primary cursor-pointer" type="checkbox"/>
              </label>
            </div>
          </div>
          <div className="mt-6 pt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted border-t border-surface-container">
            <span>PHI Security: Standard</span>
            <span className="font-bold text-primary">HIPAA Tier 2</span>
          </div>
        </div>

        {/* Prescriptions */}
        <div className="bg-card-surface border border-surface-container rounded-xl p-8 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">medication</span>
                </div>
                <h3 className="text-[18px] font-bold text-text-ink">5. Prescription</h3>
              </div>
              <span className="bg-container-tint border border-primary/20 text-primary text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider">Attending Signoff</span>
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm group">
                <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">Synthesize AI Formulations</span>
                <input defaultChecked className="w-5 h-5 rounded accent-primary cursor-pointer" type="checkbox"/>
              </label>
              <label className="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm group">
                <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">Edit Dosages & Formulary</span>
                <input defaultChecked className="w-5 h-5 rounded accent-primary cursor-pointer" type="checkbox"/>
              </label>
              <label className="flex items-center justify-between p-4 rounded-lg bg-success-bg border border-clinical-success/20 cursor-pointer shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-text-ink">Cryptographic E-Sign & Finalize</span>
                  <span className="material-symbols-outlined text-clinical-success text-[20px]">shield</span>
                </div>
                <input defaultChecked className="w-5 h-5 rounded accent-primary cursor-pointer" type="checkbox"/>
              </label>
            </div>
          </div>
          <div className="mt-6 pt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted border-t border-surface-container">
            <span>EPCS Certification: Valid</span>
            <span className="font-bold text-clinical-success">DEA Compliant</span>
          </div>
        </div>

        {/* MedScribe AI */}
        <div className="bg-card-surface border border-surface-container rounded-xl p-8 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
                </div>
                <h3 className="text-[18px] font-bold text-text-ink">6. MedScribe AI</h3>
              </div>
              <span className="bg-success-bg border border-clinical-success/20 text-clinical-success text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider">3 / 3 Enabled</span>
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm group">
                <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">Activate Ambient Mic</span>
                <input defaultChecked className="w-5 h-5 rounded accent-primary cursor-pointer" type="checkbox"/>
              </label>
              <label className="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm group">
                <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">Trigger Ambient Scribe</span>
                <input defaultChecked className="w-5 h-5 rounded accent-primary cursor-pointer" type="checkbox"/>
              </label>
              <label className="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm group">
                <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">Edit Clinical Vocabulary</span>
                <input defaultChecked className="w-5 h-5 rounded accent-primary cursor-pointer" type="checkbox"/>
              </label>
            </div>
          </div>
          <div className="mt-6 pt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted border-t border-surface-container">
            <span>Latency: &lt;140ms Streaming</span>
            <span className="font-bold text-primary">Zero Retention</span>
          </div>
        </div>
      </div>

      {/* Assigned Doctors */}
      <div className="bg-card-surface border border-surface-container rounded-xl p-8 shadow-sm flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container pb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">badge</span>
            <h3 className="text-[20px] font-bold text-text-ink">Assigned Doctors (12 Total Clinicians)</h3>
          </div>
          <Link href="/admin/users" className="text-[13px] text-primary hover:text-accent-dark font-bold flex items-center gap-1.5 bg-surface-container-low px-4 py-2 rounded-lg border border-surface-container shadow-sm transition-colors">
            <span>Manage Cohort in Users</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm">
            <img className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-primary/10" alt="Eleanor Vance" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzQ2cALbirGg7bcKgvzwlZDpPyDxKbw5E6otzZuXm7uOJmPlkMWmVDUEe7U2486W9Y2TPd-2r7HEQ2t2Cy9FZXrhkSVPkQqXXlO0SP5i7uyEGA9eKJ95ke4247lfrbSBwrdgGI3PjWn7iNur4lTb5Fu5xeST784v893N4SHkbW-J83CPQ-ie0RPtFvYPE4zyvt32dxUbdxJUpwCSlS82UBtXb9Ere18_nqBV_0-eM6cOlJM0yOKvlqdQ"/>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-text-ink truncate">Dr. Eleanor Vance, MD</span>
              <span className="text-[12px] font-bold text-text-muted truncate">Pulmonology (Lead)</span>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => router.push('/admin/users/kevin-zhao')}>
            <img className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-primary/10" alt="Kevin Zhao" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQrUzMlWUicxUGogMVXV4Atf_HgPORjepf929X-CqZoq0wYuBQYE44f9KiTt9avjxHCSsu4hrEZxseM4ap63m09ZIUYZ1mYo78VGHeoZgbeF_J1jxuvuGJp-iHfocCzknvMabp__3zAtTbfCulno94FodneIIiF14PDYiheGG8J3L6p4r_h8QhPf8FjcxobxUqwcZ2_pA3VlKyzVmDZm2QiHdm17ImjzXbW2Z_my0NSokT_T8zu9xbqQ"/>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-text-ink truncate group-hover:text-primary transition-colors">Dr. Kevin Zhao, MD</span>
              <span className="text-[12px] font-bold text-text-muted truncate">Orthopedic Surgery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
