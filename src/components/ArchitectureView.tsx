import React, { useState } from 'react';
import { SUBSYSTEMS, CRITICAL_GAPS } from '../data/projectData';
import {
  ShieldAlert,
  Layers,
  ArrowRight,
  Terminal,
  Cpu,
  Lock,
  Workflow,
  Sparkles,
} from 'lucide-react';

interface ArchitectureViewProps {
  onNavigateToPojo: (pojoName: string) => void;
  onOpenAiResearch: (query?: string) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  onNavigateToPojo,
  onOpenAiResearch,
}) => {
  const [selectedSubsystemId, setSelectedSubsystemId] = useState<string>('sub-security');
  const [selectedGapId, setSelectedGapId] = useState<string>('GAP-01');

  const activeSubsystem = SUBSYSTEMS.find((s) => s.id === selectedSubsystemId) || SUBSYSTEMS[0];
  const activeGap = CRITICAL_GAPS.find((g) => g.id === selectedGapId) || CRITICAL_GAPS[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Subsystem Header */}
      <div>
        <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
          Technical Architecture Deep-Dive
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Zero-Dependency 8-Layer Enterprise Blueprint
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
          LJAC is structured into eight strictly decoupled functional layers operating solely within the standard{' '}
          <code className="text-indigo-300 font-mono">java.base</code> module. No third-party bytecode, reflection frameworks, or native JNI bindings are permitted.
        </p>
      </div>

      {/* 8-Layer Interactive Subsystem Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Layer Selector List */}
        <div className="lg:col-span-5 space-y-2">
          {SUBSYSTEMS.map((sub) => {
            const isSelected = sub.id === selectedSubsystemId;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubsystemId(sub.id)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/20'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-mono text-xs font-semibold text-indigo-400">
                    L{sub.layer}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{sub.name}</div>
                    <div className="text-xs text-slate-500">{sub.associatedPojos.length} Components</div>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Selected Subsystem Inspector */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono font-semibold text-indigo-400">
                Layer {activeSubsystem.layer} Specification
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{activeSubsystem.name}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{activeSubsystem.description}</p>
            </div>
            <button
              onClick={() => onOpenAiResearch(`Analyze security architecture and invariants for ${activeSubsystem.name}`)}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Research Layer</span>
            </button>
          </div>

          {/* Key Mechanisms */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Key Architectural Mechanisms</span>
            </h4>
            <div className="space-y-2">
              {activeSubsystem.keyMechanisms.map((mech, mIdx) => (
                <div key={mIdx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                  {mech}
                </div>
              ))}
            </div>
          </div>

          {/* Security Role & Boundary */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Security Guarantee & Threat Role</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300/90 leading-relaxed">
              {activeSubsystem.securityRole}
            </div>
          </div>

          {/* Associated POJOs */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Associated Java 21 POJOs</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {activeSubsystem.associatedPojos.map((pojo, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => onNavigateToPojo(pojo)}
                  className="px-2.5 py-1 text-xs font-mono bg-slate-950 text-indigo-300 hover:text-white border border-slate-800 hover:border-indigo-500 rounded transition-colors cursor-pointer"
                >
                  {pojo}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Architectural Gaps Remediated Section */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div>
          <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider mb-1">
            Audited & Remediated
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            5 Critical Architectural Gaps Resolved
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
            The initial review identified five critical operational failure points that would trigger resource leakage, context window overflow, or unkillable worker threads in enterprise deployments.
          </p>
        </div>

        {/* Gap Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {CRITICAL_GAPS.map((gap) => {
            const isSelected = gap.id === selectedGapId;
            return (
              <button
                key={gap.id}
                onClick={() => setSelectedGapId(gap.id)}
                className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-rose-500 ring-1 ring-rose-500/20'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-rose-400 font-semibold">{gap.id}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{gap.threatSeverity}</span>
                </div>
                <div className="text-xs font-bold text-slate-100 line-clamp-1">{gap.title}</div>
                <div className="text-[11px] text-indigo-400 mt-2 font-mono">→ {gap.remediedByPojo}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Gap Deep-Dive Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-semibold mb-1">
                <span>{activeGap.id}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Severity: {activeGap.threatSeverity}</span>
                {activeGap.cveReference && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>{activeGap.cveReference}</span>
                  </>
                )}
              </div>
              <h3 className="text-xl font-bold text-white">{activeGap.title}</h3>
            </div>

            <button
              onClick={() => onNavigateToPojo(activeGap.remediedByPojo.split(' ')[0])}
              className="px-3 py-1.5 text-xs font-medium text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 rounded-md border border-indigo-800 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Inspect {activeGap.remediedByPojo}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>The Unaddressed Failure Vector</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                {activeGap.gap}
              </p>
              <div className="text-xs text-slate-400 pt-1">
                <span className="font-semibold text-slate-300">Enterprise Impact: </span>
                {activeGap.impact}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-emerald-400" />
                <span>Implemented Remediation</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                {activeGap.remediation}
              </p>
              <div className="text-xs text-slate-400 pt-1">
                <span className="font-semibold text-slate-300">Remedied by POJO: </span>
                <span className="font-mono text-indigo-300">{activeGap.remediedByPojo}</span>
              </div>
            </div>
          </div>

          {/* Before vs After Logic Diff */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Before vs. After Code Logic</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-rose-950/60 rounded-lg p-3">
                <div className="text-[11px] font-mono font-semibold text-rose-400 mb-2">❌ Vulnerable / Flawed Logic:</div>
                <pre className="text-xs font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap">{activeGap.beforeLogic}</pre>
              </div>
              <div className="bg-slate-950 border border-emerald-950/60 rounded-lg p-3">
                <div className="text-[11px] font-mono font-semibold text-emerald-400 mb-2">✅ Hardened LJAC Implementation:</div>
                <pre className="text-xs font-mono text-emerald-300/90 overflow-x-auto whitespace-pre-wrap">{activeGap.afterLogic}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
