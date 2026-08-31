import React from 'react';

interface DeveloperDebugProps {
  mappedDrugs: any[];
  pipelineMetrics: { extractMs: number; mapMs: number; generateMs?: number } | null;
  isGenerating: boolean;
  handleGenerate: () => void;
}

export function DeveloperDebug({ mappedDrugs, isGenerating, handleGenerate, pipelineMetrics }: DeveloperDebugProps) {
  if (mappedDrugs.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-sm shadow-slate-200/50 dark:shadow-none p-6 space-y-6 mt-8">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Entity Resolution Pipeline</h3>
        {pipelineMetrics && (
          <div className="flex gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">
            <span>Extract: {(pipelineMetrics.extractMs / 1000).toFixed(2)}s</span>
            <span>Map: {(pipelineMetrics.mapMs / 1000).toFixed(2)}s</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mappedDrugs.map((drug, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
            <div className="mb-3 flex justify-between items-start">
              <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                Target: <span className="font-bold text-blue-600 dark:text-blue-400">"{drug.original_extracted_word}"</span>
              </p>
              {drug.phonetic_code && (
                <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded flex-shrink-0">ph:{drug.phonetic_code}</span>
              )}
            </div>
            
            {drug.auto_picked ? (
              <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <h4 className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest">Auto-Picked</h4>
                </div>
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{drug.auto_picked.brand_name}</p>
                  {drug.auto_picked.phonetic_code && (
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded flex-shrink-0">ph:{drug.auto_picked.phonetic_code}</span>
                  )}
                </div>
                {drug.auto_picked.salt && <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate">{drug.auto_picked.salt}</p>}
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                {drug.top_phonetic && drug.top_phonetic.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phonetic Matches</h4>
                    <div className="space-y-2">
                      {drug.top_phonetic.map((match: any, j: number) => (
                        <div key={`p-${j}`} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2.5 rounded-xl shadow-sm">
                          <div className="flex justify-between items-start">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate pr-2">{match.brand_name}</p>
                            {match.phonetic_code && (
                              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded flex-shrink-0">ph:{match.phonetic_code}</span>
                            )}
                          </div>
                          {match.salt && <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate">{match.salt}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {drug.top_fuzzy && drug.top_fuzzy.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fuzzy Matches</h4>
                    <div className="space-y-2">
                      {drug.top_fuzzy.map((match: any, j: number) => (
                        <div key={`f-${j}`} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2.5 rounded-xl shadow-sm flex flex-col">
                          <div className="flex justify-between items-start">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate pr-2">{match.brand_name}</p>
                            <div className="flex gap-1 flex-shrink-0">
                              {match.phonetic_code && (
                                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">ph:{match.phonetic_code}</span>
                              )}
                              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">s:{Math.round(match.score)}</span>
                            </div>
                          </div>
                          {match.salt && <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate">{match.salt}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="pt-6 flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-medium shadow-sm transition-all disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Run Generation Step'}
        </button>
      </div>
    </div>
  );
}
