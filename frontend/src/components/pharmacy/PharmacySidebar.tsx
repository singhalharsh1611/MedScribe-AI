"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PharmacySidebar() {
  const currentPath = usePathname();

  const navItems = [
    { name: "Dashboard", path: "/pharmacy/dashboard", icon: "space_dashboard" },
    { name: "Prescription Queue", path: "/pharmacy/queue", icon: "receipt_long" },
    { name: "Fulfillment Review", path: "/pharmacy/fulfillment", icon: "verified" },
    { name: "Handover Complete", path: "/pharmacy/handover", icon: "task_alt" },
    { name: "Inventory & Stock", path: "/pharmacy/inventory", icon: "inventory_2" },
    { name: "Dispensing Log", path: "/pharmacy/dispensing-log", icon: "fact_check" },
    { name: "Emergency Alerts", path: "/pharmacy/alerts", icon: "warning", errorIcon: true },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-72 bg-card-surface shadow-[0_1px_8px_rgba(7,12,25,0.04)] z-30 hidden lg:flex flex-col justify-between p-gutter-desktop overflow-y-auto border-r border-surface-container">
      <div className="space-y-space-lg">
        <div className="px-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">PHARMACY WORKSPACE</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              (item.path !== "/pharmacy/dashboard" && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? "bg-primary-container text-on-primary font-bold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      item.errorIcon && !isActive ? "text-clinical-error" : ""
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[14px]">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-space-md space-y-space-sm border-t border-surface-container mt-4">
        <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
            <span className="text-[11px] font-semibold text-text-ink uppercase">Compound Core Node</span>
          </div>
          <p className="text-[12px] text-on-surface-variant">Rx Node 4 • Station Online</p>
        </div>
        <div className="p-2.5 rounded-lg bg-surface-container-high flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-tertiary-container">lock</span>
          <p className="text-[11px] text-on-surface">HIPAA Compliant • E2E Encrypted</p>
        </div>
      </div>
    </aside>
  );
}
