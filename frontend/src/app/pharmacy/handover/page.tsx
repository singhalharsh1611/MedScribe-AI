"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function PharmacyHandoverPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [slipPrinted, setSlipPrinted] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const handlePrint = () => {
    setSlipPrinted(true);
    showToast("Receipt Bag Slip sent to Window 2 Thermal Printer!");
    setTimeout(() => setSlipPrinted(false), 3000);
  };

  const handleSms = () => {
    setSmsSent(true);
    showToast("Pickup SMS notification successfully dispatched to (555) 302-8819.");
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Subtle Ambient Glow Element */}
      <div className="relative w-full px-10 py-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-clinical-success/10 via-primary/5 to-transparent blur-3xl pointer-events-none -z-10"></div>
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Top Operational Pathway Tracker */}
          <div className="flex items-center justify-between bg-card-surface rounded-xl p-3 shadow-sm border border-surface-container">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-success-bg flex items-center justify-center text-clinical-success border border-clinical-success/20 shadow-sm">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  task_alt
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-secondary uppercase tracking-wider font-bold mb-0.5">
                  Workflow Status
                </span>
                <span className="text-[15px] font-bold text-text-ink">
                  Step 4 of 4 • Clinical Handover Completed
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-text-muted">Ledger Node:</span>
              <span className="text-[11px] bg-container-tint text-primary px-2 py-0.5 rounded font-mono font-bold border border-primary/20 shadow-sm">
                RX-NODE-04-EHR
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-clinical-success shadow-sm ml-1"></span>
            </div>
          </div>

          {/* Main Layout Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Hero Confirmation & Dispensed Item Ledger */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Hero Confirmation Card */}
              <div className="relative bg-card-surface rounded-xl p-10 shadow-sm overflow-hidden flex flex-col items-center text-center border border-surface-container">
                <div className="absolute right-[-24px] top-[-24px] pointer-events-none opacity-5">
                  <span className="material-symbols-outlined text-[180px] text-clinical-success">verified</span>
                </div>

                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-success-bg flex items-center justify-center shadow-inner border-4 border-white">
                    <span
                      className="material-symbols-outlined text-[48px] text-clinical-success"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      inventory_2
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-clinical-success text-white flex items-center justify-center shadow-md border-2 border-white">
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-bg text-clinical-success rounded-full mb-4 border border-clinical-success/20 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span className="text-[11px] uppercase tracking-wider font-bold">
                    Chain of Custody Sealed
                  </span>
                </div>

                <h1 className="text-[28px] font-bold text-text-ink mb-3 tracking-tight">
                  Prescription Marked as Dispensed
                </h1>
                <p className="text-[15px] font-medium text-text-muted max-w-xl leading-relaxed">
                  Prescription <span className="font-bold text-text-ink">#RX-2024-99812</span> has been successfully
                  fulfilled, packaged, and recorded in the clinic electronic health record ledger.
                </p>

                {/* Inline Quick Stats */}
                <div className="grid grid-cols-3 gap-4 w-full mt-8 pt-6 bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-inner">
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] text-secondary uppercase font-bold mb-1">
                      Package Count
                    </span>
                    <span className="text-[18px] font-bold text-text-ink">3 Units</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-r border-surface-container">
                    <span className="text-[11px] text-secondary uppercase font-bold mb-1">
                      Verification
                    </span>
                    <span className="text-[18px] font-bold text-clinical-success flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[20px]">fingerprint</span> Dual-Sign
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] text-secondary uppercase font-bold mb-1">
                      Rx Ledger State
                    </span>
                    <span className="text-[18px] font-bold text-text-ink">Archived</span>
                  </div>
                </div>
              </div>

              {/* Summary of Dispensed Items Section */}
              <div className="bg-card-surface rounded-xl p-8 shadow-sm flex flex-col gap-6 border border-surface-container">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[24px]">medication</span>
                    <h2 className="text-[18px] font-bold text-text-ink">Dispensed Medication Packets</h2>
                  </div>
                  <span className="text-[12px] bg-success-bg text-clinical-success px-3 py-1.5 rounded font-bold border border-clinical-success/20 shadow-sm">
                    3 of 3 Verified Safe
                  </span>
                </div>

                {/* Item 1 */}
                <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:border-surface-container-highest transition-colors border border-surface-container gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary shadow-sm">
                      <span className="material-symbols-outlined text-[24px]">pill</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[15px] font-bold text-text-ink">Montelukast Sodium 10mg</span>
                        <span className="text-[11px] bg-container-tint text-secondary px-2 py-0.5 rounded font-bold border border-secondary/10">
                          Oral
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-text-muted text-[12px] font-bold mt-0.5">
                        <span>30 Film-Coated Tablets</span>
                        <span>•</span>
                        <span className="font-mono text-text-ink bg-surface-container px-1 rounded">Lot #MK-9021</span>
                        <span>•</span>
                        <span>Exp: 11/2026</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col text-left md:text-right">
                    <span className="text-[13px] text-clinical-success font-bold flex items-center justify-start md:justify-end gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span> Dispensed
                    </span>
                    <span className="text-[12px] text-text-muted font-bold mt-0.5">Barcoded Seal #0912</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:border-surface-container-highest transition-colors border border-surface-container gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary shadow-sm">
                      <span className="material-symbols-outlined text-[24px]">vaccines</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[15px] font-bold text-text-ink">
                          Fluticasone Propionate 50mcg
                        </span>
                        <span className="text-[11px] bg-container-tint text-secondary px-2 py-0.5 rounded font-bold border border-secondary/10">
                          Nasal Spray
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-text-muted text-[12px] font-bold mt-0.5">
                        <span>1 Metered Spray Bottle (16g)</span>
                        <span>•</span>
                        <span className="font-mono text-text-ink bg-surface-container px-1 rounded">Lot #FL-4402</span>
                        <span>•</span>
                        <span>Exp: 08/2025</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col text-left md:text-right">
                    <span className="text-[13px] text-clinical-success font-bold flex items-center justify-start md:justify-end gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span> Dispensed
                    </span>
                    <span className="text-[12px] text-text-muted font-bold mt-0.5">Barcoded Seal #0913</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:border-surface-container-highest transition-colors border border-surface-container gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary shadow-sm">
                      <span className="material-symbols-outlined text-[24px]">air</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[15px] font-bold text-text-ink">
                          Albuterol Sulfate HFA 90mcg
                        </span>
                        <span className="text-[11px] bg-container-tint text-secondary px-2 py-0.5 rounded font-bold border border-secondary/10">
                          Inhaler
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-text-muted text-[12px] font-bold mt-0.5">
                        <span>1 Pressurized Canister (200 Actuations)</span>
                        <span>•</span>
                        <span className="font-mono text-text-ink bg-surface-container px-1 rounded">Lot #AL-1109</span>
                        <span>•</span>
                        <span>Exp: 04/2026</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col text-left md:text-right">
                    <span className="text-[13px] text-clinical-success font-bold flex items-center justify-start md:justify-end gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span> Dispensed
                    </span>
                    <span className="text-[12px] text-text-muted font-bold mt-0.5">Barcoded Seal #0914</span>
                  </div>
                </div>

                {/* Gravimetric Scale Notice */}
                <div className="flex items-center justify-between bg-surface-container-lowest border border-surface-container p-4 rounded-lg mt-2 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-[22px]">verified_user</span>
                    <span className="text-[13px] text-text-muted font-bold">
                      Compound & Dose Precision verified via MedScribe AI Gravimetric Scale Node. Zero Variance.
                    </span>
                  </div>
                  <span className="text-[13px] text-text-ink font-bold bg-surface-container px-3 py-1.5 rounded-md shadow-sm">100% Accuracy</span>
                </div>
              </div>

              {/* Secondary Workflow Actions Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Print Dispensing Slip */}
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-between p-5 bg-card-surface rounded-xl shadow-sm hover:border-primary/50 hover:bg-surface-container-lowest transition-all group text-left border border-surface-container cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container border border-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors shadow-sm">
                      <span className="material-symbols-outlined text-[24px]">
                        {slipPrinted ? "sync" : "print"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] text-text-ink font-bold mb-0.5">
                        {slipPrinted ? "Printed at Window 2" : "Print Dispensing Receipt"}
                      </span>
                      <span className="text-[12px] text-text-muted font-bold">
                        Bag slip & instructions label
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </button>

                {/* Send Pickup SMS */}
                <button
                  onClick={handleSms}
                  className="flex items-center justify-between p-5 bg-card-surface rounded-xl shadow-sm hover:border-primary/50 hover:bg-surface-container-lowest transition-all group text-left border border-surface-container cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container border border-surface-container-highest flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors shadow-sm">
                      <span className="material-symbols-outlined text-[24px]">sms</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] text-text-ink font-bold mb-0.5">
                        Pickup SMS Notification
                      </span>
                      <span
                        className={`text-[12px] font-bold ${
                          smsSent ? "text-clinical-success" : "text-text-muted"
                        }`}
                      >
                        {smsSent ? "SMS Dispatched (10:58 AM)" : "Send confirmation to patient"}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>

            {/* Right 4 Columns: Handover Telemetry */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Return to Queue Block */}
              <div className="bg-card-surface rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-surface-container">
                <span className="text-[11px] text-secondary uppercase tracking-wider font-bold">
                  Immediate Next Step
                </span>
                <Link
                  href="/pharmacy/queue"
                  className="w-full py-3 px-4 bg-primary hover:bg-accent-dark text-on-primary rounded-lg text-[15px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Return to Prescription Queue</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>

                {/* Direct Jump to Next Patient */}
                <div className="bg-surface-container-lowest border border-surface-container rounded-lg p-4 flex flex-col gap-2 mt-2 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-text-muted font-bold uppercase">
                      Next In Line
                    </span>
                    <span className="text-[10px] bg-warning-bg text-clinical-warning px-2 py-0.5 rounded font-bold border border-clinical-warning/20">
                      Urgent
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-text-ink">Arthur Pendelton</span>
                      <span className="text-[12px] font-medium text-text-muted mt-0.5">
                        #RX-2024-99813 • Stat IV Compound
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        showToast("Loading Arthur Pendelton (#RX-2024-99813)...");
                        router.push("/pharmacy/fulfillment");
                      }}
                      className="w-9 h-9 rounded-lg bg-surface-container-high border border-surface-container-highest flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors cursor-pointer shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[22px]">play_arrow</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Handover Telemetry Card */}
              <div className="bg-card-surface rounded-xl p-6 shadow-sm flex flex-col gap-5 border border-surface-container">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">fact_check</span>
                    <h3 className="text-[16px] font-bold text-text-ink">Handover Telemetry</h3>
                  </div>
                  <span className="material-symbols-outlined text-clinical-success text-[22px]">check_circle</span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1 bg-surface-container-lowest border border-surface-container p-3 rounded-lg shadow-sm">
                    <span className="text-[10px] text-secondary uppercase font-bold flex items-center gap-1.5 mb-0.5">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> Dispense Timestamp
                    </span>
                    <span className="text-[14px] font-bold text-text-ink">October 24, 2024</span>
                    <span className="text-[12px] font-mono font-bold text-text-muted">
                      10:58:14 AM EST
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 bg-surface-container-lowest border border-surface-container p-3 rounded-lg shadow-sm">
                    <span className="text-[10px] text-secondary uppercase font-bold flex items-center gap-1.5 mb-0.5">
                      <span className="material-symbols-outlined text-[14px]">badge</span> Dispensing Staff
                    </span>
                    <span className="text-[14px] font-bold text-text-ink">Marcus Vance, CPhT</span>
                    <span className="text-[12px] font-mono font-bold text-text-muted">
                      ID: Badge #STF-4029
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 bg-surface-container-lowest border border-surface-container p-3 rounded-lg shadow-sm">
                    <span className="text-[10px] text-secondary uppercase font-bold flex items-center gap-1.5 mb-0.5">
                      <span className="material-symbols-outlined text-[14px]">room</span> Dispensing Station
                    </span>
                    <span className="text-[14px] font-bold text-text-ink">Window 2</span>
                    <span className="text-[12px] font-bold text-text-muted">
                      Clinical Dispensing Unit A (North Wing)
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 bg-surface-container-lowest border border-surface-container p-3 rounded-lg shadow-sm">
                    <span className="text-[10px] text-secondary uppercase font-bold flex items-center gap-1.5 mb-0.5">
                      <span className="material-symbols-outlined text-[14px]">how_to_reg</span> Recipient Handover
                    </span>
                    <span className="text-[14px] font-bold text-text-ink">Patient In-Person</span>
                    <span className="text-[13px] text-text-ink font-bold mt-0.5">Maya Lin Harrison</span>
                    <span className="text-[11px] font-bold text-clinical-success flex items-center gap-1 mt-1 bg-success-bg px-2 py-1 rounded w-fit border border-clinical-success/20">
                      <span className="material-symbols-outlined text-[14px]">verified</span> ID Verified (DOB:
                      06/14/1990)
                    </span>
                  </div>
                </div>

                {/* Audit Block */}
                <div className="bg-surface-container border border-surface-container-highest p-4 rounded-lg flex flex-col gap-1 shadow-inner">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-secondary font-bold uppercase">
                      Audit Record
                    </span>
                    <span className="text-[10px] bg-success-bg text-clinical-success px-2 py-0.5 rounded font-bold border border-clinical-success/20 shadow-sm">
                      HL7 Transmitted
                    </span>
                  </div>
                  <span className="text-[12px] font-mono font-bold text-text-ink break-all mb-1">
                    #DSP-2024-99812-F7
                  </span>
                  <span className="text-text-muted text-[11px] font-bold leading-tight">
                    Dispense Acknowledgement transmitted to Central Health Information Exchange (HIE).
                  </span>
                </div>
              </div>

              {/* Photo Verification Card */}
              <div className="bg-card-surface rounded-xl p-5 shadow-sm flex flex-col gap-3 border border-surface-container">
                <span className="text-[11px] text-secondary uppercase font-bold">
                  Cold Chain & Package Snapshot
                </span>
                <div className="relative h-32 w-full rounded-lg overflow-hidden bg-surface-container shadow-inner border border-surface-container-highest">
                  <div
                    className="bg-cover bg-center w-full h-full"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCkoaM9W-wBZryYFq-np3wYi8QU4nabSa5tIyMT_iyT1GwUjEH5sxg7cQNc_zHhJFbkAOu-abCFmJGjpdiujpwmKppwj1EY_42urPtz6xjH0FXuYTtCYAwwG_meIG12dcXGhAmzHXGDVwIuM7guIeY9v9jjJIVPFUPOBnHMxPtLSQSp-z3HVjvXTHvppeRTwxneStsMgERyY1B4e81gRh7KQihyfTnB107cf5bML9UXM2viEcPJpz9MAQ')",
                    }}
                  ></div>
                  <div className="absolute bottom-2 left-2 bg-text-ink/80 text-white px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-clinical-success">photo_camera</span>
                    Window #2 Auto-Capture
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[12px] text-text-muted font-bold pt-1 gap-2 sm:gap-0">
                  <span>
                    Temp: <strong className="text-text-ink font-mono bg-surface-container-low px-1.5 py-0.5 rounded border border-surface-container">20.4°C</strong> (Ambient)
                  </span>
                  <span>
                    Weight: <strong className="text-text-ink font-mono bg-surface-container-low px-1.5 py-0.5 rounded border border-surface-container">148.2g</strong> (Nominal)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Voice Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4 pointer-events-auto">
        <div className="bg-card-surface/95 backdrop-blur-xl rounded-full p-2 shadow-xl flex items-center justify-between border border-surface-container">
          <div className="flex items-center gap-3 pl-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm animate-pulse border border-primary-container">
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] text-text-ink font-bold flex items-center gap-1.5 mb-0.5">
                Voice Assistant Active
                <span className="w-2 h-2 rounded-full bg-clinical-success shadow-sm"></span>
              </span>
              <span className="text-[11px] font-bold text-text-muted">
                Say &quot;Open next prescription&quot; or &quot;Print bag tag&quot;
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 pr-2">
            <div className="hidden sm:flex items-center gap-1 h-6 px-3 bg-surface-container rounded-full border border-surface-container-highest shadow-inner">
              <span className="w-1 h-3.5 bg-primary rounded-full animate-bounce"></span>
              <span className="w-1 h-4 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></span>
              <span className="w-1 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-4 bg-primary rounded-full animate-bounce [animation-delay:0.15s]"></span>
            </div>
            <button
              onClick={() => showToast("Voice mic muted.")}
              className="px-4 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container text-text-ink text-[12px] font-bold transition-colors cursor-pointer border border-surface-container-highest shadow-sm"
            >
              Mute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
