import { ReactNode } from "react";
import DoctorHeader from "@/components/doctor/DoctorHeader";
import ConsultationSidebar from "@/components/consultation/ConsultationSidebar";

export default function ConsultationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-app-bg text-on-surface">
      <ConsultationSidebar />
      <div className="pl-64">
        <DoctorHeader />
        <main className="w-full pt-16 min-h-screen px-margin-desktop py-space-lg">
          {children}
        </main>
      </div>
    </div>
  );
}
