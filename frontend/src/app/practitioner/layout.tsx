"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PractitionerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { label: 'Patient Summary (Profile)', icon: 'person', path: '/practitioner' },
    { label: 'New Encounter (Empty)', icon: 'clinical_notes', path: '/practitioner/new-encounter' },
    { label: 'Active Encounter (Charted)', icon: 'graphic_eq', path: '/practitioner/active-encounter', badge: 'Active' },
  ];

  return (
    <div className="min-h-screen bg-app-bg text-on-surface font-body-md antialiased flex">
      <aside className="fixed left-0 top-0 h-full w-72 bg-card-surface shadow-sm z-50 flex flex-col justify-between border-r border-surface-container">
        <div className="flex flex-col">
          <div className="h-16 px-6 flex items-center gap-3 border-b border-surface-container bg-surface-container-lowest">
            <span className="material-symbols-outlined text-primary text-[24px]">local_hospital</span>
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-text-ink leading-tight">Clinical Voice</span>
              <span className="text-[12px] font-bold text-text-muted">Practitioner Workspace</span>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="bg-container-tint border border-primary/20 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-clinical-success text-[18px]">mic</span>
                <span className="text-[13px] text-text-ink font-bold">Scribe Engine</span>
              </div>
              <span className="text-[11px] text-clinical-success bg-success-bg border border-clinical-success/20 px-2 py-0.5 rounded-full font-bold shadow-sm uppercase tracking-wider">Ready</span>
            </div>
          </div>
          <nav className="px-4 py-2 space-y-1.5 flex flex-col">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/practitioner');
              // fix exact match for practitioner root
              const isExactRoot = pathname === '/practitioner' && item.path === '/practitioner';
              const finalIsActive = item.path === '/practitioner' ? isExactRoot : isActive;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-[14px] font-bold ${
                    finalIsActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-text-muted hover:bg-surface-container-lowest hover:text-text-ink'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm ${finalIsActive ? 'bg-white/20 text-white' : 'bg-surface-container-high border border-surface-container text-text-ink'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 pb-2 border-t border-surface-container mt-4 mb-2">
              <span className="px-4 text-[11px] uppercase tracking-wider text-text-muted font-bold">Quick Workflow</span>
            </div>

            <Link
              href="/practitioner/new-encounter"
              className="flex items-center justify-between px-4 py-2 rounded-lg text-text-muted hover:bg-surface-container-lowest hover:text-text-ink text-[13px] font-bold transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">groups</span>
                <span>Patient Queue</span>
              </div>
              <span className="bg-surface-container-high border border-surface-container text-text-ink text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">4 waiting</span>
            </Link>
            
            <Link
              href="/practitioner"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-text-muted hover:bg-surface-container-lowest hover:text-text-ink text-[13px] font-bold transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>Today's Schedule</span>
            </Link>

            <Link
              href="/practitioner/active-encounter"
              className="flex items-center justify-between px-4 py-2 rounded-lg text-text-muted hover:bg-surface-container-lowest hover:text-text-ink text-[13px] font-bold transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
                <span>Live Voice Scribe</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-clinical-success animate-pulse shadow-sm"></span>
            </Link>
          </nav>
        </div>

        <div className="p-5 m-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-clinical-success text-[18px]">lock</span>
            <span className="text-[13px] text-text-ink font-bold">HIPAA Encrypted Node</span>
          </div>
          <p className="text-[12px] font-medium text-text-muted leading-tight">Voice Node Station 101 Online</p>
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-surface-container">
            <span className="w-1.5 h-1.5 rounded-full bg-clinical-success"></span>
            <span className="text-[11px] font-bold text-clinical-success uppercase tracking-wider">256-bit TLS Stream</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col ml-72">
        <header className="fixed top-0 left-72 right-0 h-16 bg-card-surface/95 backdrop-blur-md shadow-sm z-40 border-b border-surface-container">
          <div className="h-16 w-full px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary border border-primary-container flex items-center justify-center text-white shadow-sm font-bold">
                <span className="material-symbols-outlined text-[24px]">waveform</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-bold text-text-ink tracking-tight">SleekCare Clinical Voice OS</span>
                <span className="text-[12px] font-bold text-text-muted">Metropolitan Health Medical Center</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsMicMuted(!isMicMuted)}
                title="Click to toggle Station Mic"
                className={`hidden xl:flex items-center gap-2 px-4 py-2 rounded-full border transition-all shadow-sm cursor-pointer ${
                  isMicMuted 
                    ? 'bg-error-bg border-clinical-error/30 text-clinical-error' 
                    : 'bg-container-tint border-primary/20 text-text-ink'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shadow-sm ${isMicMuted ? 'bg-clinical-error' : 'bg-clinical-success animate-pulse'}`}></span>
                <span className="text-[12px] font-bold uppercase tracking-wider">
                  {isMicMuted ? 'Station 101 — Sennheiser Array Muted' : 'Station 101 — Sennheiser Array Active'}
                </span>
              </button>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest border border-surface-container rounded-lg shadow-sm" title="Calibrated Audio Sensitivity">
                <span className="material-symbols-outlined text-primary text-[20px]">graphic_eq</span>
                <div className="flex items-end gap-1 h-4 w-12">
                  <div className="w-1.5 h-2 bg-clinical-success rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-3 bg-clinical-success rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
                  <div className="w-1.5 h-4 bg-clinical-success rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-surface-container-high rounded-full"></div>
                </div>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-text-muted hover:text-text-ink rounded-full hover:bg-surface-container-lowest border border-transparent hover:border-surface-container transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[24px]">notifications</span>
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-clinical-error rounded-full border-2 border-card-surface shadow-sm"></span>
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-card-surface border border-surface-container rounded-xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <p className="font-bold text-text-ink mb-3 text-[14px]">Recent Clinical Notifications</p>
                    <div className="p-3 bg-warning-bg border border-clinical-warning/20 rounded-lg text-clinical-warning text-[13px] font-bold mb-2 shadow-sm">
                      Penicillin Allergy flag verified for Maya Lin Harrison.
                    </div>
                    <div className="p-3 bg-container-tint border border-primary/20 rounded-lg text-primary text-[13px] font-bold shadow-sm">
                      Triage vitals successfully synchronized from Room 101.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pl-2 border-l border-surface-container">
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-[14px] font-bold text-text-ink">Dr. Eleanor Vance, MD</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Attending Physician / Clinic Administrator</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm font-bold text-[14px] border border-primary-container">
                  EV
                </div>
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
