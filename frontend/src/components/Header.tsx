import React from 'react';
import { Activity } from 'lucide-react';
import { ModeToggle } from './mode-toggle';

interface HeaderProps {
  activeTab: 'doctor' | 'developer' | 'history' | 'usage';
  setActiveTab: (tab: 'doctor' | 'developer' | 'history' | 'usage') => void;
  resetState: () => void;
}

export function Header({ activeTab, setActiveTab, resetState }: HeaderProps) {
  return (
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
              onClick={() => { setActiveTab(tab.id as any); resetState(); }}
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
  );
}
