"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["Live Dictation", "Transcript Review", "AI Processing", "Extraction", "Draft Order"];

export default function VoiceProcessingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(58);
  const [patient, setPatient] = useState<any>(null);
  const [audioSeconds, setAudioSeconds] = useState<number | null>(null);

  const patientName = patient ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() : "Patient";
  const patientInitials = `${patient?.first_name?.charAt(0) || "P"}${patient?.last_name?.charAt(0) || ""}`;
  const patientAge = patient?.age || null;
  const durationLabel = audioSeconds === null ? "Audio ready" : `${audioSeconds.toFixed(1)}s · Audio captured`;

  useEffect(() => {
    const activeEntry = localStorage.getItem("activeQueueEntry");
    if (activeEntry) {
      try {
        const entry = JSON.parse(activeEntry);
        const age = entry.age || (entry.dob ? Math.floor((Date.now() - new Date(entry.dob).getTime()) / 31557600000) : null);
        setPatient({ ...entry, age });
      } catch (e) {}
    }

    const transcription = localStorage.getItem("transcriptionResult");
    if (transcription) {
      try { setAudioSeconds(JSON.parse(transcription).audioSeconds || null); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          setTimeout(() => router.push("/consultation/extraction"), 600);
          return 100;
        }
        return prev + 6;
      });
    }, 350);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <section className="w-full max-w-6xl mx-auto flex flex-col gap-6 min-h-[calc(100vh-6rem)] pb-4 pt-4 lg:flex-row">
      <div className="hidden w-56 shrink-0 flex-col gap-5 pt-2 lg:flex">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-muted ml-1">Encounter Workflow</h3>
        <div className="flex flex-col gap-0 relative">
          <div className="absolute left-3.5 top-2 bottom-6 w-px bg-surface-container-highest z-0"></div>
          {STEPS.map((step, idx) => {
            const isActive = idx === 2;
            const isCompleted = idx < 2;

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

      <div className="flex-1 flex flex-col gap-space-lg pb-10 lg:overflow-y-auto lg:pr-2">
      <div className="flex items-center gap-space-xs text-text-muted text-[11px] font-semibold uppercase tracking-wider">
        <span>Doctor Workspace</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span>Consultations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface">{patientName}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">Voice Prescription</span>
        <span className="material-symbols-outlined text-[14px] text-primary">chevron_right</span>
        <span className="bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
          Processing ({progress}%)
        </span>
      </div>

      <div className="bg-card-surface rounded-xl shadow-sm p-space-md flex flex-wrap items-center justify-between gap-space-md border border-surface-container">
        <div className="flex items-center gap-space-md">
          <div className="relative w-12 h-12 rounded-xl bg-container-tint flex items-center justify-center text-primary-container text-[18px] font-bold shadow-sm">
            {patientInitials}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-clinical-success rounded-full ring-2 ring-card-surface"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <h2 className="font-bold text-[18px] text-text-ink">{patientName}</h2>
              <span className="bg-surface-container-high text-on-surface-variant text-[11px] font-semibold px-2 py-0.5 rounded">
                {patientAge ? `${patientAge} yrs` : "Age N/A"} · {patient?.gender || "Gender N/A"}
              </span>
              <span className="bg-container-tint text-primary text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                {patient?.uhid || "UHID N/A"}
              </span>
            </div>
            <div className="flex items-center gap-space-md mt-1 text-text-muted text-[12px] font-semibold">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-clinical-warning">warning</span>
                {patient?.allergies || "No documented allergies"}
              </span>
              <span className="h-3 w-px bg-surface-container-highest"></span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-clinical-success">check_circle</span>
                e-Prescribe Verified · RxHub 4.8
              </span>
              <span className="h-3 w-px bg-surface-container-highest"></span>
                <span>{patient?.room || "Room 101"} · {patient?.department || "General Medicine"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-full border border-surface-container">
          <div className="flex items-center gap-1">
            <span className="w-1 bg-primary-container rounded-full h-3 animate-pulse"></span>
            <span className="w-1 bg-primary-container rounded-full h-5 animate-pulse"></span>
            <span className="w-1 bg-primary-container rounded-full h-2 animate-pulse"></span>
            <span className="w-1 bg-primary-container rounded-full h-4 animate-pulse"></span>
          </div>
          
        </div>
      </div>

      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-4xl bg-card-surface rounded-xl shadow-xl p-space-2xl relative overflow-hidden flex flex-col items-center text-center border border-surface-container">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-space-xl">
            <div className="absolute inset-0 rounded-full bg-secondary-fixed/30"></div>
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-primary/40 animate-spin" style={{ animationDuration: "12s" }}></div>
            <div className="absolute inset-5 rounded-full bg-surface-container-high/60 animate-ping" style={{ animationDuration: "3s" }}></div>
            <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-primary-container to-accent-dark shadow-lg flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[42px] animate-pulse">model_training</span>
            </div>
          </div>
          
          <h1 className="text-[32px] font-bold text-text-ink tracking-tight mt-space-md">
            Processing Encounter Data
          </h1>
          <p className="text-[16px] text-text-muted font-medium mt-space-xs max-w-lg">
            The SleekCare Clinical LLM is structuring your audio into formal EHR notes, extracting prescriptions, and checking drug interactions.
          </p>

          <div className="w-full max-w-xl mt-space-xl">
            <div className="flex items-center justify-between mb-space-2xs text-[14px] font-semibold">
              <span className="text-primary">Structuring Clinical Entities...</span>
              <span className="text-text-ink">{progress}%</span>
            </div>
            <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-primary to-tertiary-fixed transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
