"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function PharmacyHeader() {
  const { showToast } = useApp();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-card-surface/90 backdrop-blur-xl z-40 shadow-sm border-b border-surface-container">
      <div className="h-16 w-full px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">domain</span>
            <span className="text-[14px] text-text-ink font-bold">
              Metropolitan Health Medical Center
            </span>
          </div>
          <span className="h-4 w-px bg-surface-container-highest"></span>
          <div className="flex items-center gap-2 bg-success-bg px-2 py-1 rounded shadow-sm border border-clinical-success/20">
            <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
            <span className="text-[11px] text-clinical-success font-bold">
              Voice Engine Online
            </span>
          </div>
          <div className="flex items-center gap-2 bg-container-tint px-2 py-1 rounded shadow-sm border border-primary/20">
            <span className="text-[11px] text-primary font-bold">Rx Node #4</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast("Voice trigger active: 'Listening for batch command...'")}
              className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-text-muted hover:bg-surface-container hover:text-primary transition-colors cursor-pointer border border-surface-container shadow-sm"
              title="Voice Engine"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
            <button
              onClick={() => showToast("All 12 compounding stations operational. No critical system alerts.", "notifications_active")}
              className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-text-muted hover:bg-surface-container transition-colors cursor-pointer border border-surface-container shadow-sm"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
          </div>
          <div className="flex items-center gap-3 pl-2 border-l border-surface-container">
            <div className="flex flex-col text-right">
              <span className="text-[14px] text-text-ink font-bold leading-tight">
                Marcus Vance, CPhT
              </span>
              <span className="text-[11px] font-medium text-text-muted">Staff Compounder</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
