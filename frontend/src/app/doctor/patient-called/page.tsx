"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function PatientCalledPage() {
  const router = useRouter();
  const { queue, updatePatientStatus } = useApp();
  const [loading, setLoading] = useState(false);

  // Get first in consultation or last called (for demo)
  const patient = queue.find((p) => p.status === "in_consultation") || queue[0];

  const handleStart = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/doctor/encounter/new");
    }, 600);
  };

  const handleReturn = () => {
    if (patient) updatePatientStatus(patient.id, "waiting");
    router.push("/doctor/dashboard");
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card-surface rounded-xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-clinical-success animate-pulse"></div>

        <div className="p-space-xl flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center text-clinical-success shadow-sm mb-space-md">
            <span className="material-symbols-outlined text-[40px] animate-pulse">campaign</span>
          </div>

          <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-container-tint text-primary text-[11px] font-semibold mb-space-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Broadcasted to Waiting Room Audio
          </div>

          <h1 className="text-[32px] font-bold text-text-ink tracking-tight mb-space-2xs">
            {patient?.name || "Patient"} is being called
          </h1>
          <p className="text-[16px] text-on-surface-variant max-w-md">
            Please wait for the patient to arrive at <span className="font-bold text-text-ink">Room 101</span>.
          </p>
        </div>

        <div className="px-space-xl pb-space-lg">
          <div className="bg-surface-container-low rounded-lg p-space-md flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-space-md min-w-0">
              <span className="px-3 py-1.5 rounded bg-surface-container-high text-[14px] font-bold text-text-ink shrink-0">
                #{patient?.token || "T-000"}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[16px] text-text-ink truncate">{patient?.name || "Marcus Chen"}</span>
                <span className="text-[12px] text-on-surface-variant truncate">
                  {patient?.complaint || "Routine Checkup"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-space-xl pb-space-xl flex flex-col sm:flex-row gap-space-md justify-center">
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-1 max-w-[240px] flex items-center justify-center gap-2 px-space-lg py-3.5 rounded-lg bg-primary hover:bg-accent-dark text-on-primary font-bold text-[16px] transition-all shadow-md cursor-pointer"
          >
            {loading ? (
              <><span className="material-symbols-outlined animate-spin">sync</span><span>Starting...</span></>
            ) : (
              <><span className="material-symbols-outlined">add_notes</span><span>Start Consultation</span></>
            )}
          </button>
          
          <button
            onClick={handleReturn}
            disabled={loading}
            className="flex-1 max-w-[240px] flex items-center justify-center gap-2 px-space-lg py-3.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-ink font-bold text-[16px] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">undo</span>
            <span>Return to Queue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
