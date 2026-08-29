import React from 'react';
import { Mic, Square, Upload, Languages, Copy } from 'lucide-react';
import { Language } from '../../types';

interface DictationPanelProps {
  isLiveMode: boolean;
  setIsLiveMode: (val: boolean) => void;
  spokenLang: string;
  setSpokenLang: (val: string) => void;
  languages: Language[];
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  audioUrl: string | null;
  handleTranscribe: () => void;
  isTranscribing: boolean;
  clearAudio: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  transcription: string;
  setTranscription: (val: string) => void;
  copyToClipboard: (text: string) => void;
  activeTab: 'doctor' | 'developer';
  isExtracting: boolean;
  isGenerating: boolean;
  handleDoctorGenerate: () => void;
  handleExtractAndMap: () => void;
}

export function DictationPanel({
  isLiveMode, setIsLiveMode,
  spokenLang, setSpokenLang, languages,
  isRecording, startRecording, stopRecording,
  audioUrl, handleTranscribe, isTranscribing, clearAudio,
  handleFileUpload,
  transcription, setTranscription, copyToClipboard,
  activeTab, isExtracting, isGenerating,
  handleDoctorGenerate, handleExtractAndMap
}: DictationPanelProps) {
  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-sm shadow-slate-200/50 dark:shadow-none p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-500" /> Dictation
          </h2>
          <label className="flex items-center gap-2 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
            <input type="checkbox" checked={isLiveMode} onChange={(e) => setIsLiveMode(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Live Mode</span>
          </label>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Spoken Language</label>
            <select
              value={spokenLang}
              onChange={(e) => setSpokenLang(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none appearance-none"
            >
              <option value="auto">Auto-Detect Language</option>
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!isRecording ? (
              <>
                <button
                  onClick={() => { setTranscription(''); startRecording(); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-medium transition-colors shadow-sm"
                >
                  <Mic className="w-4 h-4" /> Start Recording
                </button>
                {!isLiveMode && (
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-2xl font-medium transition-colors shadow-sm cursor-pointer">
                    <Upload className="w-4 h-4" /> Upload Audio
                    <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
              </>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-medium transition-colors shadow-sm animate-pulse"
              >
                <Square className="w-4 h-4" /> Stop
              </button>
            )}
          </div>

          {audioUrl && !isLiveMode && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <audio src={audioUrl} controls className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-800" />
              <div className="flex gap-3">
                <button
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                  className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isTranscribing ? 'Processing...' : 'Transcribe'}
                </button>
                <button
                  onClick={clearAudio}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(transcription || isTranscribing) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-sm shadow-slate-200/50 dark:shadow-none flex flex-col overflow-hidden mt-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Languages className="w-4 h-4" /> Transcript (English)
            </h3>
            {transcription && (
              <button onClick={() => copyToClipboard(transcription)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
          <textarea
            className="w-full p-5 bg-transparent resize-y min-h-[300px] outline-none text-slate-700 dark:text-slate-300 text-base leading-relaxed placeholder-slate-400 dark:placeholder-slate-500"
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder={isTranscribing ? "Listening and streaming to AI..." : "Transcript will appear here. Feel free to edit it manually before generating."}
            disabled={isTranscribing && !isLiveMode}
          />
          
          {transcription && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              {activeTab === 'doctor' ? (
                <button
                  onClick={handleDoctorGenerate}
                  disabled={isExtracting || isGenerating || !transcription.trim()}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white dark:text-slate-900 px-6 py-3.5 rounded-2xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {(isExtracting || isGenerating) ? (
                    <><div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> Analyzing...</>
                  ) : 'Generate Rx'}
                </button>
              ) : (
                <button
                  onClick={handleExtractAndMap}
                  disabled={isExtracting || !transcription.trim()}
                  className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-6 py-3 rounded-2xl font-medium transition-colors flex justify-center"
                >
                  {isExtracting ? 'Extracting...' : 'Extract & Map to Database'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}





