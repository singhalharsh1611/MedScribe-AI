"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function WelcomePage() {
  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 md:px-margin-desktop py-space-xl overflow-hidden">

      {/* â”€â”€ Animated blobs â”€â”€ outside opacity-0 wrapper so they're always visible */}
      <div
        className="animate-blob-1 pointer-events-none absolute"
        style={{
          top: "-10%",
          left: "15%",
          width: "600px",
          height: "480px",
          background: "radial-gradient(ellipse at center, rgba(56,91,197,0.32) 0%, rgba(99,132,241,0.18) 45%, transparent 70%)",
          filter: "blur(80px)",
          borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
        }}
      />
      <div
        className="animate-blob-2 pointer-events-none absolute"
        style={{
          bottom: "-8%",
          right: "10%",
          width: "520px",
          height: "420px",
          background: "radial-gradient(ellipse at center, rgba(0,112,95,0.28) 0%, rgba(72,210,185,0.16) 45%, transparent 70%)",
          filter: "blur(90px)",
          borderRadius: "45% 55% 40% 60% / 60% 40% 55% 45%",
        }}
      />
      <div
        className="animate-blob-3 pointer-events-none absolute"
        style={{
          top: "30%",
          left: "50%",
          marginLeft: "-300px",
          width: "600px",
          height: "600px",
          background: "radial-gradient(ellipse at center, rgba(116,141,215,0.20) 0%, rgba(66,91,162,0.10) 50%, transparent 70%)",
          filter: "blur(110px)",
          borderRadius: "50%",
        }}
      />
      {/* Dark mode blob overrides */}
      <div
        className="animate-blob-1 pointer-events-none absolute dark:opacity-100 opacity-0"
        style={{
          top: "-10%",
          left: "15%",
          width: "600px",
          height: "480px",
          background: "radial-gradient(ellipse at center, rgba(6,182,212,0.25) 0%, rgba(59,130,246,0.15) 45%, transparent 70%)",
          filter: "blur(80px)",
          borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
        }}
      />
      <div
        className="animate-blob-2 pointer-events-none absolute dark:opacity-100 opacity-0"
        style={{
          bottom: "-8%",
          right: "10%",
          width: "520px",
          height: "420px",
          background: "radial-gradient(ellipse at center, rgba(16,185,129,0.25) 0%, rgba(6,182,212,0.15) 45%, transparent 70%)",
          filter: "blur(90px)",
          borderRadius: "45% 55% 40% 60% / 60% 40% 55% 45%",
        }}
      />

      {/* â”€â”€ Card â”€â”€ */}
      <div className="relative w-full max-w-xl mx-auto flex flex-col items-center animate-glide-in opacity-0">
        <div className="w-full bg-card-surface rounded-xl shadow-[0_12px_28px_-6px_rgba(56,91,197,0.08),0_4px_12px_-2px_rgba(7,12,25,0.04)] p-space-lg md:p-space-2xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent-light to-tertiary-container"></div>

          <div className="relative mb-space-lg group">
            <img className="w-auto h-36 object-contain" alt="Waveform Emblem" src="medscribe.svg" />
          </div>

          <div className="flex items-center gap-space-xs text-text-ink mb-space-xs">
            <span className="text-[22px] font-bold tracking-tight text-primary">MedScribe AI</span>
            <span className="w-1 h-4 bg-outline-variant rounded-full mx-1"></span>
            <span className="text-[13px] font-semibold uppercase tracking-wider text-on-surface-variant">MedScribe AI</span>
          </div>

          <h1 className="text-[28px] font-bold text-text-ink tracking-tight mt-space-xs mb-space-sm max-w-md">
            Next-Generation Medical Scribe AI
          </h1>

          <p className="text-[16px] text-on-surface-variant max-w-lg mb-space-xl leading-relaxed">
            Streamline patient consultations, automated real-time medical transcription, and effortless clinical documentation.
          </p>

          <div className="w-full max-w-xs h-10 bg-surface-container-low rounded-lg p-space-xs flex items-center justify-between mb-space-xl px-space-md">
            <div className="flex items-center gap-1 h-full w-full justify-between">
              {[2, 4, 6, 7, 4, 6, 8, 5, 3, 6, 4, 2].map((h, i) => (
                <span key={i} className="w-1 bg-accent-light rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 80}ms` }}></span>
              ))}
            </div>
            <span className="text-[11px] font-semibold text-text-muted ml-space-sm whitespace-nowrap">Voice Engine Ready</span>
          </div>

          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-space-md">
            <Link href="/register" className="w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center gap-space-xs px-space-lg py-3 bg-primary-container hover:bg-accent-dark text-card-surface font-bold text-[18px] rounded-lg shadow-sm transition-all duration-200 group no-underline">
              <span>Get Started</span>
              <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-0.5">arrow_forward</span>
            </Link>
            <Link href="/login" className="w-full sm:w-auto min-w-[140px] inline-flex items-center justify-center gap-space-2xs px-space-lg py-3 bg-surface-container hover:bg-surface-container-high text-text-ink font-bold text-[15px] rounded-lg shadow-sm transition-all duration-200 no-underline">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">lock_open</span>
              <span>Login</span>
            </Link>
          </div>

          <div className="w-full mt-space-2xl pt-space-md flex items-center justify-center">
            <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-low text-text-muted">
              <span className="material-symbols-outlined text-[16px] text-clinical-success" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <span className="text-[11px] font-semibold tracking-wide text-on-surface-variant">End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

