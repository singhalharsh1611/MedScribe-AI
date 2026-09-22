
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getUser } from "@/lib/api";

export default function ReceptionRegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: "", last_name: "", dob: "", gender: "",
    phone: "", email: "", blood_group: "", complaint: "",
    address: "", emergency_contact_name: "", emergency_contact_relation: "", emergency_contact_phone: ""
  });

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, []);

  const set = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.first_name || !form.last_name || !form.phone) {
      setError("First name, last name and phone are required."); return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Enter a valid 10-digit mobile number."); return;
    }
    setLoading(true);
    try {
      const data = await api.patients.create({ ...form, clinic_id: user?.clinic_id });
      localStorage.setItem("newPatient", JSON.stringify(data.patient));
      router.push("/reception/register/confirmation");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-surface-container-lowest text-text-ink text-[14px] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-transparent focus:border-primary shadow-sm";

  return (
    <div className="min-h-screen bg-app-bg">

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-card-surface rounded-xl border border-surface-container shadow-sm p-6 lg:p-8 animate-glide-in opacity-0">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error-bg border border-clinical-error/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-clinical-error text-[20px]">error</span>
              <span className="text-[14px] text-clinical-error font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Section 1: Basic Information */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[14px] font-bold text-primary uppercase tracking-wider border-b border-surface-container pb-2">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-ink">First Name <span className="text-clinical-error">*</span></label>
                  <input className={inputClass} placeholder="e.g. Ramesh" value={form.first_name} onChange={e => set("first_name", e.target.value)} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-ink">Last Name <span className="text-clinical-error">*</span></label>
                  <input className={inputClass} placeholder="e.g. Sharma" value={form.last_name} onChange={e => set("last_name", e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-ink">Date of Birth</label>
                  <input type="date" className={inputClass} value={form.dob} onChange={e => set("dob", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-ink">Gender</label>
                  <select className={inputClass} value={form.gender} onChange={e => set("gender", e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[14px] font-bold text-primary uppercase tracking-wider border-b border-surface-container pb-2">Contact Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-ink">Mobile Number <span className="text-clinical-error">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-text-muted font-medium">+91</span>
                    <input
                      type="tel" maxLength={10} pattern="[0-9]*" required
                      className={`${inputClass} pl-12`}
                      placeholder="9876543210" value={form.phone}
                      onChange={e => set("phone", e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-ink">Email Address</label>
                  <input type="email" className={inputClass} placeholder="patient@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-text-ink">Residential Address</label>
                <textarea rows={2} className={inputClass} placeholder="Enter full address..." value={form.address} onChange={e => set("address", e.target.value)} />
              </div>
            </div>

            {/* Section 3: Emergency Contact */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[14px] font-bold text-primary uppercase tracking-wider border-b border-surface-container pb-2">Emergency Contact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-ink">Full Name</label>
                  <input className={inputClass} placeholder="e.g. Suresh Sharma" value={form.emergency_contact_name} onChange={e => set("emergency_contact_name", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-ink">Relationship</label>
                  <input className={inputClass} placeholder="e.g. Spouse, Father" value={form.emergency_contact_relation} onChange={e => set("emergency_contact_relation", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-ink">Phone Number</label>
                  <input type="tel" maxLength={10} pattern="[0-9]*" className={inputClass} placeholder="9876543210" value={form.emergency_contact_phone} onChange={e => set("emergency_contact_phone", e.target.value.replace(/\D/g, ""))} />
                </div>
              </div>
            </div>

            {/* Section 4: Medical Initial */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[14px] font-bold text-primary uppercase tracking-wider border-b border-surface-container pb-2">Initial Clinical Info</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-ink">Blood Group</label>
                  <select className={inputClass} value={form.blood_group} onChange={e => set("blood_group", e.target.value)}>
                    <option value="">Select blood group</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-text-ink">Chief Complaint</label>
                  <input className={inputClass} placeholder="e.g. Fever, Headache" value={form.complaint} onChange={e => set("complaint", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 mt-2 border-t border-surface-container">
              <Link href="/reception/dashboard" className="flex-1 py-3.5 rounded-xl border border-outline-variant text-text-muted font-bold text-[14px] text-center hover:bg-surface-container transition-colors">
                Cancel
              </Link>
              <button type="submit" disabled={loading}
                className="flex-1 py-3.5 rounded-xl bg-primary hover:bg-accent-dark text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 shadow-sm">
                {loading ? <span className="material-symbols-outlined animate-spin text-[20px]">sync</span> : <>
                  <span>Register Patient</span>
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

