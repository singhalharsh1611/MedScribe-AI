
import { ReactNode } from "react";
import ReceptionHeader from "@/components/reception/ReceptionHeader";
import ReceptionSidebar from "@/components/reception/ReceptionSidebar";
import MobileSectionNav from "@/components/shared/MobileSectionNav";
import RoleGuard from "@/components/auth/RoleGuard";

export default function ReceptionLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["receptionist", "compounder"]}>
    <div className="min-h-screen bg-app-bg">
      <ReceptionHeader />
      <ReceptionSidebar />
      <MobileSectionNav items={[{href:"/reception/dashboard",label:"Dashboard"},{href:"/reception/queue",label:"Queue"},{href:"/reception/directory",label:"Patient Directory"},{href:"/reception/appointments",label:"Appointments"}]} />
      <div className="min-h-screen pt-24 flex flex-col lg:pl-72 lg:pt-16">
        <main className="flex flex-1 flex-col gap-space-lg p-4 sm:p-6 lg:p-gutter-desktop">
          {children}
        </main>
      </div>
    </div>
    </RoleGuard>
  );
}

