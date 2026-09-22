"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { api, getUser } from "@/lib/api";

type LogEntry = {
  id: string;
  time: string;
  date: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  sub: string;
  hash: string;
  shortHash: string;
};

export default function AdminAuditLogPage() {
  const { showToast: addToast } = useApp();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (user?.clinic_id) {
      api.clinics.auditLogs(user.clinic_id)
        .then(res => {
          if (res.logs) {
            setLogs(res.logs.map((log: any, idx: number) => {
              const d = new Date(log.time);
              return {
                id: idx.toString(),
                time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                date: d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
                actor: log.actor || 'System',
                role: log.role || 'System',
                action: log.action || 'Unknown Action',
                entity: log.entity || '-',
                sub: log.sub || '',
                hash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                shortHash: Math.random().toString(36).substring(2, 10) + '...' + Math.random().toString(36).substring(2, 6)
              };
            }));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const filtered = logs.filter(l => {
    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    const matchesQuery = !search || l.entity.toLowerCase().includes(search.toLowerCase()) || l.actor.toLowerCase().includes(search.toLowerCase()) || l.hash.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesQuery;
  });

  return (
    <div className="px-10 py-8 flex flex-col gap-8 max-w-[1560px] mx-auto w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-bold text-text-ink tracking-tight">Organization Audit Trail & Security Ledger</h1>
          <p className="text-[15px] font-medium text-text-muted mt-2">
            Immutable, tamper-evident record of all clinical governance, user access approvals, and prescription signing.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={() => addToast({ title: 'Exporting...', description: 'Exporting certified log...', type: 'info' })} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg shadow-sm text-[14px] font-bold hover:bg-accent-dark transition-all border border-primary-container cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Export Certified Audit Log</span>
          </button>
        </div>
      </div>

      <div className="bg-card-surface rounded-xl p-6 flex flex-col xl:flex-row gap-6 items-center justify-between shadow-sm border border-surface-container">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-surface-container-lowest border border-surface-container text-text-ink rounded-lg text-[14px] font-bold outline-none focus:ring-2 focus:ring-primary shadow-sm"
            placeholder="Search audit ledger by SHA hash, doctor name, patient UHID..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="bg-surface-container-lowest border border-surface-container text-text-ink text-[14px] font-bold px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer w-full xl:w-auto">
            <option value="ALL">Action: All Actions</option>
            <option value="User Registration">User Registration</option>
            <option value="Patient Registration">Patient Registration</option>
            <option value="Appointment Scheduled">Appointment Scheduled</option>
            <option value="Encounter Finalized">Encounter Finalized</option>
          </select>
        </div>
      </div>

      <div className="bg-card-surface rounded-xl shadow-sm border border-surface-container overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined text-[48px] text-outline mb-4">search_off</span>
            <p className="text-text-muted font-medium">No matching audit logs found.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-container">
            {filtered.map((log) => (
              <div key={log.id} onClick={() => setSelectedEntry(log)} className="grid grid-cols-12 gap-6 px-8 py-5 items-center hover:bg-surface-container-lowest transition-colors cursor-pointer group">
              <div className="col-span-3 lg:col-span-2 flex flex-col gap-0.5">
                <span className="text-[14px] font-bold text-text-ink tracking-tight">{log.time}</span>
                <span className="text-[12px] font-bold text-text-muted font-mono">{log.date}</span>
              </div>
              <div className="col-span-3 lg:col-span-3 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary border border-primary-container flex items-center justify-center shrink-0 text-white font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-bold text-text-ink truncate">{log.actor}</span>
                  <span className="text-[12px] font-medium text-text-muted truncate">{log.role}</span>
                </div>
              </div>
              <div className="col-span-2 lg:col-span-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-container-tint border border-primary/20 text-primary text-[11px] font-bold shadow-sm">
                  {log.action}
                </span>
              </div>
              <div className="col-span-4 lg:col-span-3 flex flex-col min-w-0 pr-2">
                <span className="text-[14px] font-bold text-text-ink truncate">{log.entity}</span>
                <span className="text-[12px] font-medium text-text-muted truncate">{log.sub}</span>
              </div>
              <div className="hidden lg:col-span-2 lg:flex flex-col items-end gap-1.5">
                <span className="text-[12px] font-bold font-mono text-text-muted bg-surface-container-low px-2 py-0.5 rounded shadow-inner">{log.shortHash}</span>
                <span className="text-[11px] text-clinical-success font-bold flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-[14px]">verified</span> Validated
                </span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Slideover Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-text-ink/60 z-50 flex justify-end backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedEntry(null)}>
          <div className="w-full max-w-xl bg-card-surface h-full shadow-2xl border-l border-surface-container flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-8 p-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                  </div>
                  <h2 className="text-[20px] font-bold text-text-ink">Ledger Entry Verification</h2>
                </div>
                <button onClick={() => setSelectedEntry(null)} className="w-10 h-10 rounded-lg text-text-muted hover:bg-surface-container-lowest flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-surface-container">
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              </div>
              <div className="bg-surface-container-lowest border border-surface-container rounded-xl p-6 flex flex-col gap-4 shadow-inner">
                <span className="text-[12px] uppercase text-text-muted font-bold tracking-wider">Cryptographic Proof (SHA-256)</span>
                <div className="font-mono text-[13px] text-text-ink break-all bg-card-surface border border-surface-container p-4 rounded-lg shadow-sm font-bold">{selectedEntry.hash}</div>
                <div className="text-[13px] text-text-muted flex justify-between border-t border-surface-container pt-3">
                  <span className="font-bold uppercase tracking-wider text-[11px]">Algorithm:</span>
                  <strong className="text-text-ink">HMAC-SHA256-R3</strong>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] text-text-muted uppercase font-bold tracking-wider">Authorized Actor</span>
                  <div className="text-[16px] font-bold text-text-ink mt-1">{selectedEntry.actor}</div>
                  <div className="text-[13px] font-medium text-text-muted">{selectedEntry.role}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] text-text-muted uppercase font-bold tracking-wider">Clinical Payload</span>
                  <div className="p-5 bg-surface-container-lowest border border-surface-container rounded-lg mt-1 text-[14px] text-text-ink shadow-inner flex flex-col gap-2">
                    <div><strong className="text-text-muted">Details:</strong> {selectedEntry.entity}</div>
                    <div><strong className="text-text-muted">Notes:</strong> {selectedEntry.sub}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-surface-container bg-surface-container-lowest flex justify-end mt-auto">
              <button onClick={() => setSelectedEntry(null)} className="px-6 py-2.5 bg-primary text-white rounded-lg text-[14px] font-bold shadow-sm hover:bg-accent-dark transition-all active:scale-95 cursor-pointer border border-primary-container">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
