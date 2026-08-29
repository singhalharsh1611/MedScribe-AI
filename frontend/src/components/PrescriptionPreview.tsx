import React, { RefObject } from 'react';

interface PrescriptionPreviewProps {
  prescriptionHtml: string | null;
  isSaving: boolean;
  handleSavePrescription: () => void;
  pipelineMetrics: { extractMs: number; mapMs: number; generateMs?: number } | null;
  isGenerating: boolean;
  iframeRef: RefObject<HTMLIFrameElement | null>;
}

export function PrescriptionPreview({
  prescriptionHtml, isSaving, handleSavePrescription,
  pipelineMetrics, isGenerating, iframeRef
}: PrescriptionPreviewProps) {
  if (!prescriptionHtml) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-10rem)] min-h-[700px] flex flex-col">
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Digital Prescription</h3>
        <button 
          onClick={handleSavePrescription}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          {isSaving ? (
            <><div className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full"></div> Saving...</>
          ) : 'Save to History'}
        </button>
      </div>
      
      {pipelineMetrics && (
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">
           <span>Extract: {(pipelineMetrics.extractMs / 1000).toFixed(2)}s</span>
           <span>Map: {(pipelineMetrics.mapMs / 1000).toFixed(2)}s</span>
           {pipelineMetrics.generateMs && <span>Gen: {(pipelineMetrics.generateMs / 1000).toFixed(2)}s</span>}
        </div>
      )}

      <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 overflow-hidden relative">
        <div className="w-full h-full bg-white rounded-lg shadow-sm ring-1 ring-slate-200/50 overflow-hidden relative">
          {isGenerating && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Structuring Document...</span>
              </div>
            </div>
          )}
          <iframe 
            ref={iframeRef}
            srcDoc={prescriptionHtml} 
            className="w-full h-full border-none bg-white"
            title="Prescription Preview"
          />
        </div>
      </div>
    </div>
  );
}

