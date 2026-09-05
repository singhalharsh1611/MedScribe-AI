"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReviewVerifyPage() {
  const router = useRouter();
  const [attested, setAttested] = useState(true);

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Scribe Telemetry Dock */}
      <div className="w-full flex items-center justify-between px-6 py-2.5 bg-surface-container-low rounded-xl shadow-sm mb-4 border border-surface-container">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
            <span className="text-[11px] text-primary uppercase tracking-wider font-bold">Voice-Scribe Verified</span>
          </div>
          <span className="text-text-muted text-[12px]">•</span>
          <span className="text-[12px] text-on-surface-variant font-medium">Encounter #ENC-99824 · Audio Anchor Confirmed (28m 14s Session)</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest border border-surface-container">
            <span className="material-symbols-outlined text-primary text-[14px]">graphic_eq</span>
            <span className="text-[11px] text-text-ink font-bold">99.8% Match</span>
          </div>
          <div className="flex items-center gap-1 text-clinical-success text-[11px] font-bold">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>EHR Ready</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-text-muted mb-4">
        <Link href="/doctor/dashboard" className="hover:text-primary transition-colors">Doctor Workspace</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-primary transition-colors cursor-pointer">Consultations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-text-ink font-semibold">Maya Lin Harrison</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">Final Review & Verification</span>
      </nav>

      {/* Legal Advisory Banner */}
      <div className="w-full p-4 rounded-xl bg-warning-bg shadow-sm flex items-start gap-4 mb-6 border border-clinical-warning/20">
        <div className="w-9 h-9 rounded-lg bg-clinical-warning/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-clinical-warning text-[22px]">gavel</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-warning bg-card-surface px-2 py-0.5 rounded shadow-sm">Pre-Signing Regulatory Check</span>
            <span className="text-[11px] text-text-muted font-medium">DEA / Title 21 CFR Compliant</span>
          </div>
          <p className="text-[14px] text-text-ink font-medium leading-relaxed">
            <strong className="font-bold">IMPORTANT NOTICE:</strong> Review carefully before finalizing. Once signed, this prescription is cryptographically committed to the clinic EHR, sent to the patient portal, and dispatched to the pharmacy gateway. The physician is the final legal and clinical authority.
          </p>
        </div>
      </div>

      {/* Split Master Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-card-surface rounded-xl p-5 shadow-sm flex flex-col gap-4 border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-primary uppercase tracking-widest font-bold">Patient Demographics</span>
              <span className="px-2 py-0.5 rounded bg-success-bg text-clinical-success text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-clinical-success"></span> Verified Active
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-container-tint flex items-center justify-center text-primary-container text-[20px] font-bold shadow-sm ring-2 ring-container-tint">
                ML
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-[18px] font-bold text-text-ink truncate">Maya Lin Harrison</h2>
                <span className="text-[12px] text-text-muted font-medium">32 yrs · Female (DOB: 14 Aug 1991)</span>
                <span className="text-[11px] text-secondary font-bold mt-1">UHID-MH-2024-88412</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-1 bg-surface-container-low p-3 rounded-lg text-[12px] border border-surface-container">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Primary Phone</span>
                <span className="text-text-ink font-semibold">+1 (555) 849-2041</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Encounter Timing</span>
                <span className="text-text-ink font-semibold">Oct 24, 2024 · 10:48 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Pharmacy Gateway</span>
                <span className="text-primary font-bold">Walgreens #4410 (Metro)</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-error-bg flex flex-col gap-1 border border-clinical-error/20">
              <div className="flex items-center gap-1.5 text-clinical-error text-[11px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>Documented Allergy</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] text-text-ink font-bold">Penicillin</span>
                <span className="text-[11px] text-clinical-error font-semibold">Moderate Urticaria</span>
              </div>
              <span className="text-[11px] text-text-muted">Direct beta-lactam safety checks applied. 0 interactions detected.</span>
            </div>
          </div>

          <div className="bg-card-surface rounded-xl p-5 shadow-sm flex flex-col gap-4 border border-surface-container">
            <span className="text-[11px] text-primary uppercase tracking-widest font-bold">Originating Facility & Prescriber</span>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0 border border-surface-container">
                <span className="material-symbols-outlined text-[20px]">domain</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] text-text-ink font-bold leading-tight">Metropolitan Health Medical Center</span>
                <span className="text-[12px] text-text-muted">Outpatient Care Suite 100</span>
                <span className="text-[12px] text-text-muted">742 Evergreen Blvd, Metro District</span>
              </div>
            </div>
            <div className="h-px w-full bg-container-tint"></div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-card-surface text-[16px] font-bold shadow-sm shrink-0">
                EV
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] text-text-ink font-bold leading-tight">Dr. Eleanor Vance, MD</span>
                <span className="text-[12px] text-text-muted">Attending Pulmonologist / Internal Med</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] bg-container-tint text-primary px-1.5 py-0.5 rounded font-bold">MD-8839102</span>
                  <span className="text-[11px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded font-bold">DEA: BV-4491028</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card-surface rounded-xl p-5 shadow-sm flex flex-col gap-3 border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-primary uppercase tracking-widest font-bold">ICD-10 Diagnostic Indications</span>
              <span className="material-symbols-outlined text-clinical-success text-[18px]">verified</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold px-2 py-0.5 rounded bg-primary-container text-card-surface shadow-sm">J45.909</span>
                  <span className="text-[12px] text-text-ink font-semibold">Unspecified Asthma</span>
                </div>
                <span className="text-[11px] text-clinical-success font-bold">Primary</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant shadow-sm">J30.1</span>
                  <span className="text-[12px] text-text-ink font-semibold">Allergic Rhinitis (Pollen)</span>
                </div>
                <span className="text-[11px] text-text-muted font-bold">Secondary</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-card-surface rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-surface-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <h1 className="text-[22px] font-bold text-text-ink">Electronic Medical Order Matrix</h1>
                </div>
                <p className="text-[12px] text-text-muted mt-1 font-semibold">3 Prescriptions Formulated · Voice Scribe Transcription Synchronized · Ready for Dispatch</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded bg-surface-container text-on-surface-variant text-[11px] font-bold flex items-center gap-1 border border-surface-container-highest">
                  <span className="material-symbols-outlined text-[16px]">sync</span> E-Prescribe v4.2
                </span>
                <span className="px-3 py-1 rounded bg-success-bg text-clinical-success text-[11px] font-bold flex items-center gap-1 border border-clinical-success/20">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Formulary Tier 1
                </span>
              </div>
            </div>

            {/* Matrix Items */}
            <div className="rounded-xl bg-surface p-4 flex flex-col gap-3 border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-[18px]">1</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] font-bold text-text-ink">Montelukast Sodium 10 mg</h3>
                      <span className="px-2 py-0.5 rounded-full bg-container-tint text-primary text-[11px] font-bold">Oral Tablet</span>
                    </div>
                    <span className="text-[12px] text-text-muted font-medium">Target Indication: J45.909 Chronic Asthma Prophylaxis</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-success-bg text-clinical-success text-[11px] font-bold self-start sm:self-auto">Verified Dosage</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-card-surface p-3 rounded-lg text-[13px] border border-surface-container">
                <div><span className="text-[11px] text-text-muted block font-bold">Dose & Frequency</span><span className="font-bold text-text-ink">1 Tab · OD Night</span></div>
                <div><span className="text-[11px] text-text-muted block font-bold">Duration</span><span className="font-bold text-text-ink">30 Days</span></div>
                <div><span className="text-[11px] text-text-muted block font-bold">Dispense & Refills</span><span className="font-bold text-text-ink">30 Tabs · 2 Refills</span></div>
                <div><span className="text-[11px] text-text-muted block font-bold">Food Advisory</span><span className="font-bold text-text-ink">With or without food</span></div>
              </div>
              <div className="px-3 py-2 rounded bg-surface-container-low flex items-start gap-2 text-[14px]">
                <span className="text-[11px] text-primary uppercase font-bold shrink-0 mt-0.5">Sig / Directions:</span>
                <p className="text-text-ink font-medium italic">&quot;Take 1 tablet by mouth every night at bedtime. For chronic asthma prophylaxis.&quot;</p>
              </div>
            </div>

            <div className="rounded-xl bg-surface p-4 flex flex-col gap-3 border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-[18px]">2</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] font-bold text-text-ink">Fluticasone Propionate 50 mcg</h3>
                      <span className="px-2 py-0.5 rounded-full bg-container-tint text-primary text-[11px] font-bold">Nasal Spray</span>
                    </div>
                    <span className="text-[12px] text-text-muted font-medium">Target Indication: J30.1 Allergic Rhinitis</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-success-bg text-clinical-success text-[11px] font-bold self-start sm:self-auto">Verified Dosage</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-card-surface p-3 rounded-lg text-[13px] border border-surface-container">
                <div><span className="text-[11px] text-text-muted block font-bold">Dose & Frequency</span><span className="font-bold text-text-ink">1 Spray/nostril · OM</span></div>
                <div><span className="text-[11px] text-text-muted block font-bold">Duration</span><span className="font-bold text-text-ink">14 Days</span></div>
                <div><span className="text-[11px] text-text-muted block font-bold">Dispense & Refills</span><span className="font-bold text-text-ink">1 Bottle · 1 Refill</span></div>
                <div><span className="text-[11px] text-text-muted block font-bold">Method</span><span className="font-bold text-text-ink">Intranasal</span></div>
              </div>
              <div className="px-3 py-2 rounded bg-surface-container-low flex items-start gap-2 text-[14px]">
                <span className="text-[11px] text-primary uppercase font-bold shrink-0 mt-0.5">Sig / Directions:</span>
                <p className="text-text-ink font-medium italic">&quot;Administer 1 spray into each nostril once daily every morning.&quot;</p>
              </div>
            </div>

            <div className="rounded-xl bg-surface p-4 flex flex-col gap-3 border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-[18px]">3</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] font-bold text-text-ink">Albuterol Sulfate HFA 90 mcg</h3>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">Inhaler (Rescue)</span>
                    </div>
                    <span className="text-[12px] text-text-muted font-medium">Target Indication: Acute Bronchospasm Relief (PRN)</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-success-bg text-clinical-success text-[11px] font-bold self-start sm:self-auto">Verified PRN</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-card-surface p-3 rounded-lg text-[13px] border border-surface-container">
                <div><span className="text-[11px] text-text-muted block font-bold">Dose & Frequency</span><span className="font-bold text-text-ink">1-2 Puffs · q4-6h PRN</span></div>
                <div><span className="text-[11px] text-text-muted block font-bold">Duration</span><span className="font-bold text-text-ink">30 Days</span></div>
                <div><span className="text-[11px] text-text-muted block font-bold">Dispense & Refills</span><span className="font-bold text-text-ink">1 Inhaler · 3 Refills</span></div>
                <div><span className="text-[11px] text-text-muted block font-bold">Trigger Protocol</span><span className="font-bold text-text-ink">Wheezing / Tightness</span></div>
              </div>
              <div className="px-3 py-2 rounded bg-surface-container-low flex items-start gap-2 text-[14px]">
                <span className="text-[11px] text-primary uppercase font-bold shrink-0 mt-0.5">Sig / Directions:</span>
                <p className="text-text-ink font-medium italic">&quot;Inhale 1 to 2 puffs every 4-6 hours PRN for acute bronchospasm. Rinse mouth with water after use.&quot;</p>
              </div>
            </div>
          </div>

          <div className="bg-card-surface rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">draw</span>
                <h4 className="text-[18px] font-bold text-text-ink">Doctor Digital Signature & Legal Attestation</h4>
              </div>
              <span className="text-[11px] bg-container-tint text-primary px-2.5 py-1 rounded-full font-bold">FIPS 140-2 Level 3 Secure</span>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-lg bg-surface hover:bg-surface-container-low transition-colors cursor-pointer border border-surface-container">
              <input 
                type="checkbox" 
                checked={attested} 
                onChange={(e) => setAttested(e.target.checked)}
                className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <span className="text-[14px] text-text-ink font-medium leading-relaxed select-none">
                I attest that I have examined the patient Maya Lin Harrison (UHID-MH-2024-88412), have verified no adverse drug interactions exist with her documented Penicillin allergy, and clinically authorize these medications under full legal authority as attending physician.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-surface-container-lowest shadow-sm gap-4 border border-surface-container">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-container text-card-surface flex items-center justify-center shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold">Cryptographic Key Stamp</span>
                  <div className="text-[22px] text-primary tracking-wide italic font-serif select-none">
                    Dr. Eleanor Vance, MD
                  </div>
                  <span className="text-[12px] text-text-muted font-mono font-semibold mt-0.5">HASH: SHA256:8f2a994c...7701e4bb</span>
                </div>
              </div>
              <div className="flex flex-col sm:items-end text-left sm:text-right">
                <span className="text-[11px] text-clinical-success font-bold uppercase tracking-wider flex items-center gap-1 sm:justify-end">
                  <span className="w-2 h-2 rounded-full bg-clinical-success animate-ping"></span> Live Authorization
                </span>
                <span className="text-[14px] text-text-ink font-bold mt-1">October 24, 2024 · 10:48 AM EST</span>
                <span className="text-[11px] font-semibold text-text-muted">Metropolitan Node 101 · Station 4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-4 z-30 w-full bg-card-surface/95 backdrop-blur-md rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-container-tint">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/consultation/review/draft" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-surface hover:bg-surface-container text-text-ink text-[13px] font-bold transition-all shadow-sm border border-surface-container">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Edit Draft</span>
          </Link>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-[11px] text-clinical-success font-bold">Zero Interaction Conflicts</span>
            <span className="text-[11px] font-semibold text-text-muted">Patient Portal Dispatched Upon Signing</span>
          </div>
          <button 
            disabled={!attested}
            onClick={() => router.push("/consultation/review/finalized")}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-lg bg-primary-container hover:bg-accent-dark text-card-surface text-[14px] font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer ${
              !attested ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">lock_clock</span>
            <span>Finalize Prescription</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
