
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function RegisterConfirmationPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("newPatient");
      if (stored) {
        setPatient(JSON.parse(stored));
      } else {
        router.replace("/reception/register");
        return;
      }
    } catch (e) {
      router.replace("/reception/register");
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary">sync</span>
      </div>
    );
  }

  const fullName = `${patient.first_name} ${patient.last_name}`;
  const uhid = patient.uhid || `UHID-REG-${patient.id || "0000"}`;

  let formattedDob = patient.dob;
  if (formattedDob) {
    try {
      const dateObj = new Date(formattedDob);
      if (!isNaN(dateObj.getTime())) {
        formattedDob = dateObj.toLocaleDateString("en-IN", {
          day: "2-digit", month: "long", year: "numeric"
        });
      } else if (typeof formattedDob === "string" && formattedDob.length >= 10) {
        const match = formattedDob.match(/(\d{4}-\d{2}-\d{2})/);
        if (match) formattedDob = match[1];
      }
    } catch (e) {}
  }

  const copyToken = () => {
    navigator.clipboard?.writeText(uhid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("UHID token copied to clipboard", "content_copy");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav className="flex items-center gap-2 text-[12px] text-text-muted font-semibold">
          <Link href="/reception/dashboard" className="hover:text-primary">Front Desk</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/reception/register" className="hover:text-primary">Patient Registration</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-text-ink font-bold flex items-center gap-1 bg-container-tint px-2.5 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-clinical-success"></span> Confirmation
          </span>
        </nav>
      </div>

      <div className="bg-card-surface rounded-xl shadow-sm border border-surface-container p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-success-bg flex items-center justify-center text-clinical-success shrink-0 shadow-sm border border-clinical-success/20">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-container-tint text-primary text-[12px] font-bold shadow-sm">Status: Active Patient</span>
            </div>
            <h1 className="text-[24px] font-bold text-text-ink tracking-tight mt-0.5">Patient registered successfully</h1>
            <p className="text-[12px] font-medium text-text-muted">New Electronic Health Record created and synchronized with Master Patient Index.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-card-surface rounded-xl p-6 shadow-sm border border-surface-container space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-surface-container">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-[24px] shadow-sm">
                  {patient.first_name?.[0]}{patient.last_name?.[0]}
                </div>
                <div>
                  <h2 className="text-[22px] font-bold text-text-ink">{fullName}</h2>
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-text-muted mt-1">
                    <span className="bg-container-tint text-primary px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider">UHID: {uhid}</span>
                    {patient.gender && <span className="w-1 h-1 rounded-full bg-outline ml-1"></span>}
                    {patient.gender && <span>{patient.gender}</span>}
                    {formattedDob && <span className="w-1 h-1 rounded-full bg-outline"></span>}
                    {formattedDob && <span>DOB: {formattedDob}</span>}
                    {patient.blood_group && <span className="w-1 h-1 rounded-full bg-outline"></span>}
                    {patient.blood_group && <span className="text-clinical-error font-bold">{patient.blood_group}</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Generated UHID</span>
                <div onClick={copyToken} className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant font-mono text-[14px] font-bold text-text-ink flex items-center gap-2 cursor-pointer hover:bg-surface-container hover:border-primary transition-colors group" title="Copy UHID">
                  {uhid}
                  <span className={`material-symbols-outlined text-[16px] ${copied ? "text-clinical-success" : "text-text-muted group-hover:text-primary"}`}>
                    {copied ? "check" : "content_copy"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
              <div className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container space-y-2">
                <span className="text-text-muted uppercase font-bold text-[10px] tracking-wider">Contact Information</span>
                <div className="font-bold text-text-ink text-[13px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-text-muted">call</span>
                  {patient.phone}
                </div>
                <div className="font-medium text-text-ink flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-text-muted">home</span>
                  {patient.address || <span className="text-text-muted italic">No address provided</span>}
                </div>
                {patient.email && (
                  <div className="font-medium text-text-ink flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-text-muted">mail</span>
                    {patient.email}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-surface-container-lowest border border-surface-container space-y-2">
                <span className="text-clinical-warning uppercase font-bold text-[10px] tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">emergency</span>
                  Emergency Contact
                </span>
                {patient.emergency_contact_name ? (
                  <>
                    <div className="font-bold text-text-ink text-[13px]">{patient.emergency_contact_name}</div>
                    <div className="text-text-muted font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      {patient.emergency_contact_phone || "No phone provided"}
                      {patient.emergency_contact_relation && <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] text-text-ink">{patient.emergency_contact_relation}</span>}
                    </div>
                  </>
                ) : (
                  <div className="text-text-muted italic flex items-center h-full">No emergency contact provided</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container space-y-3">
            <span className="text-[12px] font-bold text-text-ink">Next Workflow Steps</span>
            <p className="text-[12px] font-medium text-text-muted">
              Patient registration is complete. Transition patient into scheduling or assign directly to walk-in queue.
            </p>
            <div className="space-y-2 pt-1">
              <Link href="/reception/appointments" className="w-full py-2.5 rounded-lg bg-primary-container hover:bg-accent-dark text-on-primary text-[12px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                Create Appointment
              </Link>
              <Link href="/reception/queue" className="w-full py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-text-ink text-[12px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">group_add</span>
                Direct to Queue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
