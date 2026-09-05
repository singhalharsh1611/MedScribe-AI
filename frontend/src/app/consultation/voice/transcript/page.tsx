"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VoiceTranscriptPage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [transcriptText, setTranscriptText] = useState(
    "Patient will continue Albuterol HFA ninety micrograms, two puffs every four to six hours as needed for wheezing. Add Montelukast sodium ten milligrams, one tablet orally once daily at bedtime for thirty days. Also add Fluticasone propionate nasal spray fifty micrograms per actuation, one spray in each nostril every morning for two weeks for allergic rhinitis symptoms."
  );

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-2xl">
      <section className="w-full bg-card-surface shadow-sm rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md border border-surface-container">
        <div className="flex items-center gap-space-md min-w-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-container-tint flex items-center justify-center text-primary-container text-[20px] font-bold shadow-sm">
              ML
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-clinical-success ring-2 ring-card-surface"></span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs flex-wrap">
              <h2 className="font-bold text-[18px] text-text-ink truncate">Maya Lin Harrison</h2>
              <span className="bg-surface-container-high text-on-surface-variant text-[11px] font-semibold px-2 py-0.5 rounded-full">32 yrs · Female</span>
              <span className="bg-surface-container-high text-secondary text-[11px] font-mono px-2 py-0.5 rounded-full">UHID-MH-2024-88412</span>
            </div>
            <div className="flex items-center gap-space-sm mt-1 text-text-muted text-[12px] font-semibold">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">stethoscope</span>
                Pulmonology Follow-up
              </span>
              <span>•</span>
              <span>Room 101</span>
              <span>•</span>
              <span>Dr. Eleanor Vance, MD</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-space-xs bg-error-bg text-clinical-error px-space-md py-space-xs rounded-lg shrink-0 self-start md:self-auto shadow-sm">
          <span className="material-symbols-outlined text-[20px]">warning</span>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider">Allergy Alert</span>
            <span className="font-bold text-[12px] leading-none">Penicillin (Severe Rash)</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-space-xs">
            <span className="text-[11px] font-bold uppercase text-primary tracking-widest">Step 04 / Voice Review</span>
            <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest"></span>
            <span className="text-[11px] font-semibold text-text-muted">Acoustic Pipeline LLR 4.2</span>
          </div>
          <h1 className="font-bold text-[32px] text-text-ink tracking-tight">Transcript</h1>
          <p className="text-[14px] font-medium text-text-muted">
            Review the verbatim voice capture from your Room 101 dictation. You can edit errors or continue to structured medication parsing.
          </p>
        </div>
        
        <div className="bg-card-surface shadow-sm rounded-xl p-space-sm flex items-center gap-space-md min-w-[340px] xl:w-auto border border-surface-container">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-accent-dark transition-transform active:scale-95 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">{isPlaying ? "pause" : "play_arrow"}</span>
          </button>
          <div className="flex flex-col flex-1 min-w-[180px]">
            <div className="flex items-center justify-between text-text-muted text-[11px] font-semibold mb-1">
              <span className="font-mono text-text-ink font-bold">{isPlaying ? "00:11" : "00:08"}</span>
              <span>00:15</span>
            </div>
            <div className="relative w-full h-7 flex items-center gap-0.5 cursor-pointer">
              {Array.from({ length: 18 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full ${i < 8 ? "bg-primary" : "bg-secondary-container"} ${isPlaying && i < 12 ? "bg-primary animate-pulse" : ""}`}
                  style={{ height: `${(i % 5 + 2) * 4}px` }}
                />
              ))}
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-right pl-space-xs">
            <span className="text-[11px] font-bold uppercase text-text-muted">Captured</span>
            <span className="text-[12px] font-bold text-text-ink">Today · 09:44 AM</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className="bg-card-surface shadow-sm rounded-xl p-space-lg flex flex-col gap-space-md relative overflow-hidden border border-surface-container">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">graphic_eq</span>
                <div>
                  <h3 className="font-bold text-[16px] text-text-ink">Doctor Spoken Audio Transcript</h3>
                  <p className="text-[12px] font-semibold text-text-muted">Raw verbatim buffer synced with Room 101 hardware token</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-success-bg text-clinical-success px-space-sm py-1 rounded-full shrink-0 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider">Confidence 98.6%</span>
              </div>
            </div>

            <div className="flex flex-col gap-space-sm">
              {!isEditing ? (
                <div className="p-space-md bg-surface-container-low rounded-lg border border-surface-container">
                  <p className="text-[16px] text-text-ink leading-relaxed font-medium">
                    &quot;{transcriptText}&quot;
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-space-xs">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Manual Correction Mode</label>
                  <textarea 
                    className="w-full p-space-md bg-card-surface text-text-ink text-[14px] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container leading-relaxed resize-y"
                    rows={4}
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                  />
                  <div className="flex justify-end gap-space-xs mt-1">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-space-sm py-1.5 rounded text-text-muted hover:text-text-ink text-[13px] font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-space-md py-1.5 bg-primary text-on-primary rounded-lg text-[13px] font-bold shadow-sm hover:bg-accent-dark cursor-pointer"
                    >
                      Save Update
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-space-xs pt-space-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-text-muted tracking-wider">Extracted Clinical Entities (3 Items Auto-Detected)</span>
                <span className="text-[11px] font-semibold text-primary flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  Ready for Rx conversion
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1 border border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Bronchodilator</span>
                    <span className="material-symbols-outlined text-clinical-success text-[16px]">check_circle</span>
                  </div>
                  <span className="font-bold text-[13px] text-text-ink">Albuterol HFA 90mcg</span>
                  <span className="text-[11px] font-semibold text-text-muted">PRN Inhalation · 2 puffs q4-6h</span>
                </div>

                <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1 border border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Leukotriene Inhibitor</span>
                    <span className="material-symbols-outlined text-clinical-success text-[16px]">check_circle</span>
                  </div>
                  <span className="font-bold text-[13px] text-text-ink">Montelukast 10mg</span>
                  <span className="text-[11px] font-semibold text-text-muted">Oral Daily · Bedtime · 30 Days</span>
                </div>

                <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1 border border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Corticosteroid</span>
                    <span className="material-symbols-outlined text-clinical-success text-[16px]">check_circle</span>
                  </div>
                  <span className="font-bold text-[13px] text-text-ink">Fluticasone 50mcg</span>
                  <span className="text-[11px] font-semibold text-text-muted">Nasal Daily · 1 spray · 14 Days</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-md border-t border-surface-container mt-space-xs">
              <div className="flex items-center gap-space-xs w-full sm:w-auto">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-text-ink text-[13px] font-bold transition-colors shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  <span>{isEditing ? "Close Editor" : "Edit Transcript"}</span>
                </button>
              </div>
              <button 
                onClick={() => router.push("/consultation/review/draft")}
                className="w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-xl py-3 rounded-lg bg-primary-container hover:bg-accent-dark text-on-primary font-bold text-[14px] shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Continue to Prescription Draft</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-card-surface shadow-sm rounded-xl p-space-md flex flex-col gap-space-md border border-surface-container">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                <h4 className="font-bold text-[13px] text-text-ink">Voice Telemetry</h4>
              </div>
              <span className="text-[11px] font-bold bg-container-tint text-primary px-2 py-0.5 rounded-full">LLR 4.2</span>
            </div>
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between bg-surface-container-low p-space-sm rounded-lg border border-surface-container">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-text-muted">Acoustic Clarity</span>
                  <span className="font-bold text-[20px] text-text-ink">98.6%</span>
                </div>
                <span className="material-symbols-outlined text-clinical-success text-[24px]">verified</span>
              </div>
              <div className="flex items-center justify-between bg-surface-container-low p-space-sm rounded-lg border border-surface-container">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-text-muted">Audio Duration</span>
                  <span className="font-bold text-[20px] text-text-ink">14.8s</span>
                </div>
                <span className="material-symbols-outlined text-text-muted text-[24px]">timer</span>
              </div>
              <div className="flex items-center justify-between bg-surface-container-low p-space-sm rounded-lg border border-surface-container">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-text-muted">Entities Extracted</span>
                  <span className="font-bold text-[20px] text-text-ink">3 Rx</span>
                </div>
                <span className="material-symbols-outlined text-primary text-[24px]">dataset</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
