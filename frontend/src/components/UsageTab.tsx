import React from 'react';

interface UsageTabProps {
  usageStats: {
    transcriptions: any[];
    translations: any[];
  };
}

export function UsageTab({ usageStats }: UsageTabProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-sm shadow-slate-200/50 dark:shadow-none p-6 space-y-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Billing & Usage</h2>
      
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Transcription Operations</h3>
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Cost (INR)</th>
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Audio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {(usageStats?.transcriptions || []).map((stat: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{new Date(stat.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{stat.duration_seconds.toFixed(1)}s</td>
                  <td className="px-6 py-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">₹{stat.cost_inr.toFixed(4)}</td>
                  <td className="px-6 py-4 text-slate-400 truncate max-w-xs">{stat.transcription_text}</td>
                  <td className="px-6 py-4">{stat.audio_url ? <audio controls src={stat.audio_url} className="h-8 w-48" /> : null}</td>
                </tr>
              ))}
              {(!usageStats?.transcriptions || usageStats.transcriptions.length === 0) && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Translation Operations</h3>
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Length</th>
                <th className="px-6 py-4">Latency</th>
                <th className="px-6 py-4">Cost (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {(usageStats?.translations || []).map((stat: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{new Date(stat.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{stat.source_language} → {stat.target_language}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{stat.text_length} chars</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{stat.translation_time_ms} ms</td>
                  <td className="px-6 py-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">₹{stat.cost_inr ? stat.cost_inr.toFixed(4) : '0.0000'}</td>
                </tr>
              ))}
              {(!usageStats?.translations || usageStats.translations.length === 0) && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

