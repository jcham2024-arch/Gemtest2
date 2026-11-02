import React, { useState } from 'react';
import {
  MASTER_METADATA,
  IMPLEMENTATION_PHASES,
  DOWNSTREAM_STEPS,
} from '../data/projectData';
import { MilestoneStep } from '../types/architecture';
import {
  CheckCircle2,
  Clock,
  Circle,
  Shield,
  Layers,
  Code2,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface RoadmapViewProps {
  onNavigateToPojo: (pojoName: string) => void;
  onOpenAiResearch: (query?: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  onNavigateToPojo,
  onOpenAiResearch,
}) => {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(1);
  const [steps, setSteps] = useState<MilestoneStep[]>(() => {
    const saved = localStorage.getItem('ljac_steps_status');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DOWNSTREAM_STEPS;
      }
    }
    return DOWNSTREAM_STEPS;
  });

  const selectedPhase =
    IMPLEMENTATION_PHASES.find((p) => p.id === selectedPhaseId) ||
    IMPLEMENTATION_PHASES[0];

  const toggleStepStatus = (stepNumber: number) => {
    setSteps((prev) => {
      const updated = prev.map((s) => {
        if (s.step === stepNumber) {
          const nextStatus: 'pending' | 'in_progress' | 'completed' =
            s.status === 'completed'
              ? 'pending'
              : s.status === 'pending'
              ? 'in_progress'
              : 'completed';
          return { ...s, status: nextStatus };
        }
        return s;
      });
      localStorage.setItem('ljac_steps_status', JSON.stringify(updated));
      return updated;
    });
  };

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const inProgressCount = steps.filter((s) => s.status === 'in_progress').length;
  const totalSteps = steps.length;
  const overallPercentage = Math.round((completedCount / totalSteps) * 100);
  const totalTokenBudget = steps.reduce((sum, s) => sum + s.tokenBudget, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Executive Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span className="text-indigo-400 font-semibold uppercase tracking-wider">
              {MASTER_METADATA.projectName}
            </span>
            <span aria-hidden="true">·</span>
            <span>{MASTER_METADATA.targetJdk}</span>
            <span aria-hidden="true">·</span>
            <span>Zero External Runtime Dependencies</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white text-balance">
            Executive Project Roadmap & Implementation Architecture
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            {MASTER_METADATA.vision}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-medium">Orchestration Core:</span>
              <span>Pure Java 21 POJOs, Records & Interfaces</span>
            </div>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-medium">Primary Guest Engine:</span>
              <span>TypeScript (Deno / Bun / ts-node)</span>
            </div>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-medium">Auxiliary Engine:</span>
              <span>Python 3 (ML & Scientific)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="text-xs text-slate-400 font-medium">Implementation Phases</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">5 Phases</div>
          <div className="text-xs text-slate-500 mt-1">10-Week Structured Execution</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="text-xs text-slate-400 font-medium">Downstream Agent Tasks</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1 tabular-nums">
            {completedCount} / {totalSteps} Done
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {inProgressCount} currently active ({overallPercentage}%)
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="text-xs text-slate-400 font-medium">Codebase POJO Footprint</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">26 Micro-POJOs</div>
          <div className="text-xs text-slate-500 mt-1">Strict &lt; 120 LOC per class constraint</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="text-xs text-slate-400 font-medium">Agent Reading Budget</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
            {totalTokenBudget.toLocaleString()} Tokens
          </div>
          <div className="text-xs text-slate-500 mt-1">Context-window-aware ingestion</div>
        </div>
      </div>

      {/* Phase Navigation Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">5 Master Implementation Phases</h2>
          <span className="text-xs text-slate-400">Click a phase to inspect milestones and deliverables</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {IMPLEMENTATION_PHASES.map((phase) => {
            const isSelected = phase.id === selectedPhaseId;
            const phaseSteps = steps.filter((s) => s.phaseId === phase.id);
            const phaseDone = phaseSteps.filter((s) => s.status === 'completed').length;
            const phasePct = Math.round((phaseDone / phaseSteps.length) * 100) || 0;

            return (
              <button
                key={phase.id}
                onClick={() => setSelectedPhaseId(phase.id)}
                className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-semibold">{phase.name}</span>
                  <span className="tabular-nums font-mono text-[11px]">{phase.estimatedWeeks}</span>
                </div>
                <div className="text-sm font-bold text-slate-100 line-clamp-1">{phase.title}</div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{phaseDone}/{phaseSteps.length} tasks</span>
                  <span className="tabular-nums font-medium text-slate-400">{phasePct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${phasePct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Phase Detail Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
              <span>{selectedPhase.name}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedPhase.estimatedWeeks}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">Risk: {selectedPhase.riskFactor}</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{selectedPhase.title}</h3>
            <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">{selectedPhase.summary}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAiResearch(`Analyze implementation details and risks for ${selectedPhase.name}: ${selectedPhase.title}`)}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ask AI on Phase</span>
            </button>
          </div>
        </div>

        {/* Phase Deliverables & Verification Criteria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Target Phase Deliverables</span>
            </h4>
            <div className="space-y-2">
              {selectedPhase.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className="text-indigo-400 font-mono text-[11px] mt-0.5">{String(idx + 1).padStart(2, '0')}.</span>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Verification & Quality Gates</span>
            </h4>
            <div className="space-y-2">
              {selectedPhase.verificationCriteria.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300/90 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Risk Mitigation: </span>
                {selectedPhase.riskMitigation}
              </div>
            </div>
          </div>
        </div>

        {/* Downstream Agent Execution Steps for this Phase */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Downstream Agent Implementation Steps</span>
            </h4>
            <span className="text-xs text-slate-500">
              Click status icon to toggle step progress (persists in session)
            </span>
          </div>

          <div className="space-y-3">
            {steps
              .filter((s) => s.phaseId === selectedPhase.id)
              .map((step) => {
                const isComplete = step.status === 'completed';
                const isInProgress = step.status === 'in_progress';

                return (
                  <div
                    key={step.step}
                    className={`p-4 rounded-lg border transition-all ${
                      isComplete
                        ? 'bg-slate-950/80 border-emerald-900/40'
                        : isInProgress
                        ? 'bg-slate-950 border-indigo-800/60 ring-1 ring-indigo-500/20'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleStepStatus(step.step)}
                          className="mt-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Click to toggle status"
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : isInProgress ? (
                            <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold text-indigo-400">
                              Step {step.step}
                            </span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <h5 className="text-sm font-bold text-white">{step.task}</h5>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {step.details}
                          </p>

                          {/* Artifacts pills/list */}
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-slate-500">Target Artifacts:</span>
                            {step.targetArtifacts.map((art, aIdx) => (
                              <button
                                key={aIdx}
                                onClick={() => {
                                  const name = art.split('.').pop() || '';
                                  onNavigateToPojo(name);
                                }}
                                className="text-[11px] font-mono text-indigo-300 hover:text-indigo-200 underline decoration-indigo-500/40 cursor-pointer"
                              >
                                {art}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-xs font-mono font-semibold text-slate-300 tabular-nums">
                          {step.tokenBudget.toLocaleString()} tokens
                        </div>
                        <div
                          className={`text-[11px] font-medium mt-1 uppercase tracking-wider ${
                            isComplete
                              ? 'text-emerald-400'
                              : isInProgress
                              ? 'text-indigo-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {step.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    {/* Acceptance criteria */}
                    <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-400">
                      {step.acceptanceCriteria.map((crit, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                          <span>{crit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Architectural Principles & Invariants */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Non-Negotiable Architectural Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MASTER_METADATA.architecturalPrinciples.map((prin, pIdx) => (
            <div key={pIdx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="text-sm font-semibold text-indigo-400">{prin.name}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{prin.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
