"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VoiceListeningPage() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(14);
  const [isPaused, setIsPaused] = useState(false);
  const [decibels, setDecibels] = useState(69);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setSeconds((prev) => prev + 1);
        setDecibels(Math.floor(Math.random() * 7) + 65);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStop = () => {
    router.push("/consultation/voice/processing");
  };

  const handleCancel = () => {
    if (confirm("Discard this live audio capture and return to voice studio?")) {
      router.push("/doctor/encounter/new");
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto flex flex-col gap-space-lg">
      {/* Top Meta Bar */}
      <div className="w-full bg-card-surface rounded-xl shadow-sm px-space-md py-space-sm flex flex-wrap items-center justify-between gap-space-sm border border-surface-container">
        <div className="flex items-center gap-space-md">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-container-tint flex items-center justify-center text-primary-container text-[18px] font-bold shadow-sm">
              ML
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-clinical-success rounded-full ring-2 ring-card-surface"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-bold text-[16px] text-text-ink tracking-tight">Maya Lin Harrison</span>
              <span className="bg-primary-fixed text-on-primary-fixed text-[11px] font-bold px-2 py-0.5 rounded-full">Active Encounter</span>
            </div>
            <div className="flex items-center gap-space-xs text-text-muted text-[12px] mt-0.5">
              <span>32 yrs • Female</span>
              <span>•</span>
              <span className="font-mono">UHID-MH-2024-88412</span>
              <span>•</span>
              <span>Allergies: <strong className="text-clinical-error font-semibold">Penicillin</strong></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-space-xs">
          <div className="flex items-center gap-1.5 bg-error-bg px-space-sm py-1.5 rounded-full text-clinical-error shadow-sm">
            <span className={`w-2 h-2 rounded-full bg-clinical-error ${!isPaused ? "animate-ping" : ""}`}></span>
            <span className="text-[11px] font-bold uppercase tracking-wider">{isPaused ? "PAUSED" : "RECORDING"}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-surface-container-low px-space-sm py-1.5 rounded-full text-text-muted text-[12px] font-semibold">
            <span className="material-symbols-outlined text-[16px] text-primary">mic</span>
            <span>Station 101 Active</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="relative w-full bg-card-surface rounded-xl shadow-md p-space-xl lg:p-space-2xl flex flex-col items-center justify-between min-h-[540px] overflow-hidden border border-surface-container">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 bg-clinical-success/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full flex flex-col items-center text-center z-10 gap-space-xs">
          <div className="inline-flex items-center gap-2 bg-success-bg text-clinical-success px-space-sm py-1 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-[18px]">sensors</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">Clinical LLM Stream Connected</span>
          </div>
          <h1 className="text-[36px] font-bold text-text-ink tracking-tight mt-space-xs">
            {isPaused ? "Recording Paused" : "Listening..."}
          </h1>
          <p className="text-[16px] text-text-muted max-w-xl font-medium">
            Speak at a natural conversational pace. Medical entity parser is actively streaming.
          </p>
          
          <div className="flex items-center justify-center mt-space-md">
            <div className="flex items-baseline gap-2 bg-surface-container-low px-space-xl py-space-sm rounded-xl shadow-sm border border-surface-container">
              <span className={`material-symbols-outlined text-clinical-error text-[28px] ${isPaused ? "" : "animate-pulse"}`}>radio_button_checked</span>
              <span className="font-mono text-[48px] font-bold tracking-tight text-text-ink">{formatTime(seconds)}</span>
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider">Elapsed</span>
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="w-full flex flex-col items-center my-space-lg z-10">
          <div className="w-full max-w-3xl h-36 bg-surface-container-low rounded-xl px-space-md py-space-sm flex items-center justify-center gap-1.5 shadow-inner overflow-hidden relative border border-surface-container">
            <div className="absolute inset-x-0 top-1/2 h-px bg-surface-container-highest pointer-events-none"></div>
            {Array.from({ length: 30 }).map((_, idx) => {
              const h = isPaused ? 10 : Math.floor(Math.sin(idx + seconds) * 35 + 45);
              return (
                <div 
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-150 ${idx % 3 === 0 ? "bg-primary" : idx % 2 === 0 ? "bg-primary-container" : "bg-secondary-container"}`}
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>

          <div className="mt-space-sm flex flex-wrap items-center justify-center gap-space-sm">
            <div className="flex items-center gap-1.5 bg-success-bg text-clinical-success px-space-sm py-1 rounded-full text-[12px] font-bold shadow-sm">
              <span className="material-symbols-outlined text-[16px]">volume_up</span>
              <span>{isPaused ? "0 dB (Paused)" : `${decibels} dB`}</span>
              <span className="text-on-surface-variant text-[11px] font-semibold">· Optimal Voice Level</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container-low text-on-surface-variant px-space-sm py-1 rounded-full text-[12px] font-bold shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-clinical-success">check_circle</span>
              <span>Microphone picking up speech cleanly</span>
              <span className="text-text-muted text-[11px] font-semibold">· Floor: 18 dB</span>
            </div>
          </div>
        </div>

        {/* Live Transcript Stream */}
        <div className="w-full max-w-2xl bg-surface-container-lowest/80 rounded-xl p-space-md shadow-sm mb-space-md flex flex-col gap-1 z-10 border border-surface-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[16px]">text_fields</span>
              <span className="text-[11px] uppercase font-bold tracking-wider">Live Streaming Transcript</span>
            </div>
            <span className="text-[11px] font-bold text-clinical-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-clinical-success animate-ping"></span>
              Syncing SNOMED CT
            </span>
          </div>
          <p className="text-[14px] text-text-ink leading-relaxed font-medium">
            &quot;...Patient presents today reporting recurrent localized tension headaches over the past ten days, predominantly temporal. Denies visual aura or photophobia. Blood pressure recorded at triage was 128 over 82...&quot;
            <span className="inline-block w-2 h-4 bg-primary animate-pulse align-middle ml-1"></span>
          </p>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-wrap items-center justify-center gap-space-md pt-space-xs z-10">
          <button onClick={handleCancel} className="flex items-center gap-space-xs bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant px-space-lg py-3 rounded-lg transition-colors text-[13px] font-bold shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
            <span>Cancel Recording</span>
          </button>
          <button onClick={() => setIsPaused(!isPaused)} className="flex items-center gap-space-xs bg-card-surface hover:bg-surface-container text-text-ink px-space-lg py-3 rounded-lg transition-colors text-[13px] font-bold shadow-sm border border-surface-container cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">{isPaused ? "play_arrow" : "pause"}</span>
            <span>{isPaused ? "Resume Recording" : "Pause Recording"}</span>
          </button>
          <button onClick={handleStop} className="flex items-center gap-space-sm bg-primary hover:bg-accent-dark text-on-primary px-space-xl py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 group cursor-pointer">
            <span className="w-3.5 h-3.5 bg-clinical-error rounded-sm transition-transform group-hover:scale-110"></span>
            <span className="font-bold text-[14px] tracking-wide">Stop & Process Encounter</span>
            <span className="material-symbols-outlined text-[20px] ml-1 transition-transform group-hover:translate-x-1">arrow_forward</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="bg-card-surface rounded-xl p-space-md shadow-sm flex items-start gap-space-sm border border-surface-container">
          <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]">medication</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-text-ink">Prescription Pipeline</span>
            <span className="text-[12px] font-semibold text-text-muted">Drafting structured dosage and schedule in background</span>
          </div>
        </div>
        <div className="bg-card-surface rounded-xl p-space-md shadow-sm flex items-start gap-space-sm border border-surface-container">
          <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-clinical-success shrink-0">
            <span className="material-symbols-outlined text-[20px]">fact_check</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-text-ink">Entity Verification</span>
            <span className="text-[12px] font-semibold text-text-muted">98.6% clinical confidence score on current stream</span>
          </div>
        </div>
        <div className="bg-card-surface rounded-xl p-space-md shadow-sm flex items-start gap-space-sm border border-surface-container">
          <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[20px]">shield</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-text-ink">De-Identification Active</span>
            <span className="text-[12px] font-semibold text-text-muted">HIPAA Safe Harbor standard local tokenization</span>
          </div>
        </div>
      </div>
    </section>
  );
}
