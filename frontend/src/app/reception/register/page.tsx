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
      setError("Enter a valid 10-digit Indian mobile number."); return;
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

  const inputClass = "w-full bg-surface-container-lowest text-text-ink text-[14px] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-transparent focus:border-primary";

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-surface border-b border-surface-container px-6 py-4 flex items-center gap-4">
        <Link href="/reception/dashboard" className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <h1 className="text-[16px] font-bold text-text-ink">Register New Patient</h1>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-card-surface rounded-xl border border-surface-container shadow-sm p-6 animate-glide-in opacity-0">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-bg border border-clinical-error/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-clinical-error text-[18px]">error</span>
              <span className="text-[13px] text-clinical-error font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-ink">First Name <span className="text-clinical-error">*</span></label>
                <input className={inputClass} placeholder="e.g. Ramesh" value={form.first_name} onChange={e => set("first_name", e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-ink">Last Name <span className="text-clinical-error">*</span></label>
                <input className={inputClass} placeholder="e.g. Sharma" value={form.last_name} onChange={e => set("last_name", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-ink">Date of Birth</label>
                <input type="date" className={inputClass} value={form.dob} onChange={e => set("dob", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-ink">Gender</label>
                <select className={inputClass} value={form.gender} onChange={e => set("gender", e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-ink">Email</label>
                <input type="email" className={inputClass} placeholder="patient@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-ink">Blood Group</label>
                <select className={inputClass} value={form.blood_group} onChange={e => set("blood_group", e.target.value)}>
                  <option value="">Select blood group</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-text-ink">Chief Complaint</label>
              <textarea rows={3} className={inputClass} placeholder="Describe the patient's main concern..." value={form.complaint} onChange={e => set("complaint", e.target.value)} />
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/reception/dashboard" className="flex-1 py-3 rounded-xl border border-outline-variant text-text-muted font-bold text-[14px] text-center hover:bg-surface-container transition-colors">
                Cancel
              </Link>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-accent-dark text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60">
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
