"use client";
import { useApp } from "@/context/AppContext";

export default function GlobalToast() {
  const { toast } = useApp();
  if (!toast) return null;

  const isError = toast.type === "error";
  const iconName = toast.icon || (isError ? "error" : "check_circle");
  const iconColor = isError ? "text-clinical-error" : "text-clinical-success";
  const bgColor = isError ? "bg-error-bg border-clinical-error/30" : "bg-card-surface border-surface-container";

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-5 py-4 ${bgColor} border rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in max-w-[400px] w-full mx-4`}>
      <span className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${iconColor}`}>
        {iconName}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        {toast.title && <span className="font-bold text-[14px] text-text-ink">{toast.title}</span>}
        {(toast.description || toast.message) && (
          <span className={`text-[13px] ${toast.title ? "text-text-muted" : "font-bold text-text-ink"}`}>
            {toast.description || toast.message}
          </span>
        )}
      </div>
    </div>
  );
}
