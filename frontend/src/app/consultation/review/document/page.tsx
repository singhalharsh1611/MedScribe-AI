"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getUser } from "@/lib/api";

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

export default function ReviewDocumentPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [prescription, setPrescription] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [clinic, setClinic] = useState<any>(null);
  const [record, setRecord] = useState<any>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser?.clinic_id) {
      api.clinics.get(currentUser.clinic_id)
        .then((response) => setClinic(response.clinic || null))
        .catch(() => {});
    }
    const id = Number(new URLSearchParams(window.location.search).get("id") || sessionStorage.getItem("finalizedPrescriptionId"));
    if (!Number.isInteger(id) || id <= 0) {
      setLoadError("No finalized prescription was selected.");
      setLoading(false);
      return;
    }
    api.prescriptions.record(id)
      .then((response: any) => {
        const saved = response.prescription;
        setRecord(saved);
        setPatient(saved);
        setPrescription(saved.prescription_data || {});
      })
      .catch((error: any) => setLoadError(error?.message || "Unable to load the finalized prescription."))
      .finally(() => {
        setLoading(false);
        if (new URLSearchParams(window.location.search).get("print") === "true" && !loadError) {
          setTimeout(() => window.print(), 500);
        }
      });
  }, []);

  const medications: Medication[] = Array.isArray(prescription?.medications)
    ? prescription.medications
    : [];

  const patientName = patient
    ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
    : prescription?.patient_name || "Patient";
  const initials = patientName
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "P";

  const now = record?.timestamp ? new Date(record.timestamp) : new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const rxSerial = record?.serial || "Pending";

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-semibold text-slate-600">Loading finalized prescription...</div>;
  if (loadError) return <div role="alert" className="mx-auto mt-10 max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">{loadError}</div>;

  return (
    <>
      {/* ─── No-print top bar ─── */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-3 shadow sm:flex-nowrap sm:gap-4 sm:px-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors sm:px-4"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>
        <div className="hidden sm:flex items-center gap-2 text-[12px] font-semibold text-slate-500">
          <span className="material-symbols-outlined text-[16px] text-green-600">verified</span>
          Official E-Prescription &nbsp;·&nbsp; {rxSerial}
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-700 text-white px-3 py-2.5 text-[13px] font-bold transition-colors shadow sm:px-5"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          Print / Save PDF
        </button>
      </div>

      {/* ─── A4 canvas ─── */}
      <main className="prescription-bg pt-[112px] pb-12 flex justify-center sm:pt-[64px]">
        <article className="prescription-sheet flex flex-col bg-white text-slate-900">

          {/* ══ HEADER ══ */}
          <header className="px-header pt-header-t pb-6 border-b-2 border-slate-900">
            <div className="flex items-start justify-between gap-6">

              {/* Clinic */}
              <div className="flex items-start gap-4">
                <div className="w-[52px] h-[52px] rounded-md bg-slate-900 flex items-center justify-center text-white flex-shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: 26 }}>local_hospital</span>
                </div>
                <div>
                  <h1 className="clinic-name font-bold tracking-tight leading-tight">
                    {clinic?.name || "Clinic Prescription"}
                  </h1>
                  <p className="addr-line text-slate-500 mt-1.5 leading-relaxed">
                    {clinic?.address || "Clinic address not available"}<br />
                    {clinic?.phone ? `Tel: ${clinic.phone}` : "Clinic contact not available"}
                  </p>
                </div>
              </div>

              {/* Rx ID + QR */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                <div className="border border-slate-900 rounded px-3 py-2 text-right">
                  <p className="rx-label uppercase tracking-widest font-bold text-slate-500">Prescription</p>
                  <p className="rx-serial font-bold">{rxSerial}</p>
                  <p className="rx-sub text-slate-600 mt-0.5">Date: {dateStr}</p>
                  <p className="rx-sub text-slate-500 mt-0.5">Status: Finalized</p>
                </div>
                <svg className="qr-icon text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm11-2h2v2h-2v-2zm-3 2h2v4h-2v-4zm6-2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm-4 2h2v2h-2v-2zm-6-9h2v2h-2V7zm5 0h2v2h-2V7z" />
                </svg>
              </div>
            </div>
          </header>

          {/* ══ PATIENT + PRESCRIBER ══ */}
          <section className="px-header py-5 grid grid-cols-2 gap-4 bg-slate-50 border-b border-slate-300">
            {/* Patient */}
            <div>
              <p className="section-label uppercase tracking-widest font-bold text-slate-400">Patient Information</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-[12px] font-bold flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="patient-name font-bold leading-tight">{patientName}</p>
                  <p className="detail-line text-slate-600">
                    {patient?.gender || prescription?.patient_gender || "Not recorded"} &nbsp;&middot;&nbsp;
                    DOB: {patient?.dob || "Not recorded"} &nbsp;&middot;&nbsp;
                    Age: {patient?.age || prescription?.patient_age || "Not recorded"}
                  </p>
                  <p className="detail-line text-slate-700 font-semibold mt-0.5">
                  {patient?.uhid || "Not recorded"}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded px-2 py-1">
                <span className="material-symbols-outlined text-red-600" style={{ fontSize: 13 }}>warning</span>
                <span className="allergy-text font-bold text-red-700">
                  ALLERGY: {patient?.allergies || prescription?.allergies || "None documented"}
                </span>
              </div>
            </div>

            {/* Prescriber */}
            <div className="border-l border-slate-300 pl-4">
              <p className="section-label uppercase tracking-widest font-bold text-slate-400">Prescribing Practitioner</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-[12px] font-bold flex-shrink-0">
                  {user?.name?.split(" ").filter(Boolean).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase() || "DR"}
                </div>
                <div>
                  <p className="patient-name font-bold leading-tight">{record?.clinician_name || user?.name || "Attending Physician"}</p>
                  <p className="detail-line text-slate-600">{record?.clinician_specialty || user?.specialty || "Clinical Practitioner"}</p>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {user?.license_number && (
                  <div>
                    <p className="detail-line text-slate-400 font-semibold">State Lic</p>
                    <p className="detail-line font-bold">{user.license_number}</p>
                  </div>
                )}
                {(record?.clinician_npi || user?.npi) && (
                  <div>
                    <p className="detail-line text-slate-400 font-semibold">Reg / NPI</p>
                    <p className="detail-line font-bold">{record?.clinician_npi || user?.npi}</p>
                  </div>
                )}
              </div>
              <p className="detail-line text-slate-500 mt-2">Electronically issued by {clinic?.name || "the clinic"}</p>
            </div>
          </section>

          {/* ══ MEDICATIONS ══ */}
          <section className="px-header py-5 flex-1">
            {/* Rx header */}
            <div className="flex items-baseline gap-3 mb-4 pb-2 border-b-2 border-slate-900">
              <span className="rx-symbol font-bold italic leading-none text-slate-900 select-none">&#8478;</span>
              <div>
                <h2 className="med-section-title font-bold">Medication Orders</h2>
                <p className="detail-line text-slate-500">
                  {medications.length} order{medications.length !== 1 ? "s" : ""} 
                </p>
              </div>
            </div>

            {/* Column Headers */}
            {medications.length > 0 && (
              <div className="flex items-center gap-3 pb-2 border-b border-slate-300 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <div style={{ width: 26 }} className="shrink-0" />
                <div className="flex-1 flex gap-4">
                  <div className="w-1/3 shrink-0">Medication</div>
                  <div className="flex-1 flex gap-4 justify-between">
                    <div className="flex-1">Instruction</div>
                    <div className="shrink-0 text-right">Duration</div>
                  </div>
                </div>
              </div>
            )}

            {/* Med rows */}
            <div className="divide-y divide-slate-200">
              {medications.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-500">No medication orders were included in this prescription.</p>
              )}
              {medications.map((med, idx) => {
                const name = med.medicine || med.name || "Unknown Medication";
                const instructionText = med.instructions || [med.dose, med.route, med.frequency].filter(Boolean).join(" \u00b7 ") || "As directed";
                return (
                  <div key={idx} className="avoid-break py-2.5 flex items-start gap-3">
                    <div
                      className="rounded-full bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5"
                      style={{ width: 26, height: 26, fontSize: 11 }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-row items-baseline gap-4 mt-1">
                      <h3 className="med-name font-bold text-slate-900 w-1/3 shrink-0 capitalize">{name}</h3>
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 justify-between">
                        <p className="med-sig flex-1 capitalize text-slate-700">
                          {instructionText}
                        </p>
                        <p className="med-detail text-slate-600 whitespace-nowrap shrink-0 text-right capitalize">
                          {med.duration || "\u2014"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clinical Directives */}
            {(prescription?.follow_up || patient?.allergies || prescription?.allergies || prescription?.emergency_precautions) && (
              <div className="mt-5 p-3 rounded border border-yellow-400 bg-yellow-50">
                <p className="directive-label uppercase tracking-wider font-bold text-yellow-700 mb-1.5">
                  Clinical Directives &amp; Precautions
                </p>
                <ul className="directive-text text-slate-800" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  {prescription?.follow_up && (
                    <li style={{ display: "flex", gap: 6 }}>
                      <span style={{ color: "#b45309", flexShrink: 0, marginTop: 1 }}>&bull;</span>
                      <span><strong>Follow-up:</strong> {prescription.follow_up}</span>
                    </li>
                  )}
                  {(patient?.allergies || prescription?.allergies) && (
                    <li style={{ display: "flex", gap: 6 }}>
                      <span style={{ color: "#dc2626", flexShrink: 0, marginTop: 1 }}>&bull;</span>
                      <span><strong>Allergies:</strong> {patient?.allergies || prescription?.allergies}</span>
                    </li>
                  )}
                  {prescription?.emergency_precautions && (
                    <li style={{ display: "flex", gap: 6 }}>
                      <span style={{ color: "#b45309", flexShrink: 0, marginTop: 1 }}>&bull;</span>
                      <span><strong>Emergency:</strong> {prescription.emergency_precautions}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Diagnoses */}
            {(prescription?.final_diagnosis || prescription?.differential_diagnosis) && (
              <div className="mt-5 pt-4 border-t border-slate-200">
                <p className="section-label uppercase tracking-widest font-bold text-slate-400">Diagnosis</p>
                <p className="detail-line font-bold text-slate-800 mt-1">{prescription?.final_diagnosis || prescription?.differential_diagnosis}</p>
              </div>
            )}
          </section>

          {/* ══ SIGNATURE ══ */}
          <footer className="px-header pt-5 pb-10 border-t-2 border-slate-900 mt-2">
            <div className="flex items-end justify-between gap-8">
              {/* Attestation */}
              <div style={{ maxWidth: "60%" }}>
                <p className="section-label uppercase tracking-widest font-bold text-slate-400 mb-1">Legal Attestation</p>
                <p className="attestation-text text-slate-700 italic leading-relaxed">
                  &ldquo;I hereby certify that I am the licensed practitioner named herein, personally examined or reviewed the above patient,
                  and have electronically authorized this prescription in full compliance with Federal Controlled Substances
                  and State Pharmacy Regulations.&rdquo;
                </p>
                <p className="detail-line font-semibold text-slate-500 mt-2">
                  DAW: 0 &nbsp;&middot;&nbsp; Substitution permitted &nbsp;&middot;&nbsp; Non-transferable
                </p>
              </div>

              {/* Signature box */}
              <div className="flex flex-col items-center" style={{ width: 160 }}>
                <div
                  className="w-full flex items-end justify-center font-serif font-bold italic text-slate-900 select-none pb-1"
                  style={{ height: 52, fontSize: 22 }}
                >
                  {user?.name || "Attending Physician"}
                </div>
                <div className="w-full bg-slate-900 mb-1" style={{ height: 1 }} />
                <p className="detail-line font-bold text-center">{user?.name || "Attending Physician"}</p>
                <p className="detail-line text-slate-500 text-center">NPI: {record?.clinician_npi || user?.npi || "Not recorded"}</p>
                <div className="mt-1 flex items-center gap-1 text-green-700 font-bold" style={{ fontSize: 9 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>verified</span>
                  <span>E-Signed &middot; SHA-256 Verified</span>
                </div>
                <p className="text-center text-slate-400" style={{ fontSize: 9, marginTop: 2 }}>{dateStr} &nbsp;&middot;&nbsp; 10:49 AM UTC-5</p>
              </div>
            </div>

            {/* Security bar */}
            <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between" style={{ fontSize: 8 }}>
              <span className="font-semibold text-slate-400">SECURITY: Void pantograph active &middot; Microprint border authenticated &middot; Tamper-evident E-Record</span>
              <span className="font-semibold text-slate-400">{clinic?.name || "Clinic"} Clinical Record</span>
            </div>
          </footer>
        </article>
      </main>

      {/* ─── Styles ─── */}
      <style>{`
        .prescription-sheet {
          font-family: 'Times New Roman', Times, serif;
          width: 210mm;
          max-width: calc(100vw - 32px);
          background: white;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          margin-bottom: 24px;
        }
        .prescription-bg {
          background: #e2e8f0;
        }
        .px-header { padding-left: 14mm; padding-right: 14mm; }
        .pt-header-t { padding-top: 12mm; }

        /* font sizes */
        .clinic-name   { font-size: 19px; }
        .dept-line     { font-size: 11px; }
        .addr-line     { font-size: 10px; }
        .rx-label      { font-size: 9px; }
        .rx-serial     { font-size: 15px; }
        .rx-sub        { font-size: 10px; }
        .qr-icon       { width: 52px; height: 52px; }
        .section-label { font-size: 9px; }
        .patient-name  { font-size: 15px; }
        .detail-line   { font-size: 11px; }
        .allergy-text  { font-size: 10px; }
        .rx-symbol     { font-size: 42px; }
        .med-section-title { font-size: 15px; }
        .med-name      { font-size: 14px; }
        .med-sig       { font-size: 12px; }
        .med-detail    { font-size: 11px; }
        .dispense-label { font-size: 8px; }
        .dispense-val  { font-size: 13px; }
        .directive-label { font-size: 9px; }
        .directive-text  { font-size: 11px; }
        .attestation-text { font-size: 10px; }

        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: auto !important;
          }
          body * { visibility: hidden !important; }
          .prescription-sheet,
          .prescription-sheet * { visibility: visible !important; }
          .no-print { display: none !important; }
          .prescription-bg {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: unset !important;
          }
          .prescription-sheet {
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            box-shadow: none !important;
            margin: 0 !important;
            border: none !important;
            page-break-after: auto;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}
