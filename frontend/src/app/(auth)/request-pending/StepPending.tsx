"use client";
import { useEffect, useState, useRef } from "react";
import { api, getUser } from "@/lib/api";

export default function RequestPendingPage({ onNext }: { onNext: (step: string, data?: any) => void }) {
    const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { onNext('login'); return; }
    setUser(u);
    checkStatus(u.id);
    // Poll every 5 seconds
    intervalRef.current = setInterval(() => checkStatus(u.id), 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const checkStatus = async (userId: number) => {
    try {
      const data = await api.auth.me(userId);
      const u = data.user;
      
      // If waiting for platform approval and just got it
      if (u.verification_status === "approved" && (!user || user.verification_status === "pending" || !u.clinic_id)) {
        // Wait, if they are already approved but waiting for clinic, we only proceed when clinic_id is present.
        if (user && user.verification_status === "approved") {
           // We are waiting for clinic approval
           if (u.clinic_id) {
             localStorage.setItem("user", JSON.stringify(u));
             clearInterval(intervalRef.current);
             onNext('approved');
           }
        } else {
           // We were waiting for platform approval
           localStorage.setItem("user", JSON.stringify(u));
           clearInterval(intervalRef.current);
           onNext('approved');
        }
      } else if (u.verification_status === "rejected") {
        clearInterval(intervalRef.current);
        setStatus("rejected");
        onNext('rejected');
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center text-center gap-6 animate-glide-in opacity-0">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-warning-bg animate-ping opacity-75"></div>
          <div className="relative w-20 h-20 rounded-full bg-warning-bg flex items-center justify-center">
            <span className="material-symbols-outlined text-clinical-warning text-[40px]">pending_actions</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Verification Status</span>
          <h1 className="text-[28px] font-bold text-text-ink mt-1">Request Pending</h1>
          <p className="text-[14px] text-on-surface-variant mt-2 leading-relaxed">
            {user?.verification_status === "approved" 
              ? "Your request to join the clinic has been submitted to the Clinic Administrator for review."
              : "Your account has been submitted for review by the SleekCare Platform Administration."}
            <br />You will be notified once verified.
          </p>
        </div>

        {user && (
          <div className="w-full bg-card-surface rounded-xl p-4 border border-surface-container text-left flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-clinical-warning animate-pulse"></span>
              <span className="text-[12px] font-semibold text-clinical-warning">Awaiting admin approval</span>
            </div>
            <p className="text-[13px] font-bold text-text-ink">{user.name}</p>
            <p className="text-[12px] text-text-muted">{user.phone}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full text-center">
          <p className="text-[12px] text-text-muted flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
            Checking status automatically...
          </p>
          <button onClick={() => user && checkStatus(user.id)}
            className="w-full py-3 rounded-xl bg-surface-container text-text-ink font-bold text-[14px] hover:bg-surface-container-high transition-all">
            Check Now
          </button>
          <button onClick={() => { localStorage.clear(); sessionStorage.clear(); onNext('login'); }}
            className="text-[13px] text-text-muted hover:text-primary transition-colors">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
