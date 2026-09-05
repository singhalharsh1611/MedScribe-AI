"use client";
import React from "react";
import Link from "next/link";

export default function PharmacyDispensingLogPage() {
  return (
    <div className="p-12 max-w-4xl mx-auto space-y-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-container-tint text-primary flex items-center justify-center mx-auto shadow-sm border border-primary/20">
        <span className="material-symbols-outlined text-[40px]">fact_check</span>
      </div>
      <h1 className="text-[32px] font-bold text-text-ink tracking-tight">Daily Dispensing Log</h1>
      <p className="text-[16px] font-medium text-text-muted max-w-xl mx-auto leading-relaxed">
        Immutable HL7 audit ledger for regulatory and compliance tracking.
      </p>
      <div className="pt-6 flex items-center justify-center gap-4">
        <Link
          href="/pharmacy/dashboard"
          className="px-6 py-3 rounded-lg bg-primary text-on-primary font-bold hover:bg-accent-dark transition-colors shadow-sm cursor-pointer"
        >
          Return to Dashboard
        </Link>
        <Link
          href="/pharmacy/queue"
          className="px-6 py-3 rounded-lg bg-surface-container-low border border-surface-container hover:bg-surface-container text-text-ink font-bold transition-colors shadow-sm cursor-pointer"
        >
          View Rx Queue
        </Link>
      </div>
    </div>
  );
}
