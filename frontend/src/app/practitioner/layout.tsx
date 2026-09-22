"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import MobileSectionNav from "@/components/shared/MobileSectionNav";

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
    <div className="min-h-screen bg-app-bg text-on-surface font-body-md antialiased">
      <header className="fixed top-0 left-0 right-0 h-16 bg-card-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(7,12,25,0.04)] z-40 flex items-center justify-between px-3 sm:px-6 lg:px-gutter-desktop border-b border-surface-container">
        <div className="flex items-center gap-space-md">
          <Link href="/practitioner">
            <img alt="SleekCare Logo" className="h-8 w-auto object-contain cursor-pointer" src="/logo.svg" />
          </Link>
          <div className="hidden flex-col sm:flex">
            <div className="flex items-center gap-space-xs">
              <span className="font-bold text-[15px] text-text-ink tracking-tight">SleekCare Clinical Voice OS</span>
              <span className="px-2 py-0.5 rounded-full bg-success-bg text-clinical-success font-semibold text-[11px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
                Station 101 Active
              </span>
            </div>
            <span className="text-[12px] text-on-surface-variant">Practitioner Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-space-lg">
          <ThemeToggle />
          <button 
            onClick={() => setIsMicMuted(!isMicMuted)}
            title="Click to toggle Station Mic"
            className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all shadow-sm cursor-pointer ${
              isMicMuted 
                ? 'bg-error-bg border-clinical-error/30 text-clinical-error' 
                : 'bg-container-tint border-primary/20 text-text-ink'
            }`}
          >
            <span className={`w-2 h-2 rounded-full shadow-sm ${isMicMuted ? 'bg-clinical-error' : 'bg-clinical-success animate-pulse'}`}></span>
            <span className="text-[12px] font-bold uppercase tracking-wider">
              {isMicMuted ? 'Mic Muted' : 'Mic Active'}
            </span>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" 
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-clinical-error"></span>
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

          <div className="flex items-center gap-space-sm pl-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm font-bold text-[13px] border border-primary-container">
              EV
            </div>
          </div>
        </div>
      </header>

      <aside className="fixed left-0 top-16 bottom-0 w-72 bg-card-surface shadow-[0_1px_8px_rgba(7,12,25,0.04)] z-30 hidden lg:flex flex-col justify-between p-gutter-desktop border-r border-surface-container overflow-y-auto">
        <div className="space-y-space-lg">
          <div className="px-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">PRACTITIONER WORKSPACE</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/practitioner');
              const isExactRoot = pathname === '/practitioner' && item.path === '/practitioner';
              const finalIsActive = item.path === '/practitioner' ? isExactRoot : isActive;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                    finalIsActive
                      ? "bg-primary-container text-on-primary font-bold shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className="text-[14px]">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${finalIsActive ? 'bg-white/20 text-white' : 'bg-success-bg text-clinical-success'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 pb-2 border-t border-surface-container mt-4 mb-2">
              <span className="px-2 text-[11px] uppercase tracking-wider text-text-muted font-bold">Quick Workflow</span>
            </div>

            <Link
              href="/practitioner/new-encounter"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">groups</span>
                <span className="text-[14px]">Patient Queue</span>
              </div>
              <span className="bg-warning-bg text-clinical-warning text-[11px] font-semibold px-2 py-0.5 rounded-full">4 waiting</span>
            </Link>
            
            <Link
              href="/practitioner"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium transition-all group"
            >
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              <span className="text-[14px]">Today's Schedule</span>
            </Link>

            <Link
              href="/practitioner/active-encounter"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                <span className="text-[14px]">Live Voice Scribe</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-clinical-success animate-pulse shadow-sm"></span>
            </Link>
          </nav>
        </div>

        <div className="pt-space-md space-y-space-sm border-t border-surface-container mt-4">
          <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
              <span className="text-[11px] font-semibold text-text-ink uppercase">Voice Station Node</span>
            </div>
            <p className="text-[12px] text-on-surface-variant">Room 101 • Sennheiser Clinical Array Online</p>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container-high flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-tertiary-container">lock</span>
            <p className="text-[11px] text-on-surface">HIPAA Compliant • E2E Encrypted</p>
          </div>
        </div>
      </aside>

      <MobileSectionNav items={navItems.map(({path,label}) => ({href:path,label}))} />
      <div className="flex min-h-screen flex-col pt-24 lg:pl-72 lg:pt-16">
        <main className="relative w-full flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
