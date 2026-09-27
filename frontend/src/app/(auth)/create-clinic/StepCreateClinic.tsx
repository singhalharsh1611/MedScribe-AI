"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function CreateClinicPage({ onNext }: { onNext: (step: string, data?: any) => void }) {
  const router = useRouter();
  const [clinicName, setClinicName] = useState("");
  const [practiceType, setPracticeType] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState<any>({});

  useEffect(() => {
    const saved = localStorage.getItem('registerData');
    if (saved) { try { setUserData(JSON.parse(saved)); } catch(e) {} }
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const practiceTypesList = [
    { id: "multi", label: "Multispecialty Outpatient Clinic", icon: "local_hospital" },
    { id: "acute", label: "General Acute Hospital & Emergency", icon: "emergency" },
    { id: "cardio", label: "Cardiology & Cardiovascular Center", icon: "cardiology" },
    { id: "primary", label: "Family Medicine & Primary Care", icon: "family_star" },
    { id: "neuro", label: "Neurology & Neurosurgical Unit", icon: "neurology" },
    { id: "oncology", label: "Comprehensive Cancer Institute", icon: "oncology" },
  ];

  const selectedPracticeType = practiceTypesList.find((type) => type.id === practiceType);
  const locationPreview = [city.trim(), state.trim(), zip.trim()].filter(Boolean).join(", ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (clinicName.trim().length < 3) {
      setError("Please enter a valid clinic name.");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      setError("Please enter a valid 10-digit Indian mobile/phone number.");
      return;
    }

    if (!practiceType || !street || !city || !state || !zip || !email) {
      setError("Please fill out all the fields.");
      return;
    }

    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const data = await api.clinics.create({
        name: clinicName,
        type: practiceType,
        street, city, state, zip,
        phone, email,
        admin_id: user?.id || null,
      });

      // Update local user record with new clinic_id and admin role
      if (user && data.clinic) {
        const updatedUser = { ...user, clinic_id: data.clinic.id, role: 'admin' };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      // Clear registration data
      localStorage.removeItem('registerData');
      onNext('clinic-ready');
    } catch (err: any) {
      setError('Failed to create clinic: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-margin-desktop py-space-xl max-w-7xl mx-auto animate-glide-in opacity-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-lg">
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>STEP 03 OF 03</span>
          </div>
          <span className="text-[15px] font-bold text-text-ink tracking-tight">Practice Creation • Administrator Role</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
        <div className="lg:col-span-7 flex flex-col gap-space-lg animate-glide-in opacity-0">
          <div className="bg-card-surface rounded-xl p-space-lg md:p-space-xl shadow-sm relative overflow-hidden transition-all duration-500">
            <div className="relative z-10 flex flex-col gap-space-xs mb-space-lg">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Organizational Setup</span>
              <h1 className="text-[28px] font-bold text-text-ink tracking-tight">Create Clinic / Hospital</h1>
              <p className="text-[14px] text-on-surface-variant">Set up your practice profile to establish your organization workspace on MedScribe AI.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-error-bg border border-clinical-error/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="material-symbols-outlined text-clinical-error">error</span>
                <p className="text-[13px] font-semibold text-clinical-error mt-0.5">{error}</p>
              </div>
            )}

            <form className="relative z-10 flex flex-col gap-space-lg" onSubmit={handleSubmit}>
              {/* Clinic Name */}
              <div className="flex flex-col gap-space-2xs">
                <label className="text-[15px] font-bold text-text-ink">Clinic / Hospital Name</label>
                <div className="relative group">
                  <input className="w-full bg-surface-container-lowest text-text-ink text-[14px] rounded-lg px-space-md py-space-sm pl-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" required type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="e.g. Apollo Hospitals" />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">corporate_fare</span>
                </div>
              </div>

              {/* Practice Type */}
              <div className="flex flex-col gap-space-2xs relative">
                <label className="text-[15px] font-bold text-text-ink">Practice Type / Primary Specialization</label>
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-surface-container-lowest text-text-ink text-[14px] rounded-lg px-space-md py-space-sm pl-11 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all flex items-center justify-between border border-surface-container-lowest hover:border-outline-variant min-h-[44px]"
                  >
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors pointer-events-none">medical_services</span>
                    <span className={practiceType ? "text-text-ink font-medium" : "text-text-muted"}>
                      {practiceType ? practiceTypesList.find(t => t.id === practiceType)?.label : "Select Practice Type..."}
                    </span>
                    <span className={`material-symbols-outlined text-outline text-[20px] transition-transform duration-300 pointer-events-none ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                      <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-[240px] overflow-y-auto p-2 flex flex-col gap-1">
                          {practiceTypesList.map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => {
                                setPracticeType(type.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left w-full ${practiceType === type.id ? 'bg-primary-container text-on-primary-container font-semibold' : 'hover:bg-surface-container text-text-ink'}`}
                            >
                              <span className="material-symbols-outlined text-[18px] opacity-70">{type.icon}</span>
                              <span className="text-[13px]">{type.label}</span>
                              {practiceType === type.id && (
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

              {/* Address */}
              <div className="flex flex-col gap-space-2xs">
                <label className="text-[15px] font-bold text-text-ink">Street Address</label>
                <div className="relative group">
                  <input className="w-full bg-surface-container-lowest text-text-ink text-[14px] rounded-lg px-space-md py-space-sm pl-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" required type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street Address" />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">pin_drop</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                <div className="flex flex-col gap-space-2xs md:col-span-1">
                  <label className="text-[15px] font-bold text-text-ink">City</label>
                  <input className="w-full bg-surface-container-lowest text-text-ink text-[14px] rounded-lg px-space-md py-space-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" required type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" />
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <label className="text-[15px] font-bold text-text-ink">State</label>
                  <input className="w-full bg-surface-container-lowest text-text-ink text-[14px] rounded-lg px-space-md py-space-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" required type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. MH" />
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <label className="text-[15px] font-bold text-text-ink">Zip Code</label>
                  <input className="w-full bg-surface-container-lowest text-text-ink text-[14px] rounded-lg px-space-md py-space-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" required type="text" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="PIN Code" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                <div className="flex flex-col gap-space-2xs">
                  <label className="text-[15px] font-bold text-text-ink">Official Clinic Phone</label>
                  <div className="relative group">
                    <span className="absolute left-11 top-1/2 -translate-y-1/2 text-[14px] font-medium text-text-muted select-none">+91</span>
                    <input className="w-full bg-surface-container-lowest text-text-ink text-[14px] rounded-lg px-space-md py-space-sm pl-[72px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all tracking-wider" required maxLength={10} pattern="[0-9]*" type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="9876543210" />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">call</span>
                  </div>
                </div>
                <div className="flex flex-col gap-space-2xs">
                  <label className="text-[15px] font-bold text-text-ink">Clinic Email</label>
                  <div className="relative group">
                    <input className="w-full bg-surface-container-lowest text-text-ink text-[14px] rounded-lg px-space-md py-space-sm pl-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@hospital.com" />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                  </div>
                </div>
              </div>


              <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
                <button type="button" onClick={() => onNext('choose-path')} className="text-[14px] font-bold text-on-surface-variant hover:text-text-ink transition-colors px-4 py-2 hover:bg-surface-container-highest rounded-lg">Back</button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm px-space-xl py-space-md bg-primary hover:bg-accent-dark text-on-primary font-bold text-[16px] rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  ) : (
                    <>
                      <span>Provision Architecture</span>
                      <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">cloud_done</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="hidden lg:flex lg:col-span-5 flex-col gap-space-md animate-glide-in opacity-0">
          <div className="bg-surface-container-lowest border border-surface-container rounded-xl overflow-hidden shadow-sm sticky top-space-xl transition-all duration-500">
            <div className="h-40 bg-surface-container-highest relative">
              <img className="w-full h-full object-cover opacity-80" alt="Hospital Architecture" src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200&h=400" />
              <div className="absolute inset-0 bg-gradient-to-t from-text-ink/75 via-text-ink/20 to-transparent"></div>
              <div className="absolute bottom-space-md left-space-md right-space-md flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-card-surface uppercase tracking-wider bg-primary/80 px-2 py-0.5 rounded backdrop-blur-sm">Site Preview</span>
                  <p className="text-[18px] font-bold text-card-surface mt-1">{clinicName || "Clinic Name"}</p>
                </div>
                <span className="material-symbols-outlined text-card-surface text-[26px]">domain</span>
              </div>
            </div>
            <div className="p-space-lg flex flex-col gap-space-md">
              <div className="flex items-start justify-between gap-space-md pb-space-sm border-b border-surface-container">
                <span className="text-[13px] font-semibold text-text-muted uppercase shrink-0">Practice Type</span>
                <span className="text-[14px] font-bold text-text-ink text-right">
                  {selectedPracticeType?.label || "Select a practice type"}
                </span>
              </div>

              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[19px] mt-0.5">location_on</span>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold uppercase text-text-muted">Clinic Address</p>
                  <p className="text-[14px] font-bold text-text-ink break-words">
                    {street.trim() || "Street address"}
                  </p>
                  <p className="text-[13px] text-on-surface-variant">
                    {locationPreview || "City, State, PIN code"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                <div className="bg-surface-container-low p-space-sm rounded-lg flex items-start gap-space-xs min-w-0">
                  <span className="material-symbols-outlined text-primary text-[18px]">call</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase text-text-muted">Phone</p>
                    <p className="text-[13px] font-bold text-text-ink truncate">
                      {phone ? `+91 ${phone}` : "+91 Phone number"}
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-space-sm rounded-lg flex items-start gap-space-xs min-w-0">
                  <span className="material-symbols-outlined text-primary text-[18px]">mail</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase text-text-muted">Email</p>
                    <p className="text-[13px] font-bold text-text-ink truncate">
                      {email.trim() || "Clinic email"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-success-bg p-space-sm rounded-lg flex items-center gap-space-sm text-[12px] text-on-surface-variant">
                <span className="material-symbols-outlined text-clinical-success text-[18px]">admin_panel_settings</span>
                <span>
                  Administrator: <strong className="text-text-ink">{userData.name || "Current practitioner"}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
