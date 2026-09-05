"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { api, getUser } from "@/lib/api";

export default function AdminClinicSettingsPage() {
  const { showToast: addToast } = useApp();
  const [pinPolicy, setPinPolicy] = useState(true);
  const [archivePolicy, setArchivePolicy] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [clinic, setClinic] = useState<any>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", type: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) return;
    setUser(u);
    if (u.clinic_id) {
      api.clinics.get(u.clinic_id).then(d => {
        setClinic(d.clinic);
        setForm({ name: d.clinic.name || "", phone: d.clinic.phone || "", email: d.clinic.email || "", type: d.clinic.type || "" });
      }).catch(() => {});
    }
  }, []);

  const handleSave = async () => {
    if (!user?.clinic_id) { addToast({ title: 'Not assigned to a clinic', type: 'error' }); return; }
    setSaving(true);
    try {
      await api.clinics.update(user.clinic_id, form);
      addToast({ title: 'Settings Saved', description: 'Clinic settings updated successfully', type: 'success' });
    } catch (e: any) {
      addToast({ title: 'Save failed', description: e.message, type: 'error' });
    }
    setSaving(false);
  };

  return (
    <div className="p-10 xl:p-14 max-w-7xl mx-auto w-full flex flex-col gap-10 relative">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-primary uppercase tracking-widest font-bold">Workspace Administration</span>
            <span className="w-1.5 h-1.5 rounded-full bg-surface-container-highest"></span>
            <span className="text-[12px] text-clinical-success flex items-center gap-1.5 font-bold bg-success-bg px-2.5 py-0.5 rounded-sm border border-clinical-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-clinical-success"></span>
              Sync Active
            </span>
          </div>
          <h1 className="text-[32px] font-bold text-text-ink tracking-tight">Clinic Settings & Practice Profile</h1>
          <p className="text-[15px] font-medium text-text-muted">
            Configure clinic identity, practice contact info, and basic operational settings for Metropolitan Health Medical Center.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-surface-container-lowest border border-surface-container px-6 py-4 rounded-xl shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-container-tint border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[28px]">verified</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Federated Health Profile</span>
            <span className="text-[16px] font-bold text-text-ink">NPI: ORG-88492019</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-card-surface border border-surface-container rounded-xl shadow-sm p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[24px]">apartment</span>
                <h2 className="text-[20px] font-bold text-text-ink">Clinic Identity & Location</h2>
              </div>
              <span className="text-[11px] bg-container-tint border border-primary/20 text-primary px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm">Core Entity</span>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-text-ink uppercase tracking-wider">Clinic Legal Name</label>
                <input className="w-full bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary shadow-sm" defaultValue="Metropolitan Health Medical Center"/>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-text-ink uppercase tracking-wider">Practice Classification</label>
                <input className="w-full bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary shadow-sm" defaultValue="Multi-Specialty Ambulatory & Surgical Outpatient Clinic"/>
              </div>
              <div className="bg-surface-container-lowest border border-surface-container rounded-xl p-5 flex flex-col gap-2 shadow-inner">
                <span className="text-[16px] font-bold text-text-ink">742 Evergreen Terrace, Suite 100</span>
                <span className="text-[14px] font-medium text-text-muted">Metro District, NY 10024</span>
                <div className="w-full h-40 rounded-xl bg-cover bg-center mt-3 shadow-sm border border-surface-container flex items-end p-3 relative overflow-hidden ring-2 ring-primary/10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-ZKugOVEerigQJ4_NF3ypMeKZmmotdfkuXsjWVef6uPNlGGVTeK5W-D3UCsMPLysuk-CmJr5TRDWZhgD9-BQzNNJo1seb0UoYGzupAUvdMGHmZItaHuZY55v8FsffRiCdBea-HjHpuTqTgS_8hZ0PloAgf8SFvYMJpXYozi1sXPRa6TSfDLK8-O9iBpLKFUocdlY-p9V9mD64k2_p9odCsXinYR6f5WozflqsQ5MdcbVaP61Pb8MJjQ')" }}>
                  <div className="bg-card-surface/95 backdrop-blur-md border border-surface-container px-3 py-1.5 rounded-md text-text-ink flex items-center gap-2 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-clinical-success animate-ping"></span>
                    <span className="text-[11px] font-bold uppercase tracking-wider">Primary Campus Geofence Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-card-surface border border-surface-container rounded-xl shadow-sm p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
                <h2 className="text-[20px] font-bold text-text-ink">Operational & Privacy Policies</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-4 pr-6">
                  <div className="w-12 h-12 rounded-xl bg-card-surface border border-surface-container flex items-center justify-center text-primary shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[24px]">pin</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[16px] font-bold text-text-ink">Patient PIN Policy</span>
                    <span className="text-[13px] font-medium text-text-muted">Enforce 6-Digit PIN on Bedside & Staff Stations prior to chart access.</span>
                  </div>
                </div>
                <input type="checkbox" checked={pinPolicy} onChange={() => setPinPolicy(!pinPolicy)} className="w-6 h-6 accent-primary cursor-pointer"/>
              </div>

              <div className="flex items-center justify-between p-6 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-4 pr-6">
                  <div className="w-12 h-12 rounded-xl bg-card-surface border border-surface-container flex items-center justify-center text-primary shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[16px] font-bold text-text-ink">Auto-Archive Finalized Consultations</span>
                    <span className="text-[13px] font-medium text-text-muted">Move finalized transcripts to encrypted cold-storage ledger after 24 hours.</span>
                  </div>
                </div>
                <input type="checkbox" checked={archivePolicy} onChange={() => setArchivePolicy(!archivePolicy)} className="w-6 h-6 accent-primary cursor-pointer"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-72 right-0 bg-card-surface/95 backdrop-blur-md px-10 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-6 z-40">
        <div className="flex items-center gap-2 text-text-muted bg-surface-container-lowest px-4 py-2 rounded-lg border border-surface-container">
          <span className="w-2 h-2 rounded-full bg-clinical-success shadow-sm"></span>
          <span className="text-[12px] font-bold uppercase tracking-wider">All changes signed with cryptokey #VANCE-MD-9021</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { setPinPolicy(true); setArchivePolicy(true); addToast({ title: 'Reset', description: 'Changes reset', type: 'info' }); }} className="px-6 py-2.5 rounded-lg bg-surface-container-lowest border border-surface-container hover:bg-surface-container text-text-ink text-[14px] font-bold shadow-sm transition-colors cursor-pointer">Discard</button>
          <button onClick={handleSave} className="px-8 py-2.5 rounded-lg bg-primary text-white text-[14px] font-bold shadow-md flex items-center gap-2 hover:bg-accent-dark transition-all active:scale-95 border border-primary-container cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">check</span>
            <span>Save Clinic Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
