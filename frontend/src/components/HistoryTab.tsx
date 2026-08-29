import React from 'react';
import { Activity } from 'lucide-react';

interface HistoryTabProps {
  prescriptionHistory: any[];
  viewingHistoryId: number | null;
  historyHtml: string | null;
  loadHistoryItem: (id: number) => void;
}

export function HistoryTab({ prescriptionHistory, viewingHistoryId, historyHtml, loadHistoryItem }: HistoryTabProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-sm shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col md:flex-row h-[800px]">
      <div className="w-full md:w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Prescription Archive</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {prescriptionHistory.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No prescriptions found.</p>
            </div>
          ) : (
            prescriptionHistory.map((p) => (
                            <button
                key={p.id}
                onClick={() => loadHistoryItem(p.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${
                  viewingHistoryId === p.id 
                    ? 'bg-slate-100 dark:bg-slate-800/80 border-transparent shadow-sm' 
                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-sm'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100">{p.patient_name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2">{new Date(p.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{p.diagnosis}</div>
                
                {p.audio_url && (
                  <div className="mt-3 mb-2" onClick={(e) => e.stopPropagation()}>
                    <audio controls src={p.audio_url} className="w-full h-8" />
                  </div>
                )}
                
                {p.transcription_text && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                    "{p.transcription_text}"
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
      <div className="w-full md:w-2/3 p-6 flex flex-col bg-slate-100/50 dark:bg-slate-950/50">
        {historyHtml ? (
          <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/50">
              <button 
                onClick={() => {
                  const printWindow = window.open('', '', 'width=900,height=700');
                  if (printWindow) {
                    printWindow.document.write(historyHtml);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
                className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-700 dark:text-slate-200"
              >
                Print Document
              </button>
            </div>
            <iframe 
              srcDoc={historyHtml} 
              className="w-full h-full border-none bg-white"
              title="Prescription Preview"
            />
          </div>
        ) : viewingHistoryId ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a prescription to view.</p>
          </div>
        )}
      </div>
    </div>
  );
}


