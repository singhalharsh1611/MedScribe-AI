"use client";
import React from "react";
import PharmacySidebar from "@/components/pharmacy/PharmacySidebar";
import PharmacyHeader from "@/components/pharmacy/PharmacyHeader";
import MobileSectionNav from "@/components/shared/MobileSectionNav";

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <PharmacyHeader />
      <PharmacySidebar />
      <MobileSectionNav items={[{href:"/pharmacy/dashboard",label:"Dashboard"},{href:"/pharmacy/queue",label:"Prescription Queue"},{href:"/pharmacy/dispensing-log",label:"Dispensing Log"}]} />
      <div className="flex min-h-screen flex-col pt-24 lg:pl-72 lg:pt-16">
        <main className="w-full flex-1 bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
