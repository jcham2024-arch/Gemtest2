import React from 'react';
import { ViewMode } from '../types/architecture';
import { Sparkles, Terminal } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenAiResearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  onOpenAiResearch,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onSelectView('roadmap');
          }}
          className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-2.5 whitespace-nowrap"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Terminal className="w-4 h-4" />
          </div>
          <span>Lean Java Agentic Core</span>
        </a>
      </div>

      {/* Zone 2: 5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectView('roadmap')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
            currentView === 'roadmap'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400'
          }`}
        >
          Roadmap & Milestones
        </button>
        <button
          onClick={() => onSelectView('architecture')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
            currentView === 'architecture'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400'
          }`}
        >
          Technical Architecture
        </button>
        <button
          onClick={() => onSelectView('pojos')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
            currentView === 'pojos'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400'
          }`}
        >
          POJO Code Inventory
        </button>
        <button
          onClick={() => onSelectView('wiki')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
            currentView === 'wiki'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400'
          }`}
        >
          Obsidian Wiki Graph
        </button>
        <button
          onClick={() => onSelectView('simulator')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
            currentView === 'simulator'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400'
          }`}
        >
          Live Simulators
        </button>
        <button
          onClick={() => onSelectView('workbench')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
            currentView === 'workbench'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400'
          }`}
        >
          Agentic Workbench
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenAiResearch}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Architecture Research</span>
        </button>
      </div>
    </header>
  );
};
