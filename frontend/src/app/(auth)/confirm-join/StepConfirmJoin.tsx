"use client";

import { useState } from "react";

export default function ConfirmJoinPage({ onNext }: { onNext: (step: string, data?: any) => void }) {
    const [attest, setAttest] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!attest) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onNext('request-pending');
    }, 600);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 md:px-margin-desktop py-space-xl">
      <div className="w-full flex items-center justify-between pb-space-lg">
        <button type="button" onClick={() => onNext('find-clinic')} className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-primary transition-colors text-[13px] font-semibold no-underline">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Directory</span>
        </button>
        <div className="hidden sm:flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs text-clinical-success text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
            <span>EHR Registry Interlink Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
        <section className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className="bg-card-surface rounded-xl p-space-lg md:p-space-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent-light to-clinical-success"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-lg">
              <div>
                <div className="inline-flex items-center gap-space-xs px-space-xs py-1 rounded bg-container-tint text-primary text-[11px] font-semibold mb-space-xs">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>FED-RELAY ROUTED DISPATCH</span>
                </div>
                <h1 className="text-[28px] font-bold text-text-ink tracking-tight">Confirm Join Request</h1>
                <p className="text-[14px] text-on-surface-variant mt-space-2xs">Verify target institution assignment and clinical credential routing before dispatching authorization tickets.</p>
              </div>
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-[32px]">domain_verification</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg py-space-md">
              <div className="bg-surface-container-low rounded-lg p-space-md">
                <div className="flex items-center justify-between pb-space-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-space-2xs">
                    <span className="material-symbols-outlined text-[15px] text-primary">local_hospital</span>
                    Target Facility
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-card-surface text-primary shadow-sm">ID: SJM-94112</span>
                </div>
                <h3 className="text-[18px] font-bold text-text-ink">St. Jude Medical Center</h3>
                <p className="text-[12px] text-on-surface-variant mt-space-2xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  San Francisco, CA
                </p>
                <div className="mt-space-sm pt-space-sm border-t border-surface-container">
                  <span className="text-[10px] font-semibold text-text-muted uppercase">Designated Department</span>
                  <span className="text-[15px] font-bold text-accent-dark block">Cardiopulmonary & Internal Medicine</span>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-lg p-space-md">
                <div className="flex items-center justify-between pb-space-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-space-2xs">
                    <span className="material-symbols-outlined text-[15px] text-primary">badge</span>
                    Credentialed Physician
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-clinical-success bg-success-bg px-2 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Verified MD
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-text-ink">Dr. Eleanor Vance, MD</h3>
                <p className="text-[12px] text-on-surface-variant mt-space-2xs">Internal Medicine Specialist</p>
                <div className="mt-space-sm pt-space-sm border-t border-surface-container flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-text-muted uppercase block">NPI Registry</span>
                    <span className="text-[13px] font-semibold text-text-ink">1849204918</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-text-muted uppercase block">State License</span>
                    <span className="text-[13px] font-semibold text-text-ink">CA-A14289</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-space-md rounded-lg p-space-md bg-warning-bg flex items-start gap-space-md shadow-sm">
              <div className="w-10 h-10 rounded-full bg-clinical-warning/20 text-clinical-warning flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
              </div>
              <div>
                <span className="text-[15px] font-bold text-text-ink">Your request will be sent to a clinic administrator for approval.</span>
                <p className="text-[12px] text-on-surface-variant mt-1 leading-relaxed">Access will remain pending until reviewed and authorized by St. Jude Medical Center administration.</p>
              </div>
            </div>

            <div className="mt-space-lg pt-space-lg flex flex-col gap-space-md">
              <label className="flex items-start gap-space-sm cursor-pointer select-none group">
                <input type="checkbox" checked={attest} onChange={(e) => setAttest(e.target.checked)} className="w-5 h-5 rounded bg-surface-container text-primary accent-primary cursor-pointer focus:ring-2 focus:ring-primary mt-0.5" />
                <span className="text-[12px] text-on-surface-variant group-hover:text-text-ink transition-colors">
                  I attest that I am an appointed clinical provider at St. Jude Medical Center and authorize SleekCare to verify my credentials with the medical executive board.
                </span>
              </label>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-space-md mt-space-sm">
                <button type="button" onClick={() => onNext('find-clinic')} className="w-full sm:w-auto px-space-lg py-3 rounded-md bg-card-surface hover:bg-surface-container text-text-ink font-bold text-[15px] text-center transition-all shadow-sm no-underline">Cancel</button>
                <button
                  type="button"
                  disabled={!attest || submitting}
                  onClick={handleSubmit}
                  className={`w-full sm:w-auto px-space-xl py-3 rounded-md bg-primary hover:bg-accent-dark text-on-primary font-bold text-[15px] shadow-lg flex items-center justify-center gap-space-xs transition-all cursor-pointer ${!attest ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Join Request</span>
                      <span className="material-symbols-outlined text-[20px]">send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-4">
          <div className="bg-card-surface rounded-xl overflow-hidden shadow-md">
            <div className="relative h-44 w-full overflow-hidden bg-surface-container">
              <img className="w-full h-full object-cover" alt="Hospital Pavilion" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD4AhOC7BJ-CnNOWH3QujQHua8fVYWJOERM-kk_gvd9Xy0ONPPYqVz_20XUUeZOK4gW_gat4JRJPyMsUrk9XsEuRVE375-3uBKHhgHWeMv4uYCaI6b8qURei1TzLCFIsUlVkdE6B5Qy7Z1dfh0ttsL5pGp2Y9ffXl07boY3zxFO1w1OcC-IEsJ-Q9CJmcwmj74DxL94Is0N9jBzdDnZKzizjTGNq71e7PXgMBv406ffrqPnJXyBVh47w" />
              <div className="absolute inset-0 bg-gradient-to-t from-card-surface via-card-surface/20 to-transparent"></div>
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-card-surface/90 backdrop-blur-md text-[11px] font-semibold text-text-ink shadow-sm">Primary Campus</span>
                <span className="px-2 py-0.5 rounded bg-success-bg text-clinical-success text-[11px] font-semibold flex items-center gap-1">Online</span>
              </div>
            </div>
            <div className="p-space-md flex flex-col gap-space-sm text-[12px]">
              <h4 className="text-[18px] font-bold text-text-ink">Campus Details</h4>
              <div className="flex items-center justify-between py-1 bg-surface-container-low px-space-xs rounded">
                <span className="text-on-surface-variant">Medical Director</span>
                <span className="font-bold text-text-ink">Dr. Marcus Hayes, MD</span>
              </div>
              <div className="flex items-center justify-between py-1 bg-surface-container-low px-space-xs rounded">
                <span className="text-on-surface-variant">Active Dictators</span>
                <span className="font-bold text-text-ink">84 Physicians</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
