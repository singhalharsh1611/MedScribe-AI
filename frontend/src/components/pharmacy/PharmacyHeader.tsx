
"use client";
import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import HeaderProfileDropdown from "@/components/shared/HeaderProfileDropdown";
import HeaderClinicName from "@/components/shared/HeaderClinicName";
import HeaderNavLinks from "@/components/shared/HeaderNavLinks";

export default function PharmacyHeader() {
  const { showToast } = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(7,12,25,0.04)] z-40 flex items-center justify-between px-3 sm:px-6 lg:px-gutter-desktop border-b border-surface-container">
      <div className="flex items-center gap-space-md">
        <Link href="/pharmacy/dashboard">
          <img alt="SleekCare Logo" className="h-8 w-auto object-contain cursor-pointer" src="/logo.svg" />
        </Link>
        <div className="hidden flex-col sm:flex">
          <div className="flex items-center gap-space-xs">
            <span className="font-bold text-[15px] text-text-ink tracking-tight">SleekCare Clinical Voice OS</span>
            <span className="px-2 py-0.5 rounded-full bg-success-bg text-clinical-success font-semibold text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
              Rx Node #4 Online
            </span>
          </div>
          <span className="text-[12px] text-on-surface-variant"><HeaderClinicName defaultText="Pharmacy Workspace" /></span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-space-lg">
        <HeaderNavLinks />
        <ThemeToggle />
        <div className="hidden items-center gap-2 sm:flex">
          <button 
            onClick={() => showToast("Voice trigger active: 'Listening for batch command...'")}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" 
            title="Voice Engine"
          >
            <span className="material-symbols-outlined text-[22px]">mic</span>
          </button>
          <button 
            onClick={() => showToast("All 12 compounding stations operational. No critical system alerts.", "notifications_active")}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" 
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-clinical-error"></span>
          </button>
        </div>
        <div className="flex items-center gap-space-sm pl-2">
          <HeaderProfileDropdown />
        </div>
      </div>
    </header>
  );
}

