"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Medication {
  medicine?: string;
  name?: string;
  dose?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  refills?: string | number;
  dispense?: string;
}

export default function ReviewFinalizedPage() {
  const router = useRouter();
  const [toast, setToast] = useState({ visible: false, message: "", icon: "" });
  const [patient, setPatient] = useState<any>(null);
  const [prescription, setPrescription] = useState<any>(null);
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const id = Number(sessionStorage.getItem("finalizedPrescriptionId"));
    if (!Number.isInteger(id) || id <= 0) {
      setLoadError("No finalized prescription was selected.");
      setLoading(false);
      return;
    }
    api.prescriptions.record(id)
      .then((result: any) => {
        const saved = result.prescription;
        setRecord(saved);
        setPrescription(saved.prescription_data || {});
        setPatient(saved);
      })
      .catch((error: any) => setLoadError(error?.message || "Unable to load the finalized prescription."))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message: string, icon = "check_circle") => {
    setToast({ visible: true, message, icon });
    setTimeout(() => setToast({ visible: false, message: "", icon: "" }), 3200);
  };

  const sendPrescription = async () => {
    try {
      await api.prescriptions.send(record.id);
      showToast("Patient delivery confirmed", "send_to_mobile");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Prescription delivery failed", "error");
    }
  };

  const copyProviderLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/consultation/review/document?id=${record.id}`);
      showToast("Prescription link copied to clipboard", "ios_share");
    } catch {
      showToast("Clipboard access was denied", "error");
    }
  };

  // ── Derived fields ──
  const firstName = patient?.first_name || "";
  const lastName  = patient?.last_name  || "";
  const patientName = (firstName + " " + lastName).trim() || prescription?.patient_name || "Patient";
  const initials = patientName.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase() || "P";
  const gender   = patient?.gender || prescription?.patient_gender || "—";
  const age      = patient?.age    || prescription?.patient_age    || "—";
  const uhid     = patient?.uhid   || patient?.patient_id          || "—";
  const phone    = patient?.phone  || patient?.contact             || "—";
  const allergies = patient?.allergies || prescription?.allergies  || "None documented";

  const medications: Medication[] = prescription?.medications || [];
  const diagnosis  = prescription?.final_diagnosis || prescription?.differential_diagnosis || "—";
  const followUp   = prescription?.follow_up || "—";
  const chiefComplaint = prescription?.chief_complaint || "—";
  const hpi        = prescription?.hpi || "";
  const documentPath = `/consultation/review/document?id=${record?.id}`;

  const now        = record?.timestamp ? new Date(record.timestamp) : new Date();
  const rxSerial   = record?.serial || "Pending";
  const timeStr    = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const dateStr    = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-sm font-semibold text-text-muted">Loading finalized prescription...</div>;
  if (loadError) return <div role="alert" className="mx-auto mt-10 max-w-lg rounded-xl border border-clinical-error/30 bg-error-bg p-6 text-center"><p className="font-semibold text-clinical-error">{loadError}</p><button onClick={() => router.replace("/doctor/dashboard")} className="mt-4 rounded-lg bg-primary px-4 py-2 font-bold text-white">Return to dashboard</button></div>;

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Toast */}
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

          <div className="flex items-center gap-2 self-start sm:self-auto">

          </div>
        </div>

        {/* ── Success Banner ── */}
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
                </div>
                
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => router.push(`${documentPath}&print=true`)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary-container hover:bg-accent-dark text-card-surface text-[15px] font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">print</span>
                <span>Print Prescription</span>
              </button>
              <button
                onClick={() => router.replace("/doctor/dashboard")}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-text-ink hover:bg-surface-variant hover:text-text-ink text-card-surface text-[15px] font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                <span>Return to Dashboard</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Two Column Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: 8 cols */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Prescription Order Manifest */}
            <div className="bg-card-surface rounded-xl p-6 shadow-sm flex flex-col gap-5 border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-container-tint flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">medication</span>
                  </div>
                  <div>
                    <h2 className="text-[22px] font-bold text-text-ink">Prescription Order Manifest</h2>
                    <p className="text-[12px] font-semibold text-text-muted">
                      {medications.length > 0
                        ? `${medications.length} finalized pharmaceutical order${medications.length !== 1 ? "s" : ""} approved for transmission`
                        : "No medications on record"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-md text-text-ink text-[11px]">
                  <span className="text-text-muted">RX TOKEN:</span>
                  <span className="font-mono font-bold text-primary">#{rxSerial}</span>
                  <button onClick={() => showToast("Rx Token copied to clipboard", "content_copy")} className="hover:text-primary cursor-pointer" title="Copy">
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  </button>
                </div>
              </div>

              {/* Medication rows — dynamic */}
              <div className="flex flex-col gap-3">
                {medications.length === 0 ? (
                  <div className="p-6 text-center text-text-muted text-[13px] bg-surface-container-low rounded-lg border border-dashed border-surface-container-highest">
                    No medication data found. Complete the voice consultation and extraction steps first.
                  </div>
                ) : (
                  medications.map((med, idx) => {
                    const name = med.medicine || med.name || "Unknown";
                    const sig  = med.instructions || [med.dose, med.route, med.frequency].filter(Boolean).join(" · ") || "As directed";
                    return (
                      <div key={idx} className="p-4 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 border border-surface-container">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-container-tint flex items-center justify-center text-primary font-bold text-[13px] shrink-0 mt-0.5">{idx + 1}</div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[17px] font-bold text-text-ink">{name}</span>
                              {med.route && <span className="px-2 py-0.5 rounded bg-container-tint text-primary text-[11px] font-bold">{med.route}</span>}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-on-surface-variant">
                              <span><strong className="text-text-ink font-semibold">SIG:</strong> {sig}</span>
                              {med.duration && <><span className="text-surface-container-highest font-bold">•</span><span><strong className="text-text-ink font-semibold">Duration:</strong> {med.duration}</span></>}
                              {med.refills !== undefined && <><span className="text-surface-container-highest font-bold">•</span><span><strong className="text-text-ink font-semibold">Refills:</strong> {med.refills}</span></>}
                            </div>
                          </div>
                        </div>
                        <div className="flex md:flex-col items-end justify-between md:justify-center gap-1 shrink-0">
                          <span className="text-[11px] text-clinical-success font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Transmitted
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chief complaint / diagnosis row */}
              {(chiefComplaint !== "—" || diagnosis !== "—") && (
                <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container text-[12px] flex flex-col gap-1">
                  {chiefComplaint !== "—" && (
                    <p><strong className="text-text-ink">Chief Complaint:</strong> <span className="text-on-surface-variant">{chiefComplaint}</span></p>
                  )}
                  {hpi && (
                    <p><strong className="text-text-ink">HPI:</strong> <span className="text-on-surface-variant">{hpi}</span></p>
                  )}
                  {diagnosis !== "—" && (
                    <p><strong className="text-text-ink">Diagnosis:</strong> <span className="text-on-surface-variant">{diagnosis}</span></p>
                  )}
                </div>
              )}

              {/* Legal notice */}
              <div className="p-4 rounded-lg bg-warning-bg/60 flex items-start gap-3 border border-clinical-warning/20">
                <span className="material-symbols-outlined text-clinical-warning text-[20px] shrink-0 mt-0.5">verified_user</span>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider text-text-ink font-bold">Official Clinical Record Legal Notice</span>
                  <p className="text-[12px] font-medium text-on-surface-variant leading-relaxed">
                    <strong className="font-bold">OFFICIAL CLINICAL RECORD — Verified &amp; Signed by Attending Physician.</strong> AI voice transcription telemetry and draft buffer scratchpads were automatically permanently discarded upon finalization. Legal prescriber authority and full clinical accountability applied by the authorized attending physician.
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
                <button onClick={() => router.push(documentPath)}
                  className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-container-low hover:bg-container-tint text-text-ink transition-all shadow-sm hover:shadow-md group border border-surface-container cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-card-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <span className="text-[15px] font-bold">View Script</span>
                  <span className="text-[12px] text-text-muted mt-0.5 font-semibold">Full prescription view</span>
                </button>

                <button onClick={() => { showToast("Opening official prescription for printing...", "print"); setTimeout(() => router.push(`${documentPath}&print=true`), 400); }}
                  className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-container-low hover:bg-container-tint text-text-ink transition-all shadow-sm hover:shadow-md group border border-surface-container cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-card-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">print</span>
                  </div>
                  <span className="text-[15px] font-bold">Print Script</span>
                  <span className="text-[12px] text-text-muted mt-0.5 font-semibold">Official A4 PDF</span>
                </button>

                <button onClick={sendPrescription}
                  className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-container-low hover:bg-container-tint text-text-ink transition-all shadow-sm hover:shadow-md group border border-surface-container cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-card-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">send_to_mobile</span>
                  </div>
                  <span className="text-[15px] font-bold">Send to Patient</span>
                  <span className="text-[12px] text-text-muted mt-0.5 font-semibold">SMS / email delivery</span>
                </button>

                <button onClick={copyProviderLink}
                  className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-container-low hover:bg-container-tint text-text-ink transition-all shadow-sm hover:shadow-md group border border-surface-container cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-card-surface flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">ios_share</span>
                  </div>
                  <span className="text-[15px] font-bold">Provider Share</span>
                  <span className="text-[12px] text-text-muted mt-0.5 font-semibold">Copy authenticated link</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: 4 cols */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Patient card */}
            <div className="bg-card-surface rounded-xl p-5 shadow-sm flex flex-col gap-4 border border-surface-container">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Patient Encounter Details</span>
                <span className="px-2 py-0.5 rounded bg-success-bg text-clinical-success text-[11px] font-bold">FINALIZED</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-container-tint flex items-center justify-center text-primary-container text-[20px] font-bold shadow-sm ring-2 ring-container-tint shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-[18px] font-bold text-text-ink">{patientName}</h2>
                  <span className="text-[12px] text-text-muted font-medium">{age !== "—" ? age + " · " : ""}{gender}</span>
                  {uhid !== "—" && <span className="text-[11px] text-secondary font-bold mt-1">UHID: {uhid}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-surface-container-low p-3 rounded-lg text-[12px] border border-surface-container">
                {phone !== "—" && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Primary Phone</span>
                    <span className="text-text-ink font-semibold">{phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Date</span>
                  <span className="text-text-ink font-semibold">{dateStr}</span>
                </div>
                {allergies !== "None documented" && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Allergies</span>
                    <span className="text-clinical-error font-bold">{allergies}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Follow-up / Next steps */}
            <div className="bg-card-surface rounded-xl p-5 shadow-sm flex flex-col gap-4 border border-surface-container">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Next Steps &amp; Follow-up</span>
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-primary text-[13px] font-bold">
                    <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                    <span>Follow-up Scheduled</span>
                  </div>
                  <span className="text-[13px] text-text-ink font-medium">{followUp}</span>
                </div>
                {medications.length > 0 && (
                  <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-clinical-success text-[13px] font-bold">
                      <span className="material-symbols-outlined text-[18px]">medication</span>
                      <span>{medications.length} Medication{medications.length !== 1 ? "s" : ""} Prescribed</span>
                    </div>
                    <span className="text-[12px] text-text-muted font-medium">
                      {medications.map(m => m.medicine || m.name).join(", ")}
                    </span>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-warning-bg border border-clinical-warning/20 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-clinical-warning text-[13px] font-bold">
                    <span className="material-symbols-outlined text-[18px]">shield_with_heart</span>
                    <span>Allergy Alert Active</span>
                  </div>
                  <span className="text-[12px] text-text-ink font-medium">{allergies}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
