"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ReceptionSidebar() {
  const currentPath = usePathname();

  const navItems = [
    { path: "/reception/dashboard", label: "Dashboard", icon: "space_dashboard" },
    { path: "/reception/directory", label: "Patient Directory", icon: "person_search" },
    { path: "/reception/register", label: "Register Patient", icon: "person_add" },
    { path: "/reception/appointments", label: "Appointments", icon: "calendar_month" },
    { path: "/reception/queue", label: "Clinic Queue", icon: "group", badge: "4 waiting" },
    { path: "/reception/kiosk", label: "Check-in Kiosk", icon: "sensor_door" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-card-surface z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container">
      <div className="flex flex-col">
        <div className="h-16 px-6 flex items-center justify-between border-b border-surface-container-high/60">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-clinical-success animate-pulse"></div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Reception Portal</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-container-tint text-[11px] text-primary font-bold">V2.4</span>
        </div>

        <div className="px-6 pt-3 pb-2">
          <div className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Receptionist Workspace</div>
        </div>

        <nav className="px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== "/reception/dashboard" && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-[14px] transition-all ${
                  isActive
                    ? "bg-primary-container text-on-primary font-bold shadow-[0_2px_8px_-2px_rgba(7,12,25,0.08)]"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isActive ? "bg-white/20 text-white" : "bg-container-tint text-primary"}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 m-3 rounded-lg bg-surface-container-low flex flex-col gap-2 border border-surface-container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-clinical-success text-[18px]">mic</span>
            <span className="text-[12px] font-bold text-text-ink">Desk Station 01</span>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-success-bg text-clinical-success text-[11px] font-semibold">Online</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          <span>HIPAA Encrypted Node</span>
        </div>
      </div>
    </aside>
  );
}
