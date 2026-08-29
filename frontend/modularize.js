const fs = require('fs');

const path = 'D:/coding/medical/frontend/src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const returnIndex = content.indexOf('  return (\n    <div className="min-h-screen bg-slate-50');

if (returnIndex === -1) {
    console.error("Could not find the return statement");
    process.exit(1);
}

// Add imports
const imports = `
import { Header } from '../components/Header';
import { HistoryTab } from '../components/HistoryTab';
import { UsageTab } from '../components/UsageTab';
import { DictationPanel } from '../components/DictationPanel';
import { DeveloperDebug } from '../components/DeveloperDebug';
import { PrescriptionPreview } from '../components/PrescriptionPreview';
`;

let beforeReturn = content.substring(0, returnIndex);

// Add imports after the last import
const lastImportIndex = beforeReturn.lastIndexOf('import ');
const endOfLastImport = beforeReturn.indexOf('\n', lastImportIndex);
beforeReturn = beforeReturn.substring(0, endOfLastImport + 1) + imports + beforeReturn.substring(endOfLastImport + 1);

const newUi = `  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans">
      
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
            <div className={\`flex flex-col gap-6 \${prescriptionHtml ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'}\`}>
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
            <div className={\`\${prescriptionHtml ? 'lg:col-span-7' : 'hidden'}\`}>
              <PrescriptionPreview 
                prescriptionHtml={prescriptionHtml}
                isSaving={isSaving}
                handleSavePrescription={handleSavePrescription}
                pipelineMetrics={pipelineMetrics}
                isGenerating={isGenerating}
                iframeRef={iframeRef}
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
`;

fs.writeFileSync(path, beforeReturn + newUi, 'utf8');
console.log('Successfully modularized page.tsx!');
