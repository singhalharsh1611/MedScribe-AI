"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function PharmacyFulfillmentPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [attestationChecked, setAttestationChecked] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isDispensed, setIsDispensed] = useState(false);
  const [itemsChecked, setItemsChecked] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true });

  const toggleItem = (idx: number) => {
    setItemsChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleDispenseClick = () => {
    if (!attestationChecked || isRecording) return;
    setIsRecording(true);
    showToast("Validating cryptographic SHA-256 seal and gravimetric tare weight...");
    setTimeout(() => {
      setIsRecording(false);
      setIsDispensed(true);
      showToast("Prescription marked as dispensed! Redirecting to Handover Summary...");
      setTimeout(() => {
        router.push("/pharmacy/handover");
      }, 1000);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      <div className="px-10 py-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Breadcrumb & Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card-surface p-5 rounded-xl shadow-sm border border-surface-container">
          <div className="flex flex-col gap-2 min-w-0">
            <nav className="flex items-center gap-2 text-text-muted text-[13px] font-bold">
              <Link href="/pharmacy/queue" className="hover:text-primary transition-colors cursor-pointer">
                Prescription Queue
              </Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-text-ink font-bold">Rx #RX-2024-99812</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-secondary font-bold">Fulfillment Review</span>
            </nav>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="bg-warning-bg text-clinical-warning text-[11px] px-2 py-0.5 rounded flex items-center gap-1.5 font-bold border border-clinical-warning/20">
                <span className="w-2 h-2 rounded-full bg-clinical-warning animate-pulse"></span>
                Awaiting Dispense Verification
              </span>
              <span className="bg-container-tint text-primary text-[11px] px-2 py-0.5 rounded flex items-center gap-1 font-bold border border-primary/20">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Locked Physician Order • Read-Only for Staff • E-Signed by Dr. Eleanor Vance, MD
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast("Printing patient bottle labels to Window 2 Thermal Printer...")}
              className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-text-ink text-[13px] font-bold px-4 py-2.5 rounded-md transition-colors shadow-sm border border-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">print</span>
              <span>Print Labels</span>
            </button>
            <button
              onClick={() => showToast("Patient education handout queued for Maya Lin Harrison.")}
              className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-text-ink text-[13px] font-bold px-4 py-2.5 rounded-md transition-colors shadow-sm border border-surface-container cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">description</span>
              <span>Patient Handout</span>
            </button>
          </div>
        </div>

        {/* Patient & Attending Doctor Context Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Patient Card */}
          <div className="lg:col-span-7 bg-card-surface p-6 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-secondary-fixed flex items-center justify-center text-primary text-[20px] font-bold shrink-0 shadow-sm border border-secondary/20">
                  MH
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-[22px] font-bold text-text-ink">Maya Lin Harrison</h1>
                    <span className="bg-surface-container-low border border-surface-container text-text-muted text-[11px] px-2 py-0.5 rounded font-bold">
                      32 yrs • Female
                    </span>
                  </div>
                  <span className="text-[13px] font-bold text-text-muted tracking-wider">
                    UHID: MH-2024-88412 • Bed 304-B (Pulmonary Outpatient)
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className="text-[11px] text-text-muted uppercase font-bold tracking-wide">
                  Fulfillment Serial
                </span>
                <span className="text-[14px] text-primary font-bold">#RX-2024-99812</span>
              </div>
            </div>

            {/* Severe Allergy Banner */}
            <div className="bg-error-bg p-4 rounded-lg flex items-start gap-3 border border-clinical-error/30 mt-2">
              <span className="material-symbols-outlined text-clinical-error text-[24px] shrink-0 mt-0.5">
                crisis_alert
              </span>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] text-clinical-error font-bold tracking-wide">
                    DOCUMENTED ALLERGY ALERT:
                  </span>
                  <span className="text-[11px] bg-card-surface text-clinical-error px-2 py-0.5 rounded font-bold shadow-sm">
                    Penicillin
                  </span>
                </div>
                <p className="text-[13px] font-bold text-clinical-error/80 pt-0.5">
                  Patient exhibits Moderate Urticaria and Anaphylactoid sensitivity. Ensure no cross-contaminants or
                  cephalosporin class interactions exist in compounding space.
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Record */}
          <div className="lg:col-span-5 bg-card-surface p-6 rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
                <span className="text-[13px] text-text-ink font-bold">Authorized Prescriber</span>
              </div>
              <span className="bg-success-bg text-clinical-success text-[11px] px-2 py-0.5 rounded flex items-center gap-1 font-bold border border-clinical-success/20">
                <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                Digital Sig Valid
              </span>
            </div>
            <div className="flex items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-secondary shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px]">stethoscope</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-bold text-text-ink">Dr. Eleanor Vance, MD</span>
                <span className="text-[12px] font-medium text-text-muted">
                  Attending Pulmonologist • Clinic Admin
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 bg-surface-container-lowest border border-surface-container p-3 rounded-lg mt-2">
              <div>
                <span className="text-[11px] text-text-muted font-bold block mb-0.5">DEA License</span>
                <span className="text-[12px] text-text-ink font-bold tracking-wider">BV-4491028</span>
              </div>
              <div>
                <span className="text-[11px] text-text-muted font-bold block mb-0.5">NPI Number</span>
                <span className="text-[12px] text-text-ink font-bold tracking-wider">1982736450</span>
              </div>
              <div className="col-span-2 pt-1">
                <span className="text-[11px] text-text-muted font-bold block mb-0.5">Issued Timestamp</span>
                <span className="text-[12px] text-text-ink font-bold">
                  Oct 24, 2024 at 10:49 AM EST
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Working Grid: Medications List & Right Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Formulary Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <h2 className="text-[18px] font-bold text-text-ink">Prescribed Formulary Review</h2>
                <span className="text-[11px] bg-container-tint text-primary px-2.5 py-0.5 rounded-full font-bold border border-primary/20">
                  3 Locked Items
                </span>
              </div>
              <span className="text-[12px] text-text-muted italic font-bold">
                Physician order locked • Compounding staff confirmation required
              </span>
            </div>

            {/* Formulary Card 1 */}
            <div className="bg-card-surface p-5 rounded-xl shadow-sm transition-all hover:border-primary/50 space-y-4 border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary font-bold shrink-0 shadow-sm mt-0.5">
                    01
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[18px] font-bold text-text-ink">Montelukast Sodium</span>
                      <span className="bg-surface-container-highest text-text-ink text-[12px] px-2 py-0.5 rounded font-bold shadow-sm">
                        10 mg
                      </span>
                    </div>
                    <span className="text-[13px] text-secondary font-bold">
                      Oral Tablet • Leukotriene Receptor Antagonist
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-lowest border border-surface-container px-3 py-1.5 rounded-md shadow-sm">
                  <span className="text-[11px] text-text-muted font-bold">DISPENSE:</span>
                  <span className="text-[13px] text-text-ink font-bold">
                    30 Tablets (30 Days • 2 Refills)
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-surface-container p-3 rounded-lg flex items-start gap-3 shadow-inner">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">schedule</span>
                <div className="flex flex-col">
                  <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold mb-1">
                    SIG (Physician Instructions):
                  </span>
                  <p className="text-[14px] text-text-ink font-bold">
                    &quot;Take 1 tablet by mouth every night at bedtime. For chronic asthma prophylaxis.&quot;
                  </p>
                </div>
              </div>

              <div className="bg-container-tint/30 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 border border-primary/10">
                <div className="flex flex-wrap items-center gap-4 text-text-muted text-[12px] font-bold">
                  <span>NDC: <strong className="text-text-ink">68180-496-11</strong></span>
                  <span>Lot: <strong className="text-text-ink">#MK-9021</strong></span>
                  <span>Exp: <strong className="text-text-ink">11/2026</strong></span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none bg-card-surface px-3 py-1.5 rounded-md shadow-sm border border-surface-container hover:bg-surface-container-lowest transition-colors">
                  <input
                    checked={itemsChecked[1]}
                    onChange={() => toggleItem(1)}
                    className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                    type="checkbox"
                  />
                  <span className="text-[12px] text-clinical-success font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Checked & Counted
                  </span>
                </label>
              </div>
            </div>

            {/* Formulary Card 2 */}
            <div className="bg-card-surface p-5 rounded-xl shadow-sm transition-all hover:border-primary/50 space-y-4 border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary font-bold shrink-0 shadow-sm mt-0.5">
                    02
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[18px] font-bold text-text-ink">Fluticasone Propionate</span>
                      <span className="bg-surface-container-highest text-text-ink text-[12px] px-2 py-0.5 rounded font-bold shadow-sm">
                        50 mcg / spray
                      </span>
                    </div>
                    <span className="text-[13px] text-secondary font-bold">
                      Nasal Spray Suspension • Corticosteroid
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-lowest border border-surface-container px-3 py-1.5 rounded-md shadow-sm">
                  <span className="text-[11px] text-text-muted font-bold">DISPENSE:</span>
                  <span className="text-[13px] text-text-ink font-bold">
                    1 Bottle (16g • 14 Days • 1 Refill)
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-surface-container p-3 rounded-lg flex items-start gap-3 shadow-inner">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">schedule</span>
                <div className="flex flex-col">
                  <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold mb-1">
                    SIG (Physician Instructions):
                  </span>
                  <p className="text-[14px] text-text-ink font-bold">
                    &quot;Administer 1 spray into each nostril once daily every morning. Shake well prior to dosing.&quot;
                  </p>
                </div>
              </div>

              <div className="bg-container-tint/30 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 border border-primary/10">
                <div className="flex flex-wrap items-center gap-4 text-text-muted text-[12px] font-bold">
                  <span>NDC: <strong className="text-text-ink">00093-2032-43</strong></span>
                  <span>Lot: <strong className="text-text-ink">#FL-4402</strong></span>
                  <span>Exp: <strong className="text-text-ink">08/2026</strong></span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none bg-card-surface px-3 py-1.5 rounded-md shadow-sm border border-surface-container hover:bg-surface-container-lowest transition-colors">
                  <input
                    checked={itemsChecked[2]}
                    onChange={() => toggleItem(2)}
                    className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                    type="checkbox"
                  />
                  <span className="text-[12px] text-clinical-success font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Checked & Counted
                  </span>
                </label>
              </div>
            </div>

            {/* Formulary Card 3 */}
            <div className="bg-card-surface p-5 rounded-xl shadow-sm transition-all hover:border-primary/50 space-y-4 border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary font-bold shrink-0 shadow-sm mt-0.5">
                    03
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[18px] font-bold text-text-ink">Albuterol Sulfate HFA</span>
                      <span className="bg-surface-container-highest text-text-ink text-[12px] px-2 py-0.5 rounded font-bold shadow-sm">
                        90 mcg / act
                      </span>
                    </div>
                    <span className="text-[13px] text-secondary font-bold">
                      Inhalation Aerosol • Short-Acting Beta2 Agonist
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-lowest border border-surface-container px-3 py-1.5 rounded-md shadow-sm">
                  <span className="text-[11px] text-text-muted font-bold">DISPENSE:</span>
                  <span className="text-[13px] text-text-ink font-bold">
                    1 Inhaler (200 Actuations • 30 Days • 3 Refills)
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-surface-container p-3 rounded-lg flex items-start gap-3 shadow-inner">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">schedule</span>
                <div className="flex flex-col">
                  <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold mb-1">
                    SIG (Physician Instructions):
                  </span>
                  <p className="text-[14px] text-text-ink font-bold">
                    &quot;Inhale 1 to 2 puffs every 4 to 6 hours as needed for wheeze or acute shortness of breath.&quot;
                  </p>
                </div>
              </div>

              <div className="bg-container-tint/30 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 border border-primary/10">
                <div className="flex flex-wrap items-center gap-4 text-text-muted text-[12px] font-bold">
                  <span>NDC: <strong className="text-text-ink">59310-579-20</strong></span>
                  <span>Lot: <strong className="text-text-ink">#AL-1109</strong></span>
                  <span>Exp: <strong className="text-text-ink">04/2027</strong></span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none bg-card-surface px-3 py-1.5 rounded-md shadow-sm border border-surface-container hover:bg-surface-container-lowest transition-colors">
                  <input
                    checked={itemsChecked[3]}
                    onChange={() => toggleItem(3)}
                    className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                    type="checkbox"
                  />
                  <span className="text-[12px] text-clinical-success font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Checked & Counted
                  </span>
                </label>
              </div>
            </div>

            {/* Clinical Integrity Guardrail Notice Box */}
            <div className="bg-card-surface p-5 rounded-xl shadow-sm flex items-start gap-4 border border-surface-container border-l-4 border-l-secondary">
              <div className="w-12 h-12 rounded-lg bg-surface-container-lowest border border-surface-container flex items-center justify-center text-secondary shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px]">gavel</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[16px] font-bold text-text-ink">
                    Clinical Integrity Guardrail • Pharmacist Enforcement
                  </span>
                  <span className="bg-container-tint text-primary text-[11px] px-2 py-0.5 rounded font-bold border border-primary/20">
                    SHA-256 Validated
                  </span>
                </div>
                <p className="text-[13px] font-bold text-text-muted">
                  This prescription is cryptographically sealed with the Attending Physician&apos;s digital signature.
                  Modifications, item additions, or dosage alterations are strictly restricted and can only be authorized
                  by Dr. Eleanor Vance, MD via clinical consultation order.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Verification Status, Visual Audit & Compounder Sign-Off */}
          <div className="lg:col-span-4 space-y-4">
            {/* Verification Progress Box */}
            <div className="bg-card-surface p-5 rounded-xl shadow-sm space-y-4 border border-surface-container">
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-bold text-text-ink">Item Reconciliation</span>
                <span className="text-[12px] bg-success-bg text-clinical-success font-bold px-2 py-0.5 rounded border border-clinical-success/20">
                  {Object.values(itemsChecked).filter(Boolean).length} of 3 Checked
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-clinical-success rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${(Object.values(itemsChecked).filter(Boolean).length / 3) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-text-muted text-[11px] font-bold pt-1">
                  <span>Lot Numbers Match</span>
                  <span>
                    {Object.values(itemsChecked).filter(Boolean).length === 3 ? "100% Ready" : "Verification In Progress"}
                  </span>
                </div>
              </div>
              <div className="bg-surface-container-lowest border border-surface-container p-3 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">barcode_scanner</span>
                  <span className="text-[12px] text-text-ink font-bold">Safety Barcode Audit</span>
                </div>
                <span className="text-[12px] text-clinical-success font-bold">Passed (3/3)</span>
              </div>
            </div>

            {/* Packaging Showcase */}
            <div className="bg-card-surface p-5 rounded-xl shadow-sm space-y-3 border border-surface-container">
              <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider">
                Packaging Standard
              </span>
              <div className="relative h-40 rounded-lg overflow-hidden border border-surface-container-high shadow-sm">
                <img
                  className="w-full h-full object-cover"
                  alt="Packaging Standard"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwbYGcQDs_4sNpvci5r5JMdKLReCK_9EGaYzEqCAA_d0RW6MPTux79WLXTgOuTPiqgGIBNoGdY97CtsmlFcDSYWVcIo_kn_g62XO0CRIr_87UXJlOEXEbRFI4ZbgiK1v71A8wXt87kBu9Uz5A6n3kLem2MRRor_ITMLmUHVw0Gc0DwiTYLwqkzDeGFLhk9Oky9upjjq9HkelftMlvpNSsrIq1KK4-p4zIitHV63Xz4V22BKzQgZ9CSTQ"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-text-ink/90 via-text-ink/30 to-transparent flex items-end p-3">
                  <span className="text-[12px] text-white font-bold drop-shadow-md">
                    Child-resistant safety caps & auxiliary warning tags applied
                  </span>
                </div>
              </div>
            </div>

            {/* Staff Dispenser Sign-Off Card */}
            <div className="bg-card-surface p-5 rounded-xl shadow-sm space-y-4 border border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
                <span className="text-[16px] font-bold text-text-ink">Dispenser Attestation</span>
              </div>
              <div className="bg-surface-container-lowest border border-surface-container p-3 rounded-lg flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary text-[15px] font-bold shrink-0 shadow-inner">
                  MV
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] text-text-ink font-bold truncate">
                    Marcus Vance, CPhT
                  </span>
                  <span className="text-[12px] font-medium text-text-muted">
                    Staff Compounder • ID #STF-4029
                  </span>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none pt-2">
                <input
                  checked={attestationChecked}
                  onChange={(e) => setAttestationChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-primary accent-primary cursor-pointer shadow-sm"
                  type="checkbox"
                />
                <span className="text-[12px] text-text-ink font-bold leading-tight">
                  I confirm all 3 medication items have been verified against NDC lots, packaged with safety caps, and
                  labeled with exact clinical SIG instructions.
                </span>
              </label>

              <div className="pt-3 flex flex-col gap-3">
                <button
                  disabled={!attestationChecked || isRecording}
                  onClick={handleDispenseClick}
                  className={`w-full text-[14px] py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-[0.99] ${
                    isDispensed
                      ? "bg-clinical-success text-white"
                      : !attestationChecked || isRecording
                      ? "bg-primary-container/50 text-on-primary cursor-not-allowed"
                      : "bg-primary hover:bg-accent-dark text-on-primary cursor-pointer"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                      <span>Recording Dispense Node...</span>
                    </>
                  ) : isDispensed ? (
                    <>
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      <span>Rx Dispensed Successfully!</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">task_alt</span>
                      <span>Mark as Dispensed</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => showToast("Flag logged: Dr. Eleanor Vance notified of pharmacy inquiry.")}
                  className="w-full bg-surface-container-low hover:bg-surface-container text-clinical-error border border-surface-container text-[13px] py-2.5 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">flag</span>
                  <span>Flag Discrepancy to Doctor</span>
                </button>
              </div>
            </div>

            {/* Ambient Voice Assistant Pill */}
            <div className="bg-surface-container-lowest border border-surface-container p-3 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary shadow-inner">
                  <span className="material-symbols-outlined text-[16px]">mic</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] text-text-ink font-bold mb-0.5">Voice OS Assistant</span>
                  <span className="text-[11px] text-text-muted font-bold">Say: “Verify Lot MK-9021”</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-primary rounded-full animate-pulse"></span>
                <span className="w-1 h-5 bg-primary rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></span>
                <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: "450ms" }}></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
