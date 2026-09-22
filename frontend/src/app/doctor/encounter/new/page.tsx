"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function NewEncounterPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [isDictating, setIsDictating] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("activeQueueEntry");
    if (data) {
      try { setPatient(JSON.parse(data)); } catch (e) {}
    } else {
      // If no patient active, return to queue or dashboard
      // router.push("/doctor/dashboard"); 
    }
  }, []);

  const handleCancel = () => {
    if (patient) {
      api.queue.updateStatus(patient.id, "waiting").catch(() => {});
    }
    router.push("/doctor/dashboard");
  };

  const startVoice = () => {
    if (!patient) return;

    setIsDictating(true);
    setTimeout(() => {
      router.push("/consultation/voice/listening");
    }, 800);
  };

  const vitals = patient?.vitals || {};

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-space-lg pb-10">
      <div className="bg-card-surface rounded-xl p-space-md shadow-sm flex flex-col xl:flex-row xl:items-start justify-between gap-space-md border border-surface-container relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
        <div className="pl-2 flex flex-col xl:flex-row xl:items-center justify-between w-full gap-4">
          <div className="flex items-start gap-space-md">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-[16px] shrink-0">
              {patient?.first_name?.charAt(0) || "P"}{patient?.last_name?.charAt(0) || ""}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <h2 className="text-[22px] font-bold text-text-ink truncate">{patient ? `${patient.first_name} ${patient.last_name}` : "Loading..."}</h2>
                <span className="px-space-xs py-1 rounded-md bg-container-tint text-[11px] text-primary-container font-semibold">{patient?.gender || "N/A"}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 mt-space-2xs text-text-muted text-[12px] font-semibold">
                <span className="flex items-center gap-1"><span className="text-outline">UHID:</span><span className="text-text-ink font-semibold">{patient?.uhid || "Not assigned"}</span></span>
                <span className="flex items-center gap-1"><span className="text-outline">Phone:</span><span className="text-text-ink">{patient?.phone || "N/A"}</span></span>
                <span className="flex items-center gap-1"><span className="text-outline">Age:</span><span className="text-text-ink">{patient?.age || "N/A"}</span></span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-space-xs pt-space-xs xl:pt-0">
            <button onClick={handleCancel} className="px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant text-[13px] font-semibold transition-all border border-surface-container cursor-pointer">
              Cancel Encounter
            </button>
            <button onClick={startVoice} disabled={isDictating || !patient} className="px-space-lg py-2.5 rounded-lg bg-primary-container hover:bg-accent-dark text-on-primary text-[15px] font-bold flex items-center gap-space-xs shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <span className={`material-symbols-outlined text-[20px] text-on-primary ${isDictating ? "animate-pulse" : ""}`}>{isDictating ? "sync" : "mic"}</span>
              <span>{isDictating ? "Connecting..." : "Start Voice Prescription"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <aside className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-card-surface rounded-xl p-space-md shadow-sm border border-surface-container">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary-container text-[20px]">folder_shared</span>
                <span className="text-[18px] font-bold text-text-ink">Patient Context</span>
              </div>
              <span className="text-[11px] font-semibold text-text-muted">Queue Data</span>
            </div>
            
            <div className="mt-space-md">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Chief Complaint</span>
              <p className="mt-1 text-[14px] text-text-ink font-semibold">
                {patient?.complaint || "Routine visit / No complaint specified"}
              </p>
            </div>
          </div>

          <div className="bg-card-surface rounded-xl p-space-md shadow-sm border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-text-ink">Intake Vitals</span>
              <span className="text-[11px] text-clinical-success bg-success-bg px-2 py-1 rounded-full font-semibold">Today</span>
            </div>
            <div className="grid grid-cols-2 gap-space-xs mt-space-sm">
              <div className="p-space-xs bg-surface-container-low rounded-lg flex flex-col border border-surface-container">
                <span className="text-[11px] text-text-muted font-semibold">Blood Pressure</span>
                <span className="text-[18px] text-text-ink font-bold mt-0.5">{vitals.bp || "--/--"}</span>
                <span className="text-[11px] text-text-muted font-semibold">mmHg</span>
              </div>
              <div className="p-space-xs bg-surface-container-low rounded-lg flex flex-col border border-surface-container">
                <span className="text-[11px] text-text-muted font-semibold">Heart Rate</span>
                <span className="text-[18px] text-text-ink font-bold mt-0.5">{vitals.hr || "--"}</span>
                <span className="text-[11px] text-text-muted font-semibold">bpm</span>
              </div>
              <div className="p-space-xs bg-surface-container-low rounded-lg flex flex-col border border-surface-container">
                <span className="text-[11px] text-text-muted font-semibold">Temperature</span>
                <span className="text-[18px] text-text-ink font-bold mt-0.5">{vitals.temp || "--"}</span>
                <span className="text-[11px] text-text-muted font-semibold">�F</span>
              </div>
              <div className="p-space-xs bg-surface-container-low rounded-lg flex flex-col border border-surface-container">
                <span className="text-[11px] text-text-muted font-semibold">SpO2 / Weight</span>
                <span className="text-[16px] text-text-ink font-bold mt-0.5">{vitals.spo2 ? vitals.spo2 + "%" : "--"} / {vitals.weight ? vitals.weight + "kg" : "--"}</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-8 bg-surface-container-lowest border-2 border-dashed border-surface-container-highest rounded-xl flex flex-col items-center justify-center p-space-2xl text-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-space-md">
            <span className="material-symbols-outlined text-[32px]">mic</span>
          </div>
          <h3 className="text-[22px] font-bold text-text-ink mb-space-xs">Ready for Voice Intake</h3>
          <p className="text-[14px] text-on-surface-variant max-w-md">
            Press the <strong className="text-text-ink">Start Voice Prescription</strong> button above to begin recording the encounter note.
          </p>
        </div>
      </div>
    </div>
  );
}
