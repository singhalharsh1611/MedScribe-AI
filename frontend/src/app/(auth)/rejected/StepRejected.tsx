"use client";
import { useEffect, useState } from "react";
import { api, getUser } from "@/lib/api";

export default function RejectedPage({ onNext }: { onNext: (step: string, data?: any) => void }) {
  const [clinicName, setClinicName] = useState<string>("the clinic");
  const [verificationStatus, setVerificationStatus] = useState<string>("pending");

  useEffect(() => {
    const user = getUser();
    if (user) {
      setVerificationStatus(user.verification_status || "pending");
      if (user.verification_status !== "rejected") {
        api.joinRequests.myRequest(user.id).then(({ request }) => {
          if (request && request.clinic_name) {
            setClinicName(request.clinic_name);
          }
        }).catch(() => {});
      }
    }
  }, []);

  const isPlatformRejected = verificationStatus === "rejected";

  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 md:px-margin-desktop py-space-xl overflow-hidden">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[300px] bg-gradient-to-b from-clinical-error/10 via-error-bg/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-xl flex flex-col items-center text-center gap-space-xl">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-28 h-28 rounded-full bg-error-bg animate-pulse"></div>
          <div className="relative w-20 h-20 rounded-full bg-card-surface shadow-xl flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-clinical-error flex items-center justify-center text-card-surface shadow-md">
              <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>close</span>
            </div>
          </div>
        </div>

        <div className="space-y-space-xs">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-error-bg text-clinical-error text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-clinical-error"></span>
            Request Denied
          </div>
          <h1 className="text-[36px] font-bold text-text-ink tracking-tight">Request rejected</h1>
          <p className="text-[16px] text-on-surface-variant max-w-md mx-auto leading-relaxed">
            {isPlatformRejected ? (
              <>Your registration request for the <strong>MedScribe AI</strong> was not approved by the Platform Administration. Please contact support if you believe this is an error.</>
            ) : (
              <>Your join request for <strong>{clinicName}</strong> was not approved. This may be due to incomplete credentials or insufficient departmental authorization.</>
            )}
          </p>
        </div>

        <div className="w-full bg-card-surface rounded-xl p-space-lg shadow-md flex flex-col gap-space-md text-left">
          <p className="text-[14px] font-semibold text-text-ink">Possible reasons for rejection:</p>
          <div className="space-y-space-sm">
            {isPlatformRejected ? (
              ["State Medical License could not be verified", "NPI number is inactive or invalid", "Identity verification failed", "Your specialty requires manual onboarding"].map((r) => (
                <div key={r} className="flex items-center gap-space-xs text-[13px] text-on-surface-variant">
                  <span className="material-symbols-outlined text-clinical-error text-[18px] shrink-0">error</span>
                  <span>{r}</span>
                </div>
              ))
            ) : (
              ["NPI credentials could not be verified against the state registry", "You are not listed on the hospital privilege roster", "An administrator manually declined the request", "Duplicate affiliation request already pending"].map((r) => (
                <div key={r} className="flex items-center gap-space-xs text-[13px] text-on-surface-variant">
                  <span className="material-symbols-outlined text-clinical-error text-[18px] shrink-0">error</span>
                  <span>{r}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-space-md w-full">
          {!isPlatformRejected && (
            <button type="button" onClick={() => onNext('find_clinic')} className="w-full sm:flex-1 inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-lg bg-primary hover:bg-accent-dark text-card-surface font-bold text-[18px] shadow-lg transition-all no-underline">
              <span>Try Another Clinic</span>
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          )}
          <button type="button" onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            if (isPlatformRejected) {
              window.location.href = '/register';
            } else {
              onNext('login');
            }
          }} className="w-full sm:flex-1 inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-text-ink font-bold text-[15px] transition-all no-underline">
            <span>{isPlatformRejected ? 'Restart Registration' : 'Back to Login'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
