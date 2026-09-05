"use client";
import React from "react";
import Link from "next/link";

export default function AdminRolesAndPermissionsPage() {
  const roles = [
    { title: 'Administrator', code: 'ADMIN-ROOT', badge: 'Full Governance', color: 'bg-primary', desc: 'Unrestricted access to clinic governance, user onboarding, join request approvals, cryptographic audit ledgers, and billing configuration.', assigned: '2', activeGroups: '9/9 Groups Active', target: '/admin/roles/doctor' },
    { title: 'Doctor', code: 'PHYS-SCH2', badge: 'Clinical & Prescribing', color: 'bg-clinical-success', desc: 'Full patient consultation, EHR access, ambient voice scribing, diagnostic workflows, and legal digital signature authority for Schedule II-V e-prescriptions.', assigned: '12', activeGroups: '5 Core Clinical Groups', target: '/admin/roles/doctor' },
    { title: 'Receptionist', code: 'FRONT-DESK', badge: 'Front Desk & Queue', color: 'bg-clinical-warning', desc: 'Patient intake, appointment scheduling, patient registration, insurance verification, and clinic queue triage management.', assigned: '3', activeGroups: '3 Groups Enabled', target: '/admin/roles/doctor' },
    { title: 'Compounder', code: 'PHARM-DISP', badge: 'Fulfillment & Dispensing', color: 'bg-accent-light', desc: 'Prescription queue monitoring, compound packaging verification, lot tracking, cold chain logging, and marking prescriptions as dispensed.', assigned: '3', activeGroups: 'Pharmacy Group Active', target: '/admin/roles/doctor' },
    { title: 'Nurse', code: 'CLINIC-NURSE', badge: 'Clinical Support', color: 'bg-secondary', desc: 'Vitals logging, triage notes, patient rooming, administering prescribed medications, and physician consultation assist.', assigned: '2', activeGroups: 'Encounter Intake', target: '/admin/roles/doctor' },
    { title: 'Assistant', code: 'OPS-MEDAID', badge: 'Operational Support', color: 'bg-outline-variant', desc: 'Basic patient records viewing, document scanning, equipment maintenance, and clinic schedule assistance.', assigned: '2', activeGroups: '2 View Groups', target: '/admin/roles/doctor' },
  ];

  return (
    <div className="p-10 xl:p-14 flex flex-col gap-10 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-3xl">
          <div className="flex items-center gap-2 text-text-muted text-[11px] uppercase tracking-wider font-bold">
            <span>Security & Governance</span>
            <span>/</span>
            <span className="text-primary">RBAC Architecture</span>
          </div>
          <h1 className="text-[32px] font-bold text-text-ink tracking-tight">Role-Based Access Control (RBAC)</h1>
          <p className="text-[15px] font-medium text-text-muted">
            Define system roles, clinical authorization levels, and operational permission boundaries across Metropolitan Health Medical Center.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/admin/audit-log" className="h-12 px-6 rounded-lg bg-card-surface border border-surface-container text-text-ink text-[14px] font-bold shadow-sm hover:bg-surface-container-lowest transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-text-muted">history_edu</span>
            <span>Matrix Log</span>
          </Link>
          <Link href="/admin/create-custom-role" className="h-12 px-6 rounded-lg bg-primary text-white text-[14px] font-bold shadow-md hover:bg-accent-dark transition-all flex items-center gap-2 border border-primary-container">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Create Custom Role</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {roles.map((r, idx) => (
          <div key={idx} className="bg-card-surface border border-surface-container rounded-xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${r.color}`}></div>
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-surface-container-low border border-surface-container text-primary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[28px]">shield_person</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h2 className="text-[20px] font-bold text-text-ink leading-tight group-hover:text-primary transition-colors">{r.title}</h2>
                    <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">{r.code}</span>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-container-tint border border-primary/20 text-primary text-[11px] font-bold shadow-sm">
                  {r.badge}
                </span>
              </div>
              <p className="text-[13px] font-medium text-text-muted min-h-[60px] leading-relaxed">
                {r.desc}
              </p>
            </div>
            <div className="pt-5 mt-5 flex items-center justify-between border-t border-surface-container">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface-container-high border border-surface-container text-text-ink text-[12px] font-bold shadow-sm">{r.assigned}</span>
                <span className="text-[12px] font-bold text-text-muted">Users Assigned</span>
              </div>
              <Link href={r.target} className="inline-flex items-center gap-1 text-primary text-[13px] font-bold hover:text-accent-dark transition-colors">
                <span>View Role Details</span>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-xl bg-card-surface border border-surface-container p-8 shadow-sm">
        <div className="absolute inset-y-0 left-0 w-2 bg-primary"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-2">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-container-tint border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">science</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-[18px] font-bold text-text-ink">Custom Roles Active: Clinical Research Associate (CRA)</span>
                <span className="px-2.5 py-1 rounded-md bg-success-bg border border-clinical-success/20 text-clinical-success text-[11px] font-bold shadow-sm">De-Identified Data Only</span>
              </div>
              <p className="text-[13px] font-medium text-text-muted mt-0.5">
                Targeted protocol auditing, blinded trial enrollment tracking, and anonymized longitudinal biomarker extracts.
              </p>
            </div>
          </div>
          <Link href="/admin/create-custom-role" className="h-10 px-5 rounded-lg bg-surface-container-low border border-surface-container hover:bg-surface-container text-text-ink text-[13px] font-bold transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap">
            <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
            <span>Configure Role</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
