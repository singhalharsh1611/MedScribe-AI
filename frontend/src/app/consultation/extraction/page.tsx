"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const CLINICAL_AI_API_URL = process.env.NEXT_PUBLIC_CLINICAL_AI_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3001/api" : API_URL);
const STEPS = ["Live Dictation", "Transcript Review", "AI Processing", "Extraction", "Draft Order"];

async function readJsonResponse(response: Response, fallbackMessage: string) {
  const body = await response.text();
  let data: any = null;
  if (body) {
    try { data = JSON.parse(body); } catch { data = null; }
  }
  if (!response.ok) {
    throw new Error(data?.error || data?.message || `${fallbackMessage} (${response.status})`);
  }
  if (!data) throw new Error(`${fallbackMessage}: the server returned an invalid response`);
  return data;
}

type Candidate = {
  id: number;
  brand_name: string;
  salt: string;
  match_type: string;
  score: number;
  confidence: number;
  dosage_form: string;
  compatible: boolean;
  conflicts: string[];
  review_reasons: string[];
  auto_selectable?: boolean;
};

type ExtractedMedication = {
  spoken_name: string;
  strength: string;
  dosage_form?: string;
  qualifiers?: string[];
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  instructions: string;
  source_text: string;
  selection_status: "matched" | "needs_review" | "no_match";
  candidates: Candidate[];
  top_phonetic: Candidate[];
  top_fuzzy: Candidate[];
  recommended_candidate?: Candidate | null;
  clinician_selected_candidate_id?: number | null;
};

function getBestUniqueCandidates(medication: ExtractedMedication) {
  const unique = new Map<string, Candidate>();
  const pool = [medication.candidates, medication.top_phonetic, medication.top_fuzzy]
    .filter(Array.isArray)
    .flat();
  for (const candidate of pool) {
    if (!candidate?.brand_name) continue;
    const key = candidate.brand_name.trim().toLowerCase();
    const existing = unique.get(key);
    if (!existing || Number(candidate.score || 0) > Number(existing.score || 0)) {
      unique.set(key, candidate);
    }
  }
  return [...unique.values()]
    .sort((left, right) => {
      if (left.compatible !== right.compatible) return left.compatible ? -1 : 1;
      return Number(right.score || 0) - Number(left.score || 0)
        || left.brand_name.localeCompare(right.brand_name);
    })
    .slice(0, 4);
}

function ensureCandidatePools(medication: ExtractedMedication): ExtractedMedication {
  const candidates = Array.isArray(medication.candidates) ? medication.candidates : [];
  return {
    ...medication,
    candidates,
    top_phonetic: Array.isArray(medication.top_phonetic)
      ? medication.top_phonetic
      : candidates.filter((candidate) => candidate.match_type === "Phonetic" || candidate.match_type === "Near-Phonetic").slice(0, 6),
    top_fuzzy: Array.isArray(medication.top_fuzzy)
      ? medication.top_fuzzy
      : candidates.slice(0, 6),
  };
}

export default function ExtractionPage() {
  const router = useRouter();
  const [medications, setMedications] = useState<ExtractedMedication[]>([]);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reviewMedicationIndex, setReviewMedicationIndex] = useState<number | null>(null);
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [reviewSearchResults, setReviewSearchResults] = useState<Candidate[]>([]);
  const [reviewSearching, setReviewSearching] = useState(false);
  const extractionStartedRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("transcriptionResult");
    if (!stored) {
      setError("No transcript is available for extraction.");
      setLoading(false);
      return;
    }

    try {
      const result = JSON.parse(stored);
      const text = result.transcript || "";
      setTranscript(text);
      if (!text) throw new Error("The transcript is empty.");

      const cachedExtraction = localStorage.getItem("extractionResult");
      if (cachedExtraction) {
        try {
          const cached = JSON.parse(cachedExtraction);
          if (cached.transcript === text && Array.isArray(cached.mapped)) {
            const mapped = cached.mapped.map(ensureCandidatePools);
            setMedications(mapped);
            localStorage.setItem("extractionResult", JSON.stringify({ ...cached, mapped }));
            const unresolvedIndex = mapped.findIndex((medication: ExtractedMedication) => medication.selection_status === "no_match");
            setReviewMedicationIndex(unresolvedIndex >= 0 ? unresolvedIndex : null);
            setLoading(false);
            return;
          }
        } catch (cacheError) {
          localStorage.removeItem("extractionResult");
        }
      }

      if (extractionStartedRef.current) return;
      extractionStartedRef.current = true;

      fetch(`${CLINICAL_AI_API_URL}/prescription/extract-and-map`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      })
        .then(async (response) => {
          const data = await readJsonResponse(response, "Extraction failed");
          const mapped = (data.mapped || []).map(ensureCandidatePools);
          setMedications(mapped);
          const unresolvedIndex = mapped.findIndex((medication: ExtractedMedication) => medication.selection_status === "no_match");
          setReviewMedicationIndex(unresolvedIndex >= 0 ? unresolvedIndex : null);
          localStorage.removeItem("generatedPrescription");
          localStorage.setItem("extractionResult", JSON.stringify({ transcript: text, mapped }));
        })
        .catch((reason) => setError(reason instanceof Error ? reason.message : "Extraction failed"))
        .finally(() => setLoading(false));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not read the transcript.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (reviewMedicationIndex === null || reviewSearchQuery.trim().length < 2) {
      setReviewSearchResults([]);
      setReviewSearching(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setReviewSearching(true);
      try {
        const response = await fetch(`${CLINICAL_AI_API_URL}/prescription/search?q=${encodeURIComponent(reviewSearchQuery.trim())}&detailed=1`, {
          credentials: "include",
          signal: controller.signal,
        });
        const data = await readJsonResponse(response, "Medicine search failed");
        setReviewSearchResults(Array.isArray(data.results) ? data.results : []);
      } catch (reason) {
        if ((reason as Error).name !== "AbortError") {
          setError(reason instanceof Error ? reason.message : "Medicine search failed");
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
  }, [reviewMedicationIndex, reviewSearchQuery]);

  const selectDoctorMatch = (candidate: Candidate) => {
    if (reviewMedicationIndex === null) return;
    const updated = medications.map((medication, index) => {
      if (index !== reviewMedicationIndex) return medication;
      const selectedCandidate: Candidate = {
        ...candidate,
        compatible: true,
        conflicts: [],
        auto_selectable: true,
      };
      const candidates = [selectedCandidate, ...(medication.candidates || [])]
        .filter((item, candidateIndex, all) => all.findIndex((entry) => Number(entry.id) === Number(item.id)) === candidateIndex);
      return {
        ...medication,
        candidates,
        selection_status: "matched" as const,
        recommended_candidate: selectedCandidate,
        clinician_selected_candidate_id: Number(selectedCandidate.id),
      };
    });
    setMedications(updated);
    localStorage.setItem("extractionResult", JSON.stringify({ transcript, mapped: updated }));
    const nextIndex = updated.findIndex((medication) => medication.selection_status === "no_match");
    setReviewSearchQuery("");
    setReviewSearchResults([]);
    setReviewMedicationIndex(nextIndex >= 0 ? nextIndex : null);
  };

  const continueToDraft = async () => {
    const unresolvedIndex = medications.findIndex((medication) => medication.selection_status === "no_match");
    if (unresolvedIndex >= 0) {
      setReviewMedicationIndex(unresolvedIndex);
      setError("Select a database medicine for every unresolved item before continuing.");
      return;
    }
    if (!transcript || !medications.length || isGenerating) return;
    setIsGenerating(true);
    setError("");
    try {
      const response = await fetch(`${CLINICAL_AI_API_URL}/prescription/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, mappedDrugs: medications }),
      });
      const data = await readJsonResponse(response, "Draft generation failed");
      localStorage.setItem("generatedPrescription", JSON.stringify(data));
      router.push("/consultation/review/draft");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Draft generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 min-h-[calc(100vh-6rem)] pb-4 pt-4 lg:flex-row">
      <div className="hidden w-56 shrink-0 flex-col gap-5 pt-2 lg:flex">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-muted ml-1">Encounter Workflow</h3>
        <div className="flex flex-col gap-0 relative">
          <div className="absolute left-3.5 top-2 bottom-6 w-px bg-surface-container-highest z-0"></div>
          {STEPS.map((step, index) => {
            const active = index === 3;
            const completed = index < 3;
            return (
              <div key={step} className="flex items-start gap-4 relative z-10 py-3">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold shrink-0 border-2 ${active ? "bg-primary text-white border-primary" : completed ? "bg-primary-container text-primary border-primary" : "bg-app-bg text-text-muted border-surface-container-highest"}`}>
                  {completed ? <span className="material-symbols-outlined text-[16px]">check</span> : index + 1}
                </div>
                <span className={`text-[14px] font-bold mt-0.5 ${active || completed ? "text-primary" : "text-on-surface-variant"}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-5 pb-10 lg:overflow-y-auto lg:pr-2">
        <div className="bg-card-surface border border-surface-container rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-[24px] font-bold text-text-ink">Medicine Extraction</h1>
              <p className="text-[13px] text-text-muted mt-1">Spoken medicine details are preserved separately from possible database matches. Nothing is finalized here.</p>
            </div>
            {loading && <span className="material-symbols-outlined animate-spin text-primary text-[24px]">sync</span>}
          </div>
          {error && <div className="p-4 rounded-lg bg-error-bg text-clinical-error text-[13px] font-semibold">{error}</div>}
          {!error && !loading && medications.length === 0 && <p className="text-[14px] text-text-muted">No medicines were extracted from this transcript.</p>}
          {!loading && medications.length > 0 && (
            <div className="flex flex-col gap-4">
              {medications.map((medication, index) => (
                <article key={`${medication.spoken_name}-${index}`} className="border border-surface-container rounded-xl p-4 bg-surface-container-lowest">
                  <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                    <div className="min-w-0 xl:max-w-[42%]">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Spoken medicine {index + 1}</span>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <h2 className="text-[19px] font-bold text-text-ink">{medication.spoken_name}</h2>
                        <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded ${medication.selection_status === "matched" ? "bg-success-bg text-clinical-success" : medication.selection_status === "no_match" ? "bg-error-bg text-clinical-error" : "bg-warning-bg text-clinical-warning"}`}>
                          {medication.selection_status === "matched" ? "DB matched" : medication.selection_status === "no_match" ? "No safe match" : "Needs review"}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-2 italic">{medication.source_text}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-[12px]">
                        <span><b>Strength:</b> {medication.strength}</span>
                        <span><b>Form:</b> {medication.dosage_form || "N/A"}</span>
                        <span><b>Qualifiers:</b> {medication.qualifiers?.join(", ") || "N/A"}</span>
                        <span><b>Dose:</b> {medication.dose}</span>
                        <span><b>Route:</b> {medication.route}</span>
                        <span><b>Frequency:</b> {medication.frequency}</span>
                        <span><b>Duration:</b> {medication.duration}</span>
                        <span><b>Instructions:</b> {medication.instructions}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      <CandidateList title="Phonetic possibilities" candidates={medication.top_phonetic} />
                      <CandidateList title="Fuzzy possibilities" candidates={medication.top_fuzzy} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button onClick={continueToDraft} disabled={loading || isGenerating || !medications.length} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold text-[14px] disabled:opacity-50 disabled:cursor-not-allowed">
            {isGenerating ? "Generating Draft..." : "Continue to Draft Review"}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {reviewMedicationIndex !== null && medications[reviewMedicationIndex] && (() => {
        const medication = medications[reviewMedicationIndex];
        const options = getBestUniqueCandidates(medication);
        const unresolvedCount = medications.filter((item) => item.selection_status === "no_match").length;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-ink/55 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="resolve-medicine-title">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-surface-container bg-card-surface p-6 shadow-2xl">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-warning">Doctor selection required · {unresolvedCount} remaining</span>
                <h2 id="resolve-medicine-title" className="mt-1 text-[21px] font-bold text-text-ink">What medicine was heard as “{medication.spoken_name}”?</h2>
                <p className="mt-1 text-[13px] text-text-muted">Select one database medicine. The next unresolved medicine will open automatically.</p>
              </div>

              <div className="mt-4 rounded-lg border border-surface-container bg-surface-container-low p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Transcript phrase</span>
                <p className="mt-1 text-[13px] font-medium text-text-ink">“{medication.source_text || medication.spoken_name}”</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-on-surface-variant">
                  <span className="rounded bg-card-surface px-2 py-1">Strength: {medication.strength || "N/A"}</span>
                  <span className="rounded bg-card-surface px-2 py-1">Form: {medication.dosage_form || "N/A"}</span>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-primary">Best 4 unique matches</h3>
                {options.length > 0 ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {options.map((candidate, index) => (
                      <button key={`${candidate.id}-${candidate.brand_name}-${index}`} onClick={() => selectDoctorMatch(candidate)} className="rounded-xl border border-surface-container p-3 text-left transition-colors hover:border-primary hover:bg-container-tint">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[14px] font-bold text-text-ink">{candidate.brand_name}</span>
                          <span className="shrink-0 rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">{Number(candidate.score || 0).toFixed(1)}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-text-muted">{candidate.dosage_form || "Form unknown"} · {candidate.match_type}</p>
                        {(!candidate.compatible || candidate.conflicts?.length > 0) && (
                          <p className="mt-1 text-[10px] font-semibold text-clinical-warning">{candidate.conflicts?.join("; ") || "Conflicts with extracted details—select only if the extraction was wrong."}</p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 rounded-lg bg-warning-bg p-3 text-[13px] font-medium text-clinical-warning">No suggested candidates are available. Search the database below.</p>
                )}
              </div>

              <div className="mt-5 border-t border-surface-container pt-5">
                <label htmlFor="extraction-medicine-search" className="text-[12px] font-bold uppercase tracking-wider text-primary">None are correct? Search all medicines</label>
                <div className="relative mt-2">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-2.5 text-[19px] text-text-muted">search</span>
                  <input id="extraction-medicine-search" autoFocus value={reviewSearchQuery} onChange={(event) => setReviewSearchQuery(event.target.value)} placeholder="Search by database brand name" className="w-full rounded-lg border border-surface-container bg-card-surface py-2.5 pl-10 pr-10 text-[14px] text-text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                  {reviewSearching && <span className="material-symbols-outlined absolute right-3 top-2.5 animate-spin text-[19px] text-primary">sync</span>}
                  
                  {reviewSearchQuery.trim().length >= 2 && !reviewSearching && (
                    <div className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-56 overflow-y-auto rounded-lg border border-surface-container bg-card-surface p-1 shadow-xl">
                      {reviewSearchResults.length > 0 ? reviewSearchResults.map((candidate, index) => (
                        <button key={`${candidate.id}-${candidate.brand_name}-${index}`} onClick={() => selectDoctorMatch(candidate)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-container-tint">
                          <span>
                            <span className="block text-[13px] font-bold text-text-ink">{candidate.brand_name}</span>
                            <span className="block text-[10px] text-text-muted">{candidate.dosage_form || "Form unknown"}</span>
                          </span>
                          <span className="material-symbols-outlined text-[17px] text-primary">add_circle</span>
                        </button>
                      )) : (
                        <p className="px-3 py-4 text-center text-[12px] text-text-muted">No database medicines found.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-4 pb-48 text-[11px] font-semibold text-text-muted">A database medicine must be selected before this prescription can continue.</p>
            </div>
          </div>
        );
      })()}
    </section>
  );
}

function CandidateList({ title, candidates }: { title: string; candidates?: Candidate[] }) {
  const list = Array.isArray(candidates) ? candidates : [];
  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-wider font-bold text-primary mb-2">{title} ({list.length})</h3>
      <div className="flex flex-col gap-2">
        {list.map((candidate) => (
            <div key={`${title}-${candidate.id}-${candidate.brand_name}`} className={`flex items-center justify-between gap-3 p-2.5 rounded-lg bg-card-surface border ${candidate.compatible ? "border-surface-container" : "border-clinical-error/40"}`}>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-text-ink truncate">{candidate.brand_name}</p>
                <p className="text-[10px] text-text-muted truncate">{candidate.dosage_form || "Form unknown"} · {candidate.match_type}</p>
                {(candidate.conflicts?.length > 0 || candidate.review_reasons?.length > 0) && (
                  <p className="text-[10px] text-clinical-warning mt-1">{[...(candidate.conflicts || []), ...(candidate.review_reasons || [])].join("; ")}</p>
                )}
              </div>
            <span className="text-[11px] font-bold text-primary shrink-0">{candidate.score.toFixed(1)}</span>
          </div>
        ))}
        {list.length === 0 && <p className="text-[12px] text-text-muted">No candidate found.</p>}
      </div>
    </div>
  );
}
