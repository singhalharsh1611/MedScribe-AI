"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["Live Dictation", "Transcript Review", "AI Processing", "Extraction", "Draft Order"];

export default function VoiceTranscriptPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [transcriptText, setTranscriptText] = useState(
    "Patient presents with persistent dry cough and wheezing over the last 4 days. Denies fever or chills. History of mild asthma. Recommending Albuterol HFA 90mcg 2 puffs every 4 to 6 hours as needed, and starting Montelukast 10mg orally daily for 30 days. Fluticasone nasal spray 50mcg daily for 14 days for concurrent allergic rhinitis symptoms."
  );

  useEffect(() => {
    const data = localStorage.getItem("activeQueueEntry");
    if (data) {
      try { setPatient(JSON.parse(data)); } catch (e) {}
    }

    const transcription = localStorage.getItem("transcriptionResult");
    if (transcription) {
      try {
        const result = JSON.parse(transcription);
        if (result.transcript) setTranscriptText(result.transcript);
        if (result.patient) setPatient(result.patient);
      } catch (e) {}
    }
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 min-h-[calc(100vh-6rem)] pb-4 pt-4 lg:flex-row">
      {/* LEFT: Vertical Steps Flow */}
      <div className="hidden w-56 shrink-0 flex-col gap-5 pt-2 lg:flex">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-muted ml-1">Encounter Workflow</h3>
        <div className="flex flex-col gap-0 relative">
          <div className="absolute left-3.5 top-2 bottom-6 w-px bg-surface-container-highest z-0"></div>
          {STEPS.map((step, idx) => {
            const isActive = idx === 1;
            const isCompleted = idx < 1;
            
            let bgClass = "bg-app-bg text-text-muted border-surface-container-highest";
            if (isActive) bgClass = "bg-primary text-white border-primary shadow-sm";
            else if (isCompleted) bgClass = "bg-primary-container text-primary border-primary";
            
            return (
              <div key={step} className="flex items-start gap-4 relative z-10 py-3">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold shrink-0 border-2 ${bgClass}`}>
                  {isCompleted ? <span className="material-symbols-outlined text-[16px]">check</span> : idx + 1}
                </div>
                <div className="flex flex-col mt-0.5">
                  <span className={`text-[14px] font-bold ${isActive || isCompleted ? "text-primary" : "text-on-surface-variant"}`}>{step}</span>
                  {isActive && <span className="text-[11px] font-semibold text-clinical-success flex items-center gap-1 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-clinical-success animate-ping"></span>Active</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Main Area */}
      <div className="flex-1 flex flex-col gap-6 pb-10 lg:overflow-y-auto lg:pr-2">
        
        {/* Dynamic Patient Header */}
        <div className="bg-card-surface rounded-xl p-6 shadow-sm border border-surface-container shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-primary font-bold text-[18px] flex items-center justify-center shadow-sm shrink-0">
              {patient?.first_name?.charAt(0) || "P"}{patient?.last_name?.charAt(0) || "T"}
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[18px] font-bold text-text-ink truncate">{patient ? `${patient.first_name} ${patient.last_name}` : "Patient"}</h2>
              <span className="text-[13px] font-semibold text-text-muted truncate">{patient?.complaint || "Routine Checkup"}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">UHID</span>
              <span className="text-[14px] font-bold text-text-ink">{patient?.uhid || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Gender</span>
              <span className="text-[14px] font-bold text-text-ink capitalize">{patient?.gender || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-6">
            <div className="bg-card-surface shadow-sm rounded-xl p-6 flex flex-col gap-4 border border-surface-container relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-clinical-success"></div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-clinical-success text-[24px]">verified_user</span>
                  <h3 className="font-bold text-[18px] text-text-ink tracking-tight">Audio Parsing Complete</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-md border border-surface-container">
                  <span className="w-2 h-2 rounded-full bg-clinical-success animate-pulse"></span>
                  <span className="text-[11px] font-bold text-text-ink">Confident Match</span>
                </div>
              </div>
              
              <p className="text-[14px] text-text-muted font-medium">
                The ambient stream has been processed and converted to text. Please review the raw transcript below for accuracy before proceeding to structured AI drafting.
              </p>

              <div className="bg-surface-container-lowest border border-surface-container rounded-xl p-1 mt-2">
                {!isEditing ? (
                  <div className="p-4 bg-app-bg rounded-lg shadow-inner">
                    <p className="text-[15px] text-text-ink font-medium leading-relaxed">
                      &quot;{transcriptText}&quot;
                    </p>
                  </div>
                ) : (
                  <div className="p-2 flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">Manual Correction Mode</label>
                    <textarea 
                      className="w-full p-4 bg-card-surface text-text-ink text-[14px] font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container leading-relaxed resize-y"
                      rows={5}
                      value={transcriptText}
                      onChange={(e) => setTranscriptText(e.target.value)}
                    />
                    <div className="flex justify-end gap-3 mt-1">
                      <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded text-text-muted hover:text-text-ink text-[13px] font-bold transition-colors cursor-pointer">
                        Cancel
                      </button>
                      <button onClick={() => {
                        try {
                          const existing = localStorage.getItem("transcriptionResult");
                          const parsed = existing ? JSON.parse(existing) : {};
                          localStorage.setItem("transcriptionResult", JSON.stringify({ ...parsed, transcript: transcriptText }));
                        } catch(e) {}
                        setIsEditing(false);
                      }} className="px-5 py-2 bg-primary text-on-primary rounded-lg text-[13px] font-bold shadow-sm hover:bg-accent-dark transition-colors cursor-pointer">
                        Save Transcript
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-surface-container mt-2">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-text-ink text-[13px] font-bold transition-colors shadow-sm cursor-pointer border border-surface-container"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  <span>{isEditing ? "Close Editor" : "Edit Transcript"}</span>
                </button>
                
                <button 
                  onClick={() => router.push("/consultation/voice/processing")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary-container hover:bg-accent-dark text-on-primary font-bold text-[14px] shadow-md transition-colors active:scale-95 cursor-pointer group"
                >
                  <span>Continue to AI Processing</span>
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
