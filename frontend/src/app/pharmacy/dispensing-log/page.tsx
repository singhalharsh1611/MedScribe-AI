"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api, getUser } from "@/lib/api";

export default function PharmacyDispensingLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = getUser();
      if (!user?.clinic_id) {
        setLoading(false);
        return;
      }
      try {
        const encRes = await api.encounters.list({ clinicId: user.clinic_id }).catch(() => ({ encounters: [] }));
        const encData = encRes.encounters || [];
        const withRx = encData.filter((e: any) => e.prescription || e.prescriptions).map((enc: any) => {
          let rxData: any = {};
          if (typeof enc.prescription === 'string') {
            try { rxData = JSON.parse(enc.prescription); } catch (e) {}
          } else { rxData = enc.prescription || enc.prescriptions || {}; }

          const meds = rxData.medications || rxData.drugs || [];
          return {
            id: `LOG-${enc.id}`,
            rxId: `RX-${enc.id}`,
            patient: enc.patient_name || enc.patient?.name || 'Unknown Patient',
            meds: meds.map((m: any) => m.name || m.drug).join(', ') || 'No details',
            pharmacist: user.name || 'Pharmacist',
            time: new Date(enc.date || enc.created_at || Date.now()).toLocaleTimeString(),
            status: 'Dispensed',
            statusColor: 'text-clinical-success',
            statusBg: 'bg-success-bg'
          };
        });
        setLogs(withRx);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-10 max-w-[1560px] mx-auto space-y-6">
      <div className="flex items-center justify-between bg-card-surface p-6 rounded-xl shadow-sm border border-surface-container">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-container-tint text-primary flex items-center justify-center shadow-sm border border-primary/20">
            <span className="material-symbols-outlined text-[32px]">fact_check</span>
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-text-ink tracking-tight">Daily Dispensing Log</h1>
            <p className="text-[14px] font-medium text-text-muted">
              Immutable HL7 audit ledger for regulatory and compliance tracking.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/pharmacy/dashboard"
            className="px-5 py-2.5 rounded-lg bg-surface-container-low border border-surface-container hover:bg-surface-container text-text-ink font-bold transition-colors shadow-sm cursor-pointer"
          >
            Dashboard
          </Link>
          <Link
            href="/pharmacy/queue"
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:bg-accent-dark transition-colors shadow-sm cursor-pointer"
          >
            View Rx Queue
          </Link>
        </div>
      </div>

      <div className="bg-card-surface rounded-xl shadow-sm border border-surface-container overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-text-muted font-medium">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-text-muted font-medium">No dispense logs found for today.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-surface-container text-[12px] uppercase text-text-muted font-bold">
                <th className="p-4">Time</th>
                <th className="p-4">Log ID / Rx ID</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Medications</th>
                <th className="p-4">Dispensed By</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="p-4 text-[13px] font-bold text-text-ink">{log.time}</td>
                  <td className="p-4">
                    <div className="text-[13px] font-bold text-primary">{log.logId || log.id}</div>
                    <div className="text-[11px] font-medium text-text-muted">{log.rxId}</div>
                  </td>
                  <td className="p-4 text-[14px] font-bold text-text-ink">{log.patient}</td>
                  <td className="p-4 text-[12px] font-medium text-text-ink max-w-[200px] truncate">{log.meds}</td>
                  <td className="p-4 text-[13px] font-medium text-text-muted">{log.pharmacist}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold ${log.statusBg} ${log.statusColor}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
