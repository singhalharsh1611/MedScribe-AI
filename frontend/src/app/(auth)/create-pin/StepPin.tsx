"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

export default function CreatePinPage({ onNext }: { onNext: (step: string, data?: any) => void }) {
  const router = useRouter();
  
  const [pin1, setPin1] = useState(["", "", "", "", "", ""]);
  const [pin2, setPin2] = useState(["", "", "", "", "", ""]);
  
  const inputRefs1 = useRef<(HTMLInputElement | null)[]>([]);
  const inputRefs2 = useRef<(HTMLInputElement | null)[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<any>({});

  const specialtyLabels: Record<string, string> = {
    internal_cardio: "Internal Medicine / Cardiology",
    neuro_surg: "Neurological Surgery",
    emergency_med: "Emergency & Critical Trauma",
    pediatrics_gen: "General Pediatrics",
    oncology_med: "Medical Oncology / Hematology",
    orthopedic: "Orthopedic Surgery",
    family_med: "Family & Ambulatory Practice",
  };

  useEffect(() => {
    // If user is already registered and logged in, prevent returning to PIN creation
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        onNext('choose-path');
        return;
      }
    }
    const dataStr = localStorage.getItem('registerData');
    if (dataStr) setUserData(JSON.parse(dataStr));
  }, []);

  const handlePinChange = (pinType: 1 | 2, index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    if (pinType === 1) {
      const newPin = [...pin1];
      newPin[index] = value;
      setPin1(newPin);
      if (value && index < 5 && inputRefs1.current[index + 1]) {
        inputRefs1.current[index + 1]?.focus();
      } else if (value && index === 5) {
        inputRefs2.current[0]?.focus();
      }
    } else {
      const newPin = [...pin2];
      newPin[index] = value;
      setPin2(newPin);
      if (value && index < 5 && inputRefs2.current[index + 1]) {
        inputRefs2.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (pinType: 1 | 2, index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (pinType === 1 && !pin1[index] && index > 0) {
        inputRefs1.current[index - 1]?.focus();
      } else if (pinType === 2 && !pin2[index]) {
        if (index > 0) {
          inputRefs2.current[index - 1]?.focus();
        } else {
          inputRefs1.current[5]?.focus();
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const p1 = pin1.join("");
    const p2 = pin2.join("");

    if (p1.length !== 6 || p2.length !== 6) {
      setError("Please fill out both 6-digit PIN fields.");
      return;
    }
    
    if (p1 !== p2) {
      setError("PINs do not match. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.auth.register({
        name: userData.name || 'Unknown Practitioner',
        phone: userData.phone || '',
        specialty: userData.specialty || '',
        npi: userData.npi || '',
        pin: p1,
        email: userData.email || '',
      });
      localStorage.setItem('user', JSON.stringify(data.user));
      onNext('pending');
    } catch (err: any) {
      setError('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-margin-desktop py-space-xl animate-glide-in opacity-0">


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:col-span-4 flex-col gap-space-lg animate-glide-in opacity-0">
          <div className="bg-card-surface rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm bg-container-tint flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[32px]">person</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-[18px] font-bold text-text-ink truncate">{userData.name ? userData.name.split(',')[0] : 'Dr. Practitioner'}</h2>
                <p className="text-[12px] text-text-muted truncate">{userData.phone || "+91 -------"}</p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-xs">
              <div className="flex justify-between items-center text-on-surface-variant text-[12px]">
                  <span>Specialty</span>
                  <span className="text-[13px] font-semibold text-text-ink truncate max-w-[120px]">{specialtyLabels[userData.specialty] || userData.specialty || "General"}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant text-[12px]">
                <span>NPI</span>
                <span className="text-[13px] font-semibold text-text-ink">{userData.npi || "-------"}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-8 flex flex-col gap-space-md animate-glide-in opacity-0">
          <div className="bg-card-surface rounded-xl p-space-lg lg:p-space-2xl shadow-md relative overflow-hidden transition-all duration-500">
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-container-tint text-primary text-[13px] font-semibold">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Step 2 of 3: Security & PIN</span>
              </div>
            </div>

            <div className="max-w-2xl">
              <h1 className="text-[28px] font-bold text-text-ink tracking-tight">Create your 6-digit PIN</h1>
              <p className="text-[16px] text-on-surface-variant mt-space-xs leading-relaxed">
                This PIN works with your mobile number <span className="font-bold text-primary">({userData.phone || "+91 -------"})</span> for quick, passwordless login across clinical terminals.
              </p>
            </div>

            {error && (
              <div className="mt-6 p-4 rounded-lg bg-error-bg border border-clinical-error/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="material-symbols-outlined text-clinical-error">error</span>
                <p className="text-[13px] font-semibold text-clinical-error mt-0.5">{error}</p>
              </div>
            )}

            <form className="mt-space-xl flex flex-col gap-space-xl" onSubmit={handleSubmit}>
              {/* Enter PIN */}
              <div className="flex flex-col gap-space-sm">
                <label className="text-[15px] font-bold text-text-ink flex items-center gap-space-xs">
                  <span>Enter 6-digit PIN</span>
                  <span className="material-symbols-outlined text-primary text-[18px]">key</span>
                </label>
                <div className="flex gap-2 sm:gap-4 max-w-sm">
                  {pin1.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs1.current[i] = el; }}
                      type="password"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(1, i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(1, i, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-[24px] font-bold rounded-lg bg-surface-container-lowest border border-outline-variant shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-ink"
                    />
                  ))}
                </div>
              </div>

              {/* Confirm PIN */}
              <div className="flex flex-col gap-space-sm">
                <label className="text-[15px] font-bold text-text-ink flex items-center gap-space-xs">
                  <span>Confirm 6-digit PIN</span>
                  <span className="material-symbols-outlined text-clinical-success text-[18px]">verified</span>
                </label>
                <div className="flex gap-2 sm:gap-4 max-w-sm">
                  {pin2.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs2.current[i] = el; }}
                      type="password"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(2, i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(2, i, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-[24px] font-bold rounded-lg bg-surface-container-lowest border border-outline-variant shadow-sm dark:shadow-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-ink"
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-space-md pt-space-md">
                <div className="flex flex-col-reverse sm:flex-row items-center sm:justify-between gap-space-md">
                  <button type="button" onClick={() => onNext('details')} className="text-[14px] font-bold text-on-surface-variant hover:text-text-ink transition-colors px-4 py-2 hover:bg-surface-container-highest rounded-lg w-full sm:w-auto text-center">
                    Back to Details
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-space-xl py-space-md bg-primary hover:bg-accent-dark text-on-primary font-bold text-[18px] rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    ) : (
                      <>
                        <span>Create PIN</span>
                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-space-md rounded-lg bg-warning-bg flex items-start gap-space-sm text-clinical-warning">
                  <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">warning</span>
                  <div>
                    <span className="text-[15px] font-bold text-text-ink">Strict Security Requirement</span>
                    <p className="text-[14px] text-on-surface-variant mt-0.5">Never share your clinical PIN with hospital staff or patients.</p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
