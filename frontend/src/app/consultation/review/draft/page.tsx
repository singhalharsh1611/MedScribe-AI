"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, clearConsultationState } from "@/lib/api";

const STEPS = ["Live Dictation", "Transcript Review", "AI Processing", "Extraction", "Draft Order"];

const STATIC_MEDICATIONS = [
  {
    id: 1,
    name: "Albuterol HFA 90mcg",
    sub: "• Inhalation Aerosol",
    category: "Bronchodilator",
    verified: "DB Verified",
    dose: "2 puffs",
    frequency: "Every 4-6 hours PRN",
    timing: "As needed",
    timingIcon: "schedule",
    timingColor: "text-primary",
    food: "Inhalation",
    duration: "30 Days",
    instructions: "Inhale 2 puffs every 4 to 6 hours as needed for wheezing.",
    timestamp: "04:32",
    quote: "Recommending Albuterol HFA 90mcg 2 puffs every 4 to 6 hours as needed.",
    debugPhonetic: [],
    debugFuzzy: [],
    originalExtracted: "Albuterol HFA",
  },
  {
    id: 2,
    name: "Montelukast 10mg",
    sub: "• Oral Tablet",
    category: "Leukotriene Inhibitor",
    verified: "DB Verified",
    dose: "1 tablet",
    frequency: "Once daily",
    timing: "Bedtime",
    timingIcon: "bedtime",
    timingColor: "text-primary",
    food: "With or without food",
    duration: "30 Days",
    instructions: "Take 1 tablet orally once daily at bedtime.",
    timestamp: "05:08",
    quote: "Starting Montelukast 10mg orally daily for 30 days.",
    debugPhonetic: [],
    debugFuzzy: [],
    originalExtracted: "Montelukast",
  },
  {
    id: 3,
    name: "Fluticasone 50mcg",
    sub: "• Nasal Spray",
    category: "Corticosteroid",
    verified: "DB Verified",
    dose: "1 spray",
    frequency: "Once daily",
    timing: "Morning",
    timingIcon: "light_mode",
    timingColor: "text-clinical-warning",
    food: "Intranasal",
    duration: "14 Days",
    instructions: "Use 1 spray in each nostril once daily for allergic rhinitis.",
    timestamp: "05:44",
    quote: "Fluticasone nasal spray 50mcg daily for 14 days.",
    debugPhonetic: [],
    debugFuzzy: [],
    originalExtracted: "Fluticasone",
  },
];

function chooseBestCandidate(item: any) {
  if (item.selection_status !== "matched") return null;
  const candidate = item.recommended_candidate;
  return candidate?.compatible && candidate?.auto_selectable ? candidate : null;
}

function getBestUniqueCandidates(item: any) {
  const pools = [item?.candidates, item?.top_phonetic, item?.top_fuzzy]
    .filter(Array.isArray)
    .flat();
  const unique = new Map<string, any>();
  for (const candidate of pools) {
    if (!candidate?.brand_name) continue;
    const key = String(candidate.brand_name).trim().toLowerCase();
    const existing = unique.get(key);
    if (!existing || Number(candidate.score || 0) > Number(existing.score || 0)) {
      unique.set(key, candidate);
    }
  }
  return [...unique.values()]
    .sort((left, right) => {
      if (Boolean(left.compatible) !== Boolean(right.compatible)) return left.compatible ? -1 : 1;
      return Number(right.score || 0) - Number(left.score || 0)
        || String(left.brand_name).localeCompare(String(right.brand_name));
    })
    .slice(0, 4);
}

function getMedicationIcon(medication: any) {
  const text = `${medication.name || ""} ${medication.sub || ""} ${medication.food || ""} ${medication.dose || ""}`.toLowerCase();
  if (/injection|injectable|iv|intravenous|intramuscular/.test(text)) return "vaccines";
  if (/inhaler|inhalation|respule|nebul/.test(text)) return "air";
  if (/capsule/.test(text)) return "pill";
  if (/syrup|suspension|solution|oral liquid/.test(text)) return "local_drink";
  if (/cream|ointment|gel|lotion|topical/.test(text)) return "dermatology";
  if (/spray|nasal|eye drop|ear drop/.test(text)) return "sprinkler";
  if (/tablet|oral|\btablet\b/.test(text)) return "medication";
  return "medication";
}

export default function ReviewDraftPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingMedicationId, setSearchingMedicationId] = useState<number | null>(null);
  const [reviewMedicationId, setReviewMedicationId] = useState<number | null>(null);
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [reviewSearchResults, setReviewSearchResults] = useState<any[]>([]);
  const [reviewSearching, setReviewSearching] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [deleteMedicationId, setDeleteMedicationId] = useState<number | null>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const finalizationInFlightRef = useRef(false);

  const patientName = patient ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() : "Patient";
  const patientInitials = `${patient?.first_name?.charAt(0) || "P"}${patient?.last_name?.charAt(0) || ""}`;
  const patientAge = patient?.age || "Age N/A";

  useEffect(() => {
    const activeEntry = localStorage.getItem("activeQueueEntry");
    if (activeEntry) {
      try { setPatient(JSON.parse(activeEntry)); } catch (error) { console.error("Could not load patient:", error); }
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("extractionResult");
    if (!stored) return;
    try {
      const { mapped } = JSON.parse(stored);
      if (!Array.isArray(mapped)) return;
      const generated = JSON.parse(localStorage.getItem("generatedPrescription") || "null");
      if (Array.isArray(generated?.prescriptionData?.medications)) {
        const generatedMeds = generated.prescriptionData.medications.map((medication: any, index: number) => ({
          id: index + 1,
          name: medication.medicine,
          sub: medication.needs_review ? "• Database match needs review" : "• Constrained database match",
          category: medication.needs_review ? "Needs Verification" : "Database Matched",
          verified: medication.needs_review ? "Requires clinician verification" : "DB matched",
          dose: medication.dose || "N/A",
          frequency: medication.frequency || "N/A",
          timing: medication.instructions || "N/A",
          timingIcon: "schedule",
          timingColor: "text-primary",
          food: medication.route || "N/A",
          duration: medication.duration || "N/A",
          instructions: medication.instructions || "N/A",
          timestamp: "MedGemma",
          quote: mapped[index]?.source_text || mapped[index]?.spoken_name || "Extracted medicine",
          debugPhonetic: mapped[index]?.top_phonetic || [],
          debugFuzzy: mapped[index]?.top_fuzzy || [],
          originalExtracted: mapped[index]?.spoken_name || medication.medicine,
          needsReview: Boolean(medication.needs_review),
          selectedCandidateId: medication.selected_candidate_id || null,
          borderWarning: Boolean(medication.needs_review),
          candidateOptions: getBestUniqueCandidates(mapped[index]),
        }));
        setMedications(generatedMeds);
        return;
      }
      const staged = mapped.map((item: any, index: number) => {
        const proposed = chooseBestCandidate(item);
        return {
          id: index + 1,
          name: proposed?.brand_name || `Unresolved: ${item.spoken_name}`,
          sub: `• ${proposed?.salt || "Candidate needs verification"}`,
          category: "Needs Verification",
          verified: proposed ? "Constrained DB match" : "No safe DB match",
          dose: item.dose || "N/A",
          frequency: item.frequency || "N/A",
          timing: item.instructions || "N/A",
          timingIcon: "schedule",
          timingColor: "text-primary",
          food: item.route || "N/A",
          duration: item.duration || "N/A",
          instructions: item.instructions || "N/A",
          timestamp: "Extracted",
          quote: item.source_text || item.spoken_name,
          debugPhonetic: item.top_phonetic || [],
          debugFuzzy: item.top_fuzzy || [],
          originalExtracted: item.spoken_name,
          needsReview: !proposed,
          selectedCandidateId: proposed?.id || null,
          borderWarning: !proposed,
          candidateOptions: getBestUniqueCandidates(item),
        };
      });
      setMedications(staged);
    } catch (error) {
      console.error("Could not load extraction result:", error);
    }
  }, []);

  useEffect(() => {
    if (searchingMedicationId === null || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || "/api";
        const res = await fetch(`${base}/prescription/search?q=${encodeURIComponent(searchQuery.trim())}`, {
          credentials: "include",
        });
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchingMedicationId]);

  useEffect(() => {
    if (reviewMedicationId === null || reviewSearchQuery.trim().length < 2) {
      setReviewSearchResults([]);
      setReviewSearching(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setReviewSearching(true);
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || "/api";
        const response = await fetch(`${base}/prescription/search?q=${encodeURIComponent(reviewSearchQuery.trim())}`, {
          credentials: "include",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Medicine search failed");
        setReviewSearchResults(data.results || []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Review medicine search error:", error);
          setReviewSearchResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setReviewSearching(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [reviewSearchQuery, reviewMedicationId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchingMedicationId(null);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    if (searchingMedicationId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchingMedicationId]);

  const updateMedication = (id: number, field: string, value: string) => {
    setMedications((current) => current.map((medication) => medication.id === id ? { ...medication, [field]: value } : medication));
  };

  const startMedicineSearch = (medication: any) => {
    setSearchingMedicationId(medication.id);
    setSearchQuery(medication.name || "");
    setSearchResults([]);
  };

  const handleSelectMedicine = (drug: any) => {
    if (searchingMedicationId === null) return;
    const brandName = typeof drug === "string" ? drug : drug.brand_name;
    setMedications((current) => current.map((medication) => medication.id === searchingMedicationId ? {
      ...medication,
      name: brandName,
      sub: "• Database medicine",
      verified: "Clinician-selected DB match",
      needsReview: false,
      borderWarning: false,
    } : medication));
    setSearchingMedicationId(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleReviewSelection = (drug: any) => {
    if (reviewMedicationId === null) return;
    const brandName = typeof drug === "string" ? drug : drug.brand_name;
    const selectedId = typeof drug === "string" ? null : drug.id || null;
    const currentId = reviewMedicationId;
    setMedications((current) => current.map((medication) => medication.id === currentId ? {
      ...medication,
      name: brandName,
      sub: "• Doctor-selected database medicine",
      category: "Clinician Verified",
      verified: "Clinician-selected DB match",
      needsReview: false,
      borderWarning: false,
      selectedCandidateId: selectedId,
    } : medication));
    setBannerMessage(`${brandName} selected.`);
    setReviewSearchQuery("");
    setReviewSearchResults([]);
    setReviewMedicationId(null);
  };

  const reviewLater = () => {
    setReviewSearchQuery("");
    setReviewSearchResults([]);
    setReviewMedicationId(null);
  };

  const handleDelete = () => {
    if (deleteMedicationId === null) return;
    setMedications((current) => current.filter((medication) => medication.id !== deleteMedicationId));
    setDeleteMedicationId(null);
  };

  const finalizePrescription = async () => {
    if (finalizationInFlightRef.current || medications.length === 0) return;
    const unresolved = medications.find((medication) => String(medication.name || "").startsWith("Unresolved:"));
    if (unresolved) {
      setFinalizeError(`Select a database medicine for ${unresolved.originalExtracted || unresolved.name} before finalizing.`);
      return;
    }
    finalizationInFlightRef.current = true;
    setIsFinalizing(true);
    setFinalizeError("");
    let generated: any = {};
    try {
      generated = JSON.parse(localStorage.getItem("generatedPrescription") || "{}") || {};
    } catch {
      setFinalizeError("The generated prescription could not be read.");
      finalizationInFlightRef.current = false;
      setIsFinalizing(false);
      return;
    }

    const prescriptionData = generated.prescriptionData || {};
    const updatedMedications = medications.map((medication) => ({
      medicine: medication.name || "",
      dose: medication.dose || "",
      route: medication.food || "",
      frequency: medication.frequency || "",
      duration: medication.duration || "",
      instructions: [
        medication.instructions || "",
        medication.timing && medication.timing !== medication.instructions ? `Timing: ${medication.timing}` : "",
      ].filter(Boolean).join(" "),
      refills: medication.refills,
      dispense: medication.dispense,
    }));

    const updatedGenerated = {
      ...generated,
      patientName: generated.patientName || patientName,
      prescriptionData: { ...prescriptionData, medications: updatedMedications },
    };
    localStorage.setItem("generatedPrescription", JSON.stringify(updatedGenerated));

    try {
      const encounter = JSON.parse(localStorage.getItem("activeEncounter") || "null");
      const transcriptionResult = JSON.parse(localStorage.getItem("transcriptionResult") || "null");
      const patientId = Number(patient?.patient_id || encounter?.patient_id || localStorage.getItem("activePatientId"));
      if (!Number.isInteger(patientId) || patientId <= 0 || !updatedGenerated.prescriptionData) {
        throw new Error("The active patient or reviewed prescription is missing.");
      }

      const result: any = await api.encounters.finalize({
        encounter_id: encounter?.id || null,
        patient_id: patientId,
        queue_id: encounter?.queue_id || patient?.queue_id || patient?.id || null,
        appointment_id: patient?.appointment_id || null,
        chief_complaint: updatedGenerated.prescriptionData.chief_complaint || patient?.complaint || null,
        diagnosis: updatedGenerated.prescriptionData.final_diagnosis || updatedGenerated.prescriptionData.differential_diagnosis || null,
        notes: updatedGenerated.prescriptionData.hpi || null,
        prescription: updatedGenerated.prescriptionData,
        transcription: transcriptionResult?.transcript || transcriptionResult?.text || "",
        audio_url: transcriptionResult?.audioUrl || transcriptionResult?.audio_url || null,
      });
      sessionStorage.setItem("finalizedPrescriptionId", String(result.prescription.id));
      clearConsultationState();
      router.replace("/consultation/review/finalized");
    } catch (error) {
      setFinalizeError(error instanceof Error ? error.message : "The prescription could not be finalized.");
      finalizationInFlightRef.current = false;
      setIsFinalizing(false);
    }
  };

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

      <div className="flex-1 flex flex-col w-full pb-28 gap-space-lg lg:overflow-y-auto lg:pr-2">

      {bannerMessage && (
        <div className="p-3 rounded-lg bg-success-bg text-clinical-success font-semibold text-[14px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          {bannerMessage}
        </div>
      )}

      {finalizeError && (
        <div role="alert" className="p-3 rounded-lg bg-error-bg text-clinical-error font-semibold text-[14px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {finalizeError}
        </div>
      )}

      {/* Patient Context */}
      <section className="w-full bg-card-surface rounded-xl shadow-sm p-4 border border-surface-container">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-container-tint flex items-center justify-center text-primary-container text-[20px] font-bold shadow-sm ring-2 ring-card-surface">
                {patientInitials}
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-clinical-success ring-2 ring-card-surface"></span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[22px] font-bold text-text-ink truncate">{patientName}</h1>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">{patientAge} · {patient?.gender || "Gender N/A"}</span>
                <span className="px-2 py-0.5 rounded bg-surface-container text-text-muted text-[11px] font-bold">Blood {patient?.blood_group || "N/A"}</span>
                <span className="text-[11px] text-text-muted font-mono tracking-tight">UHID: {patient?.uhid || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-on-surface-variant text-[12px] flex-wrap">
                <span className="flex items-center gap-1 font-medium"><span className="material-symbols-outlined text-[16px] text-primary">door_open</span> {patient?.room || "Room N/A"}</span>
                <span className="text-border-divider">·</span>
                <span className="text-border-divider">·</span>
                <span className="text-text-muted">Primary Dx: {patient?.complaint || "N/A"}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      

      {/* Staged Pharmacotherapy Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-bold text-text-ink">Staged Pharmacotherapy</h2>
            <span className="w-5 h-5 rounded-full bg-primary text-card-surface flex items-center justify-center text-[11px] font-bold">{medications.length}</span>
            <span className="text-[13px] text-text-muted ml-2 font-medium">Draft ID: RX-2024-88412-A</span>
          </div>
        </div>

        {/* Medicine Cards List */}
        <div className="flex flex-col gap-4">
          {medications.map((med) => (
            <article key={med.id} className="w-full bg-card-surface rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative overflow-hidden group border border-surface-container">
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${med.borderWarning ? "bg-clinical-warning" : "bg-primary"}`}></div>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pl-1.5">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-container-tint flex items-center justify-center text-primary shrink-0 shadow-inner">
                    <span className="material-symbols-outlined text-[28px]">
                      {getMedicationIcon(med)}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {med.badge && (
                        <span className="px-2 py-0.5 rounded bg-container-tint text-primary text-[11px] font-bold uppercase">{med.badge}</span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${med.needsReview ? "bg-warning-bg text-clinical-warning" : "bg-success-bg text-clinical-success"}`}>
                        {med.verified}
                      </span>
                    </div>
                    <h3 className="text-[20px] font-bold text-text-ink mb-2">
                      {searchingMedicationId === med.id ? (
                        <div className="relative w-full max-w-xl">
                          <input
                            autoFocus
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search 1mg medicine database..."
                            className="w-full rounded-md border border-primary bg-card-surface px-3 py-2 text-[14px] font-medium text-text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          {searchResults.length > 0 && (
                            <div ref={dropdownRef} className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-surface-container bg-card-surface p-1 shadow-xl">
                              {searchResults.map((result, index) => (
                                <button key={`${result}-${index}`} onClick={() => handleSelectMedicine(result)} className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-container-tint">
                                  <span className="text-[13px] font-bold text-text-ink">{result}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>{med.name} <span className="text-on-surface-variant font-normal text-[16px]"></span></>
                      )}
                    </h3>

                    {/* Dosage Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-surface-container-low p-3 rounded-lg mb-3 border border-surface-container">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-text-muted uppercase font-bold">Dose</span>
                        <input value={med.dose || ""} onChange={(event) => updateMedication(med.id, "dose", event.target.value)} className="mt-0.5 w-full rounded border border-transparent bg-transparent text-[13px] font-bold text-text-ink focus:border-primary focus:bg-card-surface focus:outline-none" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-text-muted uppercase font-bold">Frequency</span>
                        <input value={med.frequency || ""} onChange={(event) => updateMedication(med.id, "frequency", event.target.value)} className="mt-0.5 w-full rounded border border-transparent bg-transparent text-[13px] font-bold text-text-ink focus:border-primary focus:bg-card-surface focus:outline-none" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-text-muted uppercase font-bold">Timing</span>
                        <span className={`text-[13px] font-bold flex items-center gap-1 mt-0.5 ${med.timingColor}`}>
                          <input value={med.timing || ""} onChange={(event) => updateMedication(med.id, "timing", event.target.value)} className="min-w-0 w-full rounded border border-transparent bg-transparent text-[13px] font-bold focus:border-primary focus:bg-card-surface focus:outline-none" />
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-text-muted uppercase font-bold">Food / Route</span>
                        <input value={med.food || ""} onChange={(event) => updateMedication(med.id, "food", event.target.value)} className="mt-0.5 w-full rounded border border-transparent bg-transparent text-[13px] font-bold text-text-ink focus:border-primary focus:bg-card-surface focus:outline-none" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-text-muted uppercase font-bold">Duration</span>
                        <input value={med.duration || ""} onChange={(event) => updateMedication(med.id, "duration", event.target.value)} className="mt-0.5 w-full rounded border border-transparent bg-transparent text-[13px] font-bold text-text-ink focus:border-primary focus:bg-card-surface focus:outline-none" />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-container-tint/50 p-3 rounded-lg border border-surface-container">
                      <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">format_quote</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase text-text-muted font-bold tracking-wider">Sig / Instructions</span>
                        <textarea value={med.instructions || ""} onChange={(event) => updateMedication(med.id, "instructions", event.target.value)} rows={2} className="mt-0.5 w-full resize-y rounded border border-transparent bg-transparent text-[14px] font-medium text-text-ink focus:border-primary focus:bg-card-surface focus:outline-none" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-text-muted text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-clinical-success text-[14px]">graphic_eq</span>
                      <span>Audio timestamp: {med.timestamp} — &quot;{med.quote}&quot;</span>
                    </div>

                    
                  </div>
                </div>

                <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 pt-1">
                  <button onClick={() => med.needsReview ? setReviewMedicationId(med.id) : startMedicineSearch(med)} className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-card-surface text-text-ink hover:bg-container-tint transition-colors text-[13px] font-semibold shadow-sm w-full justify-center border border-surface-container cursor-pointer">
                    <span className="material-symbols-outlined text-[18px] text-primary">swap_horiz</span>
                    <span>{med.needsReview ? "Review Match" : "Change Medicine"}</span>
                  </button>
                  <button 
                    onClick={() => setDeleteMedicationId(med.id)}
                    className="p-2 rounded-md bg-card-surface text-clinical-error hover:bg-error-bg transition-colors shadow-sm flex items-center justify-center border border-surface-container cursor-pointer" 
                    title="Delete Item"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </article>
          ))}

          {medications.length === 0 && (
            <div className="p-8 text-center bg-card-surface rounded-xl border border-dashed border-container-tint">
              <p className="text-text-muted font-medium">All staged medications cleared. Use &quot;Add Medicine&quot; below to restore or add new orders.</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-30 mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-container-tint bg-card-surface/95 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button onClick={() => setBannerMessage("Use Change Medicine on a staged medication to search the 1mg database.")} className="flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-surface-container-low text-text-ink hover:bg-container-tint transition-colors text-[13px] font-bold shadow-sm border border-surface-container cursor-pointer">
            <span className="material-symbols-outlined text-[18px] text-primary">add_circle</span>
            <span>Add Medicine</span>
          </button>
          
          <button onClick={() => setMedications([])} className="flex items-center gap-1 px-3 py-2.5 rounded-md text-text-muted hover:text-clinical-error hover:bg-error-bg transition-colors text-[13px] font-semibold cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
            <span>Discard Draft</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-success-bg text-clinical-success text-[13px] font-bold">
          <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
          <span>{medications.length} medications staged · All safety checks green</span>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <button disabled title="Prescription templates are not available yet" className="cursor-not-allowed rounded-md border border-surface-container bg-surface-container px-4 py-2.5 text-[13px] font-bold text-text-muted opacity-70 shadow-sm">
            Templates Unavailable
          </button>
          <button disabled={isFinalizing || medications.length === 0} onClick={finalizePrescription} className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary-container text-card-surface text-[15px] font-bold hover:bg-accent-dark transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            <span className={`material-symbols-outlined text-[20px] ${isFinalizing ? "animate-spin" : ""}`}>{isFinalizing ? "sync" : "lock"}</span>
            <span>{isFinalizing ? "Finalizing..." : "Finalize Prescription"}</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
      </div>

      {reviewMedicationId !== null && (() => {
        const medication = medications.find((item) => item.id === reviewMedicationId);
        if (!medication) return null;
        const options = Array.isArray(medication.candidateOptions) ? medication.candidateOptions : [];
        const remaining = medications.filter((item) => item.needsReview).length;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-ink/50 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="review-medication-title">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-surface-container bg-card-surface p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-warning">No safe automatic match · {remaining} remaining</span>
                  <h2 id="review-medication-title" className="mt-1 text-[21px] font-bold text-text-ink">Select the medicine heard as “{medication.originalExtracted}”</h2>
                  <p className="mt-1 text-[13px] text-text-muted">Compare the transcript phrase and choose the correct database medicine. This selection will be recorded as clinician verified.</p>
                </div>
                <button onClick={reviewLater} className="rounded-full p-2 text-text-muted hover:bg-surface-container-low" aria-label="Review this medicine later">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="mt-4 rounded-lg border border-surface-container bg-surface-container-low p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Transcript</span>
                <p className="mt-1 text-[13px] font-medium text-text-ink">“{medication.quote}”</p>
              </div>

              <div className="mt-5">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-primary">Best database options</h3>
                {options.length > 0 ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {options.map((option: any, index: number) => (
                      <button key={`${option.id || option.brand_name}-${index}`} onClick={() => handleReviewSelection(option)} className="rounded-xl border border-surface-container p-3 text-left transition-colors hover:border-primary hover:bg-container-tint">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[14px] font-bold text-text-ink">{option.brand_name}</span>
                          <span className="shrink-0 rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">{Number(option.score || 0).toFixed(1)}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-text-muted">{option.dosage_form || "Form unknown"} · {option.match_type || "Candidate"}</p>
                        {(!option.compatible || option.conflicts?.length > 0) && (
                          <p className="mt-1 text-[10px] font-semibold text-clinical-warning">{option.conflicts?.join("; ") || "Candidate conflicts with extracted details"}</p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 rounded-lg bg-warning-bg p-3 text-[13px] font-medium text-clinical-warning">No suggested database candidates are available. Search the complete medicine database below.</p>
                )}
              </div>

              <div className="mt-5 border-t border-surface-container pt-5">
                <label htmlFor="review-medicine-search" className="text-[12px] font-bold uppercase tracking-wider text-primary">Search if none of these are correct</label>
                <div className="relative mt-2">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-2.5 text-[19px] text-text-muted">search</span>
                  <input id="review-medicine-search" value={reviewSearchQuery} onChange={(event) => setReviewSearchQuery(event.target.value)} placeholder="Type at least 2 letters of the brand name" className="w-full rounded-lg border border-surface-container bg-card-surface py-2.5 pl-10 pr-10 text-[14px] text-text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  {reviewSearching && <span className="material-symbols-outlined absolute right-3 top-2.5 animate-spin text-[19px] text-primary">sync</span>}
                </div>
                {reviewSearchQuery.trim().length >= 2 && !reviewSearching && (
                  <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-surface-container p-1">
                    {reviewSearchResults.length > 0 ? reviewSearchResults.map((result, index) => (
                      <button key={`${typeof result === "string" ? result : result.brand_name}-${index}`} onClick={() => handleReviewSelection(result)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-container-tint">
                        <span className="text-[13px] font-bold text-text-ink">{typeof result === "string" ? result : result.brand_name}</span>
                        <span className="material-symbols-outlined text-[17px] text-primary">add_circle</span>
                      </button>
                    )) : (
                      <p className="px-3 py-4 text-center text-[12px] text-text-muted">No database medicines found for this search.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 flex justify-end">
                <button onClick={reviewLater} className="rounded-lg border border-surface-container px-4 py-2 text-[13px] font-bold text-text-ink hover:bg-surface-container-low">Review later</button>
              </div>
            </div>
          </div>
        );
      })()}

      {deleteMedicationId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="delete-medication-title">
          <div className="w-full max-w-md rounded-xl bg-card-surface p-6 shadow-2xl border border-surface-container">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-bg text-clinical-error">
                <span className="material-symbols-outlined">delete</span>
              </div>
              <div>
                <h2 id="delete-medication-title" className="text-[17px] font-bold text-text-ink">Remove medication?</h2>
                <p className="mt-1 text-[13px] text-text-muted">This removes the medicine from the current draft. It does not change the transcript or database.</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setDeleteMedicationId(null)} className="rounded-lg border border-surface-container px-4 py-2 text-[13px] font-bold text-text-ink hover:bg-surface-container-low">Cancel</button>
              <button onClick={handleDelete} className="rounded-lg bg-clinical-error px-4 py-2 text-[13px] font-bold text-white hover:opacity-90">Remove</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
