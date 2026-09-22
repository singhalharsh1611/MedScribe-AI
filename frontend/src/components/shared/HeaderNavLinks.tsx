
"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getUser } from "@/lib/api";

export default function HeaderNavLinks() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  // Only show the context switcher if the user has dual rights (Clinic Admin)
  if (!user || user.role !== "admin") return null;

  return (
    <div className="hidden md:flex items-center gap-2 px-2 border-l border-surface-container ml-2">
      <button 
        onClick={() => router.push("/admin/overview")}
        className={`px-3 py-1.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-colors ${
          pathname.startsWith("/admin") 
            ? "bg-primary-container text-primary-dark" 
            : "text-text-muted hover:bg-surface-container hover:text-text-ink"
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
        Admin Panel
      </button>
      <button 
        onClick={() => router.push("/doctor/dashboard")}
        className={`px-3 py-1.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-colors ${
          pathname.startsWith("/doctor") 
            ? "bg-primary-container text-primary-dark" 
            : "text-text-muted hover:bg-surface-container hover:text-text-ink"
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">stethoscope</span>
        Doctor Panel
      </button>
    </div>
  );
}

