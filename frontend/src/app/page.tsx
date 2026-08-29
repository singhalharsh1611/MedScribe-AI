'use client';

import { useState, useEffect, useRef } from 'react';
import { getLanguages, transcribeAudio, translateText, extractDrugs, mapDrugsToDatabase, generatePrescription, getPrescriptionHistory, getPrescriptionHtml, savePrescription } from '../../lib/api';
import { Language } from '../../types';
import { useAudioRecorder } from '../../hooks/use-audio-recorder';
import { Mic, Square, Play, Copy, Upload, Trash2, Languages, Activity } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ModeToggle } from '../components/mode-toggle';

import { Header } from '../components/Header';
import { HistoryTab } from '../components/HistoryTab';
import { UsageTab } from '../components/UsageTab';
import { DictationPanel } from '../components/DictationPanel';
import { DeveloperDebug } from '../components/DeveloperDebug';
import { PrescriptionPreview } from '../components/PrescriptionPreview';

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
      fetchUsageStats();
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

  
  const handleSavePrescription = async () => {
    try {
      setIsSaving(true);
      const loadingToast = toast.loading('Saving prescription and uploading audio...');
      
      let uploadedAudioUrl = null;
      if (audioBlob) {
          try {
              const formData = new FormData();
              formData.append('audio', audioBlob, 'recording.webm');
              const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/transcription/upload`, formData);
              uploadedAudioUrl = res.data.audioUrl;
          } catch(e) {
              console.error('Failed to upload audio to cloudinary:', e);
              toast.error('Failed to upload audio, but saving prescription anyway');
          }
      }
      
      await savePrescription(iframeRef.current?.contentDocument?.documentElement.outerHTML || prescriptionHtml || '', patientName, diagnosis, transcription, uploadedAudioUrl);
      fetchHistory();
      toast.dismiss(loadingToast);
      toast.success('Prescription saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save prescription');
    } finally {
      setIsSaving(false);
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

  useEffect(() => {
    if (audioUrl && isLiveMode) {
      setTimeout(fetchUsageStats, 1500);
    }
  }, [audioUrl, isLiveMode]);

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
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans">
      
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        resetState={() => { setTranscription(''); setTranslation(''); }} 
      />

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
          <HistoryTab 
            prescriptionHistory={prescriptionHistory}
            viewingHistoryId={viewingHistoryId}
            historyHtml={historyHtml}
            loadHistoryItem={loadHistoryItem}
          />
        )}

        {/* --- DOCTOR & DEVELOPER TABS --- */}
        {(activeTab === 'doctor' || activeTab === 'developer') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Input & STT */}
            <div className={`flex flex-col gap-6 ${prescriptionHtml ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'}`}>
              <DictationPanel 
                isLiveMode={isLiveMode}
                setIsLiveMode={setIsLiveMode}
                spokenLang={spokenLang}
                setSpokenLang={setSpokenLang}
                languages={languages}
                isRecording={isRecording}
                startRecording={startRecording}
                stopRecording={stopRecording}
                audioUrl={audioUrl}
                handleTranscribe={handleTranscribe}
                isTranscribing={isTranscribing}
                clearAudio={clearAudio}
                handleFileUpload={handleFileUpload}
                transcription={transcription}
                setTranscription={setTranscription}
                copyToClipboard={copyToClipboard}
                activeTab={activeTab}
                isExtracting={isExtracting}
                isGenerating={isGenerating}
                handleDoctorGenerate={handleDoctorGenerate}
                handleExtractAndMap={handleExtractAndMap}
              />
            </div>

            {/* RIGHT COLUMN: Output & Preview */}
            <div className={`${prescriptionHtml ? 'lg:col-span-7' : 'hidden'}`}>
              <PrescriptionPreview 
                prescriptionHtml={prescriptionHtml}
                isSaving={isSaving}
                handleSavePrescription={handleSavePrescription}
                pipelineMetrics={pipelineMetrics}
                isGenerating={isGenerating}
                iframeRef={iframeRef}
                activeTab={activeTab as 'doctor' | 'developer'}
              />
            </div>
          </div>
        )}

        {/* DEVELOPER DEBUG PANEL (Appears below in Dev tab) */}
        {activeTab === 'developer' && mappedDrugs.length > 0 && (
          <DeveloperDebug 
            mappedDrugs={mappedDrugs}
            isGenerating={isGenerating}
            handleGenerate={handleGenerate}
            pipelineMetrics={pipelineMetrics}
          />
        )}

        {/* --- USAGE LOGS TAB --- */}
        {activeTab === 'usage' && (
          <UsageTab usageStats={usageStats} />
        )}

      </main>
    </div>
  );
}



