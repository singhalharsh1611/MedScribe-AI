"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ConsultationSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-72 top-16 bottom-0 w-72 bg-card-surface shadow-[0_1px_8px_rgba(7,12,25,0.04)] z-30 flex flex-col justify-between p-gutter-desktop overflow-y-auto border-r border-surface-container">
      <div className="space-y-space-lg">
        <div className="px-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">VOICE ENGINE 4.2 LLR</p>
        </div>
        <nav className="space-y-1">
          <Link
            href="/doctor/encounter/new"
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
              pathname === "/doctor/encounter/new"
                ? "bg-primary-container text-on-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">mic</span>
              <span className="text-[14px]">Voice Studio</span>
            </div>
            {pathname === "/doctor/encounter/new" && (
              <span className="px-2 py-0.5 rounded-full bg-success-bg text-clinical-success text-[11px] font-semibold">Live</span>
            )}
          </Link>

          <Link
            href="/consultation/voice/listening"
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
              pathname === "/consultation/voice/listening"
                ? "bg-primary-container text-on-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
              <span className="text-[14px]">Live Dictation</span>
            </div>
          </Link>

          <Link
            href="/consultation/voice/processing"
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
              pathname === "/consultation/voice/processing"
                ? "bg-primary-container text-on-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">sync</span>
              <span className="text-[14px]">AI Processing</span>
            </div>
          </Link>

          <Link
            href="/consultation/voice/transcript"
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
              pathname === "/consultation/voice/transcript"
                ? "bg-primary-container text-on-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">description</span>
              <span className="text-[14px]">Transcript Review</span>
            </div>
          </Link>

          <Link
            href="/consultation/review/draft"
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
              pathname === "/consultation/review/draft"
                ? "bg-primary-container text-on-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">prescriptions</span>
              <span className="text-[14px]">Draft Orders</span>
            </div>
            <span className="bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">3 Rx</span>
          </Link>

          <Link
            href="/consultation/review/verify"
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
              pathname === "/consultation/review/verify"
                ? "bg-primary-container text-on-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <span className="text-[14px]">Safety Check</span>
            </div>
            <span className="bg-warning-bg text-clinical-warning text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">1 Flag</span>
          </Link>
        </nav>
      </div>

      <div className="pt-space-md space-y-space-sm border-t border-surface-container mt-4">
        <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
            <span className="text-[11px] font-semibold text-text-ink uppercase">Consultation Node</span>
          </div>
          <p className="text-[12px] text-on-surface-variant">Live Voice Stream Encrypted</p>
        </div>
        <div className="p-2.5 rounded-lg bg-surface-container-high flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-tertiary-container">lock</span>
          <p className="text-[11px] text-on-surface">HIPAA Compliant • E2E Encrypted</p>
        </div>
      </div>
    </aside>
  );
}
