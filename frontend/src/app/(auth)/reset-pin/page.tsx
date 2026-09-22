
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, getUser } from "@/lib/api";

export default function ResetPinPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
  }, []);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, isConfirm: boolean) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;
    
    const targetArray = isConfirm ? [...confirmPin] : [...pin];
    const setTarget = isConfirm ? setConfirmPin : setPin;
    
    targetArray[index] = val;
    setTarget(targetArray);

    if (val && index < 5) {
      const prefix = isConfirm ? "confirm-pin-" : "pin-";
      document.getElementById(`${prefix}${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, isConfirm: boolean) => {
    if (e.key === "Backspace" && index > 0 && !(isConfirm ? confirmPin : pin)[index]) {
      const prefix = isConfirm ? "confirm-pin-" : "pin-";
      document.getElementById(`${prefix}${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const p1 = pin.join("");
    const p2 = confirmPin.join("");
    
    if (p1.length !== 6 || p2.length !== 6) { setError("PIN must be 6 digits."); return; }
    if (p1 !== p2) { setError("PINs do not match."); return; }

    setLoading(true);
    try {
      await api.auth.updatePin(user.id, { pin: p1 });
      const updatedUser = { ...user, pin_reset_required: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Role-based routing
      if (!updatedUser.clinic_id) router.replace("/register");
      else if (updatedUser.role === "admin") router.replace("/admin/overview");
      else if (updatedUser.role === "receptionist") router.replace("/reception/dashboard");
      else if (updatedUser.role === "compounder") router.replace("/reception/dashboard"); // Pharmacy disabled
      else router.replace("/doctor/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-margin-desktop py-space-xl min-h-screen flex flex-col items-center justify-center animate-glide-in opacity-0">
      <div className="w-full max-w-md flex flex-col gap-space-xl animate-glide-in opacity-0">
        <div className="w-full bg-card-surface rounded-xl shadow-md p-space-lg md:p-space-xl flex flex-col gap-space-lg relative overflow-hidden transition-all duration-500">
          <div className="flex flex-col gap-space-sm text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-warning-bg text-clinical-warning flex items-center justify-center mb-space-xs shadow-sm">
              <span className="material-symbols-outlined text-[32px]">lock_reset</span>
            </div>
            <h1 className="text-[28px] font-bold text-text-ink tracking-tight">Security Update</h1>
            <p className="text-[14px] text-on-surface-variant">Welcome {user.name}! You are using a temporary PIN. Please set a new permanent 6-digit PIN to continue.</p>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-error-bg border border-clinical-error/30 flex items-start gap-3 text-left">
              <span className="material-symbols-outlined text-clinical-error">error</span>
              <p className="text-[13px] font-semibold text-clinical-error mt-0.5">{error}</p>
            </div>
          )}

          <form className="space-y-space-lg" onSubmit={handleSubmit}>
            <div className="space-y-space-2xs text-left">
              <label className="text-[13px] font-semibold text-text-ink">New 6-Digit PIN</label>
              <div className="flex gap-2 justify-between">
                {pin.map((digit, i) => (
                  <input
                    key={`pin-${i}`}
                    id={`pin-${i}`}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(e, i, false)}
                    onKeyDown={(e) => handleKeyDown(e, i, false)}
                    className="w-12 h-14 bg-surface-container-lowest text-text-ink text-[24px] font-bold text-center rounded-lg border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-space-2xs text-left">
              <label className="text-[13px] font-semibold text-text-ink">Confirm New PIN</label>
              <div className="flex gap-2 justify-between">
                {confirmPin.map((digit, i) => (
                  <input
                    key={`cpin-${i}`}
                    id={`confirm-pin-${i}`}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(e, i, true)}
                    onKeyDown={(e) => handleKeyDown(e, i, true)}
                    className="w-12 h-14 bg-surface-container-lowest text-text-ink text-[24px] font-bold text-center rounded-lg border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                  />
                ))}
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 px-6 rounded-lg text-[15px] font-bold shadow-md hover:bg-accent-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed border border-primary-container group">
              {loading ? <span className="material-symbols-outlined animate-spin text-[20px]">sync</span> : <span>Save & Continue</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

