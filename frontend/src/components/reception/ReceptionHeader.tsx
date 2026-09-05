"use client";
import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ReceptionHeader() {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-card-surface/90 backdrop-blur-xl z-40 border-b border-surface-container shadow-sm flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold shadow-sm">
          <span className="material-symbols-outlined text-[20px]">sound_detection_dog_barking</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[14px] text-text-ink">SleekCare Clinical Voice OS</span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary">location_city</span>
            <span className="text-[11px] text-text-muted font-medium">Metropolitan Health Medical Center</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-container-tint text-primary text-[12px] font-bold">
          <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
          <span>Station 2 — Main Desk Active</span>
        </div>
        <ThemeToggle />
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors relative cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-clinical-error"></span>
        </button>
        <div className="flex items-center gap-2.5 pl-2 border-l border-surface-container">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[12px] font-bold text-text-ink">Sarah Jenkins, RN</span>
            <span className="text-[11px] text-text-muted font-medium">Desk Lead</span>
          </div>
        </div>
      </div>
    </header>
  );
}
