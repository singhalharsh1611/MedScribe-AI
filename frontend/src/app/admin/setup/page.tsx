"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminSetupOverviewPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [loadingContinue, setLoadingContinue] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("CLINIC-84920-SF");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    setLoadingContinue(true);
    setTimeout(() => {
      router.push("/admin/setup/default-roles");
    }, 500);
  };

  return (
    <div className="px-10 py-12 max-w-7xl mx-auto w-full flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 bg-container-tint px-3 py-1.5 rounded-full border border-primary/20">
            <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
            <span className="text-[11px] uppercase tracking-wider text-primary font-bold">Onboarding Phase 1</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-text-muted">
            <span className="text-text-ink">Step 1 of 3</span>
            <span className="text-outline-variant">/</span>
            <span>Initial Configuration Review</span>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-3xl">
            <h1 className="text-[32px] sm:text-[36px] font-bold leading-tight text-text-ink tracking-tight">Clinic Administration Setup</h1>
            <p className="text-[16px] text-text-muted font-medium">
              Step 1 of 3: Initial Configuration Review. Review your practice structure and security parameters before finalizing clinician access permissions.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-card-surface rounded-xl p-4 shadow-sm flex-shrink-0 border border-surface-container">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-surface-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="33.3, 100" strokeLinecap="round" strokeWidth="3.5"></path>
              </svg>
              <span className="absolute font-bold text-[13px] text-primary">33%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold mb-1">Setup Velocity</span>
              <span className="font-bold text-[15px] text-text-ink">1 of 3 Stages Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card-surface p-5 rounded-xl shadow-sm flex items-center gap-4 border-l-4 border-l-primary border-t border-r border-b border-surface-container">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[16px] flex-shrink-0 shadow-sm">1</div>
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] text-text-ink font-bold truncate mb-0.5">Practice Verification</span>
            <span className="text-[12px] text-clinical-success font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-clinical-success shadow-sm"></span>Active Stage
            </span>
          </div>
        </div>
        <Link href="/admin/setup/default-roles" className="bg-surface-container-lowest hover:bg-card-surface p-5 rounded-xl shadow-sm flex items-center gap-4 border border-surface-container transition-all">
          <div className="w-10 h-10 rounded-full bg-surface-container-high border border-surface-container flex items-center justify-center text-text-muted font-bold text-[16px] flex-shrink-0">2</div>
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-bold text-text-ink truncate mb-0.5">Default Roles</span>
            <span className="text-[12px] text-text-muted font-medium">6 standard tiers</span>
          </div>
        </Link>
        <Link href="/admin/setup/access-permissions" className="bg-surface-container-lowest hover:bg-card-surface p-5 rounded-xl shadow-sm flex items-center gap-4 border border-surface-container transition-all">
          <div className="w-10 h-10 rounded-full bg-surface-container-high border border-surface-container flex items-center justify-center text-text-muted font-bold text-[16px] flex-shrink-0">3</div>
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-bold text-text-ink truncate mb-0.5">Voice Workstations</span>
            <span className="text-[12px] text-text-muted font-medium">HIPAA microphone rules</span>
          </div>
        </Link>
      </div>

      {/* Master Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Clinic Info Card */}
          <div className="bg-card-surface rounded-xl p-8 shadow-sm flex flex-col gap-6 border border-surface-container">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[32px]">local_hospital</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-1">Verified Facility Record</span>
                  <h2 className="text-[20px] font-bold text-text-ink">Metropolitan Health Medical Center</h2>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success-bg border border-clinical-success/20 text-clinical-success text-[12px] font-bold shadow-sm">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Geocoded
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-surface-container-lowest border border-surface-container p-5 rounded-lg flex flex-col gap-2 shadow-sm">
                <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold">Physical Site</span>
                <p className="text-[13px] text-text-ink leading-relaxed font-bold">
                  742 Evergreen Medical Parkway, Suite 400<br/>San Francisco, CA 94107
                </p>
              </div>
              <div className="bg-surface-container-lowest border border-surface-container p-5 rounded-lg flex flex-col gap-2 shadow-sm">
                <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold mb-1">Official Inbound Channels</span>
                <div className="flex items-center gap-2 text-text-ink text-[13px] font-bold">
                  <span className="material-symbols-outlined text-[18px] text-primary">call</span>
                  <span>+1 (415) 890-2300</span>
                </div>
                <div className="flex items-center gap-2 text-text-ink text-[13px] font-bold">
                  <span className="material-symbols-outlined text-[18px] text-primary">mail</span>
                  <span className="truncate">intake@metrohealth-sf.org</span>
                </div>
              </div>
            </div>

            {/* Clinic ID Box */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-surface-container border border-surface-container-highest shadow-inner">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-secondary text-[24px]">fingerprint</span>
                <div className="flex flex-col">
                  <span className="text-[12px] text-text-muted font-bold mb-0.5">Global Practice ID Token</span>
                  <span className="font-bold text-[16px] text-text-ink tracking-wide">CLINIC-84920-SF</span>
                </div>
              </div>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card-surface border border-surface-container text-text-ink text-[12px] font-bold shadow-sm hover:bg-surface-container-lowest transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Telemetry Map */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold">Premises Telemetry Map</span>
              <div className="w-full h-40 bg-cover bg-center rounded-lg shadow-sm relative overflow-hidden border border-surface-container-high" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBaoHFTNzq5qDra1fFrYK_7mClHNZKppr0-LMWNvCSeq04qr4LvAk7pK7DdUjvboIUH7HS2GxvKXHUG2O9L2DW2DkrHyjn1JZ4JHF3lt5NlZv0qXwhV7nE0R2O5HlYVFxdP1FtpySFK15HyP_nxHDIqgkMDKKlF02WQJnc2LOogMjNhLjUejJy1Pdcms7iCwPudAlUYErE9TOa4kroYwqoQXqpT5aQPb0WaYDangx3P5dtDCPPzQq_uGA')` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-text-ink/80 via-transparent to-transparent flex items-end p-3">
                  <div className="inline-flex items-center gap-1.5 text-white text-[12px] font-bold bg-text-ink/60 px-3 py-1.5 rounded backdrop-blur border border-white/10 shadow-sm">
                    <span className="material-symbols-outlined text-[18px] text-accent-light">pin_drop</span>
                    <span>Bay Area Health Infrastructure Corridor · Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Identity Card */}
          <div className="bg-card-surface rounded-xl p-8 shadow-sm flex flex-col gap-6 border border-surface-container">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    className="w-16 h-16 rounded-full object-cover shadow-sm ring-4 ring-primary/10" 
                    alt="Dr. Eleanor Vance" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbx7_rD3RT3pbRGIA5oRWJcFceC-XUuqPxlsWKYD_1iumjwK-taORWzAkkjJ8VRbhdTYgCvK7s3f_1kQvp8dwcoZfboo34NDd-bucrnot6b_pSf37c7XxT71kgeN9HhHWEo13KNJHde5v3Jj9b4f_9p7oy--IdnX8byb9xHPu5nVUvSO-_xxGMhWnsAR81OSxzctyjf0mf14FsYn6z6RkW8HiUS0_FD62iC5rpI1RAp7PEXcxX_tOp_Q" 
                  />
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-clinical-success ring-2 ring-card-surface"></span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-[18px] font-bold text-text-ink">Dr. Eleanor Vance, MD</h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-container-tint border border-primary/20 text-primary text-[11px] font-bold">Primary</span>
                  </div>
                  <span className="text-[13px] text-text-muted font-bold">Founding Physician & Primary Clinic Administrator</span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded bg-success-bg border border-clinical-success/20 text-clinical-success text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">shield_person</span> Direct Authority
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col shadow-sm">
                <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold mb-1">National Provider Identifier</span>
                <span className="text-[18px] font-bold text-text-ink tracking-tight mt-0.5">1849204918</span>
                <span className="text-[12px] text-clinical-success font-bold mt-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check</span> NPPES Registry Verified
                </span>
              </div>
              <div className="p-4 bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col shadow-sm">
                <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold mb-1">State Licensure</span>
                <span className="text-[18px] font-bold text-text-ink tracking-tight mt-0.5">Med Board #A14289</span>
                <span className="text-[12px] text-clinical-success font-bold mt-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check</span> California Good Standing
                </span>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-surface-container-low flex gap-4 items-start border border-surface-container shadow-inner mt-2">
              <span className="material-symbols-outlined text-primary text-[24px] flex-shrink-0 mt-0.5">policy</span>
              <div className="flex flex-col gap-1">
                <span className="text-[14px] text-text-ink font-bold">Founding Governance Scope</span>
                <p className="text-[13px] text-text-muted font-medium leading-relaxed">
                  As the founding physician, your account holds unconditional administrative authority over roles, staff onboarding, and voice workstation provisioning. Changes you execute propagate instantaneously across real-time documentation agents.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-card-surface rounded-xl p-8 shadow-sm flex flex-col gap-6 border border-surface-container">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold mb-1">Next Sequential Phase</span>
              <h3 className="text-[20px] font-bold text-text-ink">Confirm Review & Proceed</h3>
              <p className="text-[14px] text-text-muted font-medium leading-relaxed">
                Advancing loads default permission matrices for review, clinician team roster assignment, and ambient microphone hardware pairing.
              </p>
            </div>
            <div className="flex flex-col gap-4 mt-2">
              <button 
                onClick={handleContinue}
                disabled={loadingContinue}
                className="w-full h-14 bg-primary hover:bg-accent-dark text-white font-bold text-[15px] rounded-lg flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] group cursor-pointer border border-primary-container"
              >
                {loadingContinue ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                    <span>Loading Default Roles...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Default Roles</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-between px-2 text-text-muted text-[12px] font-bold mt-1">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-clinical-success">check</span>
                  Draft auto-saved 14s ago
                </span>
                <span className="text-text-muted font-bold">Screen 01 / 03</span>
              </div>
            </div>
          </div>

          {/* Administrative Support Box */}
          <div className="p-5 rounded-xl bg-card-surface shadow-sm flex items-center gap-4 border border-surface-container">
            <div className="w-12 h-12 rounded-lg bg-surface-container border border-surface-container-highest flex items-center justify-center text-primary flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">contact_support</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] text-text-ink font-bold mb-0.5">Need assistance configuring your clinic?</span>
              <span className="text-[12px] text-text-muted font-bold truncate">SleekCare Health concierge implementation is on standby.</span>
            </div>
          </div>

          {/* Direct Jump Link for quick testing */}
          <div className="p-5 rounded-xl bg-surface-container-lowest border-2 border-dashed border-surface-container flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-text-ink mb-0.5">Jump straight to Live Workspace:</span>
              <span className="text-[11px] text-text-muted font-bold">View completed operational console</span>
            </div>
            <Link href="/admin/setup/dashboard" className="px-4 py-2 rounded-lg bg-card-surface border border-surface-container hover:bg-surface-container-lowest text-primary text-[13px] font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer">
              <span>Dashboard</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
