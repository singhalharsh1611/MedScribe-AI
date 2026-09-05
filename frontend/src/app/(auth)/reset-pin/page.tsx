"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPinPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pin = ["4", "8", "1", "9", "2", "6"];
  const confirmPin = ["4", "8", "1", "9", "2", "6"];

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/login");
    }, 800);
  };

  return (
    <div className="flex flex-col w-full py-space-xl px-4 md:px-margin-desktop items-center justify-center relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary-fixed-dim/30 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl flex flex-col items-center">
        <div className="w-full bg-card-surface rounded-xl shadow-xl p-space-lg md:p-space-2xl relative">
          <div className="flex items-center justify-between mb-space-lg">
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-container-tint text-primary text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[16px]">lock_reset</span>
              <span>RECOVERY PROTOCOL</span>
            </div>
          </div>

          <div className="mb-space-xl">
            <h1 className="text-[28px] font-bold text-text-ink tracking-tight mb-space-2xs">Reset your 6-digit PIN</h1>
            <p className="text-[14px] text-on-surface-variant">Verify your registered mobile number to configure a new clinical PIN.</p>
          </div>

          <form className="space-y-space-xl" onSubmit={handleReset}>
            {/* Mobile verification */}
            <section className="bg-surface-container-low p-space-md rounded-lg space-y-space-md">
              <div className="flex items-center justify-between">
                <label className="text-[15px] font-bold text-text-ink flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">stay_current_portrait</span>
                  1. Registered Mobile Number
                </label>
                <span className="inline-flex items-center gap-space-2xs bg-success-bg text-clinical-success text-[11px] font-semibold px-space-xs py-1 rounded">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Verified
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xs">
                <div className="md:col-span-2 relative">
                  <input className="w-full bg-card-surface text-text-ink text-[14px] rounded-md px-space-md py-space-sm shadow-sm cursor-not-allowed opacity-90" disabled type="text" value="+1 (555) 382-9401" readOnly />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-clinical-success text-[20px]">lock</span>
                </div>
                <button className="w-full bg-container-tint hover:bg-surface-variant text-text-ink text-[13px] font-semibold py-space-sm px-space-sm rounded-md transition-colors flex items-center justify-center gap-space-2xs cursor-pointer" type="button">
                  <span className="material-symbols-outlined text-[16px]">sms</span>
                  Resend OTP
                </button>
              </div>
            </section>

            {/* New PIN */}
            <section className="space-y-space-xs">
              <label className="text-[15px] font-bold text-text-ink flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">pin</span>
                2. Create New 6-digit PIN
              </label>
              <div className="flex items-center justify-between gap-2">
                {pin.map((val, idx) => (
                  <input key={idx} className="w-12 h-14 bg-surface-container-low text-center text-[22px] font-bold text-text-ink rounded-md focus:bg-card-surface focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all" type="password" maxLength={1} value={val} readOnly />
                ))}
              </div>
            </section>

            {/* Confirm PIN */}
            <section className="space-y-space-xs">
              <label className="text-[15px] font-bold text-text-ink flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">check_box</span>
                3. Confirm PIN
              </label>
              <div className="flex items-center justify-between gap-2">
                {confirmPin.map((val, idx) => (
                  <input key={idx} className="w-12 h-14 bg-surface-container-low text-center text-[22px] font-bold text-text-ink rounded-md focus:bg-card-surface focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all" type="password" maxLength={1} value={val} readOnly />
                ))}
              </div>
            </section>

            <div className="flex items-center gap-space-xs p-space-sm rounded-md bg-success-bg text-clinical-success">
              <span className="material-symbols-outlined text-[20px]">verified</span>
              <span className="text-[14px] font-semibold">New PIN matched and ready.</span>
            </div>

            <div className="space-y-space-md pt-space-xs">
              <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-accent-dark text-card-surface font-bold text-[18px] py-space-sm px-space-lg rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-space-xs cursor-pointer">
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                    <span>Saving Clinical Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Reset PIN</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
              <div className="flex justify-center">
                <Link href="/login" className="text-[14px] text-on-surface-variant hover:text-text-ink flex items-center gap-space-2xs transition-colors group no-underline">
                  <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                  Cancel and Return to Login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
