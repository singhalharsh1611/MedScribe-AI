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
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const practiceTypesList = [
    { id: "multi", label: "Multispecialty Outpatient Clinic", icon: "local_hospital" },
    { id: "acute", label: "General Acute Hospital & Emergency", icon: "emergency" },
    { id: "cardio", label: "Cardiology & Cardiovascular Center", icon: "cardiology" },
    { id: "primary", label: "Family Medicine & Primary Care", icon: "family_star" },
    { id: "neuro", label: "Neurology & Neurosurgical Unit", icon: "neurology" },
    { id: "oncology", label: "Comprehensive Cancer Institute", icon: "oncology" },
  ];

  useEffect(() => {
    const u = getUser();
    if (!u) {
      setLoading(false);
      return;
    }
    setUser(u);
    if (u.clinic_id) {
      api.clinics.get(u.clinic_id).then(d => {
        setClinic(d.clinic);
        setForm({ name: d.clinic.name || "", phone: d.clinic.phone || "", email: d.clinic.email || "", type: d.clinic.type || "" });
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
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
          </div>
          <h1 className="text-[32px] font-bold text-text-ink tracking-tight">Clinic Settings & Practice Profile</h1>
          <p className="text-[15px] font-medium text-text-muted">
            Configure clinic identity, practice contact info, and basic operational settings for Metropolitan Health Medical Center.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span>
        </div>
      ) : (
        <div className="max-w-3xl flex flex-col gap-8 pb-20">
          <div className="bg-card-surface border border-surface-container rounded-xl shadow-sm p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[24px]">apartment</span>
                <h2 className="text-[20px] font-bold text-text-ink">Clinic Identity & Location</h2>
              </div>
            </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-text-ink uppercase tracking-wider">Clinic Legal Name</label>
                  <input className="w-full bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary shadow-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
                </div>
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[13px] font-bold text-text-ink uppercase tracking-wider">Practice Classification</label>
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-surface-container-lowest text-[14px] font-bold rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all flex items-center justify-between border border-surface-container hover:border-primary/50 min-h-[44px]"
                    >
                      <span className={form.type ? "text-text-ink" : "text-text-muted"}>
                        {form.type ? practiceTypesList.find(t => t.id === form.type)?.label || form.type : "Select Practice Type..."}
                      </span>
                      <span className={`material-symbols-outlined text-outline text-[20px] transition-transform duration-300 pointer-events-none ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="max-h-[240px] overflow-y-auto p-2 flex flex-col gap-1">
                            {practiceTypesList.map((type) => (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => {
                                  setForm({ ...form, type: type.id });
                                  setIsDropdownOpen(false);
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left w-full ${form.type === type.id ? 'bg-primary-container text-on-primary-container font-semibold' : 'hover:bg-surface-container text-text-ink'}`}
                              >
                                <span className="material-symbols-outlined text-[18px] opacity-70">{type.icon}</span>
                                <span className="text-[13px]">{type.label}</span>
                                {form.type === type.id && (
                                  <span className="material-symbols-outlined text-[16px] ml-auto">check</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-text-ink uppercase tracking-wider">Contact Phone</label>
                  <input className="w-full bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary shadow-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-text-ink uppercase tracking-wider">Contact Email</label>
                  <input type="email" className="w-full bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary shadow-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>
                </div>
              </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-72 right-0 bg-card-surface/95 backdrop-blur-md px-10 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-6 z-40">
        <div className="flex items-center gap-2 text-text-muted bg-surface-container-lowest px-4 py-2 rounded-lg ">
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
