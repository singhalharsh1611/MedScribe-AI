'use client';

import { useState, useEffect, useRef } from 'react';
import { getLanguages, transcribeAudio, translateText } from '../../lib/api';
import { Language } from '../../types';
import { useAudioRecorder } from '../../hooks/use-audio-recorder';
import { Mic, Square, Play, Copy, Upload, Trash2, Languages, Activity } from 'lucide-react';
import axios from 'axios';

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
  const [error, setError] = useState<string | null>(null);
  
  const [isLiveMode, setIsLiveMode] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  
  const [activeTab, setActiveTab] = useState<'two-step' | 'direct-sttt'>('two-step');
  
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

  useEffect(() => {
    getLanguages().then(setLanguages).catch(console.error);
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001/api` : 'http://localhost:3001/api');
      const res = await axios.get(`${apiUrl}/usage`);
      setUsageStats(res.data);
    } catch(e) {
      console.error(e);
    }
  };

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

      const wsMode = activeTab === 'direct-sttt' ? 'translate' : 'transcribe';

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
        fetchUsage(); // Refresh usage when done
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
      const apiMode = activeTab === 'direct-sttt' ? 'translate' : 'transcribe';
      const result = await transcribeAudio(audioBlob, spokenLang, apiMode);
      setTranscription(result.text);
      fetchUsage();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transcription failed.');
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
      fetchUsage();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Languages className="w-10 h-10 text-blue-600" />
            Indian Voice Translator
          </h1>
          <p className="text-gray-600 text-lg">Speak naturally. We'll transcribe and translate it.</p>
        </div>

        <div className="flex justify-center border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('two-step'); setTranscription(''); setTranslation(''); }}
            className={`px-6 py-3 font-medium text-sm sm:text-base border-b-2 transition-colors ${activeTab === 'two-step' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Two-Step (STT ➔ Translate)
          </button>
          <button
            onClick={() => { setActiveTab('direct-sttt'); setTranscription(''); setTranslation(''); }}
            className={`px-6 py-3 font-medium text-sm sm:text-base border-b-2 transition-colors ${activeTab === 'direct-sttt' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Direct STTT (Sarvam Native)
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* STEP 1: RECORD AUDIO */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center space-y-6">
          <div className="w-full flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-medium text-gray-800">
              1. Input Audio {activeTab === 'direct-sttt' && <span className="text-sm text-indigo-500 ml-2">(Auto-translates to English)</span>}
            </h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                <input type="checkbox" checked={isLiveMode} onChange={(e) => setIsLiveMode(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500"/>
                <span className="text-sm font-semibold text-blue-800 flex items-center gap-1"><Activity className="w-4 h-4"/> Live Transcription</span>
              </label>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-600">Spoken Language:</label>
                <select
                  value={spokenLang}
                  onChange={(e) => setSpokenLang(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm p-1.5 text-sm border focus:border-blue-500 focus:ring-blue-500 bg-white"
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
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-medium transition-colors shadow-sm"
              >
                <Mic className="w-5 h-5" /> Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-full font-medium transition-colors animate-pulse shadow-sm"
              >
                <Square className="w-5 h-5" /> Stop Recording
              </button>
            )}

            {!isLiveMode && (
              <>
                <div className="flex items-center text-gray-500 px-2 font-medium">OR</div>
                <label className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-full font-medium cursor-pointer transition-colors shadow-sm">
                  <Upload className="w-5 h-5" />
                  Upload Audio
                  <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </>
            )}
          </div>

          {!isLiveMode && audioUrl && (
            <div className="w-full max-w-md bg-gray-50 rounded-lg p-4 flex flex-col items-center gap-4 border mt-4">
              <span className="text-sm font-medium text-gray-600">Audio Ready</span>
              <audio src={audioUrl} controls className="w-full h-10" />
              <div className="flex gap-4 w-full justify-center">
                <button
                  onClick={clearAudio}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
                <button
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: TRANSCRIPTION & TRANSLATION */}
        {(transcription || isTranscribing) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Transcription Panel */}
            <div className={`bg-white rounded-xl shadow-md p-6 flex flex-col h-full border-t-4 ${activeTab === 'direct-sttt' ? 'border-indigo-500 lg:col-span-2' : 'border-blue-500'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  {activeTab === 'direct-sttt' ? '2. Direct English Translation (STTT)' : '2. Transcription'}
                </h3>
                {transcription && (
                  <button onClick={() => copyToClipboard(transcription)} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                )}
              </div>
              <textarea
                className={`w-full flex-grow p-4 border rounded-md resize-none min-h-[200px] ${activeTab === 'direct-sttt' ? 'focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/30' : 'focus:ring-blue-500 focus:border-blue-500'}`}
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder={isTranscribing ? "Processing your audio... please wait." : "Result will appear here... (You can edit it)"}
                disabled={isTranscribing && !isLiveMode}
              />
            </div>

            {/* Translation Panel */}
            {activeTab === 'two-step' && (
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col h-full border-t-4 border-indigo-500">
                <div className="flex flex-col mb-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                      3. Translation 
                      {translationTimeMs !== null && <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{translationTimeMs}ms</span>}
                    </h3>
                    {translation && (
                      <button onClick={() => copyToClipboard(translation)} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-medium">
                        <Copy className="w-4 h-4" /> Copy
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                    <label className="text-sm font-semibold text-indigo-900 whitespace-nowrap">Translate to:</label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="w-full rounded-md border-indigo-200 shadow-sm p-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                    >
                      {languages.map(l => (
                        <option key={`tg-${l.code}`} value={l.code}>
                          {l.name} ({l.nativeName})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleTranslate}
                      disabled={isTranslating || !transcription.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                      {isTranslating ? 'Translating...' : 'Translate'}
                    </button>
                  </div>
                </div>

                <textarea
                  className="w-full flex-grow p-4 border rounded-md resize-none focus:ring-indigo-500 focus:border-indigo-500 min-h-[140px]"
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  placeholder={isTranslating ? "Translating..." : "Translation will appear here..."}
                />
              </div>
            )}
          </div>
        )}

        {/* USAGE DB PANEL */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8 border-t-4 border-green-500">
          <h2 className="text-xl font-medium text-gray-800 mb-4 flex items-center gap-2">
            📊 Cost & Usage Logs
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Transcription Logs</h3>
              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="uppercase tracking-wider border-b-2 border-gray-200 text-gray-600 bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Time</th>
                      <th scope="col" className="px-6 py-3">Duration (sec)</th>
                      <th scope="col" className="px-6 py-3">Cost (INR)</th>
                      <th scope="col" className="px-6 py-3">Text Sample</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usageStats?.transcriptions || []).map((stat: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-3">{new Date(stat.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-3">{stat.duration_seconds.toFixed(2)}s</td>
                        <td className="px-6 py-3 font-semibold text-green-600">₹{stat.cost_inr.toFixed(4)}</td>
                        <td className="px-6 py-3 text-gray-500 truncate max-w-xs" title={stat.transcription_text}>{stat.transcription_text}</td>
                      </tr>
                    ))}
                    {(!usageStats?.transcriptions || usageStats.transcriptions.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No transcriptions logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Translation Logs</h3>
              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="uppercase tracking-wider border-b-2 border-gray-200 text-gray-600 bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Time</th>
                      <th scope="col" className="px-6 py-3">Route</th>
                      <th scope="col" className="px-6 py-3">Length (chars)</th>
                      <th scope="col" className="px-6 py-3">Latency (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usageStats?.translations || []).map((stat: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-3">{new Date(stat.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-3 font-medium text-indigo-600">{stat.source_language} ➔ {stat.target_language}</td>
                        <td className="px-6 py-3">{stat.text_length} chars</td>
                        <td className="px-6 py-3">{stat.translation_time_ms} ms</td>
                      </tr>
                    ))}
                    {(!usageStats?.translations || usageStats.translations.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No translations logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
