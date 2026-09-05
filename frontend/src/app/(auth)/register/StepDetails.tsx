"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function RegisterPage({ onNext }: { onNext: (step: string, data?: any) => void }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    specialty: "",
    npi: "",
  });

  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // If user is already registered and logged in, prevent returning to registration
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        onNext('choose-path');
        return;
      }
    }
    const saved = localStorage.getItem('registerData');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const specialties = [
    { id: "emergency_med", label: "Emergency Medicine (ER)", icon: "emergency" },
    { id: "cardiology", label: "Cardiovascular Specialists", icon: "cardiology" },
    { id: "orthopedics", label: "Orthopedics & Sports Med", icon: "orthopedics" },
    { id: "neurology", label: "Neurology & Neurosurgery", icon: "neurology" },
    { id: "family_med", label: "Family & Ambulatory Practice", icon: "family_star" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setToast("");

    // Form Validation
    if (formData.name.trim().length < 3) {
      setError("Please enter a valid name.");
      return;
    }
    
    // Indian Mobile Number Validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!formData.specialty) {
      setError("Please select a specialty.");
      return;
    }

    if (formData.npi.trim().length < 5) {
      setError("Please enter a valid License / NPI number.");
      return;
    }

    setIsChecking(true);
    try {
      const { exists } = await api.auth.checkPhone(cleanPhone);
      if (exists) {
        setIsRedirecting(true);
        setToast("An account with this mobile number already exists. Redirecting to login...");
        setTimeout(() => {
          onNext('login');
        }, 2500);
        return;
      }
    } catch (err: any) {
      setError("Failed to verify mobile number: " + err.message);
      setIsChecking(false);
      return;
    }
    setIsChecking(false);

    localStorage.setItem('registerData', JSON.stringify(formData));
    onNext('create-pin');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-margin-desktop py-space-xl min-h-screen flex items-center justify-center animate-glide-in opacity-0">
      <div className="w-full max-w-3xl flex flex-col gap-space-xl animate-glide-in opacity-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[24px]">clinical_notes</span>
            <span className="text-[15px] font-bold text-text-ink">Step 1 of 3: Practitioner Details</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="w-8 h-1.5 rounded-full bg-primary transition-all duration-300"></span>
            <span className="w-8 h-1.5 rounded-full bg-surface-container-highest transition-all duration-300"></span>
            <span className="w-8 h-1.5 rounded-full bg-surface-container-highest transition-all duration-300"></span>
          </div>
        </div>

        <div className="w-full bg-card-surface rounded-xl shadow-md p-space-lg md:p-space-2xl flex flex-col gap-space-xl relative transition-all duration-500">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
            <div className="flex flex-col gap-space-2xs">
              <h1 className="text-[28px] font-bold text-text-ink tracking-tight mt-space-2xs">Doctor Registration</h1>
              <p className="text-[14px] text-on-surface-variant">Enter your professional clinical credentials to create your SleekCare account.</p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-error-bg border border-clinical-error/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="material-symbols-outlined text-clinical-error">error</span>
              <p className="text-[13px] font-semibold text-clinical-error mt-0.5">{error}</p>
            </div>
          )}

          {toast && (
            <div className="p-4 rounded-lg bg-success-bg border border-clinical-success/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {isRedirecting ? (
                <span className="material-symbols-outlined text-clinical-success animate-spin">sync</span>
              ) : (
                <span className="material-symbols-outlined text-clinical-success">info</span>
              )}
              <p className="text-[13px] font-semibold text-clinical-success mt-0.5">{toast}</p>
            </div>
          )}

          <form className="flex flex-col gap-space-lg" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="flex flex-col gap-space-2xs">
              <label className="text-[13px] font-semibold text-text-ink">Legal Full Name & Title <span className="text-clinical-error">*</span></label>
              <div className="relative flex items-center group">
                <span className="material-symbols-outlined absolute left-space-md text-outline group-focus-within:text-primary transition-colors pointer-events-none text-[20px]">badge</span>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-container-lowest text-text-ink text-[14px] pl-11 pr-space-md py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
                  placeholder="e.g. Dr. Ramesh Kumar, MD"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-space-2xs">
              <label className="text-[13px] font-semibold text-text-ink">Practitioner Mobile Number <span className="text-clinical-error">*</span></label>
              <div className="relative flex items-center group">
                <span className="material-symbols-outlined absolute left-space-md text-outline group-focus-within:text-primary transition-colors pointer-events-none text-[20px]">smartphone</span>
                <span className="absolute left-11 text-[14px] font-medium text-text-muted select-none">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]*"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-surface-container-lowest text-text-ink text-[14px] pl-[72px] pr-space-md py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all tracking-wider"
                  placeholder="9876543210"
                />
              </div>
            </div>

            {/* Specialty */}
            <div className="flex flex-col gap-space-2xs relative">
              <label className="text-[13px] font-semibold text-text-ink">Clinical Specialty & Department <span className="text-clinical-error">*</span></label>
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-surface-container-lowest text-text-ink text-[14px] pl-11 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all flex items-center justify-between border border-surface-container-lowest hover:border-outline-variant"
                >
                  <span className="material-symbols-outlined absolute left-space-md text-outline group-focus-within:text-primary transition-colors pointer-events-none text-[20px]">stethoscope</span>
                  <span className={formData.specialty ? "text-text-ink font-medium" : "text-text-muted"}>
                    {formData.specialty ? specialties.find(s => s.id === formData.specialty)?.label : "Select your specialty..."}
                  </span>
                  <span className={`material-symbols-outlined text-outline text-[20px] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="max-h-[240px] overflow-y-auto p-2 flex flex-col gap-1">
                        {specialties.map((spec) => (
                          <button
                            key={spec.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, specialty: spec.id });
                              setIsDropdownOpen(false);
                            }}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left w-full ${formData.specialty === spec.id ? 'bg-primary-container text-on-primary-container font-semibold' : 'hover:bg-surface-container text-text-ink'}`}
                          >
                            <span className="material-symbols-outlined text-[18px] opacity-70">{spec.icon}</span>
                            <span className="text-[13px]">{spec.label}</span>
                            {formData.specialty === spec.id && (
                              <span className="material-symbols-outlined text-[16px] ml-auto">check</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* NPI */}
            <div className="flex flex-col gap-space-2xs">
              <label className="text-[13px] font-semibold text-text-ink">License # / NPI <span className="text-clinical-error">*</span></label>
              <div className="relative flex items-center group">
                <span className="material-symbols-outlined absolute left-space-md text-outline group-focus-within:text-primary transition-colors pointer-events-none text-[20px]">verified_user</span>
                <input
                  type="text"
                  maxLength={15}
                  required
                  value={formData.npi}
                  onChange={(e) => setFormData({ ...formData, npi: e.target.value })}
                  className="w-full bg-surface-container-lowest text-text-ink text-[14px] pl-11 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm tracking-wider font-semibold transition-all"
                  placeholder="e.g. MCI-123456"
                />
                {formData.npi.trim().length >= 5 && (
                  <span className="material-symbols-outlined absolute right-space-md text-clinical-success text-[20px] animate-in zoom-in">check</span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs">
              <button type="button" onClick={() => onNext('login')} className="text-[14px] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 no-underline">
                <span className="text-text-muted">Already have an account?</span>
                <span className="text-[15px] font-bold text-primary hover:underline">Login</span>
              </button>
              <button type="submit" disabled={isChecking || isRedirecting} className="w-full sm:w-auto px-space-xl py-3 rounded-lg bg-primary hover:bg-accent-dark text-on-primary font-bold text-[18px] shadow-sm flex items-center justify-center gap-space-xs transition-all active:scale-[0.98] group disabled:opacity-70 disabled:cursor-not-allowed">
                {isRedirecting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    <span>Redirecting...</span>
                  </>
                ) : isChecking ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                ) : (
                  <>
                    <span>Continue</span>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
