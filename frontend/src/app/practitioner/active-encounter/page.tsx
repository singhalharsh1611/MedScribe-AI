"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PractitionerActiveEncounterPage() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(585); // starts around 09:45
  const [doctorNotes, setDoctorNotes] = useState(
    'Patient presents with clear allergic signs. Chest auscultation indicates mild bilateral wheeze. Started Fluticasone and Montelukast.'
  );
  
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      name: 'Fluticasone Propionate Nasal Spray',
      strength: '50 mcg/actuation',
      sig: 'Sig: 1 spray in each nostril daily in the morning • Dispense: 1 bottle (16g) • Refills: 2',
      target: 'Target: Allergic nasal mucosal hyperreactivity and rhinitis relief',
      isNew: true,
      status: 'No Contraindications'
    },
    {
      id: 2,
      name: 'Montelukast Sodium Tablet',
      strength: '10 mg Oral Tablet',
      sig: 'Sig: 1 tablet PO daily at bedtime • Dispense: 30 tablets • Refills: 3',
      target: 'Target: Leukotriene receptor antagonist for nocturnal asthma suppression',
      isNew: true,
      status: 'No Contraindications'
    },
    {
      id: 3,
      name: 'Albuterol Sulfate HFA',
      strength: '90 mcg Inhalation',
      sig: 'Sig: 2 puffs inhaled every 4-6 hours PRN for shortness of breath or acute wheeze • Dispense: 1 Inhaler',
      target: 'Active Since 2021',
      isNew: false,
      status: 'Continued Regimen'
    }
  ]);
  const [savedAlert, setSavedAlert] = useState(false);
  const [isPrescribingVoice, setIsPrescribingVoice] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (total: number) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleInsertMacro = (macro: string) => {
    let snippet = '';
    if (macro === '.normal_resp') {
      snippet = ' Respiration regular, unlabored. No intercostal retractions.';
    } else if (macro === '.asthma_action_plan') {
      snippet = ' Patient educated on Green/Yellow/Red peak flow action plan. Instructed on proper MDI spacer technique.';
    } else if (macro === '.followup_2wk') {
      snippet = ' Return to clinic in 14 days for spirometry review and clinical reassessment. Call earlier if wheeze worsens.';
    }
    setDoctorNotes(prev => prev + snippet);
  };

  const handleSaveDraft = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  const handleRemoveMed = (id: number) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const handleAddSimulatedMed = () => {
    setIsPrescribingVoice(true);
    setTimeout(() => {
      setIsPrescribingVoice(false);
      const newMed = {
        id: Date.now(),
        name: 'Levocetirizine Dihydrochloride',
        strength: '5 mg Tablet',
        sig: 'Sig: 1 tab PO at bedtime • Dispense: 30 tablets • Refills: 1',
        target: 'Target: Second-generation antihistamine additive',
        isNew: true,
        status: 'Voice Transcribed'
      };
      setPrescriptions(prev => [newMed, ...prev]);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full pb-20 px-8">
      {/* Dynamic Clinical Encounter Sticky Banner */}
      <div className="sticky top-16 z-30 bg-card-surface/95 backdrop-blur-md shadow-sm -mx-8 px-8 py-4 mb-6 border-b border-surface-container">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Breadcrumb + Patient Pill Metadata */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 text-text-muted text-[11px] font-bold uppercase tracking-wider">
              <Link href="/practitioner" className="hover:text-primary transition-colors">Doctor Workspace</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Consultations</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary font-bold">Encounter #ENC-2024-88412</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-container-tint border border-primary/20 flex items-center justify-center text-primary font-bold text-[14px] shadow-sm">
                MH
              </div>
              <span className="text-[20px] font-bold text-text-ink tracking-tight">Maya Lin Harrison</span>
              <span className="text-text-muted text-[13px] font-medium">| 32 yrs • Female</span>
              <span className="bg-surface-container-low border border-surface-container text-text-ink text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">UHID-MH-2024-88412</span>
              <span className="bg-container-tint border border-primary/20 text-primary text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">Blood O+</span>
              <span className="bg-error-bg border border-clinical-error/20 text-clinical-error text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider shadow-sm">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Penicillin (Severe Rash)
              </span>
            </div>
          </div>

          {/* Telemetry & Top Actions */}
          <div className="flex flex-wrap items-center gap-4 justify-between xl:justify-end">
            {/* Live Acoustic & Session Status */}
            <div className="flex items-center gap-3 bg-container-tint border border-primary/20 px-4 py-2 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-clinical-success animate-ping shadow-sm"></span>
                <span className="text-[14px] text-text-ink font-bold font-mono ml-1">{formatTime(seconds)}</span>
              </div>
              <span className="text-surface-container-highest font-bold">•</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">mic</span>
                <span className="text-[12px] font-bold uppercase tracking-wider text-text-ink hidden sm:inline">Room 101 Array</span>
              </div>
              <div className="flex items-end gap-1 h-4 w-6">
                <span className="w-1.5 bg-clinical-success h-2.5 rounded-full animate-pulse shadow-sm"></span>
                <span className="w-1.5 bg-primary h-4 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 bg-primary h-2 rounded-full animate-pulse shadow-sm" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-success-bg border border-clinical-success/20 text-clinical-success px-2 py-0.5 rounded shadow-sm">HL7/FHIR Sync</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleAddSimulatedMed}
                className="bg-surface-container-lowest hover:bg-container-tint text-text-ink font-bold text-[13px] px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 border border-surface-container shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span className="hidden md:inline">Add Rx Manually</span>
              </button>
              <button 
                onClick={handleAddSimulatedMed}
                disabled={isPrescribingVoice}
                className="bg-primary hover:bg-accent-dark text-white font-bold text-[13px] px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 border border-primary-container cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className={`material-symbols-outlined text-[20px] ${isPrescribingVoice ? 'animate-spin' : ''}`}>
                  {isPrescribingVoice ? 'autorenew' : 'mic'}
                </span>
                <span>{isPrescribingVoice ? 'Listening to Rx...' : 'Start Voice Prescription'}</span>
              </button>
              <button 
                onClick={handleSaveDraft}
                className="bg-surface-container-low hover:bg-surface-container text-text-ink font-bold text-[13px] px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 border border-surface-container shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span className="hidden lg:inline">Save Draft</span>
              </button>
            </div>
          </div>
        </div>
        {savedAlert && (
          <div className="mt-3 p-3 bg-success-bg border border-clinical-success/30 rounded-lg text-clinical-success text-[13px] font-bold flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Clinical encounter draft saved and encrypted to EHR node.
          </div>
        )}
      </div>

      {/* Main 12-Column Responsive Diagnostic Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDECAR: Previous History & Context (4 cols) */}
        <aside className="lg:col-span-4 2xl:col-span-3 flex flex-col gap-6">
          <div className="bg-card-surface rounded-xl p-6 shadow-sm relative overflow-hidden border border-surface-container">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container">
              <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">Clinical Baseline</span>
              <Link href="/practitioner" className="material-symbols-outlined text-text-muted hover:text-primary text-[20px] transition-colors" title="Back to Patient Overview">history</Link>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-container-tint border border-primary/20 text-primary flex items-center justify-center font-bold text-[24px] shadow-sm">
                ML
              </div>
              <div className="flex flex-col min-w-0 gap-0.5">
                <h3 className="text-[18px] font-bold text-text-ink leading-tight truncate">Maya Lin Harrison</h3>
                <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">PCP: Dr. Eleanor Vance, MD</span>
                <span className="text-[11px] font-bold text-clinical-success flex items-center gap-1.5 mt-1 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-clinical-success shadow-sm"></span>
                  Insurance: Active BlueCross PPO
                </span>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-lg p-4 space-y-2 border border-surface-container shadow-inner">
              <div className="flex justify-between text-[12px] font-bold uppercase tracking-wider">
                <span className="text-text-muted">Last Encounter:</span>
                <span className="text-text-ink">July 12, 2024</span>
              </div>
              <p className="text-[13px] font-medium text-text-muted leading-relaxed italic">
                Annual wellness physical. Normal spirometry. Routine CBC and lipid panel within baseline. Reported seasonal hayfever surge in early spring.
              </p>
            </div>
          </div>

          {/* Chronic Diagnostic Ledger */}
          <div className="bg-card-surface rounded-xl p-6 shadow-sm space-y-4 border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">medical_information</span>
                <span className="text-[16px] font-bold text-text-ink">Chronic Conditions</span>
              </div>
              <span className="text-[11px] bg-container-tint border border-primary/20 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">2 Active</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-surface-container-lowest rounded-lg flex flex-col gap-1 border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-text-ink">Mild Allergic Asthma</span>
                  <span className="text-[10px] bg-warning-bg border border-clinical-warning/20 text-clinical-warning px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">ICD-10 J45.20</span>
                </div>
                <span className="text-[12px] font-medium text-text-muted">Diagnosed 2021 • Albuterol PRN</span>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-lg flex flex-col gap-1 border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-text-ink">Allergic Rhinitis (Seasonal)</span>
                  <span className="text-[10px] bg-surface-container border border-surface-container text-text-ink px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">ICD-10 J30.2</span>
                </div>
                <span className="text-[12px] font-medium text-text-muted">Tree and grass pollen hypersensitivity</span>
              </div>
            </div>

            {/* Verified Allergies Focus Callout */}
            <div className="bg-error-bg p-4 rounded-xl border border-clinical-error/30 shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-clinical-error text-[18px]">dangerous</span>
                <span className="text-[11px] font-bold text-clinical-error uppercase tracking-wider">Verified Allergens</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-bold text-text-ink">Penicillins & Cephalosporins</span>
                <span className="text-clinical-error font-bold">Anaphylaxis risk</span>
              </div>
              <span className="text-text-muted text-[11px] font-bold uppercase tracking-wider block mt-1.5">Manifests as acute urticarial eruption & periorbital edema.</span>
            </div>
          </div>

          {/* Historical Lab Trajectory & Biomarker Sparkline */}
          <div className="bg-card-surface rounded-xl p-6 shadow-sm space-y-4 border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">query_stats</span>
                <span className="text-[16px] font-bold text-text-ink">Key Immunomarkers</span>
              </div>
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Prior Records</span>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded-lg space-y-3 border border-surface-container shadow-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] font-bold text-text-ink">Serum Total IgE</span>
                <div className="text-right flex items-baseline gap-1.5">
                  <span className="text-[24px] font-bold text-clinical-warning tracking-tight">180</span>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">kU/L (Ref &lt;100)</span>
                </div>
              </div>
              <svg className="w-full h-10 overflow-visible py-1" fill="none" viewBox="0 0 200 36">
                <path d="M0 28 L45 25 L100 20 L150 14 L200 6" stroke="#385bc5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                <circle className="fill-clinical-warning" cx="200" cy="6" r="4.5" stroke="#fff" strokeWidth="1.5"></circle>
              </svg>
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted">
                <span>2022: 95 kU/L</span>
                <span>2023: 130 kU/L</span>
                <span className="font-bold text-clinical-warning">2024: 180 kU/L</span>
              </div>
            </div>
            <div className="pt-3 space-y-2 border-t border-surface-container">
              <div className="flex justify-between text-[12px] font-bold uppercase tracking-wider">
                <span className="text-text-muted">Past Surgical:</span>
                <span className="text-text-ink">Appendectomy (2014)</span>
              </div>
              <div className="flex justify-between text-[12px] font-bold uppercase tracking-wider">
                <span className="text-text-muted">Tobacco / Smoke:</span>
                <span className="text-clinical-success">Never Smoker</span>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER CLINICAL WORKSPACE (8 cols) */}
        <main className="lg:col-span-8 2xl:col-span-9 flex flex-col gap-8">
          {/* SECTION 1: Ambient Chief Complaints & Voice Ingestion Engine */}
          <section className="bg-card-surface rounded-xl p-8 shadow-sm relative border border-surface-container">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-container">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-container-tint border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">record_voice_over</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[20px] font-bold text-text-ink">Chief Complaints & Speech Ingestion</h2>
                  <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Continuous acoustic feature mapping • Model: MedScribe-v4.2</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-success-bg border border-clinical-success/20 text-clinical-success px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-clinical-success animate-pulse shadow-sm"></span>
                Speech Confidence 99.4%
              </div>
            </div>

            {/* Audio Recognized Quote Callout */}
            <div className="bg-surface-container-lowest rounded-xl p-6 mt-6 relative overflow-hidden border border-surface-container shadow-inner">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-[28px] mt-1">graphic_eq</span>
                <div className="flex flex-col gap-2 min-w-0 w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Voice Recognized Transcript</span>
                    <span className="text-text-muted text-[11px] font-bold uppercase tracking-wider bg-surface-container-low px-2 py-0.5 rounded border border-surface-container">04m 12s ago</span>
                  </div>
                  <p className="text-[16px] text-text-ink italic leading-relaxed font-medium">
                    “Persistent dry cough, mild nocturnal wheezing, and nasal congestion for 5 days worsening in morning.”
                  </p>
                </div>
              </div>
              {/* Discrete Symptom Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-surface-container">
                <div className="p-4 bg-card-surface rounded-lg border border-surface-container shadow-sm flex flex-col gap-1.5">
                  <span className="text-text-muted text-[11px] font-bold uppercase tracking-wider">Onset</span>
                  <span className="text-[14px] font-bold text-text-ink">5 Days Ago</span>
                </div>
                <div className="p-4 bg-card-surface rounded-lg border border-surface-container shadow-sm flex flex-col gap-1.5">
                  <span className="text-text-muted text-[11px] font-bold uppercase tracking-wider">Severity</span>
                  <span className="text-[14px] font-bold text-clinical-warning">Moderate (5/10)</span>
                </div>
                <div className="p-4 bg-card-surface rounded-lg border border-surface-container shadow-sm flex flex-col gap-1.5">
                  <span className="text-text-muted text-[11px] font-bold uppercase tracking-wider">Diurnal Shift</span>
                  <span className="text-[14px] font-bold text-text-ink">Worse 4am - 7am</span>
                </div>
                <div className="p-4 bg-card-surface rounded-lg border border-surface-container shadow-sm flex flex-col gap-1.5">
                  <span className="text-text-muted text-[11px] font-bold uppercase tracking-wider">Systemic Flags</span>
                  <span className="text-[14px] font-bold text-clinical-success">Afebrile</span>
                </div>
              </div>
              {/* Structured Extracted Tags */}
              <div className="flex flex-wrap gap-2.5 mt-6">
                <span className="bg-container-tint border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">check</span> Dry Cough
                </span>
                <span className="bg-container-tint border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">check</span> Nocturnal Wheezing
                </span>
                <span className="bg-container-tint border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">check</span> Allergic Rhinitis
                </span>
                <span className="bg-container-tint border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">check</span> Seasonal Trigger
                </span>
                <button className="text-primary text-[11px] font-bold uppercase tracking-wider hover:bg-surface-container-low px-3 py-1.5 flex items-center gap-1.5 rounded-full border border-transparent hover:border-surface-container transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">add</span> Add Symptom Tag
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 2: Doctor Calibrated Vitals Matrix */}
          <section className="bg-card-surface rounded-xl p-8 shadow-sm border border-surface-container">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-container-tint border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">vital_signs</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[20px] font-bold text-text-ink">Vitals Telemetry</h2>
                  <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Recorded at Triage (09:15 AM) • Calibrated by Dr. Vance</span>
                </div>
              </div>
              <button className="bg-surface-container-lowest hover:bg-surface-container-low text-text-ink px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-colors border border-surface-container shadow-sm cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">tune</span>
                Re-measure / Calibrate
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:border-primary/20 transition-colors gap-2">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Blood Pressure</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-bold text-text-ink tracking-tight leading-none">120/78</span>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">mmHg</span>
                </div>
                <span className="text-[11px] font-bold text-clinical-success flex items-center gap-1.5 uppercase tracking-wider mt-1">
                  <span className="material-symbols-outlined text-[14px]">done</span> Normotensive
                </span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:border-primary/20 transition-colors gap-2">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Pulse Rate</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-bold text-text-ink tracking-tight leading-none">74</span>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">bpm</span>
                </div>
                <span className="text-[11px] font-bold text-clinical-success flex items-center gap-1.5 uppercase tracking-wider mt-1">
                  <span className="material-symbols-outlined text-[14px]">done</span> Regular Sinus
                </span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:border-primary/20 transition-colors gap-2">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Oxygen (SpO2)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-bold text-text-ink tracking-tight leading-none">98%</span>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Room Air</span>
                </div>
                <span className="text-[11px] font-bold text-clinical-success flex items-center gap-1.5 uppercase tracking-wider mt-1">
                  <span className="material-symbols-outlined text-[14px]">done</span> Optimal
                </span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:border-primary/20 transition-colors gap-2">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Temperature</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-bold text-text-ink tracking-tight leading-none">98.4°</span>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">F</span>
                </div>
                <span className="text-[11px] font-bold text-clinical-success flex items-center gap-1.5 uppercase tracking-wider mt-1">
                  <span className="material-symbols-outlined text-[14px]">done</span> Afebrile
                </span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:border-primary/20 transition-colors gap-2">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Respiration</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-bold text-text-ink tracking-tight leading-none">16</span>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">bpm</span>
                </div>
                <span className="text-[11px] font-bold text-clinical-success flex items-center gap-1.5 uppercase tracking-wider mt-1">
                  <span className="material-symbols-outlined text-[14px]">done</span> Eupneic
                </span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:border-primary/20 transition-colors gap-2">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">BMI Index</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-bold text-text-ink tracking-tight leading-none">22.4</span>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">kg/m²</span>
                </div>
                <span className="text-[11px] font-bold text-clinical-success flex items-center gap-1.5 uppercase tracking-wider mt-1">
                  <span className="material-symbols-outlined text-[14px]">done</span> Normal range
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 3: Clinical Assessment & ICD Diagnostic Coding */}
          <section className="bg-card-surface rounded-xl p-8 shadow-sm space-y-6 border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-container-tint border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">stethoscope</span>
                </div>
                <h2 className="text-[20px] font-bold text-text-ink">Clinical Assessment & Diagnosis</h2>
              </div>
              <button className="text-[13px] font-bold text-primary flex items-center gap-1.5 hover:underline bg-surface-container-lowest border border-surface-container px-3 py-1.5 rounded-lg shadow-sm cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">add</span> Search ICD-10 Library
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-surface-container-lowest relative border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">Primary</span>
                      <span className="text-[11px] text-primary font-mono font-bold bg-container-tint border border-primary/20 px-2 py-0.5 rounded shadow-sm">ICD-10 J45.909</span>
                    </div>
                    <h3 className="text-[16px] font-bold text-text-ink">Unspecified asthma, uncomplicated</h3>
                  </div>
                  <span className="bg-success-bg border border-clinical-success/20 text-clinical-success text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">Active • Confirmed</span>
                </div>
                <p className="text-[13px] font-medium text-text-muted leading-relaxed">
                  Seasonal recrudescence triggered by airborne pollen. Responds to inhaled corticosteroids and short-acting bronchodilator.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-surface-container-lowest relative border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-secondary-fixed border border-secondary-fixed text-on-secondary-fixed text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">Secondary</span>
                      <span className="text-[11px] text-text-ink font-mono font-bold bg-surface-container-low border border-surface-container px-2 py-0.5 rounded shadow-sm">ICD-10 J30.1</span>
                    </div>
                    <h3 className="text-[16px] font-bold text-text-ink">Allergic rhinitis due to pollen</h3>
                  </div>
                  <span className="bg-surface-container border border-surface-container text-text-ink text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">Correlated</span>
                </div>
                <p className="text-[13px] font-medium text-text-muted leading-relaxed">
                  Concurrent upper airway mucosal hypersensitivity leading to clear rhinorrhea and post-nasal throat irritation.
                </p>
              </div>
            </div>

            {/* Doctor Examination Snippet (Ambient Dictation Transcribed) */}
            <div className="p-6 bg-container-tint/30 rounded-xl flex items-start gap-4 border border-primary/20 shadow-inner">
              <span className="material-symbols-outlined text-primary text-[24px]">hearing</span>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold">Physical Auscultation Dictation:</span>
                <p className="text-[15px] font-medium text-text-ink leading-relaxed italic">
                  “Chest auscultation reveals mild bilateral expiratory wheezing localized at lung bases. Resonant percussion bilaterally, clear vocal resonance, no crackles or pleural friction rubs noted.”
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 4: Medication & Treatment Plan (Prescription Board) */}
          <section className="bg-card-surface rounded-xl p-8 shadow-sm space-y-6 border border-surface-container">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-container pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-container-tint border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">medication</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[20px] font-bold text-text-ink">Medication & Active Treatment Regimen</h2>
                  <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Includes current maintenance & active encounter additions</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleAddSimulatedMed}
                  className="bg-surface-container-lowest hover:bg-surface-container-low text-text-ink font-bold text-[13px] px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 border border-surface-container shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span> Add Medication Manually
                </button>
                <button 
                  onClick={handleAddSimulatedMed}
                  disabled={isPrescribingVoice}
                  className="bg-primary hover:bg-accent-dark text-white font-bold text-[13px] px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2 border border-primary-container cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className={`material-symbols-outlined text-[20px] ${isPrescribingVoice ? 'animate-spin' : ''}`}>
                    {isPrescribingVoice ? 'autorenew' : 'mic'}
                  </span>
                  <span>{isPrescribingVoice ? 'Processing Voice...' : 'Start Voice Prescription'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="p-6 rounded-xl bg-surface-container-lowest flex flex-col md:flex-row md:items-center justify-between gap-6 border border-surface-container shadow-sm hover:border-primary/30 transition-colors group">
                  <div className="flex items-start gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[16px] shrink-0 shadow-sm border ${rx.isNew ? 'bg-primary text-white border-primary-container' : 'bg-surface-container border-surface-container text-text-muted group-hover:bg-surface-container-high'}`}>
                      Rx
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-[16px] font-bold text-text-ink group-hover:text-primary transition-colors">{rx.name}</h3>
                        <span className="text-[11px] bg-container-tint border border-primary/20 text-primary px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm">{rx.strength}</span>
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm border ${rx.isNew ? 'bg-success-bg border-clinical-success/20 text-clinical-success' : 'bg-surface-container border-surface-container text-text-muted'}`}>
                          {rx.isNew ? 'New Prescription' : 'Continued Regimen'}
                        </span>
                      </div>
                      <p className="text-[14px] font-bold text-text-ink bg-card-surface px-4 py-2 rounded-lg border border-surface-container shadow-inner">
                        {rx.sig}
                      </p>
                      <span className="text-text-muted font-medium text-[12px]">{rx.target}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-success bg-success-bg border border-clinical-success/20 px-3 py-1.5 rounded-md shadow-sm">{rx.status}</span>
                    <button 
                      onClick={() => handleRemoveMed(rx.id)}
                      className="text-text-muted hover:text-clinical-error hover:bg-error-bg p-2 rounded-lg transition-colors border border-transparent hover:border-clinical-error/30 cursor-pointer" 
                      title="Remove prescription"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5: Diagnostic Lab Orders & Clinical Investigations */}
          <section className="bg-card-surface rounded-xl p-8 shadow-sm space-y-6 border border-surface-container">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-container-tint border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">biotech</span>
                </div>
                <h2 className="text-[20px] font-bold text-text-ink">Diagnostic Lab Orders & Tests</h2>
              </div>
              <button className="text-[13px] font-bold text-primary flex items-center gap-1.5 hover:underline bg-surface-container-lowest border border-surface-container px-4 py-2 rounded-lg shadow-sm cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">add_task</span> Order New Clinical Lab
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-surface-container-lowest rounded-xl flex flex-col gap-3 border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono text-primary font-bold bg-container-tint border border-primary/20 px-2.5 py-1 rounded-md self-start shadow-sm">#LAB-9041</span>
                    <h3 className="text-[16px] font-bold text-text-ink">Spirometry with Pre & Post Bronchodilator</h3>
                  </div>
                  <span className="bg-warning-bg border border-clinical-warning/20 text-clinical-warning text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">Pending Test</span>
                </div>
                <p className="text-[13px] font-medium text-text-muted leading-relaxed">
                  Evaluate FEV1/FVC ratio and assessment of reversibility (&gt;12% and 200mL increase in FEV1 post-albuterol inhalation).
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-surface-container text-[12px] font-bold uppercase tracking-wider">
                  <span className="text-text-muted">Dept: Pulmonary Function Lab</span>
                  <span className="text-text-ink">Today, 11:00 AM</span>
                </div>
              </div>
              <div className="p-6 bg-surface-container-lowest rounded-xl flex flex-col gap-3 border border-surface-container shadow-sm hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono text-primary font-bold bg-container-tint border border-primary/20 px-2.5 py-1 rounded-md self-start shadow-sm">#LAB-9042</span>
                    <h3 className="text-[16px] font-bold text-text-ink">Comprehensive Aeroallergen IgE Panel</h3>
                  </div>
                  <span className="bg-container-tint border border-primary/20 text-primary text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">Blood Drawn (Triage)</span>
                </div>
                <p className="text-[13px] font-medium text-text-muted leading-relaxed">
                  Venipuncture serum assay screening for regional tree pollinosis, grass mix, weed mix, mold spores, and Dermatophagoides farinae.
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-surface-container text-[12px] font-bold uppercase tracking-wider">
                  <span className="text-text-muted">Dept: Clinical Immunology</span>
                  <span className="text-text-ink">Est. Results: 24-48 hrs</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: Structured SOAP Clinical Notes & Macros */}
          <section className="bg-card-surface rounded-xl p-8 shadow-sm space-y-6 border border-surface-container">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-container-tint border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">edit_note</span>
                </div>
                <h2 className="text-[20px] font-bold text-text-ink">Attending Physician SOAP Notes</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mr-1">Quick Macros:</span>
                <button 
                  onClick={() => handleInsertMacro('.normal_resp')} 
                  className="px-3 py-1 bg-surface-container-lowest hover:bg-container-tint text-primary font-mono text-[11px] font-bold rounded-md border border-surface-container shadow-sm cursor-pointer"
                >
                  .normal_resp
                </button>
                <button 
                  onClick={() => handleInsertMacro('.asthma_action_plan')} 
                  className="px-3 py-1 bg-surface-container-lowest hover:bg-container-tint text-primary font-mono text-[11px] font-bold rounded-md border border-surface-container shadow-sm cursor-pointer"
                >
                  .asthma_plan
                </button>
                <button 
                  onClick={() => handleInsertMacro('.followup_2wk')} 
                  className="px-3 py-1 bg-surface-container-lowest hover:bg-container-tint text-primary font-mono text-[11px] font-bold rounded-md border border-surface-container shadow-sm cursor-pointer"
                >
                  .followup_2wk
                </button>
              </div>
            </div>
            <div className="relative">
              <textarea
                id="doctor-notes"
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={6}
                className="w-full bg-surface-container-lowest border border-surface-container rounded-xl p-6 text-[15px] text-text-ink font-medium leading-relaxed focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y shadow-inner"
                placeholder="Start typing clinical notes here or use voice dictation..."
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[11px] text-text-muted font-bold uppercase tracking-wider bg-card-surface border border-surface-container px-2 py-1 rounded-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-clinical-success"></span>
                Autosaving
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Final Action / Sign-off Bottom Bar */}
      <div className="fixed bottom-0 left-72 right-0 bg-card-surface border-t border-surface-container p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="text-[13px] font-bold text-text-ink hover:text-primary px-4 py-2.5 rounded-lg hover:bg-surface-container-lowest border border-transparent hover:border-surface-container transition-colors cursor-pointer">
            <span className="hidden sm:inline">Cancel & Delete Draft</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSaveDraft}
            className="text-[13px] font-bold text-text-ink bg-surface-container-lowest hover:bg-surface-container-low px-6 py-2.5 rounded-lg border border-surface-container shadow-sm transition-colors cursor-pointer"
          >
            Save Draft
          </button>
          <button 
            onClick={() => router.push('/practitioner')}
            className="text-[14px] font-bold text-white bg-primary hover:bg-accent-dark px-8 py-2.5 rounded-lg shadow-md flex items-center gap-2 border border-primary-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">signature</span>
            Sign & Finish Encounter
          </button>
        </div>
      </div>
    </div>
  );
}
