"use client";
import React from "react";
import PharmacySidebar from "@/components/pharmacy/PharmacySidebar";
import PharmacyHeader from "@/components/pharmacy/PharmacyHeader";

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PharmacySidebar />
      <div className="pl-64">
        <PharmacyHeader />
        <main className="w-full pt-16 bg-background min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
