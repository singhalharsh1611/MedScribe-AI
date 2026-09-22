
"use client";
import { useState, useEffect } from "react";
import { api, getUser } from "@/lib/api";

export default function DoctorSchedulePage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = getUser();
      if (u?.clinic_id) {
        try {
          const res = await api.appointments.list(u.clinic_id, u.id);
          setAppointments(res.appointments || []);
        } catch (err) {}
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-text-ink">My Schedule</h1>
      </div>
      
      <div className="bg-card-surface rounded-xl p-space-lg shadow-sm border border-surface-container">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading schedule...</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No appointments found.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {appointments.map(apt => (
              <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest border border-surface-container">
                <div>
                  <h3 className="font-bold text-[16px] text-text-ink">{apt.first_name ? `${apt.first_name} ${apt.last_name}` : `Patient #${apt.patient_id}`}</h3>
                  <p className="text-[13px] text-text-muted">{apt.reason_for_visit || "Routine visit"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{new Date(apt.appointment_time).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</p>
                  <p className="text-[12px] uppercase font-bold text-on-surface-variant mt-1">{apt.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

