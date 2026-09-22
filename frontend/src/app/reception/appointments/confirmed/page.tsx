"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function AppointmentConfirmedPage() {
  const router = useRouter();
  const { currentPatient, showToast } = useApp();
  const [isAddingToQueue, setIsAddingToQueue] = useState(false);

  const patient = currentPatient || {
    name: "Maya Lin Harrison",
    photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB47H0mBuvtRBI91-e_1-_AQc1VZUhIdW__l3H3EuVcq3KTu5NKo8pyUiMNoQ6grSCTnbjYG8ZRx2O3wuLjkOcVZaUeU_eG8CK9rTvV8rZHN686cqY8h6G9SmDjk22Mt8b1uvP4exn3WJ-TAbzcZHf90ZT882zAc6u7KjcZH-AQKztScbf0yPQ1e3Pq-1eGDGDXUB8n2zTHhlRiroSU2V24w0fqCff2KTgJTSaydLHg4fFWRObnHU_azg",
    uhid: "UHID-MH-2024-88412",
    age: "32 yrs",
    doctor: "Dr. Eleanor Vance, MD",
    room: "Room 101",
    timeSlot: "10:30 AM",
    complaint: "Seasonal allergy symptoms",
    token: "T-107"
  };

  const handleAddToQueue = () => {
    setIsAddingToQueue(true);
    setTimeout(() => {
      setIsAddingToQueue(false);
      showToast(`Token #${patient.token} assigned to ${patient.name}!`, "group_add");
      router.push("/reception/queue");
    }, 900);
  };

  return (
    <div className="px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between text-[12px] font-semibold text-text-muted">
        <div className="flex items-center gap-2">
          <Link href="/reception/dashboard" className="hover:text-primary cursor-pointer">Front Desk</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/reception/appointments" className="hover:text-primary cursor-pointer">Appointments</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-bold">Booking Confirmed</span>
        </div>
        <span className="text-clinical-success font-bold flex items-center gap-1 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-clinical-success animate-ping"></span> HL7 Synced
        </span>
      </div>

      <div className="bg-card-surface rounded-xl p-6 shadow-sm border border-surface-container flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success-bg flex items-center justify-center text-clinical-success border border-clinical-success/20 shadow-sm">
            <span className="material-symbols-outlined text-[32px]">check_circle</span>
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-text-ink">Appointment Created Successfully</h1>
            <p className="text-[12px] font-medium text-text-muted">Consultation slot confirmed and locked in clinician workstation.</p>
          </div>
        </div>
        <div className="bg-surface-container-low px-4 py-2 rounded-lg text-right border border-surface-container">
          <span className="text-[10px] uppercase font-bold text-text-muted">Assigned Slot Code</span>
          <div className="text-[14px] font-mono font-bold text-primary">#APT-2024-9104</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-card-surface rounded-xl p-6 shadow-sm border border-surface-container space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-3">
                <img src={patient.photo} alt={patient.name} className="w-12 h-12 rounded-full object-cover border border-surface-container shadow-sm" />
                <div>
                  <h2 className="text-[16px] font-bold text-text-ink">{patient.name}</h2>
                  <span className="text-[12px] font-medium text-text-muted">{patient.uhid} - {patient.age}</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-warning-bg text-clinical-warning text-[12px] font-bold shadow-sm border border-clinical-warning/20">
                Scheduled - Awaiting Check-in
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl text-[12px] border border-surface-container">
              <div>
                <span className="text-text-muted font-bold block">Attending Clinician</span>
                <span className="text-[14px] font-bold text-text-ink">{patient.doctor}</span>
                <span className="text-primary font-bold block">{patient.room}</span>
              </div>
              <div>
                <span className="text-text-muted font-bold block">Target Time</span>
                <span className="text-[14px] font-bold text-text-ink">{patient.timeSlot}</span>
                <span className="text-clinical-warning font-bold block">Starts In 35 Minutes</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-app-bg text-[12px] space-y-1 border border-surface-container">
              <span className="font-bold text-text-ink">Chief Complaint:</span>
              <p className="italic text-text-muted font-medium">&quot;{patient.complaint}&quot;</p>
            </div>
          </div>
        </div>

        {/* Ticket & Dispatch CTA */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-card-surface rounded-xl p-5 shadow-sm border border-surface-container space-y-4 text-center">
            <span className="text-[12px] font-bold text-text-muted uppercase">Live Queue Token</span>
            <div className="py-4 bg-surface-container-low rounded-xl flex flex-col items-center border border-surface-container">
              <span className="text-[30px] font-mono font-bold text-primary">{patient.token}</span>
              <span className="text-[12px] text-clinical-success font-bold mt-1">Priority: General Scheduled</span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleAddToQueue}
                disabled={isAddingToQueue}
                className="w-full py-3 rounded-md bg-primary-container hover:bg-accent-dark text-on-primary text-[12px] font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <span className="material-symbols-outlined text-[18px]">group_add</span>
                <span>{isAddingToQueue ? "Dispatching..." : "Add to Live Queue"}</span>
              </button>
              <button onClick={() => window.print()} className="w-full py-2.5 rounded-md bg-surface-container-high text-[12px] font-bold text-text-ink hover:bg-surface-container border border-surface-container-highest cursor-pointer">
                Print Slip / Label
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
