"use client";
import React from "react";
import ReceptionSidebar from "@/components/reception/ReceptionSidebar";
import ReceptionHeader from "@/components/reception/ReceptionHeader";

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-app-bg text-on-surface">
      <ReceptionSidebar />
      <div className="pl-72 flex flex-col min-h-screen">
        <ReceptionHeader />
        <main className="pt-16 flex-1 w-full p-8">
          {children}
        </main>
        <footer className="w-full bg-card-surface py-4 border-t border-surface-container mt-auto">
          <div className="w-full px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-text-muted text-[12px]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-clinical-success font-medium">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>SOC 2 Type II Certified
              </span>
              <span className="flex items-center gap-1 text-primary font-medium">
                <span className="material-symbols-outlined text-[16px]">security</span>HIPAA Compliant Vault
              </span>
            </div>
            <div>© 2024 SleekCare Technologies Inc. Metropolitan Health System Deployment.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
