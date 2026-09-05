"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function AdminCreateCustomRolePage() {
  const { showToast: addToast } = useApp();
  const router = useRouter();
  const [roleName, setRoleName] = useState('Clinical Research Coordinator');
  const [tier, setTier] = useState('Clinical Specialist');
  const [grants, setGrants] = useState<Record<string, boolean>>({
    'view-patients': true,
    'view-encounters': true,
    'edit-demographics': false,
    'view-schedules': true,
    'book-trials': true,
    'view-queue': true,
    'call-patient': false,
    'view-closed': true,
    'start-consult': false,
    'view-rx': true,
    'view-audio': true,
    'ambient-scribe': false,
    'access-analytics': true,
    'export-csv': true,
    'view-directory': true,
    'manage-users': false,
    'clinic-settings': false
  });

  const totalActive = Object.values(grants).filter(Boolean).length;
  const totalPossible = 17;

  const toggleGrant = (key: string) => {
    setGrants(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreate = () => {
    addToast({ title: 'Role Created', description: 'Custom Role Activated!', type: 'success' });
    setTimeout(() => router.push('/admin/roles-and-permissions'), 1200);
  };

  return (
    <div className="px-10 xl:px-14 pt-10 pb-28 flex flex-col gap-10 max-w-[1600px] mx-auto w-full relative">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-text-muted text-[13px] font-bold mb-3">
            <Link href="/admin/roles-and-permissions" className="hover:text-primary transition-colors">Roles & Permissions</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-text-ink">Create Custom Role</span>
          </nav>
          <h1 className="text-[32px] font-bold text-text-ink tracking-tight">Create Custom Clinical Role</h1>
          <p className="text-[15px] font-medium text-text-muted mt-2 max-w-3xl">
            Establish specific operational boundaries and permissions for specialized medical staff or visiting researchers.
          </p>
        </div>
        <div className="bg-card-surface p-4 rounded-xl shadow-sm border border-surface-container flex items-center gap-4 min-w-[260px]">
          <div className="relative w-14 h-14 bg-surface-container-low border border-surface-container rounded-lg flex items-center justify-center shadow-inner">
            <span className="text-[20px] font-bold text-text-ink">{totalActive}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Active Grants</span>
            <span className="text-[14px] font-bold text-primary">{totalActive} of {totalPossible} Selected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-card-surface rounded-xl p-8 shadow-sm border border-surface-container flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-container">
            <h2 className="text-[20px] font-bold text-text-ink">1. Role Identity & Scope</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-text-ink">Role Name <span className="text-clinical-error">*</span></label>
              <input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary shadow-sm"
                type="text"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-text-ink">Institutional Access Level Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
              >
                <option>Standard Staff</option>
                <option>Clinical Specialist</option>
                <option>Administrative</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-primary text-white rounded-xl p-8 shadow-md flex flex-col justify-between border border-primary-container relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/20 border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              Safety Protocol 11.B
            </span>
            <h2 className="text-[20px] font-bold text-white mt-4">Strict Clinical Guardrails</h2>
            <p className="text-[13px] font-medium text-white/90 mt-3 leading-relaxed">
              Custom roles automatically inherit cryptographic audit logging. Any modification to scheduled drug prescriptions is permanently locked to verified MD credentials.
            </p>
          </div>
          <div className="mt-6 pt-5 border-t border-white/20 flex justify-between text-white/90 text-[13px] font-bold relative z-10">
            <span>Sign-off Enforced:</span>
            <strong className="flex items-center gap-1.5 text-white"><span className="material-symbols-outlined text-[16px]">lock</span> Required</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
        {/* Patients Box */}
        <div className="bg-card-surface border border-surface-container rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-container">
            <span className="text-[18px] font-bold text-text-ink">Patients</span>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer select-none group">
              <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">View Patient List</span>
              <input type="checkbox" checked={grants['view-patients']} onChange={() => toggleGrant('view-patients')} className="w-5 h-5 accent-primary cursor-pointer"/>
            </label>
            <label className="flex items-center justify-between cursor-pointer select-none group">
              <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">View Encounter History</span>
              <input type="checkbox" checked={grants['view-encounters']} onChange={() => toggleGrant('view-encounters')} className="w-5 h-5 accent-primary cursor-pointer"/>
            </label>
            <label className="flex items-center justify-between cursor-pointer select-none group">
              <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">Edit Demographics</span>
              <input type="checkbox" checked={grants['edit-demographics']} onChange={() => toggleGrant('edit-demographics')} className="w-5 h-5 accent-primary cursor-pointer"/>
            </label>
          </div>
        </div>

        {/* Prescriptions Strict */}
        <div className="bg-card-surface border-2 border-clinical-warning/30 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-warning-bg/50 rounded-bl-full -z-0"></div>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-container relative z-10">
            <span className="text-[18px] font-bold text-text-ink">Prescriptions</span>
            <span className="text-[11px] bg-warning-bg border border-clinical-warning/20 text-clinical-warning px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm">Strict Policy</span>
          </div>
          <div className="space-y-4 relative z-10">
            <label className="flex items-center justify-between cursor-pointer select-none group">
              <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">View Prescriptions</span>
              <input type="checkbox" checked={grants['view-rx']} onChange={() => toggleGrant('view-rx')} className="w-5 h-5 accent-primary cursor-pointer"/>
            </label>
            <div className="flex items-center justify-between p-3 bg-error-bg border border-clinical-error/20 rounded-lg shadow-inner">
              <span className="text-[13px] text-clinical-error font-bold">Draft / Sign Prescriptions (Locked)</span>
              <span className="material-symbols-outlined text-clinical-error text-[20px]">lock</span>
            </div>
          </div>
        </div>

        {/* Reports */}
        <div className="bg-card-surface border border-surface-container rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-container">
            <span className="text-[18px] font-bold text-text-ink">Reports & Analytics</span>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer select-none group">
              <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">Access Research Analytics</span>
              <input type="checkbox" checked={grants['access-analytics']} onChange={() => toggleGrant('access-analytics')} className="w-5 h-5 accent-primary cursor-pointer"/>
            </label>
            <label className="flex items-center justify-between cursor-pointer select-none group">
              <span className="text-[14px] font-bold text-text-ink group-hover:text-primary transition-colors">Export De-identified CSV</span>
              <input type="checkbox" checked={grants['export-csv']} onChange={() => toggleGrant('export-csv')} className="w-5 h-5 accent-primary cursor-pointer"/>
            </label>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-72 right-0 bg-card-surface/95 backdrop-blur-md px-10 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-surface-container flex items-center justify-between z-40">
        <button onClick={() => router.push('/admin/roles-and-permissions')} className="px-6 py-2.5 bg-surface-container-lowest border border-surface-container hover:bg-surface-container text-text-ink text-[14px] font-bold rounded-lg shadow-sm transition-colors cursor-pointer">
          Cancel
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => addToast({ title: 'Draft Saved', description: 'Draft saved successfully', type: 'info' })} className="px-6 py-2.5 border border-surface-container text-text-muted hover:text-text-ink text-[14px] font-bold rounded-lg transition-colors cursor-pointer bg-transparent">
            Save Draft
          </button>
          <button onClick={handleCreate} className="px-8 py-2.5 bg-primary hover:bg-accent-dark text-white rounded-lg text-[14px] font-bold shadow-md border border-primary-container transition-all active:scale-95 cursor-pointer">
            Create Role
          </button>
        </div>
      </div>
    </div>
  );
}
