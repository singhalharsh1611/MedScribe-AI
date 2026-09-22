"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, getUser } from "@/lib/api";

const inputClass = "w-full rounded-lg border border-surface-container bg-surface-container-lowest px-3 py-2.5 text-[14px] text-text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function DoctorWalkInPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [patient, setPatient] = useState<any>({
    id: undefined, first_name: "", last_name: "", phone: "", dob: "", gender: "", blood_group: "", complaint: "",
  });
  const [vitals, setVitals] = useState({ bp: "", hr: "", temp: "", spo2: "", weight: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (patientSearch.trim().length >= 2) {
        setSearching(true);
        const user = getUser();
        api.patients.list(user?.clinic_id, patientSearch.trim()).then((res) => {
          setSearchResults(res.patients || []);
        }).catch(() => setSearchResults([])).finally(() => setSearching(false));
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  const setPatientField = (field: string, value: string) => setPatient((current: any) => ({ ...current, [field]: value }));
  const setVital = (field: keyof typeof vitals, value: string) => setVitals((current) => ({ ...current, [field]: value }));

  const continueToVitals = () => {
    setError("");
    if (!patient.first_name.trim() || !patient.last_name.trim() || !patient.phone.trim()) {
      setError("First name, last name, and mobile number are required.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(patient.phone.replace(/\D/g, ""))) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setStep(2);
  };

  const startConsultation = async () => {
    const user = getUser();
    if (!user?.id || !user?.clinic_id) {
      setError("Your doctor account must be linked to a clinic.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await api.encounters.startWalkIn({
        patient: { ...patient, phone: patient.phone.replace(/\D/g, "") },
        vitals,
        chief_complaint: patient.complaint,
      });
      localStorage.setItem("activePatientId", String(response.patient.id));
      localStorage.setItem("activeQueueEntry", JSON.stringify({
        ...response.patient,
        ...response.entry,
        patient_id: response.patient.id,
        queue_id: response.entry.id,
        status: "in_consultation",
      }));
      localStorage.setItem("activeEncounter", JSON.stringify(response.encounter));
      router.push("/doctor/encounter/new");
    } catch (startError: any) {
      setError(startError?.message || "Unable to start the walk-in consultation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-wider text-primary">Doctor Workspace</p>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight text-text-ink">Start a walk-in consultation</h1>
        <p className="mt-1 text-[14px] text-text-muted">Register the patient, record initial vitals, and begin the consultation directly.</p>
      </div>

      <ol className="grid grid-cols-3 gap-2 text-center text-[12px] font-semibold">
        {["Patient details", "Vitals", "Start consultation"].map((label, index) => (
          <li key={label} className={`rounded-lg px-3 py-2 ${index + 1 <= step ? "bg-primary text-white" : "bg-surface-container text-text-muted"}`}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <section className="rounded-xl border border-surface-container bg-card-surface p-6 shadow-sm">
        {error && <div className="mb-5 rounded-lg border border-clinical-error/30 bg-error-bg px-4 py-3 text-[13px] font-medium text-clinical-error">{error}</div>}

        {step === 1 ? <>
          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <label className="text-[14px] font-bold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">search</span>
              Find existing patient
            </label>
            <div className="relative">
              <input
                className={`${inputClass} border-primary/30`}
                placeholder="Search by name, phone number, or UHID..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              {patientSearch.length >= 2 && (
                <div className="absolute z-20 w-full mt-1 bg-card-surface border border-surface-container rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searching ? (
                    <div className="p-3 text-[13px] text-text-muted">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(p => (
                      <div
                        key={p.id}
                        className="p-3 hover:bg-surface-container-low cursor-pointer border-b border-surface-container last:border-0"
                        onClick={() => {
                          setPatient({
                            id: p.id,
                            first_name: p.first_name || "",
                            last_name: p.last_name || "",
                            phone: p.phone || "",
                            dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : "",
                            gender: p.gender || "",
                            blood_group: p.blood_group || "",
                            complaint: patient.complaint,
                          });
                          setPatientSearch("");
                          setSearchResults([]);
                        }}
                      >
                        <div className="font-semibold text-[14px]">{p.first_name} {p.last_name}</div>
                        <div className="text-[12px] text-text-muted">{p.phone} {p.uhid ? `• ${p.uhid}` : ''}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-[13px] text-text-muted">No patients found.</div>
                  )}
                </div>
              )}
            </div>
            {patient.id && (
              <div className="mt-3 flex items-center justify-between rounded bg-card-surface px-3 py-2 text-[13px] shadow-sm border border-primary/20">
                <div>
                  <span className="font-semibold text-text-ink">Selected: </span>
                  <span className="text-text-muted">{patient.first_name} {patient.last_name} ({patient.phone})</span>
                </div>
                <button
                  onClick={() => setPatient({ ...patient, id: undefined, first_name: "", last_name: "", phone: "", dob: "", gender: "", blood_group: "" })}
                  className="text-clinical-error font-semibold hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-bold text-text-ink">Patient details</h2>
            <div className="h-px flex-1 bg-surface-container"></div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-[13px] font-semibold text-text-ink">First name<input className={`${inputClass} mt-1.5`} value={patient.first_name} onChange={(event) => setPatientField("first_name", event.target.value)} /></label>
            <label className="text-[13px] font-semibold text-text-ink">Last name<input className={`${inputClass} mt-1.5`} value={patient.last_name} onChange={(event) => setPatientField("last_name", event.target.value)} /></label>
            <label className="text-[13px] font-semibold text-text-ink">Mobile number<input className={`${inputClass} mt-1.5`} inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number" value={patient.phone} onChange={(event) => setPatientField("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} /></label>
            <label className="text-[13px] font-semibold text-text-ink">Date of birth<input className={`${inputClass} mt-1.5`} type="date" value={patient.dob} onChange={(event) => setPatientField("dob", event.target.value)} /></label>
            <label className="text-[13px] font-semibold text-text-ink">Gender<select className={`${inputClass} mt-1.5`} value={patient.gender} onChange={(event) => setPatientField("gender", event.target.value)}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Other</option></select></label>
            <label className="text-[13px] font-semibold text-text-ink">Blood group<select className={`${inputClass} mt-1.5`} value={patient.blood_group} onChange={(event) => setPatientField("blood_group", event.target.value)}><option value="">Select blood group</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => <option key={group} value={group}>{group}</option>)}</select></label>
          </div>
          <label className="mt-4 block text-[13px] font-semibold text-text-ink">Chief complaint<textarea className={`${inputClass} mt-1.5 min-h-24 resize-y`} value={patient.complaint} onChange={(event) => setPatientField("complaint", event.target.value)} /></label>
          <div className="mt-6 flex justify-end"><button onClick={continueToVitals} className="rounded-lg bg-primary px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-accent-dark">Continue to vitals</button></div>
        </> : <>
          <h2 className="text-[18px] font-bold text-text-ink">Initial vitals</h2>
          <p className="mt-1 text-[13px] text-text-muted">Record what is available. You can continue if a measurement is not yet taken.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-[13px] font-semibold text-text-ink">Blood pressure<input className={`${inputClass} mt-1.5`} placeholder="120/80 mmHg" value={vitals.bp} onChange={(event) => setVital("bp", event.target.value)} /></label>
            <label className="text-[13px] font-semibold text-text-ink">Heart rate<input className={`${inputClass} mt-1.5`} placeholder="72 bpm" value={vitals.hr} onChange={(event) => setVital("hr", event.target.value)} /></label>
            <label className="text-[13px] font-semibold text-text-ink">Temperature<input className={`${inputClass} mt-1.5`} placeholder="98.6 °F" value={vitals.temp} onChange={(event) => setVital("temp", event.target.value)} /></label>
            <label className="text-[13px] font-semibold text-text-ink">SpO₂<input className={`${inputClass} mt-1.5`} placeholder="98%" value={vitals.spo2} onChange={(event) => setVital("spo2", event.target.value)} /></label>
            <label className="text-[13px] font-semibold text-text-ink">Weight<input className={`${inputClass} mt-1.5`} placeholder="kg" value={vitals.weight} onChange={(event) => setVital("weight", event.target.value)} /></label>
          </div>
          <div className="mt-6 flex items-center justify-between gap-3"><button onClick={() => setStep(1)} className="rounded-lg px-4 py-2.5 text-[14px] font-bold text-primary hover:bg-container-tint">Back</button><button disabled={saving} onClick={startConsultation} className="rounded-lg bg-primary px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-accent-dark disabled:opacity-60">{saving ? "Starting consultation…" : "Start consultation"}</button></div>
        </>}
      </section>
    </main>
  );
}
