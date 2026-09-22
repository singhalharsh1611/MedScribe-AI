"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { api, getUser } from "@/lib/api";

export default function ReceptionSidebar() {
  const currentPath = usePathname();
  const [queueLength, setQueueLength] = useState<number | null>(null);

  useEffect(() => {
    const u = getUser();
    if (u?.clinic_id) {
      api.queue.get(u.clinic_id).then(res => {
        const waiting = (res.queue || []).filter((q: any) => q.status === "waiting" || q.status === "called").length;
        setQueueLength(waiting);
      }).catch(() => {});
    }
  }, []);

  const navItems = [
    { path: "/reception/dashboard", label: "Dashboard", icon: "space_dashboard" },
    { path: "/reception/directory", label: "Patient Directory", icon: "person_search" },
    { path: "/reception/register", label: "Register Patient", icon: "person_add" },
    { path: "/reception/appointments", label: "Appointments", icon: "calendar_month" },
    { path: "/reception/queue", label: "Clinic Queue", icon: "group", badge: queueLength !== null && queueLength > 0 ? `${queueLength} waiting` : "" },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-72 bg-card-surface shadow-[0_1px_8px_rgba(7,12,25,0.04)] z-30 hidden lg:flex flex-col justify-between p-gutter-desktop overflow-y-auto border-r border-surface-container">
      <div className="space-y-space-lg">
        <div className="px-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">RECEPTION WORKSPACE</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== "/reception/dashboard" && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? "bg-primary-container text-on-primary font-bold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="text-[14px]">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isActive ? "bg-white/20 text-white" : "bg-warning-bg text-clinical-warning"}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

    </aside>
  );
}
