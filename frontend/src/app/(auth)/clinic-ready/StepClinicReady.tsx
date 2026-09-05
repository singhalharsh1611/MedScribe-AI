"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function ClinicReadyPage({ onNext }: { onNext: (step: string, data?: any) => void }) {
  const [copied, setCopied] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setLoading(false);
          return;
        }
        const userObj = JSON.parse(userStr);
        const { user } = await api.auth.me(userObj.id);
        setUserData(user);
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const copyId = () => {
    if (userData && userData.clinic_id) {
      navigator.clipboard.writeText(`CLINIC-${userData.clinic_id}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden px-4 md:px-margin-desktop py-space-xl md:py-space-3xl flex items-center justify-center">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-b from-clinical-success/10 via-secondary-container/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-low shadow-sm mb-space-lg">
          <span className="w-2 h-2 rounded-full bg-clinical-success animate-ping"></span>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Clinical Workspace Provisioned • Step 06 of 06</span>
        </div>

        <div className="relative flex items-center justify-center mb-space-lg">
          <div className="absolute w-28 h-28 rounded-full bg-success-bg animate-pulse"></div>
          <div className="absolute w-36 h-36 rounded-full bg-success-bg/40 scale-105"></div>
          <div className="relative w-20 h-20 rounded-full bg-card-surface shadow-xl flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-clinical-success flex items-center justify-center text-card-surface shadow-md">
              <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>check</span>
            </div>
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-space-xs mb-space-xl">
          <h1 className="text-[36px] font-bold text-text-ink tracking-tight">Your clinic is ready</h1>
          <p className="text-[16px] text-on-surface-variant max-w-xl mx-auto">
            You are the first doctor in this clinic, so you have been assigned <span className="font-bold text-primary">Admin access</span> automatically.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-gutter-desktop mb-space-xl">
          <div className="md:col-span-7 bg-card-surface rounded-xl p-space-lg shadow-md flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-space-md mb-space-md">
                <div className="flex items-center gap-space-xs text-secondary">
                  <span className="material-symbols-outlined text-[20px]">local_hospital</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide">Registered Institution</span>
                </div>
                <span className="px-space-xs py-1 rounded bg-success-bg text-clinical-success text-[11px] font-semibold">Instant Provisioning</span>
              </div>
              <div className="space-y-space-md">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase">Clinic Entity</span>
                  <p className="text-[22px] font-bold text-text-ink tracking-tight mt-space-2xs">{userData?.clinic_name || 'Loading...'}</p>
                </div>
                <div className="grid grid-cols-2 gap-space-md pt-space-xs">
                  <div className="bg-surface-container-low p-space-sm rounded-lg">
                    <span className="text-[11px] font-semibold text-text-muted block">Practitioner in Charge</span>
                    <span className="text-[15px] font-bold text-text-ink mt-space-2xs block truncate">{userData?.name || 'Loading...'}</span>
                  </div>
                  <div className="bg-surface-container-low p-space-sm rounded-lg">
                    <span className="text-[11px] font-semibold text-text-muted block">Assigned Role</span>
                    <div className="flex items-center gap-space-2xs mt-space-2xs">
                      <span className="px-space-xs py-1 rounded bg-container-tint text-primary text-[11px] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
                        {userData?.role === 'admin' ? 'Admin' : 'Doctor'}
                      </span>
                      <span className="text-clinical-success text-[11px] font-semibold">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-space-lg pt-space-md border-t border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">fingerprint</span>
                <div>
                  <span className="text-[11px] font-semibold text-text-muted block">Facility Access Identifier</span>
                  <span className="text-[15px] font-bold font-mono text-primary tracking-wide">CLINIC-{userData?.clinic_id || '----'}</span>
                </div>
              </div>
              <button onClick={copyId} className="self-start sm:self-center px-space-sm py-1 rounded bg-surface-container hover:bg-surface-container-highest transition-colors text-[11px] font-semibold text-on-surface flex items-center gap-1 cursor-pointer">
                <span className="material-symbols-outlined text-[14px]">{copied ? 'check' : 'content_copy'}</span>
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-5 bg-card-surface rounded-xl p-space-lg shadow-md border border-surface-container relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
            <div className="relative z-10 flex flex-col gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-container-tint text-primary flex items-center justify-center mb-space-2xs">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              </div>
              <h3 className="text-[16px] font-bold text-text-ink">Primary Authority Rule</h3>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                As the primary administrator, you can now configure clinic departments, invite associate physicians, and manage electronic medical record links.
              </p>
              <div className="mt-space-sm space-y-2">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-text-ink">
                  <span className="material-symbols-outlined text-[16px] text-clinical-success">check_circle</span>
                  <span>Zero Approvals Required</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-semibold text-text-ink">
                  <span className="material-symbols-outlined text-[16px] text-clinical-success">check_circle</span>
                  <span>Autonomous Delegation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-space-md p-space-md rounded-xl bg-card-surface shadow-md">
          <div className="flex items-center gap-space-sm text-on-surface-variant">
            <div className="w-8 h-8 rounded-full bg-container-tint flex items-center justify-center shrink-0 text-primary">
              <span className="material-symbols-outlined text-[18px]">forward</span>
            </div>
            <div>
              <span className="text-[13px] font-semibold text-text-ink block">Next: Admin Console Setup</span>
              <span className="text-[12px] text-text-muted">Department structure, voice scribe hardware pairing, and ambient microphones.</span>
            </div>
          </div>
          <button type="button" onClick={() => onNext('admin/overview')} className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-lg bg-primary hover:bg-accent-dark text-card-surface font-bold text-[18px] shadow-lg transition-all hover:-translate-y-0.5 no-underline">
            <span>Set Up Clinic</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
