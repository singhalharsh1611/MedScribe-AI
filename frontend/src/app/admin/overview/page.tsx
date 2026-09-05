"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getUser } from "@/lib/api";

export default function AdminOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [clinic, setClinic] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    if (u.clinic_id) {
      Promise.all([
        api.clinics.get(u.clinic_id),
        api.clinics.stats(u.clinic_id),
        api.joinRequests.list(u.clinic_id, "pending"),
      ]).then(([c, s, jr]) => {
        setClinic(c.clinic);
        setStats(s);
        setPendingRequests(jr.requests?.length || 0);
      }).catch(() => {}).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const quickLinks = [
    { href: "/admin/join-requests", icon: "group_add", label: "Join Requests", badge: pendingRequests, color: "text-clinical-warning" },
    { href: "/admin/users", icon: "group", label: "Clinic Users", color: "text-primary" },
    { href: "/admin/clinic-settings", icon: "settings", label: "Clinic Settings", color: "text-secondary" },
    { href: "/admin/roles-and-permissions", icon: "admin_panel_settings", label: "Roles & Permissions", color: "text-tertiary" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* Clinic Banner */}
      <section className="bg-card-surface rounded-xl p-space-lg shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">Clinic Administration</p>
            <h1 className="text-[26px] font-bold text-text-ink">{clinic?.name || "Your Clinic"}</h1>
            {clinic?.type && <p className="text-[14px] text-text-muted mt-0.5">{clinic.type}</p>}
            {clinic?.address && <p className="text-[13px] text-text-muted mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>{clinic.address}
            </p>}
          </div>
          <Link href="/admin/clinic-settings"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-text-muted hover:text-primary hover:border-primary transition-colors text-[13px] font-semibold">
            <span className="material-symbols-outlined text-[18px]">settings</span>Edit Clinic
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Patients", value: stats.total_patients ?? "—", icon: "people", color: "bg-primary-fixed text-primary" },
          { label: "Today's Appointments", value: stats.today_appointments ?? "—", icon: "calendar_today", color: "bg-secondary-fixed text-secondary" },
          { label: "Clinic Doctors", value: stats.total_doctors ?? "—", icon: "stethoscope", color: "bg-tertiary-fixed text-tertiary" },
          { label: "Waiting Queue", value: stats.waiting_queue ?? "—", icon: "queue", color: "bg-warning-bg text-clinical-warning" },
        ].map(s => (
          <div key={s.label} className="bg-card-surface rounded-xl p-4 border border-surface-container shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
            </div>
            <p className="text-[28px] font-bold text-text-ink">{s.value}</p>
            <p className="text-[12px] text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickLinks.map(l => (
          <Link key={l.href} href={l.href}
            className="bg-card-surface rounded-xl p-4 border border-surface-container shadow-sm hover:shadow-md hover:border-outline-variant transition-all flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
              <span className={`material-symbols-outlined text-[22px] ${l.color}`}>{l.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-text-ink text-[14px]">{l.label}</p>
            </div>
            {l.badge ? (
              <span className="bg-clinical-warning text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{l.badge} pending</span>
            ) : (
              <span className="material-symbols-outlined text-outline text-[18px]">arrow_forward_ios</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
