"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.superAdmin.login(username, password);
      localStorage.setItem("superAdmin", JSON.stringify(data.admin));
      router.push("/superadmin/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-glide-in opacity-0">
        <div className="bg-card-surface rounded-2xl shadow-xl p-8 border border-surface-container">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[24px]">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-text-ink">SleekCare</h1>
              <p className="text-[12px] text-text-muted font-semibold uppercase tracking-wider">Platform Administration</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-bg border border-clinical-error/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-clinical-error text-[18px]">error</span>
              <span className="text-[13px] text-clinical-error font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-text-ink">Admin Username</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
                <input
                  type="text" required value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-surface-container-lowest text-text-ink text-[14px] pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="admin"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-text-ink">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest text-text-ink text-[14px] pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="••••••••••"
                />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-accent-dark text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 mt-2">
              {loading ? <span className="material-symbols-outlined animate-spin text-[20px]">sync</span> : <>
                <span>Access Platform</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>}
            </button>
          </form>

          <p className="text-center text-[12px] text-text-muted mt-6">
            This portal is restricted to SleekCare platform administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}
