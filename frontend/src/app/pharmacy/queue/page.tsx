"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { api, getUser } from "@/lib/api";

export default function PharmacyQueuePage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = getUser();
      if (!user?.clinic_id) {
        setLoading(false);
        return;
      }
      try {
        const encRes = await api.encounters.list({ clinicId: user.clinic_id }).catch(() => ({ encounters: [] }));
        const encData = encRes.encounters || [];
        const withRx = encData.filter((e: any) => e.prescription || e.prescriptions).map((enc: any) => {
          let rxData: any = {};
          if (typeof enc.prescription === 'string') {
            try { rxData = JSON.parse(enc.prescription); } catch (e) {}
          } else { rxData = enc.prescription || enc.prescriptions || {}; }

          const meds = rxData.medications || rxData.drugs || [];
          return {
            id: `RX-${enc.id}`,
            name: enc.patient_name || enc.patient?.name || 'Unknown Patient',
            uhid: `UHID-${enc.patient_id || 'UNKNOWN'}`,
            ageGender: 'Patient',
            doctor: `Dr. ${enc.doctor_name || 'Doctor'}`,
            doctorRole: 'Attending',
            time: new Date(enc.date || enc.created_at || Date.now()).toLocaleDateString(),
            status: 'Pending Dispense',
            statusColor: 'text-clinical-warning',
            statusBg: 'bg-warning-bg',
            indicatorColor: 'bg-clinical-warning',
            regimen: meds.map((m: any) => ({ name: m.name || m.drug, spec: m.dosage || '' })),
            highCheck: false,
            tab: 'pending',
            canDispense: true,
            initials: (enc.patient_name || 'U').substring(0, 2).toUpperCase()
          };
        });
        setOrders(withRx);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
            <div className="flex min-w-0 items-start gap-4 pl-3 xl:min-w-[300px]">
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
            <div className="flex min-w-0 items-center gap-3 xl:min-w-[240px]">
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
                {order.regimen.map((med: any, idx: number) => (
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
            <div className="flex min-w-0 justify-start xl:min-w-[160px] xl:justify-center">
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
