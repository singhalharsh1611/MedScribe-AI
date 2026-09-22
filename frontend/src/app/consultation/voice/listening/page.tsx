"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["Live Dictation", "Transcript Review", "AI Processing", "Extraction", "Draft Order"];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const TRANSCRIPTION_API_URL = process.env.NEXT_PUBLIC_TRANSCRIPTION_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3001/api" : API_URL);

export default function VoiceListeningPage() {
  const router = useRouter();
  
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [decibels, setDecibels] = useState(0);
  const [patient, setPatient] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingError, setRecordingError] = useState("");
  const [captureStopped, setCaptureStopped] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const isPausedRef = useRef(isPaused);
  const transcriptionInFlightRef = useRef(false);

  useEffect(() => {
    const data = localStorage.getItem("activeQueueEntry");
    if (data) {
      try { setPatient(JSON.parse(data)); } catch (e) {}
    } else {
      router.replace("/doctor/encounter/new");
    }
  }, [router]);

  useEffect(() => {
    let interval: any;
    if (!isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (!patient) return;

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        
        analyserRef.current = analyser;
        const bufferLength = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        // Set up MediaRecorder for live recording
        const preferredMimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
        const recorder = preferredMimeType
          ? new MediaRecorder(stream, { mimeType: preferredMimeType })
          : new MediaRecorder(stream);
        recorderRef.current = recorder;
        audioChunksRef.current = [];
        setCaptureStopped(false);
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        
        recorder.start(1000); // Collect data every second
        
        const renderFrame = () => {
          if (!isPausedRef.current && analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
            let sum = 0;
            for(let i = 0; i < bufferLength; i++) sum += dataArrayRef.current[i];
            const avg = sum / bufferLength;
            setDecibels(Math.floor(avg));
          } else if (isPausedRef.current) {
            setDecibels(0);
          }
          requestRef.current = requestAnimationFrame(renderFrame);
        };
        renderFrame();
      } catch (err) {
        console.error(err);
        setRecordingError("Microphone access failed. Check browser permission and try again.");
      }
    };
    setupAudio();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
      recorderRef.current = null;
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [patient]);

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const stopAudioInput = () => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
    }
    audioContextRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setDecibels(0);
    setIsPaused(true);
    setCaptureStopped(true);
  };

  const stopCapture = (): Promise<Blob | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      stopAudioInput();
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      recorder.addEventListener("stop", () => {
        const mimeType = recorder.mimeType || "audio/webm";
        recorderRef.current = null;
        resolve(new Blob(audioChunksRef.current, { type: mimeType }));
      }, { once: true });
      recorder.stop();
      stopAudioInput();
    });
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    if (transcriptionInFlightRef.current) return;
    transcriptionInFlightRef.current = true;
    setIsUploading(true);
    setRecordingError("");
    try {
      if (audioBlob.size === 0) throw new Error("The recording is empty. Please record again.");
      const formData = new FormData();
      const extension = audioBlob.type.includes("wav") ? "wav" : audioBlob.type.includes("ogg") ? "ogg" : "webm";
      formData.append("audio", audioBlob, `recording.${extension}`);
      
      // Long Modal requests can outlive Next.js's development rewrite proxy.
      // In local development, call the authenticated backend directly.
      const response = await fetch(`${TRANSCRIPTION_API_URL}/transcription`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      const responseText = await response.text();
      const contentType = response.headers.get("content-type") || "";
      let result: any;
      if (contentType.includes("application/json")) {
        try { result = JSON.parse(responseText); } catch { result = null; }
      } else {
        const events = responseText
          .split("\n")
          .filter((line) => line.startsWith("data: "))
          .map((line) => JSON.parse(line.slice(6)));
        result = events.find((event) => event.type === "error") ||
          events.find((event) => event.type === "final");
      }
      if (!response.ok) {
        throw new Error(result?.error || result?.message || `Transcription failed (${response.status})`);
      }
      if (!result) throw new Error("Transcription response did not contain a result");
      const transcript = String(result.text || "").trim();
      if (!transcript) throw new Error("No speech was detected in the recording");
      
      // Store transcript and patient data for the transcript page
      localStorage.setItem("transcriptionResult", JSON.stringify({
        transcript,
        patient,
        audioSeconds: seconds,
      }));
      
      router.push("/consultation/voice/transcript");
    } catch (error) {
      console.error("Transcription error:", error);
      setRecordingError(error instanceof Error ? error.message : "Transcription failed. Please try again.");
    } finally {
      transcriptionInFlightRef.current = false;
      setIsUploading(false);
    }
  };

  const handleStop = async () => {
    if (isUploading) return;
    if (file) {
      await stopCapture();
      await transcribeAudio(file);
      return;
    }

    if (recordedBlob) {
      await transcribeAudio(recordedBlob);
      return;
    }

    const audioBlob = await stopCapture();
    if (!audioBlob) {
      setRecordingError("No active recording was found. Return and start the microphone again.");
      return;
    }
    setRecordedBlob(audioBlob);
    await transcribeAudio(audioBlob);
  };

  const handleCancel = async () => {
    await stopCapture();
    router.push("/doctor/encounter/new");
  };

  const togglePause = () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state === "recording") {
      recorder.pause();
      setIsPaused(true);
    } else if (recorder.state === "paused") {
      recorder.resume();
      setIsPaused(false);
      setCaptureStopped(false);
    }
  };

  const handleFileSelection = async (selectedFile: File | null) => {
    if (selectedFile) await stopCapture();
    setFile(selectedFile);
    setRecordedBlob(null);
    setRecordingError("");
  };

  return (
    <section className="w-full max-w-6xl mx-auto flex flex-col gap-6 min-h-[calc(100vh-6rem)] pb-4 pt-4 lg:flex-row">
      {/* LEFT: Vertical Steps Flow */}
      <div className="hidden w-56 shrink-0 flex-col gap-5 pt-2 lg:flex">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-muted ml-1">Encounter Workflow</h3>
        <div className="flex flex-col gap-0 relative">
          <div className="absolute left-3.5 top-2 bottom-6 w-px bg-surface-container-highest z-0"></div>
          {STEPS.map((step, idx) => (
            <div key={step} className="flex items-start gap-4 relative z-10 py-3">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold shrink-0 shadow-sm border-2 ${idx === 0 ? "bg-primary text-white border-primary" : "bg-app-bg text-text-muted border-surface-container-highest"}`}>
                {idx + 1}
              </div>
              <div className="flex flex-col mt-0.5">
                <span className={`text-[14px] font-bold ${idx === 0 ? "text-primary" : "text-on-surface-variant"}`}>{step}</span>
                {idx === 0 && <span className="text-[11px] font-semibold text-clinical-success flex items-center gap-1 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-clinical-success animate-ping"></span>Active</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Main Dictation Area */}
      <div className="flex-1 flex flex-col gap-4 pb-10 lg:overflow-y-auto lg:pr-2">
        
        <div className="bg-card-surface rounded-2xl p-6 min-h-0 flex-1 overflow-hidden shadow-sm flex flex-col items-center justify-center border-2 border-primary/20 relative">
          <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none rounded-2xl"></div>

          <div className="flex flex-col items-center justify-center relative z-10">
            {/* Dynamic Patient Card */}
            <div className="w-16 h-16 rounded-full bg-primary-container text-primary font-bold text-[20px] flex items-center justify-center shadow-sm">
              {patient?.first_name?.charAt(0) || "P"}{patient?.last_name?.charAt(0) || "T"}
            </div>
            <h2 className="text-[20px] font-bold text-text-ink mt-3">{patient ? `${patient.first_name} ${patient.last_name}` : "Patient"}</h2>
            <span className="text-[13px] font-semibold text-text-muted mt-1">{patient?.complaint || "Routine Checkup"}</span>
            <span className="text-[12px] font-semibold text-on-surface-variant mt-1">UHID: {patient?.uhid || "N/A"}</span>
          </div>

          <div className="text-center mt-6 z-10">
            <div className="flex items-center justify-center gap-1.5 text-primary mb-2">
              <span className="material-symbols-outlined text-[18px]">sensors</span>
              <span className="text-[11px] font-bold uppercase tracking-wider">Clinical LLM Stream Connected</span>
            </div>
            <h1 className="text-[32px] font-bold text-text-ink tracking-tight">
              {file ? "File Ready" : isUploading ? "Processing Recording" : captureStopped ? "Recording Stopped" : isPaused ? "Recording Paused" : "Listening..."}
            </h1>
            
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-baseline gap-2 bg-surface-container-lowest px-6 py-3 rounded-xl shadow-inner border border-surface-container">
                <span className={`material-symbols-outlined text-clinical-error text-[24px] ${isPaused || file ? "" : "animate-pulse"}`}>radio_button_checked</span>
                <span className="font-mono text-[40px] font-bold tracking-tight text-text-ink">{formatTime(seconds)}</span>
              </div>
            </div>
          </div>

          {/* Real Audio Visualizer (No line in between!) */}
          <div className="w-full flex flex-col items-center my-6 z-10">
            <div className="w-full max-w-2xl h-24 bg-surface-container-lowest rounded-xl px-4 py-2 flex items-center justify-center gap-1.5 shadow-inner overflow-hidden border border-surface-container">
              {Array.from({ length: 40 }).map((_, idx) => {
                const variance = Math.sin(idx + seconds * 5) * 10;
                const h = isPaused || decibels === 0 ? 8 : Math.floor(Math.max(8, Math.min(80, (decibels / 255) * 120 + variance)));
                return (
                  <div 
                    key={idx}
                    className={`w-1.5 rounded-full transition-all duration-75 ${idx % 3 === 0 ? "bg-primary" : idx % 2 === 0 ? "bg-primary-container" : "bg-secondary-container"}`}
                    style={{ height: `${h}px` }}
                  />
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 bg-success-bg text-clinical-success px-3 py-1 rounded-full text-[12px] font-bold shadow-sm">
                <span className="material-symbols-outlined text-[16px]">volume_up</span>
                <span>{isPaused ? "0 dB (Paused)" : file ? "File Loaded" : `${decibels} dB`}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-full text-[12px] font-bold shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-clinical-success">check_circle</span>
                <span>{file ? "File Ready for Transcription" : captureStopped ? "Microphone Stopped" : isPaused ? "Microphone Paused" : "Microphone Active"}</span>
              </div>
            </div>
          </div>

          {/* Actions (with Choose File intact) */}
          <div className="w-full flex flex-col items-center justify-center gap-4 z-10">
            <div className="bg-surface-container-low px-4 py-3 rounded-xl border border-surface-container flex flex-col gap-2 w-full max-w-md">
              <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Direct Audio Sending (Optional)</span>
              <input 
                type="file" 
                accept=".mp3,.ogg,.wav,audio/*" 
                onChange={(e) => void handleFileSelection(e.target.files?.[0] || null)}
                className="text-[13px] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-primary file:text-white hover:file:bg-accent-dark cursor-pointer"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={handleCancel} className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant px-5 py-3 rounded-lg transition-colors text-[13px] font-bold shadow-sm cursor-pointer border border-surface-container">
                <span className="material-symbols-outlined text-[20px]">close</span>
                <span>Cancel</span>
              </button>
              <button onClick={togglePause} disabled={!!file || isUploading} className="flex items-center gap-2 bg-card-surface hover:bg-surface-container text-text-ink px-5 py-3 rounded-lg transition-colors text-[13px] font-bold shadow-sm border border-surface-container cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined text-[20px]">{isPaused ? "play_arrow" : "pause"}</span>
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>
              <button disabled={isUploading} onClick={handleStop} className="flex items-center gap-2 bg-primary hover:bg-accent-dark text-on-primary px-6 py-3 rounded-lg transition-all shadow-md active:scale-95 group cursor-pointer disabled:opacity-50">
                {isUploading && <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>}
                <span className="font-bold text-[14px] tracking-wide">{isUploading ? "Transcribing..." : file ? "Transcribe File" : recordedBlob ? "Retry Transcription" : "Stop & Transcribe"}</span>
                {!isUploading && <span className="material-symbols-outlined text-[20px] ml-1 transition-transform group-hover:translate-x-1">arrow_forward</span>}
              </button>
            </div>
            {recordingError && (
              <div role="alert" className="w-full max-w-md rounded-lg border border-clinical-error/30 bg-error-bg px-4 py-3 text-center text-[13px] font-semibold text-clinical-error">
                {recordingError}
              </div>
            )}
          </div>
        </div>

              </div>
    </section>
  );
}
