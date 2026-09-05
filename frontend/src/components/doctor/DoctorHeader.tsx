"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const LOGO_URL = "https://lh3.googleusercontent.com/aida/AEtjO1XkMLN23noarFOAg-7wBsrUX65ovyYdbbJpjRMqdWAYR7MwmwWWQ-7Tp8KW3HPEjbBD_jiVgmj5UbtO1tPXRpyw6OUCEDiEJQF5piaF3i0IgVgdrQxDQ4-z0aSSX9my-k0g-pCMIxOL2EsKI2_KfKDqB84y9LC8uMToker-YKVStySsY3TOLa8fNSBKcAflBI92M_xIsR0tnSg5BKuMyuCdLVd9lhMweOlxEFMlZFnSRAhev6mPbVoVG2w";

export default function DoctorHeader() {
  const { currentDoctor, currentClinic, queue } = useApp();
  const waitingCount = queue.filter((p: any) => p.status === "waiting").length;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(7,12,25,0.04)] z-40 flex items-center justify-between px-gutter-desktop">
      <div className="flex items-center gap-space-md">
        <Link href="/doctor/dashboard">
          <img alt="SleekCare Logo" className="h-8 w-auto object-contain cursor-pointer" src={LOGO_URL} />
        </Link>
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs">
            <span className="font-bold text-[15px] text-text-ink tracking-tight">SleekCare Clinical Voice OS</span>
            <span className="px-2 py-0.5 rounded-full bg-success-bg text-clinical-success font-semibold text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
              Live Voice Station Active
            </span>
          </div>
          <span className="text-[12px] text-on-surface-variant">Doctor Workspace › {currentClinic?.name ?? "—"}</span>
        </div>
      </div>

      <div className="flex items-center gap-space-lg">
        <div className="hidden md:flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface text-[14px]">
          <span className="material-symbols-outlined text-primary text-[18px]">local_hospital</span>
          <span>{currentClinic?.name ?? "Select Clinic"}</span>
          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">expand_more</span>
        </div>
        <ThemeToggle />
        <button className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" title="Notifications">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-clinical-error text-on-error font-semibold text-[10px] flex items-center justify-center">2</span>
        </button>
        <div className="flex items-center gap-space-sm pl-2">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="font-bold text-[15px] text-text-ink leading-snug">{currentDoctor?.name ?? "Doctor"}</span>
            <span className="text-[12px] text-on-surface-variant">{currentDoctor?.role ?? "Physician"}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
