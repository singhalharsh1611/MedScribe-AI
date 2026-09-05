"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function PharmacyQueuePage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const orders = [
    {
      id: "RX-2024-9041",
      name: "Maya Lin Harrison",
      uhid: "UHID-88219",
      ageGender: "34 yrs · Female · Room 402-B · ER Referral",
      doctor: "Dr. Eleanor Vance, MD",
      doctorRole: "Chief Pulmonologist · Attending",
      time: "10:49 AM · 6 mins ago",
      status: "Pending Dispense",
      statusColor: "text-clinical-warning",
      statusBg: "bg-warning-bg",
      indicatorColor: "bg-clinical-warning",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-3QMECKnep9kHfc964vzk8ImNSPYenlaiRQuC_TDkeh3_AxVe44EoIfFuPr-_sYfcKvPXW1XqQz-mWxkCzhwBedADKjNVxfDLDHwOOjYob3UuKPCYZBsTgXxYrdtWSuSX-CK4zHa5SuGYO8kG-08CxoUpuYe_TZHYv0pYGyRyZ_mNf8JugclM_ng-tyVqLCQ0K7strYnG3i97Y-9o8Qy5SiVcEb5C1Ij_5YmADeRZZx1sWcUzvnX0BQ",
      regimen: [
        { name: "Montelukast", spec: "10mg Oral" },
        { name: "Fluticasone Propionate", spec: "50mcg Spray" },
        { name: "Albuterol Sulfate", spec: "HFA 90mcg Inhaler" },
      ],
      highCheck: true,
      tab: "pending",
      canDispense: true,
    },
    {
      id: "RX-2024-9038",
      name: "Arthur Pendelton",
      uhid: "UHID-71904",
      ageGender: "68 yrs · Male · Cardiology Suite C",
      doctor: "Dr. Sarah Al-Mansoor, MD",
      doctorRole: "Interventional Cardiology",
      time: "10:32 AM · 23 mins ago",
      status: "Compounding",
      statusColor: "text-on-secondary-container",
      statusBg: "bg-secondary-container/40",
      indicatorColor: "bg-primary",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoBfB2z_Cp8Lo8nm2Ago4mjKa_-Vhl1ek_u58BZo-IDOmgOwYEags3bRGdmh8XSSmKGkblzDDWOXPREK3TacV9ujOxHgk3kMVMvAouZyVE826KyM-IhSdoO3e30Nm0q7JJDXIWWve06dPThgtcXgMwJovpKL_tP_y5c_5uUkIE3rW_HSvKOlkP4WM__koTXAopnJ9cqVHRoCkVxuxMs2vCk3tycYA1KGbeiOXqS4bFTFt3pyPNHqsbYA",
      regimen: [
        { name: "Carvedilol Extended", spec: "25mg Slow-Release" },
        { name: "Potassium Chloride", spec: "20 mEq Microcaps" },
      ],
      tab: "compounding",
      podAction: true,
    },
    {
      id: "RX-2024-9035",
      name: "David Morales",
      uhid: "UHID-93114",
      ageGender: "42 yrs · Male · Orthopedic Outpatient",
      doctor: "Dr. Kevin Zhao, MD",
      doctorRole: "Orthopedic Surgery / Trauma",
      time: "10:15 AM · 40 mins ago",
      status: "Pending Witness",
      statusColor: "text-clinical-warning",
      statusBg: "bg-warning-bg",
      indicatorColor: "bg-clinical-warning",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDivfZnPQJBIBBJFyRyGIxkIQNdHs1NUrVQwiGDD2HjuWybQgRVX67nJcW4qP5MC01ROPKc18ARk-syUO7uqrABJ5SdOPa7suF1Z9BTWBMDZdvOYPLRTMxehiN2qgIULWLKxFQJY5ff2CWGKkAhY3RIlqBvQoAwdDJ5767Kz_H_6YBxbQN6FaxDYtNLCDcLrlU1psV13k8U7fFUl3g4GoRixwHsIwhKTIshM6x-0vES0Ir0CaTQVN9gg",
      regimen: [
        { name: "Oxycodone / APAP", spec: "5mg/325mg (Schedule II)", alert: true },
        { name: "Cyclobenzaprine", spec: "10mg Oral" },
      ],
      tab: "pending",
      dualSign: true,
    },
    {
      id: "RX-2024-9029",
      name: "Elena Rostova",
      uhid: "UHID-40291",
      ageGender: "29 yrs · Female · Endocrinology Clinic",
      doctor: "Dr. Eleanor Vance, MD",
      doctorRole: "Staff Physician",
      time: "09:50 AM · 1 hr ago",
      status: "Ready for Pickup",
      statusColor: "text-clinical-success",
      statusBg: "bg-success-bg",
      indicatorColor: "bg-clinical-success",
      initials: "ER",
      regimen: [
        { name: "Insulin Glargine", spec: "100 units/mL Soln (Cold Chain)" },
        { name: "BD Nano Pen Needles", spec: "32G 4mm" },
      ],
      tab: "pickup",
      pickupAction: true,
    },
    {
      id: "RX-2024-9022",
      name: "Marcus Brody",
      uhid: "UHID-51002",
      ageGender: "51 yrs · Male · Nephrology Ward 2",
      doctor: "Dr. Sarah Al-Mansoor, MD",
      doctorRole: "Attending Specialist",
      time: "09:20 AM · 1.5 hrs ago",
      status: "Pending Dispense",
      statusColor: "text-clinical-warning",
      statusBg: "bg-warning-bg",
      indicatorColor: "bg-clinical-warning",
      initials: "MB",
      regimen: [
        { name: "Levofloxacin", spec: "250mg q48h (Renal Dosed)" },
        { name: "Sodium Bicarbonate", spec: "650mg Tablets" },
      ],
      tab: "pending",
      verifyDose: true,
    },
    {
      id: "RX-2024-9011",
      name: "Claire Dupont",
      uhid: "UHID-32980",
      ageGender: "19 yrs · Female · Pediatric Allergy Outpatient",
      doctor: "Dr. Kevin Zhao, MD",
      doctorRole: "Allergy & Immunology",
      time: "08:44 AM · Dispensed",
      status: "Dispensed",
      statusColor: "text-text-muted",
      statusBg: "bg-surface-container",
      indicatorColor: "bg-surface-container-highest",
      initials: "CD",
      regimen: [
        { name: "Epinephrine Auto-Injector 0.3mg", crossed: true },
        { name: "Cetirizine HCl 10mg", crossed: true },
      ],
      tab: "dispensed",
      auditAction: true,
    },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.doctor.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return o.tab === activeTab && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full px-10 py-8 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Node Live Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[12px] text-text-muted font-semibold">
          <Link href="/pharmacy/dashboard" className="hover:text-primary transition-colors cursor-pointer">
            SleekCare Pharmacy
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-text-ink font-bold">Rx Dispensing Queue</span>
          <span className="inline-flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full bg-container-tint text-primary font-bold shadow-sm border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            FHIR v4.3 Live Stream
          </span>
        </div>

        {/* Voice Control Quick Bar */}
        <div
          onClick={() => showToast("Voice Engine ready: Speak patient UHID or prescription ID...")}
          className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full shadow-sm border border-surface-container hover:bg-surface-container cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-primary text-[18px]">graphic_eq</span>
          <span className="text-[12px] text-text-ink font-semibold">
            Voice Trigger: <span className="text-primary font-bold">&quot;Dispense Order #RX-904&quot;</span>
          </span>
          <span className="h-4 w-px bg-surface-container-highest mx-2"></span>
          <span className="text-[12px] text-clinical-success font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-clinical-success"></span> Listening
          </span>
        </div>
      </div>

      {/* Header Block */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-card-surface p-8 rounded-xl shadow-sm border border-surface-container">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex p-1.5 rounded-lg bg-primary-fixed text-on-primary-fixed shadow-sm">
              <span className="material-symbols-outlined text-[24px]">medication_liquid</span>
            </span>
            <span className="text-[12px] uppercase tracking-wider text-secondary font-bold">
              In-Patient & Ambulatory Dispense
            </span>
          </div>
          <h1 className="text-[28px] font-bold text-text-ink tracking-tight">
            Prescription Dispensing Queue
          </h1>
          <p className="text-[14px] font-medium text-text-muted mt-1">
            Real-time stream of finalized physician orders synchronized from Consultation & Voice Prescription studios.
          </p>
        </div>

        {/* Telemetry Mini-Cards */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-lg min-w-[140px] shadow-sm">
            <div className="text-[11px] text-text-muted font-bold uppercase mb-1">Avg Fill Velocity</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] text-text-ink font-bold">3.8</span>
              <span className="text-[12px] text-clinical-success font-bold">min/Rx</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-container p-4 rounded-lg min-w-[140px] shadow-sm">
            <div className="text-[11px] text-text-muted font-bold uppercase mb-1">Awaiting Verification</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] text-clinical-warning font-bold">6</span>
              <span className="text-[12px] text-text-muted font-semibold">High Urgency</span>
            </div>
          </div>
          <div className="bg-primary p-4 rounded-lg min-w-[150px] text-on-primary shadow-sm border border-primary-container">
            <div className="text-[11px] text-primary-fixed font-bold uppercase mb-1">Automated Batch</div>
            <div className="flex items-baseline justify-between">
              <span className="text-[24px] text-on-primary font-bold">Ready (4)</span>
              <span className="material-symbols-outlined text-[22px]">bolt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Tab Toolbar */}
      <div className="bg-card-surface p-4 rounded-xl shadow-sm space-y-4 border border-surface-container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-surface-container-low border border-surface-container rounded-lg overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-md text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-text-muted hover:text-text-ink hover:bg-surface-container"
              }`}
            >
              <span>All Orders</span>
              <span className={`px-2 py-0.5 rounded text-[11px] ${activeTab === "all" ? "bg-primary text-on-primary" : "bg-surface-container text-text-ink"}`}>
                13
              </span>
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-md text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "pending"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-text-muted hover:text-text-ink hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
              <span>Pending</span>
              <span className={`px-2 py-0.5 rounded text-[11px] ${activeTab === "pending" ? "bg-primary text-on-primary" : "bg-surface-container text-text-ink"}`}>6</span>
            </button>
            <button
              onClick={() => setActiveTab("compounding")}
              className={`px-4 py-2 rounded-md text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "compounding"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-text-muted hover:text-text-ink hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">science</span>
              <span>Compounding</span>
              <span className={`px-2 py-0.5 rounded text-[11px] ${activeTab === "compounding" ? "bg-primary text-on-primary" : "bg-surface-container text-text-ink"}`}>
                3
              </span>
            </button>
            <button
              onClick={() => setActiveTab("pickup")}
              className={`px-4 py-2 rounded-md text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "pickup"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-text-muted hover:text-text-ink hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-clinical-success">check_circle</span>
              <span>Ready for Pickup</span>
              <span className={`px-2 py-0.5 rounded text-[11px] ${activeTab === "pickup" ? "bg-primary text-on-primary" : "bg-surface-container text-text-ink"}`}>
                4
              </span>
            </button>
            <button
              onClick={() => setActiveTab("dispensed")}
              className={`px-4 py-2 rounded-md text-[13px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "dispensed"
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-text-muted hover:text-text-ink hover:bg-surface-container"
              }`}
            >
              <span>Dispensed Today</span>
              <span className={`px-2 py-0.5 rounded text-[11px] ${activeTab === "dispensed" ? "bg-primary text-on-primary" : "bg-surface-container text-text-ink"}`}>
                28
              </span>
            </button>
          </div>

          {/* Quick Action Right Wing */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast("Filter by urgent priority, controlled substances, and cold chain.")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-low text-text-ink hover:bg-surface-container border border-surface-container text-[12px] font-bold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Filters</span>
            </button>
            <button
              onClick={() => showToast("Printing active queue batch dispensing slip...")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-low text-text-ink hover:bg-surface-container border border-surface-container text-[12px] font-bold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Batch Slip</span>
            </button>
          </div>
        </div>

        {/* Search input with Omnibox Ergonomics */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-3 bg-surface-container-lowest border border-surface-container rounded-lg text-text-ink text-[14px] font-bold placeholder:font-medium placeholder:text-text-muted focus:outline-none focus:border-primary shadow-inner"
            placeholder="Search queue by Patient Name, UHID (e.g. UHID-8821), Rx Order ID, or Prescribing Clinician..."
            type="text"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-card-surface border border-surface-container px-2 py-1 rounded text-[11px] font-bold text-text-muted shadow-sm">
            <span>Ctrl</span> + <span>K</span>
          </div>
        </div>
      </div>

      {/* Prescription Cards Stream */}
      <div className="space-y-4">
        {filteredOrders.length === 0 && (
          <div className="bg-card-surface p-10 text-center rounded-xl text-text-muted border border-surface-container shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-secondary mb-3">search_off</span>
            <p className="text-[16px] font-bold text-text-ink">No prescriptions match this category or query.</p>
          </div>
        )}

        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="relative bg-card-surface p-5 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-5 border border-surface-container overflow-hidden"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.indicatorColor}`}></div>

            {/* Patient & Order Identification */}
            <div className="flex items-start gap-4 min-w-[300px] pl-3">
              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-primary-fixed flex items-center justify-center border border-surface-container-highest shadow-sm">
                {order.img ? (
                  <img className="w-full h-full object-cover" alt={order.name} src={order.img} />
                ) : (
                  <div className="text-[16px] text-primary font-bold">{order.initials}</div>
                )}
                {order.highCheck && (
                  <span
                    className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-clinical-warning ring-2 ring-card-surface shadow-sm"
                    title="Action Needed"
                  ></span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3
                    onClick={() => {
                      if (order.canDispense) router.push("/pharmacy/fulfillment");
                    }}
                    className="text-[16px] text-text-ink font-bold hover:text-primary cursor-pointer transition-colors"
                  >
                    {order.name}
                  </h3>
                  <span className="text-[11px] bg-container-tint px-2 py-0.5 rounded text-secondary font-bold shadow-sm border border-secondary/10">
                    {order.uhid}
                  </span>
                </div>
                <p className="text-[12px] font-medium text-text-muted">{order.ageGender}</p>
                <div className="flex items-center gap-1.5 text-[12px] text-primary font-bold">
                  <span className="material-symbols-outlined text-[16px]">badge</span>
                  <span>Rx #{order.id}</span>
                </div>
              </div>
            </div>

            {/* Prescriber Info */}
            <div className="flex items-center gap-3 min-w-[240px]">
              <div className="w-10 h-10 rounded-full bg-surface-container-low border border-surface-container flex items-center justify-center text-primary shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">stethoscope</span>
              </div>
              <div className="space-y-0.5">
                <div className="text-[13px] text-text-ink font-bold">{order.doctor}</div>
                <div className="text-[12px] font-medium text-text-muted">{order.doctorRole}</div>
                <div className="text-[11px] font-semibold text-text-muted flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  <span>{order.time}</span>
                </div>
              </div>
            </div>

            {/* Prescribed Formulations */}
            <div className="flex-1 max-w-lg space-y-2">
              <div className="flex items-center justify-between text-[11px] uppercase font-bold text-text-muted">
                <span>Regimen ({order.regimen.length} Items)</span>
                {order.highCheck && (
                  <span className="text-clinical-warning flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">priority_high</span> High Accuracy Check
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {order.regimen.map((med, idx) => (
                  <span
                    key={idx}
                    className={`text-[12px] px-3 py-1.5 rounded-md shadow-sm border ${
                      (med as any).alert
                        ? "bg-error-bg text-clinical-error font-bold border-clinical-error/20"
                        : "bg-surface-container-low text-text-ink font-bold border-surface-container"
                    } ${(med as any).crossed ? "line-through text-text-muted" : ""}`}
                  >
                    {med.name} {(med as any).spec && <span className="font-bold text-primary ml-1">{(med as any).spec}</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Status Tag */}
            <div className="min-w-[160px] flex justify-start xl:justify-center">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${order.statusBg} ${order.statusColor} text-[12px] font-bold shadow-sm`}
              >
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                <span>{order.status}</span>
              </div>
            </div>

            {/* Action Panel */}
            <div className="flex items-center gap-2 shrink-0">
              {order.canDispense ? (
                <Link
                  href="/pharmacy/fulfillment"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary text-[13px] font-bold hover:bg-accent-dark shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>View Details & Dispense</span>
                </Link>
              ) : (order as any).podAction ? (
                <button
                  onClick={() => showToast(`Compounding Pod #2 locked for ${order.name}`)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container-low text-text-ink text-[13px] font-bold hover:bg-surface-container border border-surface-container-highest shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">blender</span>
                  <span>Open Compound Pod</span>
                </button>
              ) : (order as any).dualSign ? (
                <button
                  onClick={() => showToast("Dual pharmacist biometric signature prompted on terminal")}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container-low text-text-ink text-[13px] font-bold hover:bg-surface-container border border-surface-container-highest shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">fingerprint</span>
                  <span>Dual Sign-Off</span>
                </button>
              ) : (order as any).pickupAction ? (
                <button
                  onClick={() => router.push("/pharmacy/handover")}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container-low text-text-ink text-[13px] font-bold hover:bg-surface-container border border-surface-container-highest shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                  <span>Notify & Handover</span>
                </button>
              ) : (order as any).auditAction ? (
                <button
                  onClick={() => showToast(`Displaying immutable HL7 audit block for ${order.id}`)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container-low text-text-ink text-[13px] font-bold hover:bg-surface-container border border-surface-container-highest shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt</span>
                  <span>Audit Log</span>
                </button>
              ) : (
                <button
                  onClick={() => showToast(`Renal adjustment dose confirmed with attending physician.`)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container-low text-text-ink text-[13px] font-bold hover:bg-surface-container border border-surface-container-highest shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Confirm Dose Change</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
