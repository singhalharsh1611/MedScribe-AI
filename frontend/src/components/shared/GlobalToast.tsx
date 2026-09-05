"use client";
import { useApp } from "@/context/AppContext";

export default function GlobalToast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-5 py-3 bg-text-ink text-card-surface rounded-xl shadow-2xl animate-fade-in-up text-[14px] font-semibold max-w-[480px] w-full mx-4">
      <span className="material-symbols-outlined text-[20px] text-clinical-success shrink-0">
        {toast.icon || "check_circle"}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}
