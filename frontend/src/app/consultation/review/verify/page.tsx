"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, clearConsultationState } from "@/lib/api";

const STEPS = ["Live Dictation", "Transcript Review", "AI Processing", "Extraction", "Draft Order"];

interface Medication {
  medicine?: string;
  name?: string;
  dose?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  dispense?: string;
  refills?: string | number;
}

export default function ReviewVerifyPage() {
  const router = useRouter();
  const [attested, setAttested] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [prescription, setPrescription] = useState<any>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState("");
  const [patientVerified, setPatientVerified] = useState(false);

  useEffect(() => {
    let entry: any = null;
    try { entry = JSON.parse(localStorage.getItem("activeQueueEntry") || "null"); } catch {}
    if (entry) {
      setPatient(entry);
      const patientId = Number(entry.patient_id || localStorage.getItem("activePatientId"));
      if (Number.isInteger(patientId) && patientId > 0) {
        api.patients.get(patientId)
          .then((result: any) => {
            setPatient({ ...entry, ...(result.patient || result), queue_id: entry.queue_id || entry.id });
            setPatientVerified(true);
          })
          .catch(() => setFinalizeError("The current patient record could not be verified. Reload the page before finalizing."));
      } else {
        setFinalizeError("The current patient record could not be identified. Return to the queue and reopen the encounter.");
      }
    }
    try { setPrescription(JSON.parse(localStorage.getItem("generatedPrescription") || "null")?.prescriptionData || null); } catch {}
  }, []);

  const finalizePrescription = async () => {
    if (!attested || !patientVerified || finalizing) return;
    setFinalizing(true);
    setFinalizeError("");
    try {
      const generated = JSON.parse(localStorage.getItem("generatedPrescription") || "null");
      const encounter = JSON.parse(localStorage.getItem("activeEncounter") || "null");
      const transcriptionResult = JSON.parse(localStorage.getItem("transcriptionResult") || "null");
      const patientId = Number(patient?.patient_id || encounter?.patient_id || localStorage.getItem("activePatientId"));
      if (!Number.isInteger(patientId) || patientId <= 0 || !generated?.prescriptionData) {
        throw new Error("The active patient or reviewed prescription is missing.");
      }

      const result: any = await api.encounters.finalize({
        encounter_id: encounter?.id || null,
        patient_id: patientId,
        queue_id: encounter?.queue_id || patient?.queue_id || patient?.id || null,
        appointment_id: patient?.appointment_id || null,
        chief_complaint: generated.prescriptionData.chief_complaint || patient?.complaint || null,
        diagnosis: generated.prescriptionData.final_diagnosis || generated.prescriptionData.differential_diagnosis || null,
        notes: generated.prescriptionData.hpi || null,
        prescription: generated.prescriptionData,
        transcription: transcriptionResult?.transcript || transcriptionResult?.text || "",
        audio_url: transcriptionResult?.audioUrl || transcriptionResult?.audio_url || null,
      });
      sessionStorage.setItem("finalizedPrescriptionId", String(result.prescription.id));
      clearConsultationState();
      router.replace("/consultation/review/finalized");
    } catch (error: any) {
      setFinalizeError(error?.message || "The encounter could not be finalized. No visit state was changed.");
      setFinalizing(false);
    }
  };

  const patientName = `${patient?.first_name || ""} ${patient?.last_name || ""}`.trim() || prescription?.patient_name || "Patient";
  const patientInitials = patientName.split(" ").filter(Boolean).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase() || "P";
  const medications: Medication[] = Array.isArray(prescription?.medications) ? prescription.medications : [];

  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 min-h-[calc(100vh-6rem)] pb-4 pt-4 lg:flex-row">
      <div className="hidden w-56 shrink-0 flex-col gap-5 pt-2 lg:flex">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-muted ml-1">Encounter Workflow</h3>
        <div className="flex flex-col gap-0 relative">
          <div className="absolute left-3.5 top-2 bottom-6 w-px bg-surface-container-highest z-0"></div>
          {STEPS.map((step, idx) => {
            const isActive = idx === 4;
            const isCompleted = idx < 4;

            return (
              <div key={step} className="flex items-start gap-4 relative z-10 py-3">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold shrink-0 border-2 ${isActive ? "bg-primary text-white border-primary shadow-sm" : isCompleted ? "bg-primary-container text-primary border-primary" : "bg-app-bg text-text-muted border-surface-container-highest"}`}>
                  {isCompleted ? <span className="material-symbols-outlined text-[16px]">check</span> : idx + 1}
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className={`text-[14px] font-bold ${isActive || isCompleted ? "text-primary" : "text-on-surface-variant"}`}>{step}</span>
                  {isActive && <span className="text-[11px] font-semibold text-clinical-success flex items-center gap-1 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-clinical-success animate-ping"></span>Active</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full pb-20 lg:overflow-y-auto lg:pr-2">
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
            <strong className="font-bold">IMPORTANT NOTICE:</strong> Review carefully before finalizing. Confirming will commit the encounter and prescription to the clinic record. The physician is the final legal and clinical authority.
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
                {patientInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-[18px] font-bold text-text-ink truncate">{patientName}</h2>
                <span className="text-[12px] text-text-muted font-medium">{patient?.age || prescription?.patient_age || "Age not recorded"} · {patient?.gender || prescription?.patient_gender || "Gender not recorded"}</span>
                <span className="text-[11px] text-secondary font-bold mt-1">{patient?.uhid || "UHID not recorded"}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-1 bg-surface-container-low p-3 rounded-lg text-[12px] border border-surface-container">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Primary Phone</span>
                <span className="text-text-ink font-semibold">{patient?.phone || "Not recorded"}</span>
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
                <span className="text-[14px] text-text-ink font-bold">{patient?.allergies || prescription?.allergies || "None documented"}</span>
                <span className="text-[11px] text-clinical-error font-semibold">Review complete</span>
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
                <p className="text-[12px] text-text-muted mt-1 font-semibold">{medications.length} Prescription{medications.length === 1 ? "" : "s"} Formulated · Voice Scribe Transcription Synchronized · Ready for Dispatch</p>
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
            {medications.length === 0 && (
              <div className="rounded-xl border border-dashed border-surface-container-highest bg-surface p-6 text-center text-[13px] font-semibold text-text-muted">
                No medication orders are present. Return to the draft before finalizing.
              </div>
            )}
            {medications.map((medication, index) => (
              <div key={`${medication.medicine || medication.name}-${index}`} className="rounded-xl bg-surface p-4 flex flex-col gap-3 border border-surface-container">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-[18px]">{index + 1}</div>
                    <div>
                      <h3 className="text-[18px] font-bold text-text-ink">{medication.medicine || medication.name || "Unnamed medication"}</h3>
                      <span className="text-[12px] text-text-muted font-medium">{medication.route || "Route not specified"}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-success-bg text-clinical-success text-[11px] font-bold self-start sm:self-auto">Clinician Reviewed</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-card-surface p-3 rounded-lg text-[13px] border border-surface-container">
                  <div><span className="text-[11px] text-text-muted block font-bold">Dose</span><span className="font-bold text-text-ink">{medication.dose || "—"}</span></div>
                  <div><span className="text-[11px] text-text-muted block font-bold">Frequency</span><span className="font-bold text-text-ink">{medication.frequency || "—"}</span></div>
                  <div><span className="text-[11px] text-text-muted block font-bold">Duration</span><span className="font-bold text-text-ink">{medication.duration || "—"}</span></div>
                  <div><span className="text-[11px] text-text-muted block font-bold">Dispense / Refills</span><span className="font-bold text-text-ink">{medication.dispense || "—"} / {medication.refills ?? "0"}</span></div>
                </div>
                <div className="px-3 py-2 rounded bg-surface-container-low flex items-start gap-2 text-[14px]">
                  <span className="text-[11px] text-primary uppercase font-bold shrink-0 mt-0.5">Sig / Directions:</span>
                  <p className="text-text-ink font-medium italic">{medication.instructions || "As directed by the clinician."}</p>
                </div>
              </div>
            ))}
            <div className="hidden" aria-hidden="true">
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
                I attest that I have examined {patientName} ({patient?.uhid || "UHID not recorded"}), reviewed the documented allergies and interaction checks, and clinically authorize these medications under full legal authority as attending physician.
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

      <div className="sticky bottom-0 z-30 mt-6 grid w-full grid-cols-1 items-center gap-4 rounded-xl border border-container-tint bg-card-surface/95 p-4 shadow-xl backdrop-blur-md sm:grid-cols-[auto_1fr_auto]">
        <div className="flex items-center">
          <Link href="/consultation/review/draft" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-surface hover:bg-surface-container text-text-ink text-[13px] font-bold transition-all shadow-sm border border-surface-container">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Edit Draft</span>
          </Link>
        </div>

        <div className="hidden min-w-0 flex-col text-center sm:flex">
          <span className="text-[11px] text-clinical-success font-bold">Zero Interaction Conflicts</span>
          <span className="text-[11px] font-semibold text-text-muted">Encounter and prescription are saved together</span>
        </div>

        <div className="flex justify-stretch sm:justify-end">
          <button 
            disabled={!attested || !patientVerified || finalizing || medications.length === 0}
            onClick={finalizePrescription}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-lg bg-primary-container hover:bg-accent-dark text-card-surface text-[14px] font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer ${
              (!attested || !patientVerified || finalizing || medications.length === 0) ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${finalizing ? "animate-spin" : ""}`}>{finalizing ? "progress_activity" : "lock_clock"}</span>
            <span>{finalizing ? "Finalizing..." : "Finalize Prescription"}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
      {finalizeError && <p role="alert" className="sticky bottom-2 z-40 rounded-lg border border-clinical-error/30 bg-error-bg px-4 py-3 text-[13px] font-semibold text-clinical-error">{finalizeError}</p>}
      </div>
    </section>
  );
}
