"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getUser } from "@/lib/api";

export default function ReceptionAppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [form, setForm] = useState({ patient_id: "", doctor_id: "", appointment_time: "", reason_for_visit: "" });
  const [doctors, setDoctors] = useState<any[]>([]);
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    if (u.clinic_id) loadAll(u.clinic_id);
    else setLoading(false);
  }, []);

  const loadAll = async (clinicId: number) => {
    try {
      const [appts, pats, docs] = await Promise.all([
        api.appointments.list(clinicId),
        api.patients.list(clinicId),
        api.clinics.doctors(clinicId),
      ]);
      setAppointments(appts.appointments || []);
      setPatients(pats.patients || []);
      setDoctors(docs.doctors || []);
    } catch {}
    setLoading(false);
  };

  const bookAppointment = async () => {
    if (!form.patient_id || !form.appointment_time) { setToast("Patient and appointment time are required"); return; }
    setBooking(true);
    try {
      await api.appointments.create({
        patient_id: parseInt(form.patient_id),
        doctor_id: form.doctor_id ? parseInt(form.doctor_id) : null,
        clinic_id: user?.clinic_id,
        appointment_time: form.appointment_time,
        reason_for_visit: form.reason_for_visit,
        status: "scheduled",
      });
      setToast("Appointment booked ✓");
      setTimeout(() => setToast(""), 3000);
      setShowBook(false);
      setForm({ patient_id: "", doctor_id: "", appointment_time: "", reason_for_visit: "" });
      loadAll(user.clinic_id);
    } catch (e: any) { setToast("Error: " + e.message); }
    setBooking(false);
  };

  const statusBadge = (s: string) => ({
    scheduled: "bg-primary/10 text-primary",
    confirmed: "bg-success-bg text-clinical-success",
    completed: "bg-surface-container text-text-muted",
    cancelled: "bg-error-bg text-clinical-error",
  }[s] || "bg-surface-container text-text-muted");

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-surface border-b border-surface-container px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reception/dashboard" className="text-text-muted hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-[16px] font-bold text-text-ink">Appointments</h1>
        </div>
        <button onClick={() => setShowBook(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-bold hover:bg-accent-dark transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>Book Appointment
        </button>
      </header>

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-card-surface border border-outline-variant rounded-xl px-4 py-3 shadow-xl flex items-center gap-2 animate-glide-in">
          <span className="material-symbols-outlined text-clinical-success text-[18px]">check_circle</span>
          <span className="text-[13px] font-semibold text-text-ink">{toast}</span>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBook && (
        <>
          <div className="fixed inset-0 z-40 bg-text-ink/30 backdrop-blur-sm" onClick={() => setShowBook(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card-surface rounded-2xl shadow-2xl w-full max-w-md p-6 animate-glide-in opacity-0">
              <h3 className="text-[16px] font-bold text-text-ink mb-4">Book Appointment</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-text-ink mb-1 block">Patient *</label>
                  <select className="w-full bg-surface-container-lowest text-text-ink text-[13px] px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.patient_id} onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))}>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.uhid})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-text-ink mb-1 block">Doctor</label>
                  <select className="w-full bg-surface-container-lowest text-text-ink text-[13px] px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.doctor_id} onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))}>
                    <option value="">Any doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-text-ink mb-1 block">Date & Time *</label>
                  <input type="datetime-local" className="w-full bg-surface-container-lowest text-text-ink text-[13px] px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.appointment_time} onChange={e => setForm(f => ({ ...f, appointment_time: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-text-ink mb-1 block">Reason for Visit</label>
                  <input type="text" placeholder="e.g. Follow-up consultation"
                    className="w-full bg-surface-container-lowest text-text-ink text-[13px] px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.reason_for_visit} onChange={e => setForm(f => ({ ...f, reason_for_visit: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowBook(false)}
                  className="flex-1 py-2.5 rounded-lg border border-outline-variant text-text-muted font-bold text-[13px] hover:bg-surface-container transition-colors">Cancel</button>
                <button onClick={bookAppointment} disabled={booking}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white font-bold text-[13px] hover:bg-accent-dark transition-colors disabled:opacity-50">
                  {booking ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span></div>
        ) : appointments.length === 0 ? (
          <div className="bg-card-surface rounded-xl border border-surface-container p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline">calendar_month</span>
            <p className="text-text-muted mt-3 font-semibold">No appointments yet</p>
          </div>
        ) : (
          <div className="bg-card-surface rounded-xl border border-surface-container overflow-hidden shadow-sm">
            <div className="divide-y divide-surface-container">
              {appointments.map((appt: any) => (
                <div key={appt.id} className="px-5 py-4 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">event</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-ink text-[14px]">{appt.first_name} {appt.last_name}</p>
                    <p className="text-[12px] text-text-muted">
                      {new Date(appt.appointment_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      {appt.doctor_name && <> · Dr. {appt.doctor_name}</>}
                    </p>
                    {appt.reason_for_visit && <p className="text-[12px] text-on-surface-variant mt-0.5">{appt.reason_for_visit}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[11px] font-bold capitalize ${statusBadge(appt.status)}`}>{appt.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
