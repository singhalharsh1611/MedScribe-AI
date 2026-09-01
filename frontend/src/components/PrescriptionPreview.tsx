import React, { RefObject, useEffect, useState, useRef } from 'react';

interface PrescriptionPreviewProps {
  prescriptionHtml: string | null;
  isSaving: boolean;
  handleSavePrescription: () => void;
  pipelineMetrics: { extractMs: number; mapMs: number; generateMs?: number } | null;
  isGenerating: boolean;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  activeTab: 'doctor' | 'developer';
}

export function PrescriptionPreview({
  activeTab,
  prescriptionHtml, isSaving, handleSavePrescription,
  pipelineMetrics, isGenerating, iframeRef
}: PrescriptionPreviewProps) {
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0, show: false });
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const activeCellRef = useRef<HTMLElement | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleInput = (e: Event) => {
      let el = e.target as HTMLElement;
      
      if (el.tagName === 'BODY') {
          const iframeWin = iframeRef.current?.contentWindow;
          if (iframeWin) {
              const sel = iframeWin.getSelection();
              if (sel && sel.anchorNode) {
                  el = (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode) as HTMLElement;
              }
          }
      }

      const target = el?.closest ? el.closest('td') as HTMLTableCellElement | null : null;
      
      if (target && target.cellIndex === 0) {
        const query = target.innerText.trim();
        
        if (query.length < 2) {
          setDropdownPos(prev => ({ ...prev, show: false }));
          return;
        }

        activeCellRef.current = target;

        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        
        searchTimeout.current = setTimeout(async () => {
          try {
            const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/prescription/search?q=${encodeURIComponent(query)}`;
            
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.results && data.results.length > 0) {
              setSearchResults(data.results);
              
              const currentIframe = iframeRef.current;
              if (!currentIframe) return;
              const rect = target.getBoundingClientRect();
              const iframeRect = currentIframe.getBoundingClientRect();
              
              setDropdownPos({
                top: iframeRect.top + rect.bottom,
                left: iframeRect.left + rect.left,
                width: Math.max(rect.width, 300),
                show: true
              });
            } else {
              setDropdownPos(prev => ({ ...prev, show: false }));
            }
          } catch (err) {
            console.error('Search failed', err);
          }
        }, 250);
      }
    };

    const handleBlur = (e: Event) => {
      let el = e.target as HTMLElement;
      if (el.tagName === 'BODY') {
          const iframeWin = iframeRef.current?.contentWindow;
          if (iframeWin) {
              const sel = iframeWin.getSelection();
              if (sel && sel.anchorNode) {
                  el = (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode) as HTMLElement;
              }
          }
      }
      const target = el?.closest ? el.closest('td') as HTMLTableCellElement | null : null;
      if (target && target.cellIndex === 0) {
         setTimeout(() => {
            setDropdownPos(prev => ({ ...prev, show: false }));
         }, 200);
      }
    };

    let boundBody: HTMLElement | null = null;

    const bindListeners = () => {
      if (!iframe.contentDocument) return;
      
      const body = iframe.contentDocument.body;
      if (!body) return;

      if (boundBody === body) return;

      if (boundBody) {
        boundBody.removeEventListener('input', handleInput);
        boundBody.removeEventListener('keyup', handleInput);
        boundBody.removeEventListener('focusout', handleBlur);
      }

      body.addEventListener('input', handleInput);
      body.addEventListener('keyup', handleInput);
      body.addEventListener('focusout', handleBlur);
      boundBody = body;
    };

    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      bindListeners();
    }

    iframe.addEventListener('load', bindListeners);

    return () => {
      iframe.removeEventListener('load', bindListeners);
      if (boundBody) {
        boundBody.removeEventListener('input', handleInput);
        boundBody.removeEventListener('keyup', handleInput);
        boundBody.removeEventListener('focusout', handleBlur);
      }
    };
  }, [prescriptionHtml, iframeRef]);

  const handleSelectMedicine = (med: string) => {
    if (activeCellRef.current) {
      activeCellRef.current.innerHTML = `<b>${med}</b>`;
    }
    setDropdownPos(prev => ({ ...prev, show: false }));
  };

  if (!prescriptionHtml) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-sm shadow-slate-200/50 dark:shadow-none overflow-hidden h-[calc(100vh-10rem)] min-h-[700px] flex flex-col relative">
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Digital Prescription</h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const printWindow = window.open('', '', 'width=900,height=700');
              if (printWindow) {
                printWindow.document.write(prescriptionHtml);
                printWindow.document.close();
                printWindow.print();
              }
            }}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            Print
          </button>
          <button 
            onClick={handleSavePrescription}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <><div className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full"></div> Saving...</>
            ) : 'Save to History'}
          </button>
        </div>
      </div>
      
      {pipelineMetrics && (activeTab === 'doctor' || pipelineMetrics.generateMs) && (
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">
          {activeTab === 'doctor' && (
            <>
              <span>Extract: {(pipelineMetrics.extractMs / 1000).toFixed(2)}s</span>
              <span>Map: {(pipelineMetrics.mapMs / 1000).toFixed(2)}s</span>
            </>
          )}
          {pipelineMetrics.generateMs && <span>Gen: {(pipelineMetrics.generateMs / 1000).toFixed(2)}s</span>}
        </div>
      )}

      <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 overflow-hidden relative">
        <div className="w-full h-full bg-white rounded-xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden relative">
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
      
      {/* Search Dropdown Portal */}
      {dropdownPos.show && (
        <div 
          className="fixed z-[100] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg overflow-hidden max-h-60 overflow-y-auto"
          style={{
            top: `${dropdownPos.top + 4}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`
          }}
        >
          {searchResults.map((result, idx) => (
            <div 
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent losing focus
                handleSelectMedicine(result);
              }}
              className="px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors"
            >
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}





