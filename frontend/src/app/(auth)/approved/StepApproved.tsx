"use client";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/api";

export default function ApprovedPage({ onNext }: { onNext: (step: string, data?: any) => void }) {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    setUser(getUser());
  }, []);

  const hasClinic = !!user?.clinic_id;

  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 md:px-margin-desktop py-space-xl overflow-hidden animate-glide-in opacity-0">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[300px] bg-gradient-to-b from-clinical-success/10 via-success-bg/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-xl flex flex-col items-center text-center gap-space-xl">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-28 h-28 rounded-full bg-success-bg animate-pulse"></div>
          <div className="absolute w-36 h-36 rounded-full bg-success-bg/40"></div>
          <div className="relative w-20 h-20 rounded-full bg-card-surface shadow-xl flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-clinical-success flex items-center justify-center text-card-surface shadow-md">
              <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>check</span>
            </div>
          </div>
        </div>

        <div className="space-y-space-xs">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-success-bg text-clinical-success text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
            Access Granted • Welcome Aboard
          </div>
          <h1 className="text-[36px] font-bold text-text-ink tracking-tight">You&apos;re approved!</h1>
          <p className="text-[16px] text-on-surface-variant max-w-md mx-auto leading-relaxed">
            {hasClinic 
              ? "Your request to join the clinic has been approved. Your clinical workspace is now active."
              : "Your identity has been verified by the Platform Administration. You may now proceed to set up your practice."}
          </p>
        </div>

        {hasClinic && (
          <div className="w-full bg-card-surface rounded-xl p-space-lg shadow-md flex flex-col gap-space-md">
            <div className="grid grid-cols-2 gap-space-md">
              {[
                { label: "Institution", value: user?.clinic_name || "Assigned Clinic" },
                { label: "Role Assigned", value: "Doctor — Staff Physician" },
                { label: "Verification", value: "Complete" },
                { label: "Status", value: "Active" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surface-container-low p-space-sm rounded-lg">
                  <span className="text-[11px] font-semibold text-text-muted uppercase block">{label}</span>
                  <span className="text-[14px] font-bold text-text-ink block mt-space-2xs">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-space-md w-full">
          <button type="button" onClick={() => onNext(hasClinic ? 'doctor/dashboard' : 'choose-path')} className="w-full sm:flex-1 inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-lg bg-primary hover:bg-accent-dark text-card-surface font-bold text-[18px] shadow-lg transition-all no-underline">
            <span>{hasClinic ? "Go to Dashboard" : "Set Up Practice"}</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
