import { ReactNode } from "react";
import DoctorHeader from "@/components/doctor/DoctorHeader";
import DoctorSidebar from "@/components/doctor/DoctorSidebar";
import MobileSectionNav from "@/components/shared/MobileSectionNav";
import RoleGuard from "@/components/auth/RoleGuard";

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["doctor", "admin"]}>
    <div className="min-h-screen bg-app-bg">
      <DoctorHeader />
      <DoctorSidebar />
      <MobileSectionNav items={[{href:"/doctor/dashboard",label:"Dashboard"},{href:"/doctor/queue",label:"Queue"},{href:"/doctor/patients",label:"Patients"},{href:"/doctor/schedule",label:"Schedule"}]} />
      <div className="min-h-screen pt-24 flex flex-col lg:pl-72 lg:pt-16">
        <main className="flex flex-1 flex-col gap-space-lg p-4 sm:p-6 lg:p-gutter-desktop">
          {children}
        </main>
        <footer className="w-full bg-card-surface py-space-sm px-gutter-desktop shadow-[0_1px_8px_rgba(7,12,25,0.04)] mt-auto border-t border-surface-container">
          <div className="flex flex-col sm:flex-row items-center justify-between text-on-surface-variant text-[12px] gap-2">
            <span>© 2025 MedScribe AI.</span>
            <span>BAA Executed • SOC 2 Type II • HIPAA Compliant</span>
          </div>
        </footer>
      </div>
    </div>
    </RoleGuard>
  );
}
