
"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import HeaderProfileDropdown from "@/components/shared/HeaderProfileDropdown";
import HeaderClinicName from "@/components/shared/HeaderClinicName";
import HeaderNavLinks from "@/components/shared/HeaderNavLinks";

const LOGO_URL = "/logo.svg";

export default function DoctorHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(7,12,25,0.04)] z-40 flex items-center justify-between px-3 sm:px-6 lg:px-gutter-desktop border-b border-surface-container">
      <div className="flex items-center gap-space-md">
        <Link href="/doctor/dashboard">
          <img alt="SleekCare Logo" className="h-8 w-auto object-contain cursor-pointer" src="/logo.svg" />
        </Link>
        <div className="hidden flex-col sm:flex">
          <div className="flex items-center gap-space-xs">
            <span className="font-bold text-[15px] text-text-ink tracking-tight">SleekCare Clinical Voice OS</span>
          </div>
          <span className="text-[12px] text-on-surface-variant"><HeaderClinicName defaultText="Doctor Workspace" /></span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-space-lg">
        <HeaderNavLinks />
        <ThemeToggle />
        <div className="flex items-center gap-space-sm pl-2">
          <HeaderProfileDropdown />
        </div>
      </div>
    </header>
  );
}
