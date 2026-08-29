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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8 relative">
        
        <div className="absolute top-0 right-0">
          <ModeToggle />
        </div>

        <div className="text-center space-y-3 pt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-3 tracking-tight">
            <Activity className="w-10 h-10 md:w-12 md:h-12 text-blue-600 dark:text-blue-500" />
            SleekCare AI
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Speak naturally to dictate your consultation. We automatically transcribe, extract, and generate clinical digital prescriptions.
          </p>
        </div>

        <div className="flex justify-center border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { setActiveTab('doctor'); setTranscription(''); setTranslation(''); }}
            className={`px-6 py-3 font-medium text-sm sm:text-base border-b-2 transition-colors ${activeTab === 'doctor' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Doctor Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('developer'); setTranscription(''); setTranslation(''); }}
            className={`px-6 py-3 font-medium text-sm sm:text-base border-b-2 transition-colors ${activeTab === 'developer' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Developer / Debug
          </button>
          <button
            onClick={() => { setActiveTab('history'); }}
            className={`px-6 py-3 font-medium text-sm sm:text-base border-b-2 transition-colors ${activeTab === 'history' ? 'border-teal-600 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Prescription History
          </button>
          <button
            onClick={() => { setActiveTab('usage'); }}
            className={`px-6 py-3 font-medium text-sm sm:text-base border-b-2 transition-colors ${activeTab === 'usage' ? 'border-green-600 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            Cost & Usage Logs
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded shadow-sm">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 p-6 flex flex-col h-[800px]">
            <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">Past Prescriptions</h2>
            <div className="flex gap-6 h-full">
              <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 pr-4 overflow-y-auto space-y-3">
                {prescriptionHistory.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 italic text-sm">No prescriptions generated yet.</p>
                ) : (
                  prescriptionHistory.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => loadHistoryItem(p.id)}
                      className={`w-full text-left p-4 border rounded-lg hover:bg-teal-50 dark:bg-teal-900/20 transition-colors ${viewingHistoryId === p.id ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 ring-1 ring-teal-500' : 'border-slate-200 dark:border-slate-800'}`}
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{p.patient_name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{new Date(p.timestamp).toLocaleString()}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 truncate">{p.diagnosis}</div>
                    </button>
                  ))
                )}
              </div>
              <div className="w-2/3 h-full">
                {historyHtml ? (
                  <div className="w-full h-full border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm shadow-inner relative">
                    <button 
                      onClick={() => {
                        const printWindow = window.open('', '', 'width=900,height=700');
                        printWindow?.document.write(historyHtml);
                        printWindow?.document.close();
                        printWindow?.focus();
                        setTimeout(() => printWindow?.print(), 250);
                      }}
                      className="absolute top-2 right-2 bg-slate-800 dark:bg-slate-700 text-white text-xs px-3 py-1.5 rounded shadow hover:bg-gray-700 transition z-10"
                    >
                      Print / PDF
                    </button>
                    <iframe 
                      srcDoc={historyHtml} 
                      className="w-full h-full border-none"
                      title="Past Prescription"
                    />
                  </div>
                ) : viewingHistoryId ? (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                    Select a prescription from the list to view
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: RECORD AUDIO */}
        {(activeTab === 'doctor' || activeTab === 'developer') && (
          <div className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 p-6 flex flex-col items-center space-y-6">
          <div className="w-full flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200">
              1. Input Audio <span className="text-sm text-indigo-500 ml-2">(Auto-translates to English)</span>
            </h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-200">
                <input type="checkbox" checked={isLiveMode} onChange={(e) => setIsLiveMode(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500"/>
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1"><Activity className="w-4 h-4"/> Live Transcription</span>
              </label>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Spoken Language:</label>
                <select
                  value={spokenLang}
                  onChange={(e) => setSpokenLang(e.target.value)}
                  className="rounded-md border-slate-300 dark:border-slate-700 shadow-sm p-1.5 text-sm border focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm"
                >
                  <option value="auto">Auto-Detect Language</option>
                  {languages.map(l => (
                    <option key={`sp-${l.code}`} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            {!isRecording ? (
              <button
                onClick={() => { setTranscription(''); startRecording(); }}
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 px-6 py-3 rounded-full font-medium transition-colors shadow-sm"
              >
                <Mic className="w-5 h-5" /> Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 bg-slate-800 dark:bg-slate-700 hover:bg-gray-900 text-white px-6 py-3 rounded-full font-medium transition-colors animate-pulse shadow-sm"
              >
                <Square className="w-5 h-5" /> Stop Recording
              </button>
            )}

            {!isLiveMode && (
              <>
                <div className="flex items-center text-slate-500 dark:text-slate-400 px-2 font-medium">OR</div>
                <label className="flex items-center gap-2 bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-full font-medium cursor-pointer transition-colors shadow-sm">
                  <Upload className="w-5 h-5" />
                  Upload Audio
                  <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </>
            )}
          </div>

          {!isLiveMode && audioUrl && (
            <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 flex flex-col items-center gap-4 border mt-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Audio Ready</span>
              <audio src={audioUrl} controls className="w-full h-10" />
              <div className="flex gap-4 w-full justify-center">
                <button
                  onClick={clearAudio}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 text-sm flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
                <button
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  {isTranscribing ? 'Streaming via WebSocket...' : 'Transcribe Audio'}
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* STEP 2: TRANSCRIPTION */}
        {(activeTab === 'doctor' || activeTab === 'developer') && (transcription || isTranscribing) && (
          <div className="w-full">
            
            {/* Transcription Panel */}
            <div className={`bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 p-6 flex flex-col h-full border-t-4 border-indigo-500`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                  2. Transcription & Translation (English)
                </h3>
                {transcription && (
                  <button onClick={() => copyToClipboard(transcription)} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 flex items-center gap-1 text-sm font-medium">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                )}
              </div>
              <textarea
                className={`w-full flex-grow p-4 border rounded-md resize-none min-h-[200px] focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10`}
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder={isTranscribing ? "Streaming audio to Sarvam via WebSocket... please wait." : "Result will appear here... (You can edit it)"}
                disabled={isTranscribing && !isLiveMode}
              />
            </div>
          </div>
        )}

        {/* PRESCRIPTION PIPELINE PANEL */}
        {(activeTab === 'doctor' || activeTab === 'developer') && transcription && (
          <div className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 p-6 mt-8 border-t-4 border-teal-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                💊 Prescription Generation (AI)
              </h2>
              {activeTab === 'doctor' ? (
                <button
                  onClick={handleDoctorGenerate}
                  disabled={isExtracting || isGenerating || !transcription.trim()}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-colors flex items-center gap-2"
                >
                  {(isExtracting || isGenerating) ? (
                    <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Processing Patient...</>
                  ) : 'Generate Digital Prescription'}
                </button>
              ) : (
                <button
                  onClick={handleExtractAndMap}
                  disabled={isExtracting || !transcription.trim()}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isExtracting ? 'Extracting & Mapping...' : '1. Extract Drugs & Map to DB'}
                </button>
              )}
            </div>

            {pipelineMetrics && (
              <div className="flex gap-4 mb-4 text-xs flex-wrap">
                <div className="bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300 px-3 py-1.5 rounded border border-teal-200">
                  <span className="font-semibold">LLM Extraction:</span> {(pipelineMetrics.extractMs / 1000).toFixed(2)}s
                </div>
                <div className="bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300 px-3 py-1.5 rounded border border-teal-200">
                  <span className="font-semibold">DB Mapping:</span> {(pipelineMetrics.mapMs / 1000).toFixed(2)}s
                </div>
                {pipelineMetrics.generateMs !== undefined && (
                  <div className="bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300 px-3 py-1.5 rounded border border-teal-200">
                    <span className="font-semibold">LLM Generation:</span> {(pipelineMetrics.generateMs / 1000).toFixed(2)}s
                  </div>
                )}
                <div className="bg-teal-100 text-teal-900 px-3 py-1.5 rounded border border-teal-300 font-bold">
                  <span>Total Pipeline:</span> {((pipelineMetrics.extractMs + pipelineMetrics.mapMs + (pipelineMetrics.generateMs || 0)) / 1000).toFixed(2)}s
                </div>
              </div>
            )}

            {activeTab === 'developer' && mappedDrugs.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Identified Medications & Candidates:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mappedDrugs.map((drug, i) => (
                    <div key={i} className="border rounded-lg p-4 bg-teal-50 dark:bg-teal-900/20 border-teal-100">
                      <p className="font-medium text-teal-800 dark:text-teal-300 mb-2">Original: <span className="font-bold">"{drug.original_extracted_word}"</span></p>
                      <div className="space-y-4">
                        {/* Phonetic Matches */}
                        {drug.top_phonetic && drug.top_phonetic.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1 border-b border-slate-200 dark:border-slate-800 border-purple-200 pb-1">Top Phonetic Matches</h4>
                            {drug.top_phonetic.map((match: any, j: number) => (
                              <div key={`p-${j}`} className="text-sm flex flex-col bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm p-2 rounded border border-purple-100 shadow-sm">
                                <div className="flex justify-between items-start mb-1">
                                  <p className="font-semibold text-slate-800 dark:text-slate-200">{match.brand_name}</p>
                                </div>
                                {match.salt && <p className="text-slate-500 dark:text-slate-400 text-xs leading-tight">{match.salt}</p>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Fuzzy Matches */}
                        {drug.top_fuzzy && drug.top_fuzzy.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1 border-b border-slate-200 dark:border-slate-800 border-blue-200 pb-1">Top Fuzzy Matches</h4>
                            {drug.top_fuzzy.map((match: any, j: number) => (
                              <div key={`f-${j}`} className="text-sm flex flex-col bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm p-2 rounded border border-blue-100 shadow-sm">
                                <div className="flex justify-between items-start mb-1">
                                  <p className="font-semibold text-slate-800 dark:text-slate-200">{match.brand_name}</p>
                                  <span className="text-blue-600 font-mono text-[10px]">Score: {Math.round(match.score)}</span>
                                </div>
                                {match.salt && <p className="text-slate-500 dark:text-slate-400 text-xs leading-tight">{match.salt}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {(!drug.top_phonetic || drug.top_phonetic.length === 0) && (!drug.top_fuzzy || drug.top_fuzzy.length === 0) && (
                          <p className="text-sm text-red-500 italic">No matches found.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Generating PDF Prescription...
                      </>
                    ) : (
                      '2. Generate Digital Prescription (MedGemma AI)'
                    )}
                  </button>
                </div>
              </div>
            )}

            {prescriptionHtml && (
              <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center justify-between">
                  Final Digital Prescription (Editable)
                  <button 
                    onClick={async () => {
                      try {
                        setIsSaving(true);
                        
                        // Get edited HTML from iframe if possible, fallback to state
                        let finalHtml = prescriptionHtml;
                        try {
                          if (iframeRef.current && iframeRef.current.contentDocument) {
                            finalHtml = iframeRef.current.contentDocument.documentElement.outerHTML;
                            // Clean up contenteditable for saving/printing
                            finalHtml = finalHtml.replace(/contenteditable="true"/g, '');
                          }
                        } catch (e) {
                          console.error("Could not read from iframe", e);
                          finalHtml = finalHtml.replace(/contenteditable="true"/g, '');
                        }

                        // Save to DB
                        await savePrescription(finalHtml, patientName, diagnosis);

                        // Open Print Window
                        const printWindow = window.open('', '', 'width=900,height=700');
                        printWindow?.document.write(finalHtml);
                        printWindow?.document.close();
                        printWindow?.focus();
                        setTimeout(() => printWindow?.print(), 250);
                      } catch (err: any) {
                        alert('Failed to save prescription: ' + (err.message || 'Unknown error'));
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                    className="bg-slate-800 dark:bg-slate-700 text-white text-sm px-4 py-2 rounded shadow hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : '💾 Print & Save'}
                  </button>
                </h3>
                <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm shadow-inner" style={{ height: '800px' }}>
                  <iframe 
                    ref={iframeRef}
                    srcDoc={prescriptionHtml} 
                    className="w-full h-full border-none"
                    title="Prescription Preview"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* USAGE DB PANEL */}
        {activeTab === 'usage' && (
          <div className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm rounded-xl shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 p-6 mt-8 border-t-4 border-green-500">
          <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            📊 Cost & Usage Logs
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Transcription Logs</h3>
              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="uppercase tracking-wider border-b border-slate-200 dark:border-slate-800-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Time</th>
                      <th scope="col" className="px-6 py-3">Duration (sec)</th>
                      <th scope="col" className="px-6 py-3">Cost (INR)</th>
                      <th scope="col" className="px-6 py-3">Text Sample</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usageStats?.transcriptions || []).map((stat: any, i: number) => (
                      <tr key={i} className="border-b border-slate-200 dark:border-slate-800 border-gray-100 hover:bg-slate-50 dark:bg-slate-800/50">
                        <td className="px-6 py-3">{new Date(stat.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-3">{stat.duration_seconds.toFixed(2)}s</td>
                        <td className="px-6 py-3 font-semibold text-green-600">₹{stat.cost_inr.toFixed(4)}</td>
                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400 truncate max-w-xs" title={stat.transcription_text}>{stat.transcription_text}</td>
                      </tr>
                    ))}
                    {(!usageStats?.transcriptions || usageStats.transcriptions.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">No transcriptions logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Translation Logs</h3>
              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="uppercase tracking-wider border-b border-slate-200 dark:border-slate-800-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Time</th>
                      <th scope="col" className="px-6 py-3">Route</th>
                      <th scope="col" className="px-6 py-3">Length (chars)</th>
                      <th scope="col" className="px-6 py-3">Latency (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usageStats?.translations || []).map((stat: any, i: number) => (
                      <tr key={i} className="border-b border-slate-200 dark:border-slate-800 border-gray-100 hover:bg-slate-50 dark:bg-slate-800/50">
                        <td className="px-6 py-3">{new Date(stat.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-3 font-medium text-indigo-600">{stat.source_language} ➔ {stat.target_language}</td>
                        <td className="px-6 py-3">{stat.text_length} chars</td>
                        <td className="px-6 py-3">{stat.translation_time_ms} ms</td>
                      </tr>
                    ))}
                    {(!usageStats?.translations || usageStats.translations.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">No translations logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        )}

      </div>
    </div>
  );
}


