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
    <aside className="fixed left-0 top-0 h-full w-64 bg-card-surface z-50 flex flex-col justify-between shadow-sm border-r border-surface-container">
      <div className="flex flex-col flex-1">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-surface-container">
          <img
            alt="SleekCare Brand Mark"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XkMLN23noarFOAg-7wBsrUX65ovyYdbbJpjRMqdWAYR7MwmwWWQ-7Tp8KW3HPEjbBD_jiVgmj5UbtO1tPXRpyw6OUCEDiEJQF5piaF3i0IgVgdrQxDQ4-z0aSSX9my-k0g-pCMIxOL2EsKI2_KfKDqB84y9LC8uMToker-YKVStySsY3TOLa8fNSBKcAflBI92M_xIsR0tnSg5BKuMyuCdLVd9lhMweOlxEFMlZFnSRAhev6mPbVoVG2w"
          />
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-text-ink leading-tight">SleekCare</span>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              Voice OS • Rx
            </span>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="bg-surface-container-low px-3 py-2 rounded-lg flex items-center justify-between border border-surface-container">
            <span className="text-[11px] text-text-muted font-bold uppercase">
              Compound Core
            </span>
            <span className="text-[10px] bg-success-bg text-clinical-success px-2 py-0.5 rounded font-bold shadow-sm border border-clinical-success/20">
              Active
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              (item.path !== "/pharmacy/dashboard" && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary-container text-on-primary font-bold shadow-sm"
                    : "text-on-surface-variant text-[14px] font-medium hover:bg-surface-container hover:text-text-ink"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    item.errorIcon && !isActive ? "text-clinical-error" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-surface-container">
        <div className="bg-surface-container-low border border-surface-container px-3 py-2 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-clinical-success text-[18px]">verified_user</span>
          <div className="flex flex-col">
            <span className="text-[12px] text-text-ink font-bold">HIPAA Protected</span>
            <span className="text-[11px] font-medium text-text-muted">256-Bit Node Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
