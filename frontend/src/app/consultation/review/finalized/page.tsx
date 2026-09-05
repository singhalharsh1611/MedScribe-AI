"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReviewFinalizedPage() {
  const router = useRouter();
  const [toast, setToast] = useState({ visible: false, message: "", icon: "" });

  const showToast = (message: string, icon = "check_circle") => {
    setToast({ visible: true, message, icon });
    setTimeout(() => {
      setToast({ visible: false, message: "", icon: "" });
    }, 3200);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Internal Toast Overlay */}
      {toast.visible && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 bg-text-ink text-card-surface rounded-lg shadow-xl text-[14px] font-bold">
            <span className="material-symbols-outlined text-[20px] text-clinical-success">{toast.icon}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <nav className="flex items-center gap-2 text-text-muted text-[13px]">
            <Link href="/doctor/dashboard" className="hover:text-primary transition-colors cursor-pointer">Doctor Workspace</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <Link href="/consultation/review/verify" className="hover:text-primary transition-colors cursor-pointer">Consultations</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold">Maya Lin Harrison</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-clinical-success font-bold">Encounter Finalized</span>
          </nav>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-bg text-clinical-success text-[11px] font-bold shadow-sm">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>HL7 FHIR v4.0.1 VALIDATED</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-medium">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>10:49 AM EDT</span>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-card-surface via-card-surface to-success-bg/40 p-6 shadow-md border border-surface-container">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="relative shrink-0 mt-1">
                <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-clinical-success text-[38px]">check_circle</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-container text-card-surface flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">key</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[28px] font-bold text-text-ink tracking-tight">Prescription Finalized</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-success-bg text-clinical-success text-[11px] font-bold tracking-wide">CONFIRMED DISPATCH</span>
                </div>
                <p className="text-[16px] font-medium text-on-surface-variant max-w-3xl leading-relaxed">
                  Prescription <span className="font-bold text-text-ink">#RX-2024-99812</span> has been cryptographically signed by <span className="font-bold text-text-ink">Dr. Eleanor Vance, MD</span> and committed permanently to the Electronic Health Record.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-text-muted text-[11px]">
                  <div className="flex items-center gap-1.5 text-clinical-success font-semibold">
                    <span className="material-symbols-outlined text-[16px]">sync_saved_locally</span>
                    <span>EHR Synchronized (HL7/FHIR)</span>
                  </div>
                  <span className="text-surface-container-highest font-black">/</span>
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[16px]">outbox</span>
                    <span>Dispatched to Surescripts Gateway</span>
                  </div>
                  <span className="text-surface-container-highest font-black">/</span>
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-clinical-success text-[16px]">mark_email_read</span>
                    <span>Patient Portal Notification Sent</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => router.push("/consultation/review/document")}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary-container hover:bg-accent-dark text-card-surface text-[15px] font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                <span>View Prescription</span>
              </button>
              <button 
                onClick={() => {
                  showToast("Maya Lin Harrison encounter closed. Loading next patient...", "task_alt");
                  setTimeout(() => router.push("/doctor/dashboard"), 1500);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-text-ink hover:bg-surface-variant hover:text-text-ink text-card-surface text-[15px] font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                <span>Finish Visit</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 8 cols */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-card-surface rounded-xl p-6 shadow-sm flex flex-col gap-5 border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-container-tint flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">medication</span>
                  </div>
                  <div>
                    <h2 className="text-[22px] font-bold text-text-ink">Prescription Order Manifest</h2>
                    <p className="text-[12px] font-semibold text-text-muted">3 Finalized pharmaceutical orders approved for transmission</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-md text-text-ink text-[11px]">
                  <span className="text-text-muted">RX TOKEN:</span>
                  <span className="font-mono font-bold text-primary">0x99F4...A18C</span>
                  <button onClick={() => showToast("Rx Token copied to clipboard", "content_copy")} className="hover:text-primary cursor-pointer" title="Copy Hash">
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {/* Item 1 */}
                <div className="p-4 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 border border-surface-container">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-container-tint flex items-center justify-center text-primary font-bold text-[13px] shrink-0 mt-0.5">1</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[18px] font-bold text-text-ink">Montelukast Sodium</span>
                        <span className="px-2 py-0.5 rounded bg-container-tint text-primary text-[11px] font-bold">10mg Tablet</span>
                        <span className="px-2 py-0.5 rounded bg-success-bg text-clinical-success text-[11px] font-semibold">Ready at Metro Central</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-on-surface-variant">
                        <span><strong className="text-text-ink font-semibold">SIG:</strong> 1 tablet orally once daily at bedtime</span>
                        <span className="text-surface-container-highest font-bold">•</span>
                        <span><strong className="text-text-ink font-semibold">Duration:</strong> 30 Days supply</span>
                        <span className="text-surface-container-highest font-bold">•</span>
                        <span><strong className="text-text-ink font-semibold">Refills:</strong> 2 remaining</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col items-end justify-between md:justify-center gap-1 shrink-0">
                    <span className="text-[11px] text-clinical-success font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Transmitted
                    </span>
                    <span className="text-[12px] text-text-muted font-semibold">NDC 68180-496-11</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-4 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 border border-surface-container">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-container-tint flex items-center justify-center text-primary font-bold text-[13px] shrink-0 mt-0.5">2</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[18px] font-bold text-text-ink">Fluticasone Propionate</span>
                        <span className="px-2 py-0.5 rounded bg-container-tint text-primary text-[11px] font-bold">50mcg / Actuation</span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">Nasal Spray</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-on-surface-variant">
                        <span><strong className="text-text-ink font-semibold">SIG:</strong> 2 sprays per nostril OM Morning</span>
                        <span className="text-surface-container-highest font-bold">•</span>
                        <span><strong className="text-text-ink font-semibold">Duration:</strong> 14 Days</span>
                        <span className="text-surface-container-highest font-bold">•</span>
                        <span><strong className="text-text-ink font-semibold">Refills:</strong> 1 remaining</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col items-end justify-between md:justify-center gap-1 shrink-0">
                    <span className="text-[11px] text-clinical-success font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Transmitted
                    </span>
                    <span className="text-[12px] text-text-muted font-semibold">NDC 00093-2032-43</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="p-4 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 border border-surface-container">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-container-tint flex items-center justify-center text-primary font-bold text-[13px] shrink-0 mt-0.5">3</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[18px] font-bold text-text-ink">Albuterol Sulfate HFA</span>
                        <span className="px-2 py-0.5 rounded bg-container-tint text-primary text-[11px] font-bold">90mcg Inhaler</span>
                        <span className="px-2 py-0.5 rounded bg-warning-bg text-clinical-warning text-[11px] font-bold">Rescue Protocol</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-on-surface-variant">
                        <span><strong className="text-text-ink font-semibold">SIG:</strong> 2 puffs inhaled q4-6h PRN</span>
                        <span className="text-surface-container-highest font-bold">•</span>
                        <span><strong className="text-text-ink font-semibold">Duration:</strong> 30 Days</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col items-end justify-between md:justify-center gap-1 shrink-0">
                    <span className="text-[11px] text-clinical-success font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Transmitted
                    </span>
                    <span className="text-[12px] text-text-muted font-semibold">NDC 59310-579-20</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-surface-container">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-card-surface flex items-center justify-center text-primary shadow-sm shrink-0 border border-surface-container">
                    <span className="material-symbols-outlined text-[22px]">local_pharmacy</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Designated Fulfillment Pharmacy</span>
                    <span className="text-[15px] font-bold text-text-ink">Metro Central Pharmacy (Store #4902)</span>
                    <span className="text-[12px] font-medium text-on-surface-variant">4200 Grand Concourse, Medical Wing B · Tel (212) 555-0199</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-success-bg text-clinical-success text-[11px] font-bold flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">check</span> In-Network e-Prescribe
                </span>
              </div>

              <div className="p-4 rounded-lg bg-warning-bg/60 flex items-start gap-3 border border-clinical-warning/20">
                <span className="material-symbols-outlined text-clinical-warning text-[20px] shrink-0 mt-0.5">verified_user</span>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider text-text-ink font-bold">Official Clinical Record Legal Notice</span>
                  <p className="text-[12px] font-medium text-on-surface-variant leading-relaxed">
                    <strong className="font-bold">OFFICIAL CLINICAL RECORD — Verified & Signed by Attending Physician.</strong> AI voice transcription telemetry and draft buffer scratchpads were automatically permanently discarded. Legal prescriber authority and full clinical accountability applied by Dr. Eleanor Vance under DEA #BV9941029 and NPI #1992019488.
                  </p>
                </div>
              </div>
            </div>

            {/* Prescription Action Matrix */}
            <div className="bg-card-surface rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-surface-container">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-bold text-text-ink flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                  Prescription Action Matrix
                </h3>
                <span className="text-[11px] text-text-muted font-semibold">Instant Distribution Hub</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => router.push("/consultation/review/document")}
                  className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-container-low hover:bg-container-tint text-text-ink transition-all shadow-sm hover:shadow-md group border border-surface-container cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-card-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <span className="text-[15px] font-bold">View Script</span>
                  <span className="text-[12px] text-text-muted mt-0.5 font-semibold">Open Full Screen 05</span>
                </button>

                <button 
                  onClick={() => {
                    showToast("Generating official 2-sided pharmacy print job...", "print");
                    setTimeout(() => window.print(), 500);
                  }}
                  className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-container-low hover:bg-container-tint text-text-ink transition-all shadow-sm hover:shadow-md group border border-surface-container cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-card-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">print</span>
                  </div>
                  <span className="text-[15px] font-bold">Print Script</span>
                  <span className="text-[12px] text-text-muted mt-0.5 font-semibold">Generate hard copy</span>
                </button>

                <button 
                  onClick={() => showToast("Encrypted SMS + Patient Portal receipt re-dispatched", "send_to_mobile")}
                  className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-container-low hover:bg-container-tint text-text-ink transition-all shadow-sm hover:shadow-md group border border-surface-container cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-card-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">send_to_mobile</span>
                  </div>
                  <span className="text-[15px] font-bold">Send to Patient</span>
                  <span className="text-[12px] text-text-muted mt-0.5 font-semibold">SMS & Email Direct</span>
                </button>

                <button 
                  onClick={() => showToast("Secure provider FHIR bundle link copied to clipboard", "ios_share")}
                  className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-container-low hover:bg-container-tint text-text-ink transition-all shadow-sm hover:shadow-md group border border-surface-container cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-card-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">ios_share</span>
                  </div>
                  <span className="text-[15px] font-bold">Provider Share</span>
                  <span className="text-[12px] text-text-muted mt-0.5 font-semibold">EHR / Fax / PDF Secure</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 4 cols */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-card-surface rounded-xl p-5 shadow-sm flex flex-col gap-4 border border-surface-container">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Patient Encounter Details</span>
                <span className="px-2 py-0.5 rounded bg-success-bg text-clinical-success text-[11px] font-bold">ACTIVE COVERAGE</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-container-tint flex items-center justify-center text-primary-container text-[20px] font-bold shadow-sm ring-2 ring-container-tint shrink-0">
                  ML
                </div>
                <div className="flex flex-col">
                  <h2 className="text-[18px] font-bold text-text-ink">Maya Lin Harrison</h2>
                  <span className="text-[12px] text-text-muted font-medium">32 yrs · Female</span>
                  <span className="text-[11px] text-secondary font-bold mt-1">UHID-MH-2024-88412</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1 bg-surface-container-low p-3 rounded-lg text-[12px] border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Primary Phone</span>
                  <span className="text-text-ink font-semibold">+1 (555) 849-2041</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Insurance</span>
                  <span className="text-text-ink font-semibold">BlueCross PPO</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Group #</span>
                  <span className="text-text-ink font-semibold">MH-994102</span>
                </div>
              </div>
            </div>

            <div className="bg-card-surface rounded-xl p-5 shadow-sm flex flex-col gap-4 border border-surface-container">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Next Steps & Diagnostics</span>
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-primary text-[13px] font-bold">
                    <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                    <span>Spirometry Follow-up</span>
                  </div>
                  <span className="text-[13px] text-text-ink font-medium">4 Weeks / Auto-Booked Nov 21</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-clinical-warning text-[13px] font-bold">
                    <span className="material-symbols-outlined text-[18px]">shield_with_heart</span>
                    <span>Peak Flow Red Zone</span>
                  </div>
                  <span className="text-[13px] text-text-ink font-medium">Seek ER if &lt;70% personal best</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
