"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function RegisterConfirmationPage() {
  const { currentPatient, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  // Fallback data in case currentPatient is empty
  const patient = currentPatient || {
    name: "Maya Lin Harrison",
    phone: "+1 (555) 849-2041",
    uhid: "UHID-MH-2024-88412",
    age: "32 yrs",
    gender: "Female",
    dob: "1991-08-14",
    photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB47H0mBuvtRBI91-e_1-_AQc1VZUhIdW__l3H3EuVcq3KTu5NKo8pyUiMNoQ6grSCTnbjYG8ZRx2O3wuLjkOcVZaUeU_eG8CK9rTvV8rZHN686cqY8h6G9SmDjk22Mt8b1uvP4exn3WJ-TAbzcZHf90ZT882zAc6u7KjcZH-AQKztScbf0yPQ1e3Pq-1eGDGDXUB8n2zTHhlRiroSU2V24w0fqCff2KTgJTSaydLHg4fFWRObnHU_azg"
  };

  const copyToken = () => {
    navigator.clipboard?.writeText(patient.uhid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("UHID token copied to clipboard", "content_copy");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav className="flex items-center gap-2 text-[12px] text-text-muted font-semibold">
          <Link href="/reception/dashboard" className="hover:text-primary">Front Desk</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/reception/register" className="hover:text-primary">Patient Registration</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-text-ink font-bold flex items-center gap-1 bg-container-tint px-2.5 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-clinical-success"></span> Confirmation
          </span>
        </nav>
        <div className="text-[12px] font-bold text-text-muted bg-surface-container-lowest px-3 py-1 rounded-lg border border-surface-container flex items-center gap-2">
          <span className="material-symbols-outlined text-clinical-success text-[16px]">sync_saved_locally</span>
          <span>EHR Cloud Synced (0.18s) • Node #02</span>
        </div>
      </div>

      {/* Success Banner */}
      <div className="bg-card-surface rounded-xl shadow-sm border border-surface-container p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-success-bg flex items-center justify-center text-clinical-success shrink-0 shadow-sm border border-clinical-success/20">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-success-bg text-clinical-success text-[12px] font-bold shadow-sm">EMR Master Index Linked</span>
              <span className="px-2 py-0.5 rounded-full bg-container-tint text-primary text-[12px] font-bold shadow-sm">Status: Active Patient</span>
            </div>
            <h1 className="text-[24px] font-bold text-text-ink tracking-tight mt-0.5">Patient registered successfully</h1>
            <p className="text-[12px] font-medium text-text-muted">New Electronic Health Record created and synchronized with Master Patient Index.</p>
          </div>
        </div>
        <div className="bg-surface-container-low px-4 py-2.5 rounded-lg text-right border border-surface-container">
          <span className="text-[10px] uppercase font-bold text-text-muted">Station Audit Key</span>
          <div className="text-[14px] font-mono font-bold text-primary">#REG-88412</div>
          <span className="text-[11px] font-semibold text-text-muted">Today • 09:42 AM</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-card-surface rounded-xl p-6 shadow-sm border border-surface-container space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-surface-container">
              <div className="flex items-center gap-4">
                <img
                  src={patient.photo}
                  alt={patient.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-surface-container"
                />
                <div>
                  <span className="text-[11px] font-bold text-primary uppercase">Tier 1 General Outpatient</span>
                  <h2 className="text-[20px] font-bold text-text-ink">{patient.name}</h2>
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-text-muted mt-0.5">
                    <span>{patient.age}</span>
                    <span>•</span>
                    <span>{patient.gender}</span>
                    <span>•</span>
                    <span>DOB: {patient.dob}</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container flex items-center gap-2">
                <code className="text-[14px] font-mono text-primary font-bold">{patient.uhid}</code>
                <button onClick={copyToken} className="p-1 text-text-muted hover:text-primary cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-[16px]">{copied ? "done" : "content_copy"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
              <div className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container space-y-2">
                <span className="text-text-muted uppercase font-bold text-[10px]">Contact Information</span>
                <div className="font-bold text-text-ink">{patient.phone} (Mobile)</div>
                <div className="text-text-muted font-medium">742 Evergreen Terrace, Apt 4B</div>
              </div>

              <div className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container space-y-2">
                <span className="text-clinical-warning uppercase font-bold text-[10px]">Designated Emergency Contact</span>
                <div className="font-bold text-text-ink">Robert Harrison (Spouse)</div>
                <div className="text-text-muted font-medium">+1 (555) 849-2042 • Full Proxy Authorized</div>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="p-4 rounded-lg bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 border border-surface-container">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded border border-surface-container shadow-sm">
                  <span className="material-symbols-outlined text-[32px] text-text-ink">barcode</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold">Dispenser Validated Barcode</span>
                  <div className="font-mono text-[12px] font-bold text-text-ink">MH-88412-2024-C</div>
                </div>
              </div>
              <button onClick={() => window.print()} className="px-4 py-2 bg-surface-container-lowest hover:bg-surface-container transition-colors rounded-md border border-surface-container-highest text-[12px] font-bold flex items-center gap-1.5 shadow-sm cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-primary">print</span>
                Dispense Wristband & Card
              </button>
            </div>
          </div>
        </div>

        {/* Contextual Sidecar */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container space-y-3">
            <span className="text-[12px] font-bold text-text-ink">Next Workflow Steps</span>
            <p className="text-[12px] font-medium text-text-muted">
              Patient registration is complete. Transition patient into scheduling or assign directly to walk-in queue.
            </p>
            <div className="space-y-2 pt-1">
              <Link href="/reception/appointments" className="w-full py-2.5 rounded-lg bg-primary-container hover:bg-accent-dark text-on-primary text-[12px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                Create Appointment
              </Link>
              <Link href="/reception/queue" className="w-full py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-text-ink text-[12px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">group_add</span>
                Direct to Queue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
