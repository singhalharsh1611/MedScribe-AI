"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If we are in the setup flow, don't wrap with this layout's sidebar and header
  if (pathname.startsWith("/admin/setup")) {
    return <>{children}</>;
  }

  const navItems = [
    { path: '/admin/overview', label: 'Overview', icon: 'dashboard' },
    { path: '/admin/users', label: 'Users', icon: 'group', badge: '3', badgeType: 'info' },
    { path: '/admin/join-requests', label: 'Join Requests', icon: 'person_add', badge: '3 New', badgeType: 'warning' },
    { path: '/admin/roles-and-permissions', label: 'Roles & Permissions', icon: 'shield_person' },
    { path: '/admin/clinic-settings', label: 'Clinic Settings', icon: 'tune' },
    { path: '/admin/audit-log', label: 'Audit Log', icon: 'receipt_long' },
  ];

  return (
    <div className="min-h-screen bg-app-bg text-on-surface font-body-md antialiased">
      <aside className="fixed left-0 top-0 h-full w-72 bg-card-surface shadow-sm z-50 flex flex-col justify-between pt-6 pb-8 border-r border-surface-container">
        <div className="flex flex-col">
          <div className="px-6 py-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">admin_panel_settings</span>
              </div>
              <div>
                <div className="font-bold text-[18px] text-text-ink tracking-tight">Admin Console</div>
                <div className="text-[12px] text-text-muted font-bold uppercase tracking-wider">Voice OS Cluster</div>
              </div>
            </div>
          </div>
          <nav className="flex flex-col gap-1 px-4">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-md font-bold'
                      : 'text-text-muted hover:bg-surface-container-lowest hover:text-text-ink font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className="text-[14px]">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeType === 'warning'
                          ? 'bg-warning-bg border border-clinical-warning/20 text-clinical-warning'
                          : 'bg-container-tint border border-primary/20 text-primary'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="px-4">
          <div className="bg-surface-container-lowest border border-surface-container rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-clinical-success text-[20px]">verified_user</span>
              <span className="text-[12px] text-clinical-success font-bold">HIPAA & HITECH Active</span>
            </div>
            <div className="text-[13px] font-medium text-text-muted">Tamper-Evident Ledger</div>
            <div className="flex items-center justify-between pt-1 border-t border-surface-container mt-1 text-text-muted">
              <span className="text-[11px] font-bold uppercase">SHA-256 Validated</span>
              <span className="w-2.5 h-2.5 rounded-full bg-clinical-success inline-block shadow-sm"></span>
            </div>
          </div>
        </div>
      </aside>

      <div className="pl-72 flex flex-col min-h-screen">
        <header className="fixed top-0 left-72 right-0 h-16 bg-card-surface/95 backdrop-blur-md shadow-sm z-40 flex items-center justify-between px-8 border-b border-surface-container">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                alt="SleekCare Voice OS Logo" 
                className="h-8 w-auto object-contain" 
                src="https://lh3.googleusercontent.com/aida/AEtjO1XkMLN23noarFOAg-7wBsrUX65ovyYdbbJpjRMqdWAYR7MwmwWWQ-7Tp8KW3HPEjbBD_jiVgmj5UbtO1tPXRpyw6OUCEDiEJQF5piaF3i0IgVgdrQxDQ4-z0aSSX9my-k0g-pCMIxOL2EsKI2_KfKDqB84y9LC8uMToker-YKVStySsY3TOLa8fNSBKcAflBI92M_xIsR0tnSg5BKuMyuCdLVd9lhMweOlxEFMlZFnSRAhev6mPbVoVG2w"
              />
              <span className="text-[20px] font-bold text-text-ink tracking-tight">SleekCare</span>
              <span className="text-[11px] text-primary bg-container-tint border border-primary/20 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">Voice OS</span>
            </div>
            <div className="h-6 w-px bg-surface-container"></div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest border border-surface-container rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-primary text-[18px]">local_hospital</span>
              <span className="text-[13px] font-bold text-text-ink">Metropolitan Health Medical Center</span>
              <span className="material-symbols-outlined text-clinical-success text-[16px]">check_circle</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-success-bg border border-clinical-success/20 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse shadow-sm"></span>
              <span className="text-[11px] text-clinical-success font-bold">Admin Core Active · FIPS-140-2 Level 3</span>
            </div>
            <div className="text-[13px] font-bold text-text-muted flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span>14:32:08 UTC</span>
            </div>
            <div className="relative cursor-pointer p-2 text-text-muted hover:bg-surface-container-lowest rounded-full transition-colors">
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-clinical-warning border-2 border-card-surface shadow-sm"></span>
            </div>
            <div className="h-6 w-px bg-surface-container"></div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="text-[14px] font-bold text-text-ink">Dr. Eleanor Vance, MD</span>
                <span className="text-[11px] text-text-muted font-bold">Clinic Admin · Attending Pulmonologist</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-[20px]">person</span>
              </div>
            </div>
          </div>
        </header>

        <main className="relative pt-16 w-full flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
