import React, { useState } from 'react';
import { ViewMode } from './types/architecture';
import { Header } from './components/Header';
import { RoadmapView } from './components/RoadmapView';
import { ArchitectureView } from './components/ArchitectureView';
import { PojoInspectorView } from './components/PojoInspectorView';
import { ObsidianWikiView } from './components/ObsidianWikiView';
import { SimulatorView } from './components/SimulatorView';
import { AiConsultantModal } from './components/AiConsultantModal';
import { AgenticWorkbenchView } from './workbench/AgenticWorkbenchView';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('roadmap');
  const [selectedPojoName, setSelectedPojoName] = useState<string>('SecureSecret');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiModalQuery, setAiModalQuery] = useState<string>('');
  const [aiModalCodeContext, setAiModalCodeContext] = useState<string>('');

  const handleNavigateToPojo = (pojoName: string) => {
    setSelectedPojoName(pojoName);
    setCurrentView('pojos');
  };

  const handleOpenAiResearch = (query?: string, codeContext?: string) => {
    setAiModalQuery(query || '');
    setAiModalCodeContext(codeContext || '');
    setIsAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Strict 3-zone Top Bar Contract */}
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenAiResearch={() => handleOpenAiResearch()}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full">
        {currentView === 'roadmap' && (
          <RoadmapView
            onNavigateToPojo={handleNavigateToPojo}
            onOpenAiResearch={handleOpenAiResearch}
          />
        )}

        {currentView === 'architecture' && (
          <ArchitectureView
            onNavigateToPojo={handleNavigateToPojo}
            onOpenAiResearch={handleOpenAiResearch}
          />
        )}

        {currentView === 'pojos' && (
          <PojoInspectorView
            initialSelectedPojo={selectedPojoName}
            onOpenAiResearch={handleOpenAiResearch}
          />
        )}

        {currentView === 'wiki' && (
          <ObsidianWikiView onNavigateToPojo={handleNavigateToPojo} />
        )}

        {currentView === 'simulator' && <SimulatorView />}
        {currentView === 'workbench' && <AgenticWorkbenchView />}
      </main>

      {/* Quiet, anti-slop footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Lean Java Agentic Core (LJAC)</span>
            <span aria-hidden="true">·</span>
            <span>Java 21 LTS (java.base module)</span>
            <span aria-hidden="true">·</span>
            <span>Zero External Dependencies</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>26 Micro-POJOs</span>
            <span>·</span>
            <span>8 Subsystem Layers</span>
            <span>·</span>
            <span>TypeScript Primary / Python Auxiliary</span>
          </div>
        </div>
      </footer>

      {/* AI Architectural Consultant Modal (Search Grounding & High Thinking) */}
      <AiConsultantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialQuery={aiModalQuery}
        codeContext={aiModalCodeContext}
      />
    </div>
  );
}
