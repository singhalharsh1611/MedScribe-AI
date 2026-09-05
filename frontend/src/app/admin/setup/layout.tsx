"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSetupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/admin/setup/dashboard";

  return (
    <div className="min-h-screen bg-app-bg text-on-surface font-body-md antialiased flex flex-col">
      <header className="fixed top-0 left-0 right-0 h-16 bg-card-surface/95 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.02)] z-50 px-6 flex items-center justify-between border-b border-container-tint">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex-shrink-0">
              <img
                alt="SleekCare Emblem"
                className="h-8 w-auto object-contain flex-shrink-0"
                src="https://lh3.googleusercontent.com/aida/AEtjO1XkMLN23noarFOAg-7wBsrUX65ovyYdbbJpjRMqdWAYR7MwmwWWQ-7Tp8KW3HPEjbBD_jiVgmj5UbtO1tPXRpyw6OUCEDiEJQF5piaF3i0IgVgdrQxDQ4-z0aSSX9my-k0g-pCMIxOL2EsKI2_KfKDqB84y9LC8uMToker-YKVStySsY3TOLa8fNSBKcAflBI92M_xIsR0tnSg5BKuMyuCdLVd9lhMweOlxEFMlZFnSRAhev6mPbVoVG2w"
              />
            </Link>
            <div className="h-6 w-px bg-container-tint flex-shrink-0"></div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[15px] leading-5 text-text-ink truncate tracking-tight">
                {isDashboard ? "SleekCare Clinical Voice OS" : "Clinical Voice OS | Clinic Admin Setup & Management"}
              </span>
              <div className="flex items-center gap-1.5 text-text-muted text-[11px] font-bold">
                <span className="hover:text-primary cursor-pointer transition-colors">Clinic Administration</span>
                <span className="material-symbols-outlined text-[14px] text-outline-variant">chevron_right</span>
                <span className="text-on-surface font-bold">{isDashboard ? "Workspace Overview" : "Overview & Config"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-bg text-clinical-success text-[11px] font-bold border border-clinical-success/20">
            <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
            <span>Admin Workspace Active</span>
          </div>
          <div className="h-6 w-px bg-container-tint"></div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container">
            <div className="flex flex-col text-right">
              <span className="text-[13px] font-bold text-text-ink">Dr. Eleanor Vance, MD</span>
              <span className="text-[11px] text-text-muted font-bold">Clinic Administrator</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white shadow-sm">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card-surface shadow-sm z-40 flex flex-col justify-between pt-6 pb-8 border-r border-container-tint/50">
        <div className="flex flex-col gap-2">
          {!isDashboard ? (
            <>
              <div className="px-6 py-2 flex items-center justify-between">
                <span className="text-[11px] tracking-wider uppercase text-text-muted font-bold">Clinic Setup Wizard</span>
                <span className="px-2 py-0.5 rounded bg-primary-container/20 border border-primary/10 text-primary text-[11px] font-bold">
                  {pathname === "/admin/setup" && "Step 1/3"}
                  {pathname === "/admin/setup/default-roles" && "Step 2/3"}
                  {pathname === "/admin/setup/access-permissions" && "Step 3/3"}
                </span>
              </div>
              <nav className="flex flex-col px-4 gap-1.5">
                <Link
                  href="/admin/setup"
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg font-bold transition-all ${
                    pathname === "/admin/setup"
                      ? "bg-primary text-white shadow-md"
                      : "text-text-muted hover:bg-surface-container-low hover:text-text-ink"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[20px] ${pathname !== "/admin/setup" ? "text-clinical-success" : ""}`}>
                      {pathname === "/admin/setup" ? "domain" : "check_circle"}
                    </span>
                    <span className="text-[13px]">1. Practice Setup</span>
                  </div>
                  {pathname === "/admin/setup" ? (
                    <span className="material-symbols-outlined text-[18px]">radio_button_checked</span>
                  ) : (
                    <span className="text-[11px] text-clinical-success font-bold">Done</span>
                  )}
                </Link>

                <Link
                  href="/admin/setup/default-roles"
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg font-bold transition-all ${
                    pathname === "/admin/setup/default-roles"
                      ? "bg-primary text-white shadow-md"
                      : "text-text-muted hover:bg-surface-container-low hover:text-text-ink"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[20px] ${pathname === "/admin/setup/access-permissions" ? "text-clinical-success" : ""}`}>
                      {pathname === "/admin/setup/access-permissions" ? "check_circle" : "badge"}
                    </span>
                    <span className="text-[13px]">2. Default Roles</span>
                  </div>
                  {pathname === "/admin/setup/default-roles" ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-sm"></span>
                  ) : pathname === "/admin/setup/access-permissions" ? (
                    <span className="text-[11px] text-clinical-success font-bold">Done</span>
                  ) : (
                    <span className="text-[11px] text-text-muted">Step 2</span>
                  )}
                </Link>

                <Link
                  href="/admin/setup/access-permissions"
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg font-bold transition-all ${
                    pathname === "/admin/setup/access-permissions"
                      ? "bg-primary text-white shadow-md"
                      : "text-text-muted hover:bg-surface-container-low hover:text-text-ink"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">shield_person</span>
                    <span className="text-[13px]">3. Access Permissions</span>
                  </div>
                  {pathname === "/admin/setup/access-permissions" ? (
                    <span className="material-symbols-outlined text-[18px]">radio_button_checked</span>
                  ) : (
                    <span className="text-[11px] text-text-muted">Step 3</span>
                  )}
                </Link>
              </nav>

              <div className="pt-4 px-6 py-2 flex items-center justify-between border-t border-container-tint mt-2">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Workspace Status</span>
                <span className="material-symbols-outlined text-text-muted text-[18px]">lock_open</span>
              </div>
              <div className="flex flex-col px-4 gap-1.5">
                <Link
                  href="/admin/setup/dashboard"
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg text-text-muted hover:bg-surface-container-low transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-primary">dashboard</span>
                    <span className="text-[13px] font-bold">Admin Dashboard</span>
                  </div>
                  <span className="text-[11px] text-clinical-success px-2 py-0.5 rounded bg-success-bg font-bold border border-clinical-success/20">Live</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="px-6 py-2">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Clinic Management</span>
              </div>
              <nav className="flex flex-col px-4 gap-1.5">
                <Link
                  href="/admin/setup/dashboard"
                  className="flex items-center justify-between px-4 py-2.5 transition-all bg-primary text-white font-bold rounded-lg shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    <span className="text-[13px]">Overview</span>
                  </div>
                </Link>
                <Link href="/admin/setup/dashboard" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-text-muted hover:bg-surface-container-low hover:text-text-ink transition-all">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">group</span>
                    <span className="text-[13px] font-bold">Manage Users</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-container-tint text-text-muted text-[11px] font-bold border border-surface-container">1</span>
                </Link>
                <Link href="/admin/setup/default-roles" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-muted hover:bg-surface-container-low hover:text-text-ink transition-all">
                  <span className="material-symbols-outlined text-[20px]">shield_person</span>
                  <span className="text-[13px] font-bold">Manage Roles</span>
                </Link>
                <Link href="/admin/setup/dashboard" className="flex items-center justify-between px-4 py-2.5 rounded-lg text-text-muted hover:bg-surface-container-low hover:text-text-ink transition-all">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                    <span className="text-[13px] font-bold">Join Requests</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-warning-bg text-clinical-warning text-[11px] font-bold border border-clinical-warning/20">3</span>
                </Link>
                <Link href="/admin/setup/access-permissions" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-muted hover:bg-surface-container-low hover:text-text-ink transition-all">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                  <span className="text-[13px] font-bold">Clinic Settings</span>
                </Link>
              </nav>
              <div className="pt-4 px-6 py-2 flex items-center justify-between border-t border-container-tint mt-2">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Quick Switch</span>
              </div>
              <div className="flex flex-col px-4 gap-1.5">
                <Link href="/admin/setup" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-muted hover:bg-surface-container-low transition-all">
                  <span className="material-symbols-outlined text-[20px]">build</span>
                  <span className="text-[13px] font-bold">Return to Setup Wizard</span>
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="px-6">
          <div className="p-4 rounded-lg bg-surface-container-lowest flex flex-col gap-1.5 border border-surface-container shadow-sm">
            <div className="flex items-center gap-2 text-tertiary">
              <span className="material-symbols-outlined text-[18px]">security</span>
              <span className="text-[11px] font-bold uppercase tracking-wider">Portal Security</span>
            </div>
            <p className="text-[12px] text-text-muted font-medium leading-tight pt-1">Session encrypted via mutual TLS & hardware keystore verification.</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 pt-16 min-h-screen">
        {children}
      </main>

      <footer className="ml-64 bg-card-surface shadow-sm py-6 px-10 border-t border-container-tint/50 mt-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-medium text-text-muted">© 2024 SleekCare Health Systems Inc. Clinical Voice Architecture.</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-lowest border border-surface-container text-text-ink text-[11px] font-bold shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-clinical-success">gavel</span>
              <span>BAA Executed</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-lowest border border-surface-container text-text-ink text-[11px] font-bold shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-clinical-success">verified</span>
              <span>SOC 2 Type II</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-lowest border border-surface-container text-text-ink text-[11px] font-bold shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-clinical-success">health_and_safety</span>
              <span>HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
