import { ReactNode } from "react";
import DoctorHeader from "@/components/doctor/DoctorHeader";
import DoctorSidebar from "@/components/doctor/DoctorSidebar";
import MobileSectionNav from "@/components/shared/MobileSectionNav";
import RoleGuard from "@/components/auth/RoleGuard";

export default function ConsultationLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["doctor", "admin"]}>
    <div className="min-h-screen bg-app-bg text-on-surface">
      <DoctorHeader />
      <DoctorSidebar />
      <MobileSectionNav items={[{href:"/doctor/dashboard",label:"Dashboard"},{href:"/consultation/voice/listening",label:"Current consultation"},{href:"/doctor/patients",label:"Patients"}]} />
      <div className="min-h-screen flex flex-col lg:pl-72">
        <main className="w-full flex-1 px-4 pb-space-lg pt-24 sm:px-6 lg:px-margin-desktop lg:pt-16">
          {children}
        </main>
      </div>
    </div>
    </RoleGuard>
  );
}
