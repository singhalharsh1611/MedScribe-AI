"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function PharmacyDashboardPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState({ id: "RX-2024-99812", name: "Maya Lin Harrison", items: "3 Items" });
  const [tasksDone, setTasksDone] = useState<Record<string, string>>({});

  const handleTask = (taskId: string, label: string) => {
    setTasksDone((prev) => ({ ...prev, [taskId]: label }));
    showToast(`Task Completed: ${label}`);
  };

  const handleOpenDispenseModal = (id: string, name: string, items: string) => {
    setSelectedRx({ id, name, items });
    setModalOpen(true);
  };

  const finalizeDispense = () => {
    setModalOpen(false);
    showToast("Prescription safely dispensed & logged to EHR.");
    router.push("/pharmacy/fulfillment");
  };

  return (
    <div className="flex flex-col w-full">
      <div className="px-10 py-8 space-y-8 max-w-[1560px] mx-auto w-full">
        {/* Top Context & Greeting Header */}
        <div className="relative overflow-hidden rounded-xl bg-card-surface p-8 shadow-sm border border-surface-container">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] bg-container-tint text-primary px-2 py-0.5 rounded uppercase font-bold tracking-wider shadow-sm border border-primary/10">
                  Pharmacy & Dispensing Hub
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-clinical-success shadow-sm"></span>
                <span className="text-[11px] text-tertiary font-bold">Shift Lock #994</span>
              </div>
              <h1 className="text-[30px] font-bold text-text-ink tracking-tight">
                Station 104 Dispensing Unit
              </h1>
              <p className="text-[14px] font-medium text-text-muted flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
                Metropolitan Health Medical Center • North Pavilion Sterile Suite • Compounding Core
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/pharmacy/queue"
                className="bg-primary hover:bg-accent-dark text-on-primary text-[14px] font-bold px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                <span>Open Rx Queue</span>
              </Link>
            </div>
          </div>

          {/* Quick KPI Stats Strip */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-surface-container">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-text-muted uppercase font-bold">
                  Pending Fulfillment
                </span>
                <span className="text-[11px] bg-error-bg text-clinical-error px-2 py-0.5 rounded font-bold border border-clinical-error/20">
                  2 STAT
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[28px] font-bold text-text-ink">6</span>
                <span className="text-[14px] font-medium text-text-muted">prescriptions</span>
              </div>
              <div className="w-full bg-surface-container mt-2 h-1.5 rounded-full overflow-hidden shadow-inner">
                <div className="bg-clinical-error h-full rounded-full" style={{ width: "33%" }}></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-surface-container">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-text-muted uppercase font-bold">
                  Compounding
                </span>
                <span className="text-[11px] bg-warning-bg text-clinical-warning px-2 py-0.5 rounded font-bold border border-clinical-warning/20">
                  Live
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[28px] font-bold text-text-ink">3</span>
                <span className="text-[14px] font-medium text-text-muted">active formulas</span>
              </div>
              <div className="w-full bg-surface-container mt-2 h-1.5 rounded-full overflow-hidden shadow-inner">
                <div className="bg-clinical-warning h-full rounded-full" style={{ width: "50%" }}></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-surface-container">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-text-muted uppercase font-bold">
                  Ready for Handover
                </span>
                <span className="text-[11px] bg-success-bg text-clinical-success px-2 py-0.5 rounded font-bold border border-clinical-success/20">
                  Window
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[28px] font-bold text-text-ink">4</span>
                <span className="text-[14px] font-medium text-text-muted">orders staged</span>
              </div>
              <div className="w-full bg-surface-container mt-2 h-1.5 rounded-full overflow-hidden shadow-inner">
                <div className="bg-clinical-success h-full rounded-full" style={{ width: "66%" }}></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-surface-container">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-text-muted uppercase font-bold">
                  Dispensed Today
                </span>
                <span className="text-[11px] bg-container-tint text-primary px-2 py-0.5 rounded font-bold border border-primary/20">
                  100% Valid
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[28px] font-bold text-text-ink">28</span>
                <span className="text-[14px] font-medium text-text-muted">items logged</span>
              </div>
              <div className="w-full bg-surface-container mt-2 h-1.5 rounded-full overflow-hidden shadow-inner">
                <div className="bg-primary h-full rounded-full" style={{ width: "90%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main 12-Column Compounder Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: 8 Columns for Primary Compound Workflows */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            {/* SECTION 1: Pending Tasks & Action Required */}
            <div className="bg-card-surface rounded-xl p-6 shadow-sm space-y-4 border border-surface-container">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">assignment_late</span>
                  <div>
                    <h2 className="text-[18px] font-bold text-text-ink">Pending Tasks & Action Required</h2>
                    <p className="text-[12px] font-medium text-text-muted">
                      Immediate sterile compounding and laboratory compliance queue
                    </p>
                  </div>
                </div>
                <span className="text-[11px] bg-container-tint text-primary font-bold px-2.5 py-1 rounded shadow-sm">
                  3 Priority Items
                </span>
              </div>

              {/* Task 1 */}
              <div className="p-4 rounded-lg bg-surface-container-low hover:bg-surface-container-lowest border border-surface-container transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="bg-error-bg text-clinical-error text-[10px] px-2 py-0.5 rounded font-bold tracking-wide animate-pulse border border-clinical-error/20">
                      STAT PRIORITY
                    </span>
                    <span className="text-[11px] text-secondary font-bold">
                      Sterile Nebulization Unit
                    </span>
                    <span className="text-[12px] font-medium text-text-muted">• Room 101 Acute Care</span>
                  </div>
                  <p className="text-[15px] font-bold text-text-ink truncate">
                    Budesonide / Formoterol Nebulizer Suspension (0.5mg / 20mcg)
                  </p>
                  <div className="flex items-center gap-3 text-[12px] font-semibold text-text-muted pt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-text-muted">person</span>Maya Lin
                      Harrison
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">stethoscope</span>Dr.
                      Eleanor Vance, MD
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {tasksDone["task1"] ? (
                    <span className="bg-success-bg text-clinical-success text-[13px] px-4 py-2 rounded-md flex items-center gap-1 font-bold shadow-sm border border-clinical-success/20">
                      <span className="material-symbols-outlined text-[18px]">check</span> Compounding Launched
                    </span>
                  ) : (
                    <button
                      onClick={() => handleTask("task1", "Compounding Launched")}
                      className="bg-primary hover:bg-accent-dark text-on-primary text-[13px] font-bold px-4 py-2 rounded-md shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">biotech</span>
                      <span>Begin Compounding</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Task 2 */}
              <div className="p-4 rounded-lg bg-surface-container-low hover:bg-surface-container-lowest border border-surface-container transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="bg-warning-bg text-clinical-warning text-[10px] px-2 py-0.5 rounded font-bold border border-clinical-warning/20">
                      LOT AUDIT
                    </span>
                    <span className="text-[11px] text-secondary font-bold">Oral Suspension Lab</span>
                    <span className="text-[12px] font-medium text-text-muted">• Batch Exp: 14 Days</span>
                  </div>
                  <p className="text-[15px] font-bold text-text-ink truncate">
                    Reconstituted Amoxicillin-Clavulanate Batch #88219 (600mg/5mL)
                  </p>
                  <div className="flex items-center gap-3 text-[12px] font-semibold text-text-muted pt-1">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-text-muted">science</span>QC Assay
                      Passed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-text-muted">scale</span>Total Vol:
                      1200mL
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {tasksDone["task2"] ? (
                    <span className="bg-success-bg text-clinical-success text-[13px] px-4 py-2 rounded-md flex items-center gap-1 font-bold shadow-sm border border-clinical-success/20">
                      <span className="material-symbols-outlined text-[18px]">check</span> Lot Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => handleTask("task2", "Lot Verified")}
                      className="bg-surface-container-highest hover:bg-surface-container text-text-ink text-[13px] font-bold px-4 py-2 rounded-md shadow-sm flex items-center gap-1.5 transition-all active:scale-95 border border-surface-container-highest cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
                      <span>Verify Lot</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Task 3 */}
              <div className="p-4 rounded-lg bg-surface-container-low hover:bg-surface-container-lowest border border-surface-container transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="bg-success-bg text-clinical-success text-[10px] px-2 py-0.5 rounded font-bold border border-clinical-success/20">
                      COMPLIANT 3.8°C
                    </span>
                    <span className="text-[11px] text-secondary font-bold">
                      Refrigerator Vault C-2
                    </span>
                    <span className="text-[12px] font-medium text-text-muted">• Scheduled Cycle</span>
                  </div>
                  <p className="text-[15px] font-bold text-text-ink truncate">
                    Insulin Glargine (Lantus) & Biologics Daily Temperature Sensor Log
                  </p>
                  <div className="flex items-center gap-3 text-[12px] font-semibold text-text-muted pt-1">
                    <span className="flex items-center gap-1 text-clinical-success font-bold">
                      <span className="material-symbols-outlined text-[16px]">thermostat</span>Target 2.0°C - 8.0°C
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-text-muted">schedule</span>Due by 11:00 AM
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {tasksDone["task3"] ? (
                    <span className="bg-success-bg text-clinical-success text-[13px] px-4 py-2 rounded-md flex items-center gap-1 font-bold shadow-sm border border-clinical-success/20">
                      <span className="material-symbols-outlined text-[18px]">check</span> Telemetry Logged
                    </span>
                  ) : (
                    <button
                      onClick={() => handleTask("task3", "Telemetry Logged")}
                      className="bg-surface-container-highest hover:bg-surface-container text-text-ink text-[13px] font-bold px-4 py-2 rounded-md shadow-sm flex items-center gap-1.5 transition-all active:scale-95 border border-surface-container-highest cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
                      <span>Log Check</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Recent Finalized Prescriptions Table */}
            <div className="bg-card-surface rounded-xl p-6 shadow-sm space-y-4 border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">receipt_long</span>
                    <h2 className="text-[18px] font-bold text-text-ink">Recent Finalized Prescriptions</h2>
                  </div>
                  <p className="text-[12px] font-medium text-text-muted">
                    Doctor-authorized clinical orders validated via cryptographic voice lock
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-text-muted">
                      search
                    </span>
                    <input
                      className="bg-surface-container-low text-text-ink text-[12px] font-bold pl-8 pr-3 py-2 rounded-md focus:outline-none focus:border-primary border border-surface-container transition-colors w-48 shadow-inner"
                      placeholder="Search Rx or Patient..."
                      type="text"
                    />
                  </div>
                  <button
                    onClick={() => showToast("Formulary filters: Displaying active hospital formulary")}
                    className="w-9 h-9 rounded-md bg-surface-container-low flex items-center justify-center text-text-muted hover:bg-surface-container transition-colors border border-surface-container shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  </button>
                </div>
              </div>

              {/* Rx Orders Card Mosaic / List */}
              <div className="space-y-3">
                {/* Rx Order Item 1 */}
                <div className="p-4 rounded-lg bg-surface-container-lowest hover:border-primary/50 transition-all space-y-2 border border-surface-container shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-primary">#RX-2024-99812</span>
                      <span className="bg-error-bg text-clinical-error text-[11px] px-2 py-0.5 rounded font-bold border border-clinical-error/20">
                        Pending Dispense
                      </span>
                      <span className="text-[12px] font-medium text-text-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">timer</span>4m ago
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-secondary bg-container-tint px-2 py-1 rounded font-bold shadow-sm border border-secondary/10">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      <span>E-Signed by Dr. Vance, MD</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
                    <div className="md:col-span-4 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-[13px] font-bold text-on-primary-fixed border border-primary/20 shadow-sm">
                          ML
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-text-ink">Maya Lin Harrison</p>
                          <p className="text-[11px] font-medium text-text-muted">32 yrs • Female • Room 101</p>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-5 space-y-0.5">
                      <span className="text-[10px] text-text-muted uppercase font-bold">
                        Prescription Contents (3 Meds)
                      </span>
                      <p className="text-[12px] text-text-ink truncate font-bold">
                        Montelukast 10mg • Fluticasone Propionate • Albuterol HFA
                      </p>
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                      <button
                        onClick={() => handleOpenDispenseModal("RX-2024-99812", "Maya Lin Harrison", "3 Items")}
                        className="w-full md:w-auto bg-primary hover:bg-accent-dark text-on-primary text-[13px] font-bold px-4 py-2 rounded-md shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                        <span>Review & Dispense</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rx Order Item 2 */}
                <div className="p-4 rounded-lg bg-surface-container-lowest hover:border-surface-container-highest transition-all space-y-2 border border-surface-container shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-primary">#RX-2024-99810</span>
                      <span className="bg-warning-bg text-clinical-warning text-[11px] px-2 py-0.5 rounded font-bold border border-clinical-warning/20">
                        In Preparation
                      </span>
                      <span className="text-[12px] font-medium text-text-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">timer</span>18m ago
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-secondary bg-container-tint px-2 py-1 rounded font-bold shadow-sm border border-secondary/10">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      <span>E-Signed by Dr. Vance, MD</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
                    <div className="md:col-span-4 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-[13px] font-bold text-on-secondary-fixed border border-secondary/20 shadow-sm">
                          AP
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-text-ink">Arthur Pendelton</p>
                          <p className="text-[11px] font-medium text-text-muted">58 yrs • Male • Outpatient</p>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-5 space-y-0.5">
                      <span className="text-[10px] text-text-muted uppercase font-bold">
                        Prescription Contents (2 Meds)
                      </span>
                      <p className="text-[12px] text-text-ink truncate font-bold">
                        Levofloxacin 500mg (10 tabs) • Benzonatate 200mg
                      </p>
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                      <button
                        onClick={() => showToast("Order #RX-2024-99810 pack staged at Compounding Bin B")}
                        className="w-full md:w-auto bg-surface-container-highest hover:bg-surface-container text-text-ink text-[13px] font-bold px-4 py-2 rounded-md shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-surface-container-highest cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px] text-secondary">fast_forward</span>
                        <span>Continue Pack</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytical Sparklines Mini Deck */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card-surface p-4 rounded-xl shadow-sm space-y-2 border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-text-muted uppercase font-bold">Mean Prep Speed</span>
                  <span className="text-[11px] text-clinical-success font-bold">-18% vs avg</span>
                </div>
                <p className="text-[22px] font-bold text-text-ink">4.2 min</p>
                <svg className="w-full h-8 text-primary" preserveAspectRatio="none" viewBox="0 0 100 25">
                  <polyline fill="none" points="0,18 15,20 30,12 45,15 60,8 75,10 90,4 100,6" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></polyline>
                </svg>
              </div>
              <div className="bg-card-surface p-4 rounded-xl shadow-sm space-y-2 border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-text-muted uppercase font-bold">Voice Commands Logged</span>
                  <span className="text-[11px] text-primary font-bold">142 Today</span>
                </div>
                <p className="text-[22px] font-bold text-text-ink">99.4% Match</p>
                <svg className="w-full h-8 text-secondary" preserveAspectRatio="none" viewBox="0 0 100 25">
                  <polyline fill="none" points="0,14 15,16 30,13 45,9 60,11 75,5 90,6 100,3" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></polyline>
                </svg>
              </div>
              <div className="bg-card-surface p-4 rounded-xl shadow-sm space-y-2 border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-text-muted uppercase font-bold">Sterile Safety Index</span>
                  <span className="text-[11px] text-clinical-success font-bold">A+ Cleanroom</span>
                </div>
                <p className="text-[22px] font-bold text-text-ink">100% Valid</p>
                <svg className="w-full h-8 text-clinical-success" preserveAspectRatio="none" viewBox="0 0 100 25">
                  <polyline fill="none" points="0,20 20,18 40,15 60,12 80,8 90,7 100,5" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></polyline>
                </svg>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 4 Columns for Queue & Regulatory Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* SECTION A: Patients Waiting at Dispensing Window */}
            <div className="bg-card-surface rounded-xl p-6 shadow-sm space-y-4 border border-surface-container">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">sensor_door</span>
                  <div>
                    <h3 className="text-[16px] font-bold text-text-ink">Dispensing Windows</h3>
                    <p className="text-[12px] font-medium text-text-muted">Live patient pickup status</p>
                  </div>
                </div>
                <span className="text-[11px] bg-success-bg text-clinical-success px-2 py-0.5 rounded font-bold border border-clinical-success/20">
                  3 Queued
                </span>
              </div>

              {/* Queue List */}
              <div className="space-y-3">
                {/* Patient 1 */}
                <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container hover:border-surface-container-highest shadow-sm transition-all space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-container-tint text-primary px-2 py-0.5 rounded font-bold border border-primary/20">
                      WINDOW 2
                    </span>
                    <span className="text-[11px] text-clinical-warning flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[14px]">hourglass_top</span>Waiting 6m
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-text-ink">Maya Lin Harrison</p>
                      <p className="text-[11px] font-medium text-text-muted">32 yrs • Female • Rx #99812</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] bg-surface-container-high border border-surface-container-highest px-2 py-0.5 rounded text-text-ink font-bold shadow-sm">
                        3 Items
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => showToast("Calling Maya Lin Harrison to Window 2 via Audio Chime...")}
                      className="flex-1 bg-surface-container-highest hover:bg-surface-container text-text-ink text-[12px] font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-colors border border-surface-container-highest shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">volume_up</span>Call Window
                    </button>
                    <button
                      onClick={() => showToast("Biometric & ID Checked for Maya Lin Harrison")}
                      className="flex-1 bg-primary hover:bg-accent-dark text-on-primary text-[12px] font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">badge</span>Verify ID
                    </button>
                  </div>
                </div>

                {/* Patient 2 */}
                <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container hover:border-surface-container-highest shadow-sm transition-all space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-container-tint text-primary px-2 py-0.5 rounded font-bold border border-primary/20">
                      WINDOW 1
                    </span>
                    <span className="text-[11px] text-clinical-error flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[14px]">alarm</span>Waiting 14m
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-text-ink">Arthur Pendelton</p>
                      <p className="text-[11px] font-medium text-text-muted">58 yrs • Male • Post-Op Consult</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] bg-surface-container-high border border-surface-container-highest px-2 py-0.5 rounded text-text-ink font-bold shadow-sm">
                        Consult
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => showToast("Calling Arthur Pendelton to Window 1...")}
                      className="flex-1 bg-surface-container-highest hover:bg-surface-container text-text-ink text-[12px] font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-colors border border-surface-container-highest shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">volume_up</span>Call Window
                    </button>
                    <button
                      onClick={() => showToast("Biometric & ID Verified: Arthur Pendelton")}
                      className="flex-1 bg-primary hover:bg-accent-dark text-on-primary text-[12px] font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">badge</span>Verify ID
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cleanroom Verification Photo */}
            <div className="relative overflow-hidden rounded-xl bg-card-surface shadow-sm group border border-surface-container">
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Laminar Cleanroom Compounding Station"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA27gWQteLcMBHi-OTWvVmv7SfY8G7sDnQCHARfVdRcWRPUqf8Mf9wf3t7m2VaHomE2judG3-CxiNFEaj6KD5BAEs_UgfFzyggTTkJ3endcRjz8QNUPCqOL3b-b3IpWWDJfG-hr6hg9SOn1Mzp_qkKFw22uWXzD0X_--KIzb5atzD9hy-HUJmikltdhpmd7oysRhgqrQHBbC7OmKjuyt6wpMsA5o-YIFseaVbBSRc3reW0j34dsz1KpwA"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-text-ink/90 via-text-ink/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] bg-primary/80 backdrop-blur-md text-on-primary px-2 py-0.5 rounded font-bold uppercase shadow-sm border border-white/20">
                    Laminar Flow Hood #2
                  </span>
                  <p className="text-[14px] font-bold text-white mt-1.5">Sterility Audit Valid • ISO Class 5</p>
                  <p className="text-[11px] font-medium text-white/80 mt-0.5">Airflow velocity: 0.45 m/s • Filter certified</p>
                </div>
              </div>
            </div>

            {/* Permissions Architecture Note */}
            <div className="bg-surface-container-low rounded-xl p-5 shadow-sm space-y-3 border border-surface-container border-l-4 border-l-primary">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">verified_user</span>
                <div className="space-y-1">
                  <h4 className="text-[14px] font-bold text-text-ink">Clinical Permission Architecture</h4>
                  <p className="text-[12px] font-medium text-on-surface-variant leading-relaxed">
                    Staff Role: <strong className="text-text-ink font-bold">Dispensing & Fulfillment Only</strong>.
                    Attending physician’s cryptographic voice signatures are immutable and locked. Prescriptions remain
                    read-only per Section 402 hospital pharmacy safety protocols.
                  </p>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-text-muted bg-surface-container-lowest p-2 rounded-md border border-surface-container">
                <span className="flex items-center gap-1 text-secondary">
                  <span className="material-symbols-outlined text-[14px]">key</span>RSA-4096 Authenticated
                </span>
                <span className="font-mono">KEY: 0x9AF8...B41C</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Dispense Confirmation */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-text-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card-surface max-w-lg w-full rounded-xl shadow-xl overflow-hidden border border-surface-container-highest">
            <div className="p-5 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                <div>
                  <h3 className="text-[18px] font-bold text-text-ink">
                    Dispense Confirmation {selectedRx.id}
                  </h3>
                  <p className="text-[12px] font-medium text-text-muted">
                    Patient identity verification & barcode audit
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-text-muted hover:text-text-ink transition-colors border border-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-surface-container-lowest p-4 rounded-lg space-y-1 border border-surface-container shadow-sm">
                <span className="text-[11px] text-secondary font-bold uppercase">Recipient Details</span>
                <p className="text-[20px] font-bold text-text-ink">{selectedRx.name}</p>
                <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-text-muted pt-1">
                  <span>DOB: 11/14/1992</span>
                  <span>•</span>
                  <span>MRN: MH-884019</span>
                  <span>•</span>
                  <span className="text-clinical-success font-bold bg-success-bg px-2 py-0.5 rounded">Insurance Approved</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] text-text-muted uppercase font-bold">
                  Barcode Scanner Verification
                </span>
                <div className="flex items-center gap-2">
                  <input
                    className="bg-surface-container-low w-full font-mono text-[12px] font-bold p-2.5 rounded-md text-text-ink border border-surface-container shadow-inner outline-none"
                    readOnly
                    type="text"
                    value="BARCODE-99812-FLUT-ALB-01"
                  />
                  <button
                    onClick={() => showToast("Barcode Scanner: RFID Lot 88219 Match OK")}
                    className="bg-primary hover:bg-accent-dark text-on-primary text-[13px] font-bold px-4 py-2.5 rounded-md whitespace-nowrap shadow-sm cursor-pointer transition-colors"
                  >
                    Scan Box
                  </button>
                </div>
                <p className="text-[12px] font-bold text-clinical-success flex items-center gap-1.5 pt-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  All 3 container RFID seals match encrypted physician order.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-warning-bg text-clinical-warning flex items-start gap-2 border border-clinical-warning/20">
                <span className="material-symbols-outlined text-[20px]">info</span>
                <p className="text-[12px] font-bold leading-snug">
                  Counseling reminder: Inhaler rinse protocol must be explained per standard respiratory pathway guidelines.
                </p>
              </div>
            </div>
            <div className="p-5 bg-surface-container-low flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-surface-container">
              <button
                onClick={() => setModalOpen(false)}
                className="w-full sm:w-auto bg-surface-container-highest hover:bg-surface-container text-text-ink text-[13px] font-bold px-5 py-2.5 rounded-md transition-colors border border-surface-container-highest cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={finalizeDispense}
                className="w-full sm:w-auto bg-clinical-success hover:bg-tertiary-container text-white text-[13px] font-bold px-6 py-2.5 rounded-md shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Open Full Review & Dispense</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
