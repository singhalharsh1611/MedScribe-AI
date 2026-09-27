"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderProfileDropdown from "@/components/shared/HeaderProfileDropdown";
import HeaderClinicName from "@/components/shared/HeaderClinicName";
import HeaderNavLinks from "@/components/shared/HeaderNavLinks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api, getUser } from "@/lib/api";
import MobileSectionNav from "@/components/shared/MobileSectionNav";
import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [usersCount, setUsersCount] = useState<number>(0);
  const [joinRequestsCount, setJoinRequestsCount] = useState<number>(0);

  useEffect(() => {
    const user = getUser();
    if (user?.clinic_id) {
      Promise.all([
        api.clinics.doctors(user.clinic_id),
        api.joinRequests.list(user.clinic_id, 'pending')
      ]).then(([doctorsRes, jrRes]) => {
        if (doctorsRes.doctors) setUsersCount(doctorsRes.doctors.length);
        if (jrRes.requests) setJoinRequestsCount(jrRes.requests.length);
      }).catch(() => {
        setUsersCount(0);
        setJoinRequestsCount(0);
      });
    }
  }, []);

  // If we are in the setup flow, don't wrap with this layout's sidebar and header
  if (pathname.startsWith("/admin/setup")) {
    return <RoleGuard allowedRoles={["admin"]}>{children}</RoleGuard>;
  }

  const navItems = [
    { path: '/admin/overview', label: 'Overview', icon: 'dashboard' },
    { path: '/admin/patients', label: 'Patient Directory', icon: 'folder_shared' },
    { path: '/admin/users', label: 'Users & Staff', icon: 'group', badge: usersCount.toString(), badgeType: 'info' },
    { path: '/admin/join-requests', label: 'Join Requests', icon: 'person_add', badge: `${joinRequestsCount} New`, badgeType: 'warning' },
    { path: '/admin/clinic-settings', label: 'Clinic Settings', icon: 'tune' },
    { path: '/admin/audit-log', label: 'Audit Log', icon: 'receipt_long' },
  ];

  return (
    <RoleGuard allowedRoles={["admin"]}>
    <div className="min-h-screen bg-app-bg">
      <header className="fixed top-0 left-0 right-0 h-16 bg-card-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(7,12,25,0.04)] z-40 flex items-center justify-between px-3 sm:px-6 lg:px-gutter-desktop border-b border-surface-container">
        <div className="flex items-center gap-space-md">
          <Link href="/admin/overview">
            <img alt="MedScribe AI Logo" className="h-8 w-auto object-contain cursor-pointer" src="/medscribe.svg" />
          </Link>
          <div className="hidden flex-col sm:flex">
            <div className="flex items-center gap-space-xs">
              <span className="font-bold text-[15px] text-text-ink tracking-tight">MedScribe AI</span>
              <span className="px-2 py-0.5 rounded-full bg-container-tint text-primary font-semibold text-[11px] flex items-center gap-1 border border-primary/20">
                Administration Node
              </span>
            </div>
            <span className="text-[12px] text-on-surface-variant"><HeaderClinicName defaultText="Admin Console" /></span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-space-lg">
          <HeaderNavLinks />
          <ThemeToggle />
          <div className="flex items-center gap-space-sm pl-2">
            <HeaderProfileDropdown />
          </div>
        </div>
      </header>

      <aside className="fixed left-0 top-16 bottom-0 w-72 bg-card-surface shadow-[0_1px_8px_rgba(7,12,25,0.04)] z-30 hidden lg:flex flex-col justify-between p-gutter-desktop overflow-y-auto border-r border-surface-container">
        <div className="space-y-space-lg">
          <div className="px-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">ADMIN CONSOLE</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                    isActive
                      ? "bg-primary-container text-on-primary font-bold shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className="text-[14px]">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.badgeType === "warning"
                          ? "bg-warning-bg text-clinical-warning"
                          : "bg-success-bg text-clinical-success"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <MobileSectionNav items={navItems.map(({path,label}) => ({href:path,label}))} />
      <div className="flex min-h-screen flex-col pt-24 lg:pl-72 lg:pt-16">
        <main className="relative mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 lg:p-space-xl">
          {children}
        </main>
      </div>
    </div>
    </RoleGuard>
  );
}
