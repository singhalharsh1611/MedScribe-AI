"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ConsultationSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card-surface shadow-sm z-30 flex flex-col justify-between py-space-md border-r border-surface-container overflow-y-auto">
      <div className="flex flex-col gap-space-md px-space-xs">
        <div className="px-space-sm pt-space-xs flex items-center gap-space-xs">
          <div className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></div>
          <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider">Voice Engine 4.2 LLR</span>
        </div>
        <nav className="flex flex-col gap-1 px-space-xs">
          <Link
            href="/doctor/encounter/new"
            className={`flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors text-[14px] ${
              pathname === "/doctor/encounter/new" ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-high hover:text-text-ink"
            }`}
          >
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[20px]">mic</span>
              <span>Voice Studio</span>
            </div>
            {pathname === "/doctor/encounter/new" && (
              <div className="flex items-center gap-1 bg-success-bg px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-clinical-success"></span>
                <span className="text-[11px] font-bold text-clinical-success uppercase">Live</span>
              </div>
            )}
          </Link>

          <Link
            href="/consultation/voice/listening"
            className={`flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors text-[14px] ${
              pathname === "/consultation/voice/listening" ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-high hover:text-text-ink"
            }`}
          >
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
              <span>Live Dictation</span>
            </div>
          </Link>

          <Link
            href="/consultation/voice/processing"
            className={`flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors text-[14px] ${
              pathname === "/consultation/voice/processing" ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-high hover:text-text-ink"
            }`}
          >
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[20px]">sync</span>
              <span>AI Processing</span>
            </div>
          </Link>

          <Link
            href="/consultation/voice/transcript"
            className={`flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors text-[14px] ${
              pathname === "/consultation/voice/transcript" ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-high hover:text-text-ink"
            }`}
          >
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[20px]">description</span>
              <span>Transcript Review</span>
            </div>
          </Link>

          <Link
            href="/consultation/review/draft"
            className={`flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors text-[14px] ${
              pathname === "/consultation/review/draft" ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-high hover:text-text-ink"
            }`}
          >
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[20px]">prescriptions</span>
              <span>Draft Orders</span>
            </div>
            <span className="bg-primary-fixed text-on-primary-fixed text-[11px] font-bold px-2 py-0.5 rounded-full">3 Rx</span>
          </Link>

          <Link
            href="/consultation/review/verify"
            className={`flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors text-[14px] ${
              pathname === "/consultation/review/verify" ? "bg-primary-container text-on-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-high hover:text-text-ink"
            }`}
          >
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <span>Safety Check</span>
            </div>
            <span className="bg-warning-bg text-clinical-warning text-[11px] font-bold px-2 py-0.5 rounded-full">1 Flag</span>
          </Link>
        </nav>
      </div>

      <div className="px-space-sm">
        <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1 border border-surface-container">
          <div className="flex items-center gap-space-xs text-clinical-success">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="text-[11px] font-bold uppercase tracking-wider">HIPAA Protected</span>
          </div>
          <p className="text-[12px] text-text-muted leading-tight">256-Bit TLS Node · Active Hardware Token Encrypted</p>
        </div>
      </div>
    </aside>
  );
}
