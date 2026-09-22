
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, getUser, clearUser } from "@/lib/api";

export default function HeaderProfileDropdown() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } finally {
      clearUser();
      router.replace("/login");
      router.refresh();
    }
  };

  const roleLabels: Record<string, string> = {
    superadmin: "Platform Admin",
    admin: "Clinic Admin",
    doctor: "Physician",
    receptionist: "Reception Desk",
    pharmacist: "Pharmacist",
  };

  if (!user) return <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse"></div>;

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-3 cursor-pointer hover:bg-surface-container-low p-1 pr-2 rounded-xl transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[13px] font-bold text-text-ink leading-tight">{user.name}</span>
          <span className="text-[11px] font-medium text-text-muted capitalize">{roleLabels[user.role] || user.role}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm font-bold text-[14px]">
          {user.name?.charAt(0).toUpperCase()}
        </div>
      </div>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className="absolute right-0 top-full mt-2 w-48 bg-card-surface border border-surface-container shadow-lg rounded-xl overflow-hidden z-50 animate-glide-in">
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-clinical-error hover:bg-error-bg flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span> Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

