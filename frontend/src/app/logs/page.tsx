"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface UsageEntry {
  timestamp: string;
  duration_seconds?: number;
  cost_inr?: number;
  transcription_text?: string;
  audio_url?: string;
  operation?: string;
  context_text?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  cost_usd?: number;
}

interface UsageStats {
  transcriptions: UsageEntry[];
  translations: UsageEntry[];
  medgemma: UsageEntry[];
}

function UsageTab({ usageStats }: { usageStats: UsageStats }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-sm p-6 space-y-8">
      <h2 className="text-lg font-semibold">Billing &amp; Usage</h2>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Transcription Operations</h3>
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr><th className="px-6 py-4">Timestamp</th><th className="px-6 py-4">Duration</th><th className="px-6 py-4">Cost (INR)</th><th className="px-6 py-4">Preview</th><th className="px-6 py-4">Audio</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {usageStats.transcriptions.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4">{entry.duration_seconds?.toFixed(1) ?? "0.0"}s</td>
                  <td className="px-6 py-4 font-mono text-emerald-600">₹{entry.cost_inr?.toFixed(4) ?? "0.0000"}</td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{entry.transcription_text}</td>
                  <td className="px-6 py-4">{entry.audio_url ? <audio controls src={entry.audio_url} className="h-8 w-48" /> : null}</td>
                </tr>
              ))}
              {usageStats.transcriptions.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">MedGemma Operations</h3>
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr><th className="px-6 py-4">Timestamp</th><th className="px-6 py-4">Operation</th><th className="px-6 py-4">Context</th><th className="px-6 py-4">Tokens (In / Out)</th><th className="px-6 py-4">Cost (USD)</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {usageStats.medgemma.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium">{entry.operation}</td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{entry.context_text || "-"}</td>
                  <td className="px-6 py-4">{entry.prompt_tokens ?? 0} / {entry.completion_tokens ?? 0}</td>
                  <td className="px-6 py-4 font-mono text-emerald-600">${entry.cost_usd?.toFixed(6) ?? "0.000000"}</td>
                </tr>
              ))}
              {usageStats.medgemma.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function LogsPage() {
  const [usageStats, setUsageStats] = useState<UsageStats>({
    transcriptions: [],
    translations: [],
    medgemma: []
  });

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
        const response = await fetch(`${apiBase}/usage`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUsageStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch usage stats:", err);
      }
    };
    fetchUsage();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">System Logs & Usage</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">View billing, transcription, and MedGemma operation logs.</p>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Back to Application
          </Link>
        </header>

        <main>
          <UsageTab usageStats={usageStats} />
        </main>
      </div>
    </div>
  );
}
