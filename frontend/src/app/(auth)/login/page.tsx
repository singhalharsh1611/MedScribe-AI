"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { api, ApiError, clearUser, getUser, setUser } from "@/lib/api";

const homeForUser = (user: any) => {
  if (user.pin_reset_required) return "/reset-pin";
  if (user.verification_status === "pending" || user.verification_status === "rejected" || !user.clinic_id) return "/register";
  if (user.role === "admin") return "/admin/overview";
  if (user.role === "receptionist" || user.role === "compounder") return "/reception/dashboard";
  return "/doctor/dashboard";
};

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const storedUser = getUser();
    if (!storedUser?.id) {
      setCheckingSession(false);
      return;
    }

    let cancelled = false;
    api.auth.me(Number(storedUser.id))
      .then((response: any) => {
        if (cancelled) return;
        const currentUser = { ...storedUser, ...response.user };
        setUser(currentUser);
        router.replace(homeForUser(currentUser));
      })
      .catch((sessionError: unknown) => {
        if (cancelled) return;
        if (sessionError instanceof ApiError && [401, 403, 404].includes(sessionError.status)) {
          clearUser();
        }
        setCheckingSession(false);
      });

    return () => { cancelled = true; };
  }, [router]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(mobile.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit Indian mobile number."); return;
    }
    const pinString = pin.join("");
    if (pinString.length !== 6) {
      setError("Please enter your 6-digit PIN."); return;
    }
    setLoading(true);
    try {
      const data = await api.auth.login({ phone: mobile, pin: pinString });
      const user = data.user;
      setUser(user);
      router.replace(homeForUser(user));
    } catch (err: any) {
      setError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-text-muted">
          <span className="material-symbols-outlined animate-spin text-[22px] text-primary">sync</span>
          Restoring your session...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-margin-desktop py-space-xl min-h-screen flex flex-col items-center justify-center animate-glide-in opacity-0">
      <div className="w-full max-w-md flex flex-col gap-space-xl animate-glide-in opacity-0">
        <div className="w-full bg-card-surface rounded-xl shadow-md p-space-lg md:p-space-xl flex flex-col gap-space-lg relative overflow-hidden transition-all duration-500">
          <div className="flex flex-col gap-space-sm text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-container-tint text-primary flex items-center justify-center mb-space-xs shadow-sm">
              <span className="material-symbols-outlined text-[32px]">clinical_notes</span>
            </div>
            <h1 className="text-[28px] font-bold text-text-ink tracking-tight">User Login</h1>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-error-bg border border-clinical-error/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
              <span className="material-symbols-outlined text-clinical-error">error</span>
              <p className="text-[13px] font-semibold text-clinical-error mt-0.5">{error}</p>
            </div>
          )}

          <form className="space-y-space-lg" onSubmit={handleLogin}>
            <div className="space-y-space-2xs text-left">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-semibold text-text-ink">Registered Mobile Number</label>
              </div>
              <div className="relative flex items-center group">
                <span className="material-symbols-outlined absolute left-space-md text-outline group-focus-within:text-primary transition-colors pointer-events-none text-[20px]">smartphone</span>
                <span className="absolute left-11 text-[14px] font-medium text-text-muted select-none">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]*"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-surface-container-lowest text-text-ink text-[14px] pl-[72px] pr-space-md py-3 rounded-lg border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all font-semibold"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="space-y-space-sm text-left">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-semibold text-text-ink">6-Digit Access PIN</label>
              </div>
              <div className="flex gap-2 sm:gap-3 justify-between w-full">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 sm:w-12 sm:h-14 text-center text-[24px] font-bold rounded-lg bg-surface-container-lowest border border-outline-variant shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-ink"
                  />
                ))}
              </div>
            </div>

            <div className="pt-space-sm flex flex-col gap-space-md">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-lg bg-primary hover:bg-accent-dark text-on-primary font-bold text-[16px] shadow-sm flex items-center justify-center gap-space-xs transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">login</span>
                    <span>Authenticate & Enter</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-surface-container text-left">
            <div className="w-9 h-9 rounded-full bg-card-surface flex items-center justify-center text-primary shadow-sm shrink-0 border border-surface-container">
              <span className="material-symbols-outlined text-[18px]">enhanced_encryption</span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-text-ink truncate">Zero-Password Architecture</p>
              <p className="text-[12px] text-on-surface-variant truncate">Strict cryptographically authenticated sessions.</p>
            </div>
          </div>
        </div>
        
        <div className="text-center text-[14px] text-on-surface-variant pb-8">
          <span>Don&apos;t have an account?</span>
          <Link href="/register" className="ml-1 text-primary font-bold hover:underline transition-all">Get Started</Link>
        </div>
      </div>
    </div>
  );
}
