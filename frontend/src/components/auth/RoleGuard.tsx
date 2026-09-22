"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, clearUser, getUser, setUser } from "@/lib/api";

const homeForRole = (user: any) => {
  if (user?.pin_reset_required) return "/reset-pin";
  if (user?.verification_status === "pending" || user?.verification_status === "rejected" || !user?.clinic_id) return "/register";
  if (user?.role === "admin") return "/admin/overview";
  if (user?.role === "receptionist" || user?.role === "compounder") return "/reception/dashboard";
  if (user?.role === "pharmacist") return "/pharmacy/dashboard";
  return "/doctor/dashboard";
};

export default function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const allowedRolesKey = allowedRoles.join("|");

  useEffect(() => {
    const storedUser = getUser();
    if (!storedUser?.id) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    let cancelled = false;
    api.auth.me(Number(storedUser.id))
      .then((response: any) => {
        if (cancelled) return;
        const currentUser = { ...storedUser, ...response.user };
        setUser(currentUser);
        if (!allowedRolesKey.split("|").includes(currentUser.role)) {
          router.replace(homeForRole(currentUser));
          return;
        }
        setAuthorized(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearUser();
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      });

    return () => { cancelled = true; };
  }, [allowedRolesKey, pathname, router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-text-muted">
          <span className="material-symbols-outlined animate-spin text-[22px] text-primary">sync</span>
          Checking access...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
