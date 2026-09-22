"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

import { useState, useEffect } from "react";
import { api, getUser } from "@/lib/api";

export default function DoctorSidebar() {
  const pathname = usePathname();
  const [waitingCount, setWaitingCount] = useState(0);

  useEffect(() => {
    const isConsultationRoute = pathname.startsWith("/consultation") ||
      pathname.startsWith("/doctor/encounter");
    if (isConsultationRoute) return;

    const fetchQ = async () => {
      try {
        const u = getUser();
        if (u?.clinic_id) {
          const res = await api.queue.get(u.clinic_id, u.id);
          setWaitingCount((res.queue || []).filter((p: any) => p.status === "waiting").length);
        }
      } catch (e) {}
    };
    fetchQ();
    const interval = setInterval(fetchQ, 5000);
    return () => clearInterval(interval);
  }, [pathname]);

  const isQueueEmpty = waitingCount === 0;

  const isActive = (path: string) => {
    if (path === "/doctor/dashboard" && pathname === "/doctor/dashboard") return true;
    if (path === "/consultation" && (pathname.startsWith("/consultation") || pathname.startsWith("/doctor/encounter/new"))) return true;
    if (path !== "/doctor/dashboard" && path !== "/consultation" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path: string) =>
    `flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
      isActive(path)
        ? "bg-primary-container text-on-primary font-bold shadow-sm"
        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
    }`;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-72 bg-card-surface shadow-[0_1px_8px_rgba(7,12,25,0.04)] z-30 hidden lg:flex flex-col justify-between p-gutter-desktop overflow-y-auto border-r border-surface-container">
      <div className="space-y-space-lg">
        <div className="px-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">DOCTOR WORKSPACE</p>
        </div>
        <nav className="space-y-1">
          <Link href="/doctor/dashboard" className={navLinkClass("/doctor/dashboard")}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="text-[14px]">Dashboard</span>
            </div>
          </Link>

          <Link href="/doctor/queue" className={navLinkClass("/doctor/queue")}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">groups</span>
              <span className="text-[14px]">Patient Queue</span>
            </div>
            {!isQueueEmpty ? (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isActive("/doctor/queue") ? "bg-white/20 text-white" : "bg-warning-bg text-clinical-warning"}`}>
                {waitingCount} waiting
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-success-bg text-clinical-success text-[11px] font-semibold">Clear</span>
            )}
          </Link>

          <Link href="/doctor/schedule" className={navLinkClass("/doctor/schedule")}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              <span className="text-[14px]">Today&apos;s Schedule</span>
            </div>
          </Link>

          <Link href="/doctor/patients" className={navLinkClass("/doctor/patients")}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">folder_shared</span>
              <span className="text-[14px]">My Patients</span>
            </div>
          </Link>

          <Link href="/doctor/walk-in" className={navLinkClass("/doctor/walk-in")}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span className="text-[14px]">Start Walk-in</span>
            </div>
          </Link>

          <Link
            href="/doctor/encounter/new"
            onClick={() => localStorage.removeItem("activeQueueEntry")}
            className={navLinkClass("/consultation")}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">mic</span>
              <span className="text-[14px]">Voice Scribe</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isActive("/consultation") ? "bg-white/20 text-white" : "bg-success-bg text-clinical-success"}`}>
              Ready
            </span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
