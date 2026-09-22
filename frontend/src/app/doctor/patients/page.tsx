"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getUser } from "@/lib/api";

const PAGE_SIZE = 12;

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const loadPatients = async () => {
      const user = getUser();
      if (!user?.clinic_id || !user?.id) {
        setError("A clinic and doctor account are required.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await api.patients.list(user.clinic_id, debouncedSearch, {
          doctorId: user.id,
          page,
          limit: PAGE_SIZE,
        });
        if (cancelled) return;
        setPatients(response.patients || []);
        setPagination(response.pagination || { page, total: response.patients?.length || 0, totalPages: 1 });
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load your patients.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPatients();
    return () => { cancelled = true; };
  }, [debouncedSearch, page]);

  const openPatient = (patientId: number) => {
    localStorage.setItem("activePatientId", String(patientId));
    router.push("/doctor/patient-profile");
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-primary">Doctor Workspace</p>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-text-ink">My Patients</h1>
          <p className="mt-1 text-[13px] text-text-muted">Every patient with an appointment or consultation assigned to you.</p>
        </div>
        <div className="rounded-lg border border-surface-container bg-card-surface px-4 py-2 shadow-sm">
          <span className="text-[12px] font-semibold text-text-muted">Total patients</span>
          <span className="ml-2 text-[18px] font-bold text-text-ink">{pagination.total}</span>
        </div>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search your patients by name, UHID, or phone..."
          className="w-full rounded-xl border border-surface-container bg-card-surface py-3 pl-10 pr-4 text-[14px] text-text-ink shadow-sm outline-none transition-all focus:ring-2 focus:ring-primary"
        />
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-surface-container bg-card-surface">
          <span className="material-symbols-outlined animate-spin text-[36px] text-primary">sync</span>
        </div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-clinical-error/30 bg-error-bg p-8 text-center font-semibold text-clinical-error">{error}</div>
      ) : patients.length === 0 ? (
        <div className="rounded-xl border border-surface-container bg-card-surface p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline">person_search</span>
          <p className="mt-3 font-semibold text-text-muted">{debouncedSearch ? "No matching patients found." : "No patients have been assigned to you yet."}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-container bg-card-surface shadow-sm">
          <div className="hidden grid-cols-[minmax(220px,1.5fr)_minmax(150px,1fr)_150px_150px_40px] gap-4 border-b border-surface-container bg-surface-container-low px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted md:grid">
            <span>Patient</span><span>Contact</span><span>Last appointment</span><span>Clinical records</span><span />
          </div>
          <div className="divide-y divide-surface-container">
            {patients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => openPatient(patient.id)}
                className="grid w-full cursor-pointer grid-cols-1 gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-container-lowest md:grid-cols-[minmax(220px,1.5fr)_minmax(150px,1fr)_150px_150px_40px] md:items-center md:gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-bold text-primary">
                    {patient.first_name?.[0]}{patient.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-text-ink">{patient.first_name} {patient.last_name}</p>
                    <p className="text-[12px] text-text-muted">{patient.uhid || `Patient #${patient.id}`} · {patient.gender || "Gender N/A"}</p>
                  </div>
                </div>
                <div className="text-[12px] text-on-surface-variant">
                  <p className="font-semibold text-text-ink">{patient.phone || "No phone"}</p>
                  <p className="truncate">{patient.email || "No email"}</p>
                </div>
                <div className="text-[12px] text-on-surface-variant">
                  {patient.last_appointment_at ? new Date(patient.last_appointment_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Consultation only"}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-container-tint px-2 py-1 text-[11px] font-bold text-primary">{patient.appointment_count || 0} appointments</span>
                  {patient.latest_prescription_id && <span className="rounded-full bg-success-bg px-2 py-1 text-[11px] font-bold text-clinical-success">Rx saved</span>}
                </div>
                <span className="material-symbols-outlined hidden text-[18px] text-outline md:block">arrow_forward_ios</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-surface-container bg-card-surface px-4 py-3 shadow-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-lg border border-surface-container px-4 py-2 text-[13px] font-bold text-text-ink hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[13px] font-semibold text-text-muted">Page {pagination.page} of {pagination.totalPages}</span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
            className="rounded-lg border border-surface-container px-4 py-2 text-[13px] font-bold text-text-ink hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
