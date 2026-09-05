"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const LOGO_URL = "logo.svg";

export default function AuthHeader() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (paths: string[]) => paths.includes(pathname);

  return (
    <header className="fixed top-0 w-full z-50 bg-card-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(7,12,25,0.04)]">
      <div className="h-16 w-full px-4 md:px-margin-desktop flex items-center justify-between">
        <Link href="/" className="flex items-center gap-space-md text-inherit no-underline">
          <img alt="SleekCare Brand Logo" className="h-12 w-auto object-contain" src={LOGO_URL} />
          <span className="font-bold text-[18px] text-text-ink tracking-tight hidden sm:inline">SleekCare Voice OS</span>
          <span className="h-4 w-px bg-outline-variant hidden md:inline"></span>
          <span className="text-[13px] font-semibold text-on-surface-variant hidden lg:inline">Doctor Authentication & Onboarding</span>
        </Link>

        <div className="flex items-center gap-space-md">
          
          
          <ThemeToggle />

        </div>
      </div>
    </header>
  );
}
