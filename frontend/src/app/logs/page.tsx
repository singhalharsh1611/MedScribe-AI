"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UsageTab } from "@/components/UsageTab";

export default function LogsPage() {
  const [usageStats, setUsageStats] = useState({
    transcriptions: [],
    translations: [],
    medgemma: []
  });

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/usage');
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
