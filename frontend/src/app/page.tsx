'use client';

import { useState, useEffect, useRef } from 'react';
import { getLanguages, transcribeAudio, translateText, extractDrugs, mapDrugsToDatabase, generatePrescription, getPrescriptionHistory, getPrescriptionHtml, savePrescription } from '../../lib/api';
import { Language } from '../../types';
import { useAudioRecorder } from '../../hooks/use-audio-recorder';
import { Mic, Square, Play, Copy, Upload, Trash2, Languages, Activity } from 'lucide-react';
import axios from 'axios';
import { ModeToggle } from '../components/mode-toggle';

export default function TranslatorApp() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [spokenLang, setSpokenLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('en');

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [translation, setTranslation] = useState('');
  const [translationTimeMs, setTranslationTimeMs] = useState<number | null>(null);
  
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Prescription Pipeline State
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mappedDrugs, setMappedDrugs] = useState<any[]>([]);
  const [prescriptionHtml, setPrescriptionHtml] = useState<string | null>(null);
  const [pipelineMetrics, setPipelineMetrics] = useState<{ extractMs: number; mapMs: number; generateMs?: number } | null>(null);

  const [prescriptionHistory, setPrescriptionHistory] = useState<any[]>([]);
  const [viewingHistoryId, setViewingHistoryId] = useState<number | null>(null);
  const [historyHtml, setHistoryHtml] = useState<string | null>(null);
  
  const [patientName, setPatientName] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  
  const [isLiveMode, setIsLiveMode] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [activeTab, setActiveTab] = useState<'doctor' | 'developer' | 'history' | 'usage'>('doctor');
  
  const [usageStats, setUsageStats] = useState<any>({ transcriptions: [], translations: [] });

  const pendingAudioRef = useRef<ArrayBufferLike[]>([]);
  const isBackendReadyRef = useRef(false);

  const onDataAvailable = (data: Int16Array | Blob) => {
    if (isLiveMode && wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN && isBackendReadyRef.current) {
        if (data instanceof Int16Array) {
          wsRef.current.send(data.buffer);
        } else {
          wsRef.current.send(data);
        }
      } else {
        if (data instanceof Int16Array) {
          // Copy buffer because Int16Array shares underlying buffer if reused, 
          // though our hook creates a new Int16Array each time. Safe to just push.
          pendingAudioRef.current.push(data.buffer);
        }
      }
    }
  };

  const { isRecording, audioBlob, setAudioBlob, startRecording, stopRecording, clearAudio } = useAudioRecorder(isLiveMode ? { onDataAvailable } : undefined);

  const handleDoctorGenerate = async () => {
    if (!transcription.trim()) return;
    setIsExtracting(true);
    setIsGenerating(true);
    setError(null);
    setPrescriptionHtml(null);
    setPipelineMetrics(null);
    setMappedDrugs([]);

    try {
      // 1. Extract
      const startExtract = performance.now();
      const extracted = await extractDrugs(transcription);
      const extractTime = performance.now() - startExtract;

      // 2. Map
      const startMap = performance.now();
      const mapped = await mapDrugsToDatabase(extracted);
      const mapTime = performance.now() - startMap;
      setMappedDrugs(mapped);

      // 3. Generate
      const startGen = performance.now();
      const result = await generatePrescription(transcription, mapped);
      const generateTime = performance.now() - startGen;

      setPatientName(result.patientName || 'Unknown Patient');
      setDiagnosis(result.diagnosis || 'Unknown Diagnosis');
      
      const editableHtml = result.html.replace('<body>', '<body contenteditable="true">');
      setPrescriptionHtml(editableHtml);
      
      setPipelineMetrics({ extractMs: extractTime, mapMs: mapTime, generateMs: generateTime });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Doctor Pipeline Failed');
    } finally {
      setIsExtracting(false);
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    getLanguages().then(setLanguages).catch(console.error);
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/usage');
      setUsageStats(response.data);
    } catch (error) {
      console.error('Failed to fetch usage stats', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await getPrescriptionHistory();
      setPrescriptionHistory(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const loadHistoryItem = async (id: number) => {
    try {
      setHistoryHtml(null);
      setViewingHistoryId(id);
      const html = await getPrescriptionHtml(id);
      setHistoryHtml(html);
    } catch (err) {
      console.error('Failed to load prescription HTML', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  // WebSocket Live Transcription setup
  useEffect(() => {
    if (isRecording && isLiveMode) {
      setIsTranscribing(true);
      let wsUrlStr = `ws://${window.location.hostname}:3001`;
      if (process.env.NEXT_PUBLIC_WS_URL) {
        wsUrlStr = process.env.NEXT_PUBLIC_WS_URL;
      } else if (process.env.NEXT_PUBLIC_API_URL) {
        // Fallback: derive ws:// from http://
        wsUrlStr = process.env.NEXT_PUBLIC_API_URL.replace('http', 'ws').replace('/api', '');
      }
      const ws = new WebSocket(wsUrlStr);
      wsRef.current = ws;

      const wsMode = 'translate';

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'start', languageCode: spokenLang, mode: wsMode }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'ready') {
          isBackendReadyRef.current = true;
          pendingAudioRef.current.forEach(buf => wsRef.current?.send(buf));
          pendingAudioRef.current = [];
        } else if (data.type === 'transcript') {
          setTranscription(data.text);
        } else if (data.type === 'error') {
          setError(data.message);
        }
      };

      ws.onclose = () => {
        isBackendReadyRef.current = false;
        pendingAudioRef.current = [];
        setIsTranscribing(false);
        fetchUsageStats(); // Refresh usage when done
      };
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setIsTranscribing(false);
      }
    }
  }, [isRecording, isLiveMode, spokenLang, activeTab]);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      const handleSavePrescription = async () => {
    try {
      setIsSaving(true);
      await savePrescription(patientName, diagnosis, iframeRef.current?.contentDocument?.documentElement.outerHTML || prescriptionHtml || '');
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl(null);
    }
  }, [audioBlob]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        setError('Audio file is too large. Max 25MB.');
        return;
      }
      setAudioBlob(file);
      setError(null);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    setError(null);
    setTranscription('');
    
    try {
      const apiMode = 'translate';
      const result = await transcribeAudio(audioBlob, spokenLang, apiMode, (partialText) => {
        setTranscription(partialText);
      });
      setTranscription(result.text);
      fetchUsageStats();
    } catch (err: any) {
      setError(err.message || 'Transcription failed.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranslate = async () => {
    if (!transcription.trim()) return;
    setIsTranslating(true);
    setError(null);
    setTranslation('');
    setTranslationTimeMs(null);

    try {
      const result = await translateText(transcription, spokenLang, targetLang);
      setTranslation(result.translatedText);
      if (result.translationTimeMs) {
        setTranslationTimeMs(result.translationTimeMs);
      }
      fetchUsageStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleExtractAndMap = async () => {
    if (!transcription.trim()) return;
    setIsExtracting(true);
    setError(null);
    setMappedDrugs([]);
    setPipelineMetrics(null);

    try {
      // Step 1: Extract
      const startExtract = performance.now();
      const extracted = await extractDrugs(transcription);
      const extractTime = performance.now() - startExtract;

      if (extracted.length === 0) {
        setError('No drugs found in transcript.');
        setIsExtracting(false);
        return;
      }

      // Step 2: Map
      const startMap = performance.now();
      const mapped = await mapDrugsToDatabase(extracted);
      const mapTime = performance.now() - startMap;

      setMappedDrugs(mapped);
      setPrescriptionHtml(null);
      setPipelineMetrics({ extractMs: extractTime, mapMs: mapTime });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to extract and map drugs.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = async () => {
    if (!transcription.trim() || mappedDrugs.length === 0) return;
    setIsGenerating(true);
    setError(null);

    try {
      const startGen = performance.now();
      const result = await generatePrescription(transcription, mappedDrugs);
      const generateTime = performance.now() - startGen;

      setPatientName(result.patientName || 'Unknown Patient');
      setDiagnosis(result.diagnosis || 'Unknown Diagnosis');
      
      const editableHtml = result.html.replace('<body>', '<body contenteditable="true">');
      setPrescriptionHtml(editableHtml);
      
      setPipelineMetrics(prev => prev ? { ...prev, generateMs: generateTime } : null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to generate prescription.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSavePrescription = async () => {
    try {
      setIsSaving(true);
      await savePrescription(patientName, diagnosis, iframeRef.current?.contentDocument?.documentElement.outerHTML || prescriptionHtml || '');
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans">
      
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">SleekCare AI</span>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: 'doctor', label: 'Dashboard' },
              { id: 'developer', label: 'Developer Debug' },
              { id: 'history', label: 'History' },
              { id: 'usage', label: 'Usage Logs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setTranscription(''); setTranslation(''); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* GLOBAL ERRORS */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 flex items-center gap-3 text-red-800 dark:text-red-400">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[800px]">
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
                      className={`w-full text-left p-4 rounded-xl transition-all border ${
                        viewingHistoryId === p.id 
                          ? 'border-blue-500 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-blue-500/20' 
                          : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-sm'
                      }`}
                    >
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{p.patient_name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2">{new Date(p.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{p.diagnosis}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="w-full md:w-2/3 p-6 flex flex-col bg-slate-100/50 dark:bg-slate-950/50">
              {historyHtml ? (
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
        )}

        {/* --- DOCTOR & DEVELOPER TABS --- */}
        {(activeTab === 'doctor' || activeTab === 'developer') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Input & STT */}
            <div className={`flex flex-col gap-6 ${prescriptionHtml ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'}`}>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-blue-500" /> Dictation
                  </h2>
                  <label className="flex items-center gap-2 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
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
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none appearance-none"
                    >
                      <option value="auto">Auto-Detect Language</option>
                      {languages.map(l => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {!isRecording ? (
                      <button
                        onClick={() => { setTranscription(''); startRecording(); }}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
                      >
                        <Mic className="w-4 h-4" /> Start Recording
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm animate-pulse"
                      >
                        <Square className="w-4 h-4" /> Stop
                      </button>
                    )}
                  </div>

                  {audioUrl && !isLiveMode && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      <audio src={audioUrl} controls className="w-full h-10 rounded-lg bg-slate-50 dark:bg-slate-800" />
                      <div className="flex gap-3">
                        <button
                          onClick={handleTranscribe}
                          disabled={isTranscribing}
                          className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {isTranscribing ? 'Processing...' : 'Transcribe'}
                        </button>
                        <button
                          onClick={clearAudio}
                          className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(transcription || isTranscribing) && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
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
                    className="w-full flex-1 p-5 bg-transparent resize-none min-h-[200px] outline-none text-slate-700 dark:text-slate-300 text-base leading-relaxed placeholder-slate-400 dark:placeholder-slate-500"
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
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 text-white px-6 py-3.5 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          {(isExtracting || isGenerating) ? (
                            <><div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> Analyzing...</>
                          ) : 'Generate Rx'}
                        </button>
                      ) : (
                        <button
                          onClick={handleExtractAndMap}
                          disabled={isExtracting || !transcription.trim()}
                          className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex justify-center"
                        >
                          {isExtracting ? 'Extracting...' : 'Extract & Map to Database'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Output & Preview */}
            <div className={`${prescriptionHtml ? 'lg:col-span-7' : 'hidden'}`}>
              {prescriptionHtml && (
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
              )}
            </div>
          </div>
        )}

        {/* DEVELOPER DEBUG PANEL (Appears below in Dev tab) */}
        {activeTab === 'developer' && mappedDrugs.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Entity Resolution Pipeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mappedDrugs.map((drug, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-3 text-sm">Target: <span className="font-bold text-blue-600 dark:text-blue-400">"{drug.original_extracted_word}"</span></p>
                  
                  <div className="space-y-4">
                    {drug.top_phonetic && drug.top_phonetic.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phonetic Matches</h4>
                        <div className="space-y-2">
                          {drug.top_phonetic.map((match: any, j: number) => (
                            <div key={`p-${j}`} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2.5 rounded-lg shadow-sm">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{match.brand_name}</p>
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
                            <div key={`f-${j}`} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2.5 rounded-lg shadow-sm flex flex-col">
                              <div className="flex justify-between items-start">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate pr-2">{match.brand_name}</p>
                                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded flex-shrink-0">s:{Math.round(match.score)}</span>
                              </div>
                              {match.salt && <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate">{match.salt}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-6 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-xl font-medium shadow-sm transition-all disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Run Generation Step'}
              </button>
            </div>
          </div>
        )}

        {/* --- USAGE LOGS TAB --- */}
        {activeTab === 'usage' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Billing & Usage</h2>
            
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Transcription Operations</h3>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Cost (INR)</th>
                      <th className="px-6 py-4">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {(usageStats?.transcriptions || []).map((stat: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{new Date(stat.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{stat.duration_seconds.toFixed(1)}s</td>
                        <td className="px-6 py-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">₹{stat.cost_inr.toFixed(4)}</td>
                        <td className="px-6 py-4 text-slate-400 truncate max-w-xs">{stat.transcription_text}</td>
                      </tr>
                    ))}
                    {(!usageStats?.transcriptions || usageStats.transcriptions.length === 0) && (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Translation Operations</h3>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Route</th>
                      <th className="px-6 py-4">Length</th>
                      <th className="px-6 py-4">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {(usageStats?.translations || []).map((stat: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{new Date(stat.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{stat.source_language} → {stat.target_language}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{stat.text_length} chars</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{stat.translation_time_ms} ms</td>
                      </tr>
                    ))}
                    {(!usageStats?.translations || usageStats.translations.length === 0) && (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

