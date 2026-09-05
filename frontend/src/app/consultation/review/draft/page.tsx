"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ReviewDraftPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: "Montelukast Sodium 10 mg",
      sub: "· Oral Tablet",
      category: "Oral Leukotriene Receptor Antagonist",
      verified: "Validated Generic",
      dose: "1 Tablet",
      frequency: "Once daily (OD)",
      timing: "Night (Bedtime)",
      timingIcon: "bedtime",
      timingColor: "text-primary",
      food: "With or without food",
      duration: "30 Days (Qty: 30)",
      instructions: "Take 1 tablet by mouth every night at bedtime. For chronic asthma prophylaxis and allergic rhinitis.",
      timestamp: "04:18",
      quote: "Let's restart montelukast 10 milligrams nightly at bedtime for the seasonal wheezing..."
    },
    {
      id: 2,
      name: "Fluticasone Propionate 50 mcg / actuation",
      sub: "· Nasal Spray Suspension",
      category: "Corticosteroid Nasal Spray",
      verified: "First-Line Rhinitis Tx",
      dose: "1 Spray / Nostril",
      frequency: "Once daily (OM)",
      timing: "Morning",
      timingIcon: "wb_sunny",
      timingColor: "text-clinical-warning",
      food: "Nasal Route (N/A)",
      duration: "14 Days (2 Weeks)",
      instructions: "Administer 1 spray into each nostril once daily every morning. Shake gently before use.",
      timestamp: "06:42",
      quote: "Fluticasone nasal spray, one spray per nostril every morning for two weeks..."
    },
    {
      id: 3,
      name: "Albuterol Sulfate HFA 90 mcg / actuation",
      sub: "· Inhalation Aerosol",
      category: "Short-Acting Beta-2 Agonist (SABA)",
      badge: "PRN Rescue Inhaler",
      borderWarning: true,
      dose: "1-2 Puffs",
      frequency: "q4-6h PRN",
      timing: "PRN Acute Wheeze",
      timingIcon: "emergency",
      timingColor: "text-clinical-warning",
      food: "Inhalation Route",
      duration: "30 Days (1 Canister)",
      instructions: "Inhale 1 to 2 puffs every 4 to 6 hours as needed for shortness of breath or acute wheeze. Rinse mouth after use.",
      timestamp: "08:05",
      quote: "Keep your albuterol inhaler ready, one or two puffs as needed if you feel acute chest tightness..."
    }
  ]);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this medication from the current draft?")) {
      setMedications(medications.filter((m) => m.id !== id));
    }
  };

  const handleAddMedicine = () => {
    const newId = Date.now();
    setMedications([
      ...medications,
      {
        id: newId,
        name: "Cetirizine HCl 10 mg",
        sub: "· Oral Tablet",
        category: "Second-Generation Antihistamine",
        verified: "Allergy Relief",
        dose: "1 Tablet",
        frequency: "Once daily (OD)",
        timing: "Evening",
        timingIcon: "schedule",
        timingColor: "text-primary",
        food: "With or without food",
        duration: "30 Days (Qty: 30)",
        instructions: "Take 1 tablet daily as needed for symptom control.",
        timestamp: "09:12",
        quote: "Adding cetirizine for persistent histamine-mediated ocular and nasal symptoms.",
        badge: undefined,
        borderWarning: undefined
      }
    ]);
    setBannerMessage("Added Cetirizine 10mg to staged draft.");
    setTimeout(() => setBannerMessage(""), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-28 gap-space-lg">
      {bannerMessage && (
        <div className="p-3 rounded-lg bg-success-bg text-clinical-success font-semibold text-[14px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          {bannerMessage}
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between">
        <nav className="flex items-center gap-1.5 text-on-surface-variant text-[13px]">
          <span className="hover:text-primary transition-colors cursor-pointer">Doctor Workspace</span>
          <span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Consultations</span>
          <span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
          <span className="hover:text-primary transition-colors cursor-pointer text-text-ink font-semibold">Maya Lin Harrison</span>
          <span className="material-symbols-outlined text-[14px] text-text-muted">chevron_right</span>
          <span className="px-1.5 py-0.5 rounded bg-container-tint text-primary font-bold">Prescription Review</span>
        </nav>
        <div className="flex items-center gap-2 text-[11px] text-text-muted font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
          <span>Enc-ID: #ENC-9082-ROOM101</span>
          <span className="text-border-divider">|</span>
          <span>Synced 1m ago</span>
        </div>
      </div>

      {/* Patient Context */}
      <section className="w-full bg-card-surface rounded-xl shadow-sm p-4 border border-surface-container">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-container-tint flex items-center justify-center text-primary-container text-[20px] font-bold shadow-sm ring-2 ring-card-surface">
                ML
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-clinical-success ring-2 ring-card-surface"></span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[22px] font-bold text-text-ink truncate">Maya Lin Harrison</h1>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px] font-semibold">32 yrs · Female</span>
                <span className="px-2 py-0.5 rounded bg-surface-container text-text-muted text-[11px] font-bold">Blood O+</span>
                <span className="text-[11px] text-text-muted font-mono tracking-tight">UHID: UHID-MH-2024-88412</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-on-surface-variant text-[12px] flex-wrap">
                <span className="flex items-center gap-1 font-medium"><span className="material-symbols-outlined text-[16px] text-primary">door_open</span> Room 101</span>
                <span className="text-border-divider">·</span>
                <span className="flex items-center gap-1 font-medium"><span className="material-symbols-outlined text-[16px] text-primary">stethoscope</span> Attending: Dr. Eleanor Vance, MD</span>
                <span className="text-border-divider">·</span>
                <span className="text-text-muted">Primary Dx: Acute exacerbation of chronic cough & allergic rhinitis</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error-bg text-clinical-error shadow-sm">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider leading-tight">Allergy Alert</span>
                <span className="text-[12px] font-semibold">Penicillin (Severe Rash)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Generated prescription banner */}
      <section className="w-full bg-gradient-to-r from-container-tint via-card-surface to-success-bg/40 rounded-xl p-4 shadow-sm relative overflow-hidden border border-surface-container">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary text-card-surface flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[18px] font-bold text-text-ink">AI-Generated Prescription Draft</span>
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-card-surface text-[11px] uppercase tracking-wider font-bold shadow-sm">Real-Time Synthesis</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-muted text-[11px]">Station 101 Ambient Stream</span>
              </div>
              <p className="text-on-surface-variant text-[14px] max-w-3xl font-medium">
                Synthesized from Room 101 ambient voice consultation. Verify all pharmacological dosages, timing, food interactions, and contraindications before clinical sign-off.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-success-bg shadow-sm">
            <div className="w-6 h-6 rounded-full bg-clinical-success text-card-surface flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px] font-bold">check</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-clinical-success font-bold uppercase tracking-wider">FDB Safety & Drug-Allergy Check Passed</span>
              <span className="text-[12px] text-tertiary font-semibold">No Penicillin / Beta-lactam conflicts detected ({medications.length}/{medications.length} Safe)</span>
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
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-on-surface-variant font-medium">Audio Confidence:</span>
            <span className="px-2 py-0.5 rounded bg-success-bg text-clinical-success font-bold">99.4% Mean Spectral Match</span>
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
                      {med.id === 1 ? "medication" : med.id === 2 ? "air" : "pulmonology"}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold tracking-wide uppercase">{med.category}</span>
                      {med.verified && (
                        <span className="text-[11px] text-clinical-success flex items-center gap-0.5 font-bold">
                          <span className="material-symbols-outlined text-[14px]">verified</span> {med.verified}
                        </span>
                      )}
                      {med.badge && (
                        <span className="px-2 py-0.5 rounded bg-container-tint text-primary text-[11px] font-bold uppercase">{med.badge}</span>
                      )}
                    </div>
                    <h3 className="text-[20px] font-bold text-text-ink mb-2">
                      {med.name} <span className="text-on-surface-variant font-normal text-[16px]">{med.sub}</span>
                    </h3>

                    {/* Dosage Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-surface-container-low p-3 rounded-lg mb-3 border border-surface-container">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-text-muted uppercase font-bold">Dose</span>
                        <span className="text-[13px] text-text-ink font-bold mt-0.5">{med.dose}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-text-muted uppercase font-bold">Frequency</span>
                        <span className="text-[13px] text-text-ink font-bold mt-0.5">{med.frequency}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-text-muted uppercase font-bold">Timing</span>
                        <span className={`text-[13px] font-bold flex items-center gap-1 mt-0.5 ${med.timingColor}`}>
                          <span className="material-symbols-outlined text-[15px]">{med.timingIcon}</span> {med.timing}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-text-muted uppercase font-bold">Food / Route</span>
                        <span className="text-[13px] text-text-ink font-bold mt-0.5">{med.food}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-text-muted uppercase font-bold">Duration</span>
                        <span className="text-[13px] text-text-ink font-bold mt-0.5">{med.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 bg-container-tint/50 p-3 rounded-lg border border-surface-container">
                      <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">format_quote</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase text-text-muted font-bold tracking-wider">Sig / Instructions</span>
                        <p className="text-[14px] text-text-ink font-medium mt-0.5">{med.instructions}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-text-muted text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-clinical-success text-[14px]">graphic_eq</span>
                      <span>Audio timestamp: {med.timestamp} — &quot;{med.quote}&quot;</span>
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 pt-1">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-card-surface text-text-ink hover:bg-container-tint transition-colors text-[13px] font-semibold shadow-sm w-full justify-center border border-surface-container cursor-pointer">
                    <span className="material-symbols-outlined text-[18px] text-primary">swap_horiz</span>
                    <span>Change Medicine</span>
                  </button>
                  <button 
                    onClick={() => {
                      const newDose = prompt("Edit Sig / Directions:", med.instructions);
                      if (newDose) {
                        setMedications(medications.map(m => m.id === med.id ? {...m, instructions: newDose} : m));
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-card-surface text-text-ink hover:bg-container-tint transition-colors text-[13px] font-semibold shadow-sm w-full justify-center border border-surface-container cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(med.id)}
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
              <p className="text-text-muted font-medium">All staged medications cleared. Use &quot;+ Add Medicine&quot; below to restore or add new orders.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card-surface rounded-xl p-4 shadow-sm flex flex-col justify-between border border-surface-container">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Designated E-Rx Pharmacy</span>
              <span className="px-2 py-0.5 rounded bg-success-bg text-clinical-success text-[11px] font-bold">NCPDP Verified</span>
            </div>
            <div className="flex items-start gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">local_pharmacy</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-text-ink">CVS Pharmacy #4821</span>
                <span className="text-[12px] font-medium text-on-surface-variant">845 Michigan Ave, Chicago IL 60611</span>
                <span className="text-[11px] text-text-muted font-mono font-semibold mt-0.5">Fax: (312) 555-0199 · Tel: (312) 555-0144</span>
              </div>
            </div>
          </div>
          <button className="text-primary text-[13px] font-semibold hover:underline flex items-center gap-1 self-start mt-2 cursor-pointer">
            <span>Change Pharmacy</span>
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </button>
        </div>

        <div className="bg-card-surface rounded-xl p-4 shadow-sm lg:col-span-2 flex flex-col justify-between border border-surface-container">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">graphic_eq</span>
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Ambient Audio Session Telemetry</span>
            </div>
            <span className="text-[11px] text-text-muted font-semibold">Total Consult: 11m 42s</span>
          </div>
          <div className="bg-surface-container-low border border-surface-container rounded-lg p-3 flex items-center gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-primary text-card-surface flex items-center justify-center hover:bg-accent-dark transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">{isPlaying ? "pause" : "play_arrow"}</span>
            </button>
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center text-[11px] text-text-muted font-semibold mb-1">
                <span>Prescription Section (04:15 - 08:30)</span>
                <span>{isPlaying ? "05:12 / 11:42 (Playing)" : "04:15 / 11:42"}</span>
              </div>
              <div className="h-6 flex items-end gap-1">
                <span className={`w-1 bg-primary rounded-full transition-all duration-300 ${isPlaying ? "h-6 animate-pulse" : "h-3"}`}></span>
                <span className={`w-1 bg-primary rounded-full transition-all duration-300 ${isPlaying ? "h-4" : "h-5"}`}></span>
                <span className={`w-1 bg-primary rounded-full transition-all duration-300 ${isPlaying ? "h-6 animate-pulse" : "h-6"}`}></span>
                <span className={`w-1 bg-primary rounded-full transition-all duration-300 ${isPlaying ? "h-3" : "h-4"}`}></span>
                <span className={`w-1 bg-primary rounded-full transition-all duration-300 ${isPlaying ? "h-5 animate-pulse" : "h-3"}`}></span>
                <span className={`w-1 bg-primary rounded-full transition-all duration-300 ${isPlaying ? "h-6" : "h-5"}`}></span>
                <span className="w-1 bg-container-tint h-3 rounded-full"></span>
                <span className="w-1 bg-primary h-4 rounded-full"></span>
                <span className="w-1 bg-primary h-5 rounded-full"></span>
                <span className="w-1 bg-container-tint h-2 rounded-full"></span>
                <span className="w-1 bg-container-tint h-3 rounded-full"></span>
                <span className="w-1 bg-primary h-6 rounded-full"></span>
                <span className="w-1 bg-primary h-4 rounded-full"></span>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-md bg-card-surface border border-surface-container text-text-ink text-[13px] font-semibold hover:bg-container-tint transition-colors flex items-center gap-1 shadow-sm cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">subtitles</span>
              <span>Transcript</span>
            </button>
          </div>
          <p className="text-[12px] font-medium text-text-muted mt-2">
            Synthesizer model: SleekCare Bio-Voice v4.1 · Attending audio confirmed no off-label warnings triggered.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 bg-card-surface/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-30 px-margin-desktop py-3 flex flex-wrap items-center justify-between border-t border-surface-container">
        <div className="flex items-center gap-3">
          <button onClick={handleAddMedicine} className="flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-surface-container-low text-text-ink hover:bg-container-tint transition-colors text-[13px] font-bold shadow-sm border border-surface-container cursor-pointer">
            <span className="material-symbols-outlined text-[18px] text-primary">add_circle</span>
            <span>+ Add Medicine</span>
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-surface-container-low text-text-ink hover:bg-container-tint transition-colors text-[13px] font-bold shadow-sm group border border-surface-container cursor-pointer">
            <span className="material-symbols-outlined text-[18px] text-clinical-error group-hover:animate-pulse">mic</span>
            <span>Re-record Voice</span>
          </button>
          <button onClick={() => { if (confirm("Discard draft session?")) setMedications([]); }} className="flex items-center gap-1 px-3 py-2.5 rounded-md text-text-muted hover:text-clinical-error hover:bg-error-bg transition-colors text-[13px] font-semibold cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
            <span>Discard Draft</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-success-bg text-clinical-success text-[13px] font-bold">
          <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
          <span>{medications.length} medications staged · All safety checks green</span>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <button className="px-4 py-2.5 rounded-md bg-card-surface border border-surface-container text-text-ink text-[13px] font-bold hover:bg-container-tint transition-colors shadow-sm cursor-pointer">
            Save as Template
          </button>
          <button onClick={() => router.push("/consultation/review/verify")} className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary-container text-card-surface text-[15px] font-bold hover:bg-accent-dark transition-all shadow-md active:scale-95 cursor-pointer">
            <span>Review & Sign</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
