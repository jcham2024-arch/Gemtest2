import React, { useState } from 'react';
import { SUBSYSTEMS, CRITICAL_GAPS, CORE_PORTS, VERIFICATION_LADDER, SAFETY_INVARIANTS } from '../data/projectData';
import {
  ShieldAlert,
  Layers,
  ArrowRight,
  Terminal,
  Cpu,
  Lock,
  Workflow,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Server,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface ArchitectureViewProps {
  onNavigateToPojo: (pojoName: string) => void;
  onOpenAiResearch: (query?: string) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  onNavigateToPojo,
  onOpenAiResearch,
}) => {
  const [activeTab, setActiveTab] = useState<'dual-plane' | 'ports' | 'ladder' | 'subsystems' | 'gaps'>('dual-plane');
  const [selectedSubsystemId, setSelectedSubsystemId] = useState<string>('sub-security');
  const [selectedGapId, setSelectedGapId] = useState<string>('GAP-08');

  const activeSubsystem = SUBSYSTEMS.find((s) => s.id === selectedSubsystemId) || SUBSYSTEMS[0];
  const activeGap = CRITICAL_GAPS.find((g) => g.id === selectedGapId) || CRITICAL_GAPS[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Subsystem Header */}
      <div>
        <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
          Apex Agent Management Chat Architecture
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Dual-Plane Microkernel & CAS Evolution Architecture
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
          Apex decouples an immutable compile-time-typed <span className="text-indigo-300 font-semibold">Kernel Plane</span> (owning execution invariants, 9 core ports, and the reasoning loop) from a versioned Git-tree <span className="text-purple-300 font-semibold">CAS Evolution Plane</span> gated by the SandboxValidationSentinel and human approval.
        </p>
      </div>

      {/* Navigation Mode Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('dual-plane')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'dual-plane'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Dual-Plane Topology
        </button>
        <button
          onClick={() => setActiveTab('ports')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'ports'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Nine Core Ports
        </button>
        <button
          onClick={() => setActiveTab('ladder')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'ladder'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          HCAT Verification Ladder (L0–L5)
        </button>
        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'gaps'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Threat Matrix & 2026 Gaps ({CRITICAL_GAPS.length})
        </button>
        <button
          onClick={() => setActiveTab('subsystems')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'subsystems'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Subsystem Layers ({SUBSYSTEMS.length})
        </button>
      </div>

      {/* Dual Plane Interactive Blueprint */}
      {activeTab === 'dual-plane' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kernel Plane Card */}
            <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-6 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Kernel Plane (Immutable)</h3>
                    <p className="text-xs text-blue-400 font-mono">Java 21 LTS · java.base · No write path to self</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Tier 0 & Tier 1
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Houses the compile-time-typed domain records, 9 core ports, native A* GOAP planner, process execution jail, and SSE streaming pipeline. It cannot mutate its own source code or bypass security gates.
              </p>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-200">Core Invariants Enforced:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>K1: No defineClass</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>K2: Zero Shell Exec</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>K4: RealPathJail Confinement</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>K8: No Virtual Carrier Pinning</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Evolution Plane Card */}
            <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-6 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Evolution Plane (CAS Git-Tree)</h3>
                    <p className="text-xs text-purple-400 font-mono">Content-Addressable Storage · Sentinel Gated</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Versioned Blobs
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                All agent growth (prompts, tool configs, SKILL.md specs) lives as immutable content-addressed blobs on ephemeral sandbox branches. Candidate commits are verified by a 6-category automated sentinel and require operator sign-off before merging to main.
              </p>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-200">Evolution Invariants Enforced:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>E1: Sentinel Runs on Write</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>E2: Capability Escalation Signoff</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>E3: Atomic Rollback</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>E6: Monotonic Safeguards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Bridge Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Workflow className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Tauri 2.0 + React 19 Isomorphic Universal Client</h4>
                <p className="text-xs text-slate-400">Strictly typed SSE events with zero-drift OpenAPI TypeScript code generation (Invariant C1).</p>
              </div>
            </div>
            <button
              onClick={() => onOpenAiResearch('Evaluate the Dual-Plane microkernel versus single-process agent platforms')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Research Dual-Plane Boundary</span>
            </button>
          </div>
        </div>
      )}

      {/* Nine Core Ports Inspector */}
      {activeTab === 'ports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CORE_PORTS.map((port) => (
              <div key={port.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">{port.interfaceName}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    port.tier === 'Tier 0 Pure'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {port.tier}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200">{port.name}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{port.purpose}</p>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80">
                  <div className="text-slate-500 text-[10px] uppercase mb-0.5">Adapter Implementation:</div>
                  <div className="text-indigo-300 truncate">{port.adapterImplementation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HCAT Verification Ladder View */}
      {activeTab === 'ladder' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-200">Principle P1 & P2:</span> Judge evidence, not worker code. Decidable checks belong in deterministic scripts, never in LLM prompts. The ladder organizes defense in depth ordered by marginal cost.
          </div>

          <div className="space-y-3">
            {VERIFICATION_LADDER.map((layer) => (
              <div key={layer.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-xs text-indigo-400">
                      {layer.id}
                    </span>
                    <span className="text-sm font-bold text-white">{layer.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-slate-400">
                      Model: {layer.modelTier}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-emerald-400">
                      Cost: {layer.cost}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300">
                  <span className="text-slate-500 font-semibold">Catches: </span>
                  {layer.catches}
                </div>
                <div className="text-xs text-slate-400 font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-indigo-400 font-semibold">Invariant Rule: </span>
                  {layer.rule}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threat Remediations & Gaps Inspector */}
      {activeTab === 'gaps' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-2">
            {CRITICAL_GAPS.map((gap) => {
              const isSelected = gap.id === selectedGapId;
              const isNew = ['GAP-08', 'GAP-09', 'GAP-10', 'GAP-11', 'GAP-12', 'GAP-13'].includes(gap.id);
              return (
                <button
                  key={gap.id}
                  onClick={() => setSelectedGapId(gap.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-rose-500/80 ring-1 ring-rose-500/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-rose-400 flex items-center gap-1.5">
                      <span>{gap.id}</span>
                      {isNew && (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          2026 Finding
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {gap.threatSeverity}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">{gap.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">{gap.cveReference}</div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs font-mono text-rose-400 font-semibold">{activeGap.id} · {activeGap.cveReference}</div>
                <h3 className="text-lg font-bold text-white mt-0.5">{activeGap.title}</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {activeGap.threatSeverity} Severity
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-1">Vulnerability Description:</div>
                <div className="text-slate-300 bg-slate-950 p-3 rounded border border-slate-800 leading-relaxed">
                  {activeGap.gap}
                </div>
              </div>

              <div>
                <div className="text-slate-400 font-semibold mb-1">Architectural Impact:</div>
                <div className="text-rose-300/90 bg-rose-950/20 p-3 rounded border border-rose-900/30 leading-relaxed">
                  {activeGap.impact}
                </div>
              </div>

              <div>
                <div className="text-slate-400 font-semibold mb-1">Enforced Remediation:</div>
                <div className="text-emerald-300/90 bg-emerald-950/20 p-3 rounded border border-emerald-900/30 leading-relaxed font-mono">
                  {activeGap.remediation}
                </div>
              </div>

              <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded border border-slate-800/80">
                  <div className="text-rose-400 font-semibold text-[11px] mb-1">Vulnerable Pattern:</div>
                  <code className="text-[11px] text-slate-400 font-mono block break-words whitespace-pre-wrap">{activeGap.beforeLogic}</code>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800/80">
                  <div className="text-emerald-400 font-semibold text-[11px] mb-1">Protected Pattern:</div>
                  <code className="text-[11px] text-emerald-300 font-mono block break-words whitespace-pre-wrap">{activeGap.afterLogic}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subsystem Layers Stack */}
      {activeTab === 'subsystems' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-semibold text-indigo-400">Layer {activeSubsystem.layer}</span>
                <h3 className="text-2xl font-bold text-white mt-1">{activeSubsystem.name}</h3>
                <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">{activeSubsystem.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-200">Key Architectural Mechanisms:</div>
              <ul className="space-y-2">
                {activeSubsystem.keyMechanisms.map((mech, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950 p-2.5 rounded border border-slate-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span>{mech}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-200">Subsystem Components:</div>
              <div className="flex flex-wrap gap-2">
                {activeSubsystem.associatedPojos.map((pojo) => (
                  <button
                    key={pojo}
                    onClick={() => onNavigateToPojo(pojo)}
                    className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-all cursor-pointer"
                  >
                    {pojo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
