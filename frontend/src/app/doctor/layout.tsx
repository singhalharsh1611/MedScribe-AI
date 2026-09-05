import { ReactNode } from "react";
import DoctorHeader from "@/components/doctor/DoctorHeader";
import DoctorSidebar from "@/components/doctor/DoctorSidebar";

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-app-bg">
      <DoctorHeader />
      <DoctorSidebar />
      <div className="pt-16 pl-72 min-h-screen">
        <main className="p-gutter-desktop flex flex-col gap-space-lg">
          {children}
        </main>
        <footer className="w-full bg-card-surface py-space-sm px-gutter-desktop shadow-[0_1px_8px_rgba(7,12,25,0.04)]">
          <div className="flex flex-col sm:flex-row items-center justify-between text-on-surface-variant text-[12px] gap-2">
            <span>© 2025 SleekCare Health Systems Inc. Clinical Voice Architecture.</span>
            <span>BAA Executed • SOC 2 Type II • HIPAA Compliant</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
