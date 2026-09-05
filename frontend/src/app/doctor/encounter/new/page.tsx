"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NewEncounterPage() {
  const router = useRouter();
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isDictating, setIsDictating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (total: number) => {
    const mins = Math.floor(total / 60).toString().padStart(2, "0");
    const secs = (total % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleCancel = () => {
    if (confirm("Discard this new encounter session for Maya Lin Harrison?")) {
      router.push("/doctor/dashboard");
    }
  };

  const startVoice = () => {
    setIsDictating(true);
    setTimeout(() => {
      router.push("/consultation/voice/listening");
    }, 500);
  };

  return (
    <div className="flex flex-col w-full pb-24 gap-space-md">
      {/* Breadcrumb & Encounter Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-md pb-space-sm">
        <div className="flex items-center gap-space-xs text-text-muted text-[11px] font-semibold uppercase tracking-wider">
          <Link href="/doctor/dashboard" className="hover:text-primary no-underline text-inherit">Doctor Workspace</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Consultations</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary-container font-bold">New Encounter</span>
        </div>
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-success-bg text-clinical-success shadow-sm">
            <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
            <span className="text-[11px] font-semibold">Room 101 Mic Standby</span>
          </div>
          <span className="text-outline-variant">•</span>
          <div className="flex items-center gap-space-2xs text-text-muted">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span className="text-[11px] font-mono font-semibold">Encounter Timer: {formatTime(timerSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Patient Identity & Master Action Bar */}
      <div className="bg-card-surface rounded-xl p-space-md shadow-sm border border-surface-container">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          {/* Left: Patient Avatar & Key Telemetry */}
          <div className="flex items-start sm:items-center gap-space-md min-w-0">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-xl bg-container-tint flex items-center justify-center text-primary-container text-[22px] font-bold shadow-inner">
                ML
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-clinical-success border-2 border-card-surface"></span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex flex-wrap items-center gap-space-xs">
                <h2 className="text-[22px] font-bold text-text-ink truncate">Maya Lin Harrison</h2>
                <span className="px-space-xs py-1 rounded-md bg-container-tint text-[11px] text-primary-container font-semibold">32 yrs • Female</span>
                <span className="px-space-xs py-1 rounded-md bg-warning-bg text-[11px] text-clinical-warning font-semibold">Penicillin Allergy</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 mt-space-2xs text-text-muted text-[12px] font-semibold">
                <span className="flex items-center gap-1"><span className="text-outline">UHID:</span><span className="text-text-ink font-semibold">MH-2024-88412</span></span>
                <span className="flex items-center gap-1"><span className="text-outline">DOB:</span><span className="text-text-ink">Aug 14, 1991</span></span>
                <span className="flex items-center gap-1"><span className="text-outline">Phone:</span><span className="text-text-ink">+1 (555) 849-2041</span></span>
              </div>
            </div>
          </div>

          {/* Right: Encounter Initiator Actions */}
          <div className="flex flex-wrap items-center gap-space-xs pt-space-xs xl:pt-0">
            <button onClick={handleCancel} className="px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant text-[13px] font-semibold transition-all border border-surface-container cursor-pointer">
              Cancel Encounter
            </button>
            <Link href="/doctor/encounter/active" className="px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-container-tint text-text-ink text-[13px] font-semibold flex items-center gap-space-xs transition-all shadow-sm border border-surface-container no-underline">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Add Medication Manually
            </Link>
            <button onClick={startVoice} disabled={isDictating} className="px-space-lg py-2.5 rounded-lg bg-primary-container hover:bg-accent-dark text-on-primary text-[15px] font-bold flex items-center gap-space-xs shadow-md transition-all active:scale-[0.98] cursor-pointer">
              <span className={`material-symbols-outlined text-[20px] text-on-primary ${isDictating ? "animate-pulse" : ""}`}>{isDictating ? "sync" : "mic"}</span>
              <span>{isDictating ? "Connecting..." : "Start Voice Prescription"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Sidebar: Patient Chronic Profile */}
        <aside className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-card-surface rounded-xl p-space-md shadow-sm border border-surface-container">
            <div className="flex items-center justify-between pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary-container text-[20px]">folder_shared</span>
                <span className="text-[18px] font-bold text-text-ink">Patient Context</span>
              </div>
              <span className="text-[11px] font-semibold text-text-muted">Chart View</span>
            </div>
            <p className="text-[12px] text-text-muted mt-1 font-semibold">
              Baseline physiological data and recurring clinical alerts synced from Primary Care records.
            </p>

            <div className="mt-space-md p-space-sm rounded-lg bg-error-bg flex items-start gap-space-xs border border-clinical-error/20">
              <span className="material-symbols-outlined text-clinical-error text-[20px] mt-0.5">warning</span>
              <div className="flex flex-col">
                <span className="text-[13px] text-clinical-error font-bold uppercase">Critical Allergy Alert</span>
                <span className="text-[14px] text-text-ink font-semibold mt-0.5">Penicillin / Beta-lactams</span>
                <span className="text-[12px] text-text-muted font-semibold">Causes severe angioedema and anaphylactoid hives. Flagged July 2021.</span>
              </div>
            </div>

            <div className="mt-space-md">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Chronic Diagnostics</span>
              <div className="mt-space-xs flex flex-col gap-space-xs">
                <div className="p-space-xs rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2 h-2 rounded-full bg-clinical-warning"></span>
                    <span className="text-[14px] text-text-ink font-semibold">Mild Persistent Asthma</span>
                  </div>
                  <span className="text-[11px] text-text-muted font-mono font-bold">J45.20</span>
                </div>
                <div className="p-space-xs rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2 h-2 rounded-full bg-accent-light"></span>
                    <span className="text-[14px] text-text-ink font-semibold">Allergic Rhinitis</span>
                  </div>
                  <span className="text-[11px] text-text-muted font-mono font-bold">J30.9</span>
                </div>
              </div>
            </div>

            <div className="mt-space-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Active Rx Regimen</span>
                <span className="text-[11px] text-primary-container font-semibold">2 Active</span>
              </div>
              <div className="mt-space-xs flex flex-col gap-space-xs">
                <div className="p-space-xs rounded-lg bg-surface-container-low flex flex-col border border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-text-ink font-semibold">Cetirizine HCl</span>
                    <span className="px-1 py-0.5 rounded bg-container-tint text-[11px] text-primary-container font-semibold">Daily</span>
                  </div>
                  <span className="text-[12px] text-text-muted font-semibold">10 mg Oral Tablet • 1 tab at bedtime</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card-surface rounded-xl p-space-md shadow-sm border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-text-ink">Baseline Vitals</span>
              <span className="text-[11px] text-clinical-success bg-success-bg px-2 py-1 rounded-full font-semibold">3 Months Ago</span>
            </div>
            <div className="grid grid-cols-2 gap-space-xs mt-space-sm">
              <div className="p-space-xs bg-surface-container-low rounded-lg flex flex-col border border-surface-container">
                <span className="text-[11px] text-text-muted font-semibold">Blood Pressure</span>
                <span className="text-[18px] text-text-ink font-bold mt-0.5">118/74</span>
                <span className="text-[11px] text-clinical-success font-semibold">mmHg (Optimal)</span>
              </div>
              <div className="p-space-xs bg-surface-container-low rounded-lg flex flex-col border border-surface-container">
                <span className="text-[11px] text-text-muted font-semibold">Resting HR</span>
                <span className="text-[18px] text-text-ink font-bold mt-0.5">72</span>
                <span className="text-[11px] text-text-muted font-semibold">bpm regular</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right side blank canvas for new encounter */}
        <div className="lg:col-span-8 bg-surface-container-lowest border-2 border-dashed border-surface-container-highest rounded-xl flex flex-col items-center justify-center p-space-2xl text-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-space-md">
            <span className="material-symbols-outlined text-[32px]">mic</span>
          </div>
          <h3 className="text-[22px] font-bold text-text-ink mb-space-xs">Ready for Voice Intake</h3>
          <p className="text-[14px] text-on-surface-variant max-w-md">
            Press the <strong className="text-text-ink">Start Voice Prescription</strong> button above or say <strong className="text-primary font-mono">&quot;SleekCare, start charting&quot;</strong> to begin recording the encounter note.
          </p>
        </div>
      </div>
    </div>
  );
}
