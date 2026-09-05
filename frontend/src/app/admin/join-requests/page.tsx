"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getUser } from "@/lib/api";

export default function JoinRequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [actionId, setActionId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "admin") { router.push("/login"); return; }
    setUser(u);
    if (u.clinic_id) loadRequests(u.clinic_id);
    else setLoading(false);
  }, []);

  useEffect(() => { if (user?.clinic_id) loadRequests(user.clinic_id); }, [filter]);

  const loadRequests = async (clinicId: number) => {
    setLoading(true);
    try {
      const data = await api.joinRequests.list(clinicId, filter !== "all" ? filter : undefined);
      setRequests(data.requests);
    } catch {}
    setLoading(false);
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setActionId(id);
    try {
      await api.joinRequests.review(id, action, user.id);
      setToast(action === "approve" ? "Doctor approved and added to clinic ✓" : "Request rejected");
      setTimeout(() => setToast(""), 3000);
      loadRequests(user.clinic_id);
    } catch (e: any) { setToast("Error: " + e.message); }
    setActionId(null);
  };

  const specialtyLabels: Record<string, string> = {
    internal_cardio: "Internal Medicine / Cardiology",
    neuro_surg: "Neurological Surgery",
    emergency_med: "Emergency & Critical Trauma",
    pediatrics_gen: "General Pediatrics",
    oncology_med: "Medical Oncology / Hematology",
    orthopedic: "Orthopedic Surgery",
    family_med: "Family & Ambulatory Practice",
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="bg-card-surface border-b border-surface-container px-6 py-4 flex items-center gap-4">
        <Link href="/admin/overview" className="text-text-muted hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-[16px] font-bold text-text-ink">Join Requests</h1>
      </header>

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-card-surface border border-outline-variant rounded-xl px-4 py-3 shadow-xl flex items-center gap-2 animate-glide-in">
          <span className="material-symbols-outlined text-clinical-success text-[18px]">check_circle</span>
          <span className="text-[13px] font-semibold text-text-ink">{toast}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex gap-2 mb-4">
          {["pending","approved","rejected","all"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-colors ${filter === f ? "bg-primary text-white" : "bg-surface-container text-text-muted hover:bg-surface-container-high"}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span></div>
        ) : requests.length === 0 ? (
          <div className="bg-card-surface rounded-xl border border-surface-container p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline">group_add</span>
            <p className="text-text-muted mt-3 font-semibold">No {filter} requests</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((req: any) => (
              <div key={req.id} className="bg-card-surface rounded-xl border border-surface-container p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary shrink-0">
                  {req.doctor_name?.[0] || "D"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-ink text-[14px]">{req.doctor_name}</p>
                  <p className="text-[12px] text-text-muted">{req.phone}</p>
                  <p className="text-[12px] text-text-muted">{specialtyLabels[req.specialty] || req.specialty}</p>
                  {req.npi && <p className="text-[11px] text-outline mt-0.5">NPI: {req.npi}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      req.verification_status === "approved" ? "bg-success-bg text-clinical-success" :
                      req.verification_status === "pending" ? "bg-warning-bg text-clinical-warning" :
                      "bg-error-bg text-clinical-error"}`}>
                      Platform: {req.verification_status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-1 rounded-full text-[11px] font-bold capitalize ${
                    req.status === "approved" ? "bg-success-bg text-clinical-success" :
                    req.status === "rejected" ? "bg-error-bg text-clinical-error" :
                    "bg-warning-bg text-clinical-warning"}`}>
                    {req.status}
                  </span>
                  {req.status === "pending" && (
                    <>
                      <button onClick={() => handleAction(req.id, "approve")} disabled={actionId === req.id}
                        className="px-3 py-1.5 rounded-lg bg-clinical-success/10 text-clinical-success border border-clinical-success/30 text-[12px] font-bold hover:bg-clinical-success/20 transition-colors disabled:opacity-50">
                        {actionId === req.id ? "..." : "Approve"}
                      </button>
                      <button onClick={() => handleAction(req.id, "reject")} disabled={actionId === req.id}
                        className="px-3 py-1.5 rounded-lg bg-error-bg text-clinical-error border border-clinical-error/30 text-[12px] font-bold hover:bg-clinical-error/10 transition-colors disabled:opacity-50">
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
