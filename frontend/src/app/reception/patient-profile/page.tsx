
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api, getUser } from "@/lib/api";

export default function PatientProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminWorkspace = pathname.startsWith("/admin");
  const directoryHref = isAdminWorkspace ? "/admin/patients" : "/reception/directory";
  const prescriptionHref = isAdminWorkspace ? "/admin/prescription" : "/reception/prescription";
  const [activeTab, setActiveTab] = useState("Overview");
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const patientId = localStorage.getItem("activePatientId");
    if (patientId) {
      api.patients.get(parseInt(patientId)).then(data => {
        setPatient(data.patient);
        setAppointments(data.appointments || []);
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      router.push(directoryHref);
    }
  }, [directoryHref, router]);

  if (loading) {
    return <div className="p-20 text-center"><span className="material-symbols-outlined animate-spin text-[40px] text-primary">sync</span></div>;
  }
  if (!patient) return <div className="p-20 text-center">Patient not found</div>;

  const tabs = ["Overview", "Appointments", "Billing"];

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={directoryHref} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-text-ink hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-bold text-text-ink tracking-tight">{patient.first_name} {patient.last_name}</h1>
            </div>
            <div className="flex items-center gap-2 text-[13px] font-semibold text-text-muted mt-1">
              <span className="bg-container-tint text-primary px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider">UHID: {patient.uhid}</span>
              <span className="w-1 h-1 rounded-full bg-outline"></span>
              <span>{patient.gender}</span>
              <span className="w-1 h-1 rounded-full bg-outline"></span>
              <span>DOB: {patient.dob ? new Date(patient.dob).toLocaleDateString() : "N/A"}</span>
              <span className="w-1 h-1 rounded-full bg-outline"></span>
              <span className="text-clinical-error font-bold">{patient.blood_group || "Blood Group N/A"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/reception/appointments" className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary hover:bg-accent-dark text-on-primary text-[15px] font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span>Book Appointment</span>
          </Link>
        </div>
      </header>

      <div className="bg-surface-container-low p-1.5 rounded-xl flex items-center justify-start overflow-x-auto gap-1 border border-surface-container hide-scrollbar">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-lg text-[15px] font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTab === tab ? "bg-card-surface text-text-ink shadow-sm" : "text-on-surface-variant hover:text-text-ink hover:bg-surface-container-high"}`}>
            {tab === "Overview" && <span className="material-symbols-outlined text-primary text-[18px]">space_dashboard</span>}
            {tab === "Appointments" && <span className="material-symbols-outlined text-[18px]">calendar_month</span>}
            {tab === "Billing" && <span className="material-symbols-outlined text-[18px]">receipt_long</span>}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card-surface rounded-xl p-6 shadow-sm border border-surface-container space-y-4">
            <h3 className="font-bold text-[16px] text-text-ink border-b border-surface-container pb-2">Contact Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-text-muted">call</span>
                <span className="text-[14px] font-semibold text-text-ink">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-text-muted">mail</span>
                <span className="text-[14px] font-semibold text-text-ink">{patient.email || "No email provided"}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-text-muted mt-0.5">home</span>
                <span className="text-[14px] font-semibold text-text-ink">{patient.address || "No address provided"}</span>
              </div>
            </div>
          </div>

          <div className="bg-card-surface rounded-xl p-6 shadow-sm border border-surface-container space-y-4">
            <h3 className="font-bold text-[16px] text-text-ink border-b border-surface-container pb-2">Emergency Contact</h3>
            {patient.emergency_contact_name ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-text-ink">{patient.emergency_contact_name}</span>
                  <span className="bg-surface-container px-2 py-1 rounded text-[11px] font-semibold text-text-ink">{patient.emergency_contact_relation}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-text-muted">call</span>
                  <span className="text-[14px] font-semibold text-text-ink">{patient.emergency_contact_phone}</span>
                </div>
              </div>
            ) : (
              <p className="text-[14px] text-text-muted italic">No emergency contact provided.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "Appointments" && (
        <div className="bg-card-surface rounded-xl p-6 shadow-sm border border-surface-container">
          <h3 className="font-bold text-[16px] text-text-ink mb-4">Recent Appointments</h3>
          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map(a => (
                <div key={a.id} className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-text-ink">{new Date(a.appointment_time).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</div>
                    <div className="text-[13px] text-text-muted">Dr. {a.doctor_name || "Any"} - {a.reason_for_visit || a.reason || "General"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${a.status === "confirmed" ? "bg-success-bg text-clinical-success" : "bg-container-tint text-primary"}`}>
                      {a.status}
                    </span>
                    {a.prescription_id && (
                      <Link
                        href={`${prescriptionHref}?id=${a.prescription_id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-bold text-on-primary shadow-sm transition-colors hover:bg-accent-dark"
                      >
                        <span className="material-symbols-outlined text-[16px]">prescriptions</span>
                        View Prescription
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-text-muted text-center py-8">No appointments found.</p>
          )}
        </div>
      )}

      {activeTab === "Billing" && (
        <div className="bg-card-surface rounded-xl p-6 shadow-sm border border-surface-container text-center py-12">
          <span className="material-symbols-outlined text-[48px] text-surface-container-highest mb-2">receipt_long</span>
          <p className="text-[14px] text-text-muted font-semibold">Billing history will be displayed here.</p>
        </div>
      )}
    </div>
  );
}
