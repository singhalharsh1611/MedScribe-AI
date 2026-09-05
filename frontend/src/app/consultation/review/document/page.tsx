"use client";
import { useState } from "react";
import Link from "next/link";

export default function ReviewDocumentPage() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [patientSent, setPatientSent] = useState(false);

  const handleSendPatient = () => {
    setPatientSent(true);
    setTimeout(() => setPatientSent(false), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
        {/* Action Bar & Legal Certification Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-card-surface shadow-sm border border-surface-container">
          <div className="flex items-center gap-3">
            <Link href="/consultation/review/finalized" className="inline-flex items-center justify-center p-2 rounded-md bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors border border-surface-container-highest cursor-pointer" title="Back to Encounter">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success-bg text-clinical-success text-[11px] font-bold tracking-wide shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  OFFICIAL MEDICAL PRESCRIPTION — E-SIGNED & FINALIZED
                </span>
                <span className="text-[11px] text-text-muted font-semibold">Rx Serial: #RX-2024-99812</span>
              </div>
              <span className="text-[18px] font-bold text-text-ink mt-0.5">Prescription Document</span>
            </div>
          </div>

          {/* Action Utilities */}
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={handleSendPatient}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-surface-container text-text-ink hover:bg-surface-container-high text-[13px] font-bold transition-colors border border-surface-container-highest shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">{patientSent ? "check" : "send_to_mobile"}</span>
              <span>{patientSent ? "Sent to Mobile!" : "Send to Patient"}</span>
            </button>
            <button 
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-surface-container text-text-ink hover:bg-surface-container-high text-[13px] font-bold transition-colors border border-surface-container-highest shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">share</span>
              <span>Share / PDF</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-on-primary hover:bg-accent-dark text-[13px] font-bold shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Print Prescription</span>
            </button>
          </div>
        </div>

        {/* Patient Transmission Notification Bar */}
        <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-on-surface transition-colors ${
          patientSent ? "bg-success-bg border border-clinical-success/20" : "bg-surface-container-low border border-surface-container"
        }`}>
          <div className="flex items-center gap-3 text-[13px]">
            <span className="material-symbols-outlined text-clinical-success text-[18px]">check_circle</span>
            <span>Dispatched to Patient Profile: <strong className="font-bold">+1 (555) 849-2041</strong> • <strong className="font-bold">maya.harrison@email.com</strong></span>
          </div>
          <span className="text-[11px] font-semibold text-text-muted">Direct EHR Push Complete • Pharmacy Notified</span>
        </div>

        {/* MAIN LEGAL PRESCRIPTION SHEET CONTAINER */}
        <div className="relative bg-card-surface rounded-xl shadow-md p-6 md:p-8 overflow-hidden border border-surface-container-highest">
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.025] select-none">
            <span className="text-[260px] text-primary font-bold tracking-widest leading-none">Rx</span>
          </div>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b border-surface-container-highest">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[32px]">local_hospital</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[22px] font-bold text-text-ink leading-tight">Metropolitan Health</span>
                  <span className="px-2 py-0.5 rounded bg-container-tint text-primary text-[11px] font-bold">OUTPATIENT RX</span>
                </div>
                <span className="text-[13px] text-text-muted font-bold">Department of Internal Medicine & Pulmonology</span>
                <p className="text-[12px] font-medium text-on-surface-variant mt-1">
                  742 Evergreen Terrace, Suite 100, Metro District 10024<br />
                  Phone: (555) 019-2830 • Pharmacy Direct: (555) 019-2839 • www.metrohealth.org
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 self-stretch md:self-auto bg-surface-container-lowest p-3 rounded-lg border border-surface-container">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold">Security QR / Rx Verification</span>
                <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-card-surface p-1 rounded shadow-sm border border-surface-container flex items-center justify-center">
                  <svg className="w-full h-full text-text-ink" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm11-2h2v2h-2v-2zm-3 2h2v4h-2v-4zm6-2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm-4 2h2v2h-2v-2zm-6-9h2v2h-2V7zm5 0h2v2h-2V7z"></path>
                  </svg>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[11px] font-bold text-text-ink">SERIAL: #RX-2024-99812</span>
                  <span className="text-[12px] font-semibold text-text-muted">DEA Order ID: DEA-7718A</span>
                  <span className="text-[11px] text-clinical-success font-bold mt-1">NCPDP E-Script Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-6 bg-surface-container-low rounded-lg p-4 border border-surface-container">
            <div className="md:col-span-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Prescribing Practitioner</span>
                <span className="text-[18px] font-bold text-text-ink block mt-0.5">Dr. Eleanor Vance, MD</span>
                <span className="text-[12px] font-medium text-on-surface-variant">Attending Physician • Internal Medicine & Pulmonology</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 mt-2 text-text-ink text-[12px]">
                <div>
                  <span className="text-text-muted block font-semibold">State Lic:</span>
                  <span className="font-bold">#MD-8839102</span>
                </div>
                <div>
                  <span className="text-text-muted block font-semibold">NPI ID:</span>
                  <span className="font-bold">1982736450</span>
                </div>
                <div>
                  <span className="text-text-muted block font-semibold">DEA Reg:</span>
                  <span className="font-bold">BV-4491028</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 flex flex-col justify-between bg-card-surface p-3 rounded-md shadow-sm border border-surface-container-highest">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Patient Demographics</span>
                  <span className="text-[18px] font-bold text-text-ink block">Maya Lin Harrison</span>
                  <span className="text-[12px] font-medium text-on-surface-variant">
                    DOB: 14 Aug 1991 (Age 32) • Female • UHID: <strong className="text-text-ink font-bold">UHID-MH-2024-88412</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-text-muted block font-bold">Date Prescribed</span>
                  <span className="text-[13px] text-text-ink font-bold">October 24, 2024</span>
                </div>
              </div>
              <div className="mt-3 pt-2 flex items-center justify-between border-t border-surface-container-highest">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-error-bg text-clinical-error text-[11px] font-bold border border-clinical-error/20">
                  <span className="material-symbols-outlined text-[15px]">warning</span>
                  <span>DOCUMENTED ALLERGIES: PENICILLIN (Anaphylactoid)</span>
                </div>
                <span className="text-[11px] font-semibold text-text-muted">Weight: 61.2 kg • BSA: 1.66 m²</span>
              </div>
            </div>
          </div>

          {/* Formulary Items */}
          <div className="py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-[42px] font-bold text-primary italic leading-none select-none">℞</span>
                <span className="text-[18px] font-bold text-text-ink">Prescribed Formulary Items (3)</span>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded bg-container-tint text-primary font-bold shadow-sm border border-primary/20">Standard Outpatient Refill Protocol</span>
            </div>

            {/* Script 1 */}
            <div className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-card-surface font-bold text-[13px] shrink-0 mt-0.5 shadow-sm">1</div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[18px] font-bold text-text-ink">Montelukast Sodium 10 mg Oral Tablet</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container text-text-muted font-bold border border-surface-container-highest">Leukotriene Receptor Antagonist</span>
                  </div>
                  <p className="text-[14px] text-on-surface-variant font-medium mt-1">
                    <strong className="text-text-ink font-bold">Sig:</strong> Take 1 tablet by mouth every night at bedtime.
                  </p>
                  <span className="text-[12px] font-semibold text-text-muted mt-0.5">Indications: Nocturnal airway hyperresponsiveness & perennial allergic rhinitis.</span>
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0 bg-card-surface px-4 py-2 rounded-md shadow-sm border border-surface-container-highest">
                <div className="flex flex-col text-center">
                  <span className="text-[11px] text-text-muted uppercase font-bold">Dispense</span>
                  <span className="text-[18px] font-bold text-text-ink">#30 Tabs</span>
                </div>
                <div className="w-px h-8 bg-surface-container-highest"></div>
                <div className="flex flex-col text-center">
                  <span className="text-[11px] text-text-muted uppercase font-bold">Refills</span>
                  <span className="text-[18px] font-bold text-primary">2 (Two)</span>
                </div>
              </div>
            </div>

            {/* Script 2 */}
            <div className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-card-surface font-bold text-[13px] shrink-0 mt-0.5 shadow-sm">2</div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[18px] font-bold text-text-ink">Fluticasone Propionate 50 mcg/actuation Nasal Spray</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container text-text-muted font-bold border border-surface-container-highest">Nasal Corticosteroid</span>
                  </div>
                  <p className="text-[14px] text-on-surface-variant font-medium mt-1">
                    <strong className="text-text-ink font-bold">Sig:</strong> Administer 1 spray into each nostril once daily every morning.
                  </p>
                  <span className="text-[12px] font-semibold text-text-muted mt-0.5">Instructions: Prime pump before first use. Gently shake bottle prior to administration.</span>
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0 bg-card-surface px-4 py-2 rounded-md shadow-sm border border-surface-container-highest">
                <div className="flex flex-col text-center">
                  <span className="text-[11px] text-text-muted uppercase font-bold">Dispense</span>
                  <span className="text-[18px] font-bold text-text-ink">1 Bottle (16g)</span>
                </div>
                <div className="w-px h-8 bg-surface-container-highest"></div>
                <div className="flex flex-col text-center">
                  <span className="text-[11px] text-text-muted uppercase font-bold">Refills</span>
                  <span className="text-[18px] font-bold text-primary">1 (One)</span>
                </div>
              </div>
            </div>

            {/* Script 3 */}
            <div className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-card-surface font-bold text-[13px] shrink-0 mt-0.5 shadow-sm">3</div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[18px] font-bold text-text-ink">Albuterol Sulfate HFA 90 mcg/actuation Inhalation Aerosol</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container text-text-muted font-bold border border-surface-container-highest">Short-Acting Beta2 Agonist</span>
                  </div>
                  <p className="text-[14px] text-on-surface-variant font-medium mt-1">
                    <strong className="text-text-ink font-bold">Sig:</strong> Inhale 1 to 2 puffs every 4 to 6 hours as needed for acute wheezing or shortness of breath.
                  </p>
                  <span className="text-[12px] font-semibold text-text-muted mt-0.5">Use spacer chamber if available. Rinse mouth with water after use.</span>
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0 bg-card-surface px-4 py-2 rounded-md shadow-sm border border-surface-container-highest">
                <div className="flex flex-col text-center">
                  <span className="text-[11px] text-text-muted uppercase font-bold">Dispense</span>
                  <span className="text-[18px] font-bold text-text-ink">1 Inhaler (200 Act)</span>
                </div>
                <div className="w-px h-8 bg-surface-container-highest"></div>
                <div className="flex flex-col text-center">
                  <span className="text-[11px] text-text-muted uppercase font-bold">Refills</span>
                  <span className="text-[18px] font-bold text-primary">3 (Three)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Directives */}
          <div className="p-4 rounded-lg bg-warning-bg mb-6 border border-clinical-warning/20 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-clinical-warning text-[22px] shrink-0 mt-0.5">info</span>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-text-ink">Physician Clinical Directives & Precautions</span>
                <ul className="mt-1 text-[14px] font-medium text-on-surface flex flex-col gap-1.5">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-clinical-warning"></span>
                    <span><strong className="font-bold">Follow-up Consultation:</strong> Return to clinic in 4 weeks for repeat spirometry and therapeutic index evaluation.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-clinical-error"></span>
                    <span><strong className="font-bold">Contraindication Alert:</strong> STRICTLY avoid beta-lactam antibiotics and any cross-reactive cephalosporin derivatives.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Attestation & Signature Graphic */}
          <div className="p-5 rounded-lg bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-6 border border-surface-container">
            <div className="flex flex-col max-w-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-clinical-success text-[18px]">verified_user</span>
                <span className="text-[11px] uppercase tracking-wider text-text-ink font-bold">Legal Signature & Authenticated Prescriber Attestation</span>
              </div>
              <p className="text-[12px] font-medium text-on-surface-variant italic">
                &quot;I hereby certify that I am the licensed practitioner named herein, personally examined or reviewed Maya Lin Harrison, and have electronically authorized this prescription in compliance with Federal Controlled Substances and State Pharmacy Regulations.&quot;
              </p>
              <span className="text-[11px] font-semibold text-text-muted mt-2">
                Dispense as Written (DAW): 0 • Substitution permitted unless DAW-1 specified • Non-transferable
              </span>
            </div>

            <div className="flex flex-col items-center md:items-end shrink-0 w-full md:w-auto">
              <div className="flex flex-col items-center p-3 rounded bg-card-surface shadow-sm w-full md:w-72 border border-surface-container-highest">
                <div className="h-14 w-full flex items-center justify-center text-[26px] italic text-primary select-none font-serif font-bold">
                  Eleanor Vance, MD
                </div>
                <div className="w-full h-px bg-surface-container-highest my-1"></div>
                <div className="flex flex-col items-center w-full">
                  <span className="text-[13px] text-text-ink font-bold">Dr. Eleanor Vance, MD</span>
                  <div className="flex items-center gap-1 text-[11px] text-clinical-success font-bold mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                    <span>Cryptographic Digest SHA-256 Valid</span>
                  </div>
                  <span className="text-[11px] font-semibold text-text-muted">Timestamp: 2024-10-24 10:49:12 UTC-5</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-container-highest flex flex-col md:flex-row items-center justify-between text-text-muted text-[11px] gap-2 font-bold">
            <span>SECURITY FEATURES: Void pantograph active • Microprint border authenticated • Tamper-evident E-Record</span>
            <span>Electronic Prescription ID: TXN-4919-8820-AA71 • Metropolitan Health Clinical Vault</span>
          </div>
        </div>

        {/* Share Modal Dialog */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
            <div className="bg-card-surface rounded-xl shadow-xl max-w-md w-full p-5 flex flex-col gap-4 border border-surface-container-highest">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">share</span>
                  <span className="text-[18px] font-bold text-text-ink">Share Official Prescription</span>
                </div>
                <button onClick={() => setShowShareModal(false)} className="p-1 rounded text-text-muted hover:text-text-ink cursor-pointer bg-surface-container-low hover:bg-surface-container">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <p className="text-[13px] font-medium text-on-surface-variant">
                This legal prescription file is secured with 256-bit encryption. Access is logged in the Metropolitan Health audit journal.
              </p>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-text-ink">Secure Web Portal URL</label>
                <div className="flex items-center bg-surface-container-low rounded-md px-3 py-2 border border-surface-container">
                  <input 
                    className="bg-transparent text-[12px] font-mono font-medium text-text-ink w-full focus:outline-none select-all" 
                    readOnly 
                    type="text" 
                    value="https://metrohealth.org/rx/verify?id=RX-2024-99812&auth=7a49f" 
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard?.writeText("https://metrohealth.org/rx/verify?id=RX-2024-99812&auth=7a49f");
                      alert("Link copied to clipboard!");
                    }}
                    className="text-primary text-[12px] font-bold hover:underline shrink-0 ml-2 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={() => {
                    setShowShareModal(false);
                    window.print();
                  }}
                  className="flex items-center justify-between p-3 rounded-md bg-surface-container-lowest hover:bg-surface-container text-text-ink transition-colors text-left border border-surface-container shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[22px]">picture_as_pdf</span>
                    <span className="text-[14px] font-bold">Download Official PDF Document</span>
                  </div>
                  <span className="text-[12px] font-semibold text-text-muted">412 KB</span>
                </button>
                <div className="flex items-center justify-between p-3 rounded-md bg-surface-container-lowest hover:bg-surface-container text-text-ink transition-colors border border-surface-container shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-clinical-success text-[22px]">mark_email_read</span>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold">Resend Email & SMS Link</span>
                      <span className="text-[12px] font-medium text-text-muted">To Maya Harrison (+1 555-849-2041)</span>
                    </div>
                  </div>
                  <button onClick={() => alert("Notification re-sent via Twilio SMS gateway.")} className="px-3 py-1.5 rounded bg-primary-container hover:bg-accent-dark text-card-surface text-[12px] font-bold shadow-sm cursor-pointer">
                    Send
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 rounded-md bg-surface-container text-text-ink text-[14px] font-bold hover:bg-surface-container-high transition-colors mt-2 cursor-pointer border border-surface-container-highest"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
