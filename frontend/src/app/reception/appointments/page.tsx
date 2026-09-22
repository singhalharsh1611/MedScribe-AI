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
  const [editingAppt, setEditingAppt] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [form, setForm] = useState({ patient_id: "", doctor_id: "", appointment_time: "", reason_for_visit: "" });
  const [doctors, setDoctors] = useState<any[]>([]);
  const [booking, setBooking] = useState(false);
  const [checkingInId, setCheckingInId] = useState<number | null>(null);
  const [vitalsAppt, setVitalsAppt] = useState<any>(null);
  const [vitals, setVitals] = useState({ bp: "", hr: "", temp: "", spo2: "", weight: "" });
  const [toast, setToast] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    if (u.clinic_id) loadAll(u.clinic_id);
    else setLoading(false);
  }, []);

  const loadAll = async (clinicId: number) => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const [appts, pats, docs] = await Promise.allSettled([
      api.appointments.list(clinicId, undefined, today),
      api.patients.list(clinicId),
      api.clinics.doctors(clinicId),
    ]);

    if (appts.status === "fulfilled") setAppointments(appts.value.appointments || []);
    if (pats.status === "fulfilled") setPatients(pats.value.patients || []);
    if (docs.status === "fulfilled") {
      setDoctors((docs.value.doctors || []).filter((d: any) => d.role === "doctor" || d.role === "admin"));
    }
    setLoading(false);
  };

  const bookAppointment = async () => {
    if (!form.patient_id || !form.appointment_time) { setToast("Patient and Appointment Time are required"); return; }
    if (!form.doctor_id) { setToast("Selecting a doctor is required"); return; }
    setBooking(true);
    try {
      await api.appointments.create({
        patient_id: parseInt(form.patient_id),
        doctor_id: parseInt(form.doctor_id),
        clinic_id: user?.clinic_id,
        appointment_time: form.appointment_time,
        reason_for_visit: form.reason_for_visit,
        status: "scheduled",
      });
      setToast("Appointment booked");
      setTimeout(() => setToast(""), 3000);
      setShowBook(false);
      setForm({ patient_id: "", doctor_id: "", appointment_time: "", reason_for_visit: "" });
      setPatientSearch("");
      loadAll(user.clinic_id);
    } catch (e: any) { setToast("Error: " + e.message); }
    setBooking(false);
  };

  const handleEdit = (appt: any) => {
    setForm({
      patient_id: appt.patient_id.toString(),
      doctor_id: appt.doctor_id ? appt.doctor_id.toString() : "",
      appointment_time: new Date(new Date(appt.appointment_time).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
      reason_for_visit: appt.reason_for_visit || ""
    });
    setPatientSearch(appt.first_name + " " + appt.last_name + " (" + appt.uhid + ")");
    setEditingAppt(appt);
    setShowBook(true);
  };

  const submitEdit = async () => {
    if (!form.patient_id || !form.appointment_time) { setToast("Patient and Appointment Time are required"); return; }
    if (!form.doctor_id) { setToast("Selecting a doctor is required"); return; }
    setBooking(true);
    try {
      await api.appointments.update(editingAppt.id, {
        doctor_id: parseInt(form.doctor_id),
        appointment_time: form.appointment_time,
        reason_for_visit: form.reason_for_visit
      });
      setToast("Appointment updated");
      setTimeout(() => setToast(""), 3000);
      setShowBook(false);
      setEditingAppt(null);
      setForm({ patient_id: "", doctor_id: "", appointment_time: "", reason_for_visit: "" });
      setPatientSearch("");
      loadAll(user.clinic_id);
    } catch (e: any) { setToast("Error: " + e.message); }
    setBooking(false);
  };

  const handleCheckIn = async () => {
    if (!vitalsAppt) return;
    const appt = vitalsAppt;
    setCheckingInId(appt.id);
    try {
      await api.queue.add({
        patient_id: appt.patient_id,
        clinic_id: user?.clinic_id,
        doctor_id: appt.doctor_id,
        complaint: appt.reason_for_visit || "General checkup",
        appointment_id: appt.id,
        vitals
      });
      await api.appointments.update(appt.id, { status: 'checked_in' });
      // Optimistic update
      setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'checked_in' } : a));
      setToast("Checked in successfully");
      setTimeout(() => setToast(""), 3000);
      loadAll(user.clinic_id);
    } catch (e: any) {
      setToast("Error: " + e.message);
    }
    setCheckingInId(null);
    setVitalsAppt(null);
    setVitals({ bp: "", hr: "", temp: "", spo2: "", weight: "" });
  };

  
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await api.appointments.delete(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      setToast("Appointment deleted");
      setTimeout(() => setToast(""), 3000);
    } catch (e: any) {
      setToast("Error: " + e.message);
    }
  };

  const statusBadge = (s: string) => ({
    scheduled: "bg-primary/10 text-primary",
    confirmed: "bg-success-bg text-clinical-success",
    checked_in: "bg-clinical-warning/10 text-clinical-warning",
    completed: "bg-surface-container text-text-muted",
    cancelled: "bg-error-bg text-clinical-error",
  }[s] || "bg-surface-container text-text-muted");

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
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

      
      {/* Vitals Check-in Modal */}
      {vitalsAppt && (
        <>
          <div className="fixed inset-0 z-40 bg-text-ink/30 backdrop-blur-sm" onClick={() => setVitalsAppt(null)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card-surface rounded-2xl shadow-2xl w-full max-w-md p-6 animate-glide-in opacity-0 overflow-visible">
              <div className="flex items-center gap-3 border-b border-surface-container pb-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">vital_signs</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-text-ink">Intake Vitals</h3>
                  <p className="text-[12px] text-text-muted">For {vitalsAppt.first_name} {vitalsAppt.last_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-[12px] font-semibold text-text-ink mb-1 block">Blood Pressure (mmHg)</label>
                  <input className="w-full bg-surface-container-lowest text-text-ink text-[13px] px-3 py-2 rounded-lg border border-surface-container focus:outline-none focus:border-primary"
                    placeholder="e.g. 120/80" value={vitals.bp} onChange={e => setVitals(v => ({...v, bp: e.target.value}))} />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-text-ink mb-1 block">Heart Rate (bpm)</label>
                  <input className="w-full bg-surface-container-lowest text-text-ink text-[13px] px-3 py-2 rounded-lg border border-surface-container focus:outline-none focus:border-primary"
                    placeholder="e.g. 72" type="number" value={vitals.hr} onChange={e => setVitals(v => ({...v, hr: e.target.value}))} />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-text-ink mb-1 block">Temperature (�F)</label>
                  <input className="w-full bg-surface-container-lowest text-text-ink text-[13px] px-3 py-2 rounded-lg border border-surface-container focus:outline-none focus:border-primary"
                    placeholder="e.g. 98.6" type="number" step="0.1" value={vitals.temp} onChange={e => setVitals(v => ({...v, temp: e.target.value}))} />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-text-ink mb-1 block">SpO2 (%)</label>
                  <input className="w-full bg-surface-container-lowest text-text-ink text-[13px] px-3 py-2 rounded-lg border border-surface-container focus:outline-none focus:border-primary"
                    placeholder="e.g. 98" type="number" value={vitals.spo2} onChange={e => setVitals(v => ({...v, spo2: e.target.value}))} />
                </div>
                <div className="col-span-2">
                  <label className="text-[12px] font-semibold text-text-ink mb-1 block">Weight (kg)</label>
                  <input className="w-full bg-surface-container-lowest text-text-ink text-[13px] px-3 py-2 rounded-lg border border-surface-container focus:outline-none focus:border-primary"
                    placeholder="e.g. 70" type="number" step="0.1" value={vitals.weight} onChange={e => setVitals(v => ({...v, weight: e.target.value}))} />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setVitalsAppt(null)}
                  className="flex-1 py-2.5 rounded-lg border border-outline-variant text-text-muted font-bold text-[13px] hover:bg-surface-container transition-colors">Skip / Cancel</button>
                <button onClick={handleCheckIn} disabled={checkingInId !== null}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white font-bold text-[13px] hover:bg-accent-dark transition-colors disabled:opacity-50">
                  {checkingInId ? "Adding..." : "Confirm & Queue"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Book Appointment Modal */}
      {showBook && (
        <>
          <div className="fixed inset-0 z-40 bg-text-ink/30 backdrop-blur-sm" onClick={() => { setShowBook(false); setEditingAppt(null); setForm({ patient_id: "", doctor_id: "", appointment_time: "", reason_for_visit: "" }); setPatientSearch(""); }}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card-surface rounded-2xl shadow-2xl w-full max-w-md p-6 animate-glide-in opacity-0 overflow-visible">
              <h3 className="text-[16px] font-bold text-text-ink mb-4">{editingAppt ? "Edit Appointment" : "Book Appointment"}</h3>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <label className="text-[12px] font-semibold text-text-ink mb-1 block">Patient *</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container-lowest text-text-ink text-[13px] px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Search patient name or UHID..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setForm(f => ({ ...f, patient_id: "" }));
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                  />
                  {showPatientDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-card-surface border border-outline-variant rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                      {patients.filter(p => `${p.first_name} ${p.last_name} ${p.uhid}`.toLowerCase().includes(patientSearch.toLowerCase())).slice(0, 50).map(p => (
                        <div
                          key={p.id}
                          className="px-3 py-2.5 text-[13px] text-text-ink hover:bg-surface-container cursor-pointer flex flex-col"
                          onClick={() => {
                            setPatientSearch(`${p.first_name} ${p.last_name} (${p.uhid})`);
                            setForm(f => ({ ...f, patient_id: p.id }));
                            setShowPatientDropdown(false);
                          }}
                        >
                          <span className="font-semibold">{p.first_name} {p.last_name}</span>
                          <span className="text-[11px] text-text-muted">{p.uhid}</span>
                        </div>
                      ))}
                      {patients.filter(p => `${p.first_name} ${p.last_name} ${p.uhid}`.toLowerCase().includes(patientSearch.toLowerCase())).length === 0 && (
                        <div className="px-3 py-4 text-center text-[12px] text-text-muted italic">No patients found.</div>
                      )}
                    </div>
                  )}
                </div>
                  <div>
                    <label className="text-[12px] font-semibold text-text-ink mb-1 block">Doctor *</label>
                    <select className="w-full bg-surface-container-lowest text-text-ink text-[13px] px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      value={form.doctor_id} onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))}>
                      <option value="">Select Doctor...</option>
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
                <button onClick={() => { setShowBook(false); setEditingAppt(null); setForm({ patient_id: "", doctor_id: "", appointment_time: "", reason_for_visit: "" }); setPatientSearch(""); }}
                  className="flex-1 py-2.5 rounded-lg border border-outline-variant text-text-muted font-bold text-[13px] hover:bg-surface-container transition-colors">Cancel</button>
                <button onClick={editingAppt ? submitEdit : bookAppointment} disabled={booking}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white font-bold text-[13px] hover:bg-accent-dark transition-colors disabled:opacity-50">
                  {booking ? "Saving..." : editingAppt ? "Save Changes" : "Confirm Booking"}
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
                      {new Date(appt.appointment_time).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                      {appt.doctor_name && <> - Dr. {appt.doctor_name}</>}
                    </p>
                    {appt.reason_for_visit && <p className="text-[12px] text-on-surface-variant mt-0.5">{appt.reason_for_visit}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold capitalize ${statusBadge(appt.status)}`}>{appt.status}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(appt)} className="px-3 py-1.5 rounded-md bg-surface-container-high hover:bg-surface-container text-text-ink text-[11px] font-bold shadow-sm transition-colors cursor-pointer">Edit</button>
                      <button onClick={() => handleDelete(appt.id)} className="px-3 py-1.5 rounded-md border border-outline-variant hover:border-error-bg hover:text-clinical-error text-text-muted text-[11px] font-bold transition-colors cursor-pointer">Delete</button>
                      {appt.status === "scheduled" ? (
                        <button 
                          onClick={() => setVitalsAppt(appt)}
                          disabled={checkingInId === appt.id || new Date().getTime() < new Date(appt.appointment_time).getTime() - 30 * 60000}
                          className="px-3 py-1.5 rounded-md bg-primary text-white text-[11px] font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                          {checkingInId === appt.id ? "Checking..." : "Check In"}
                        </button>
                      ) : (appt.status === "confirmed" || appt.status === "checked_in") ? (
                        <button disabled className="px-3 py-1.5 rounded-md bg-success-bg text-clinical-success text-[11px] font-bold shadow-sm opacity-80 flex items-center gap-1 cursor-not-allowed">
                          <span className="material-symbols-outlined text-[14px]">check</span> Checked In
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
