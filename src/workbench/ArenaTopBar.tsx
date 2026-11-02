import React from 'react';
import { AgentDefinition, WorkbenchSettings } from './types';
import { Sliders, User, Cpu, ShieldCheck } from 'lucide-react';

interface ArenaTopBarProps {
  activeAgent: AgentDefinition;
  settings: WorkbenchSettings;
  onOpenAgentSpec: () => void;
  onOpenOperatorProfile: () => void;
}

export const ArenaTopBar: React.FC<ArenaTopBarProps> = ({
  activeAgent,
  settings,
  onOpenAgentSpec,
  onOpenOperatorProfile,
}) => {
  return (
    <header className="h-14 px-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Left: Active Agent Avatar & Spec Trigger */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{activeAgent.avatarIcon}</span>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>{activeAgent.name}</span>
              {activeAgent.isDefaultHelper && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-normal">
                  Resident Helper
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Model: {activeAgent.assignedModelId}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAgentSpec}
          className="ml-2 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded border border-slate-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Configure Agent System Charter & Protocols"
        >
          <Sliders className="w-3 h-3 text-indigo-400" />
          <span>edit agent</span>
        </button>
      </div>

      {/* Right: Operator Handle & Engine Security Status */}
      <div className="flex items-center gap-3">
        {/* Engine Security & Dep Invariant */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950/70 border border-slate-800/80 text-[10px] font-mono text-slate-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Java 21 LTS · 0 Deps · RFC 8259</span>
        </div>

        {/* Set Name / Profile Button */}
        <button
          onClick={onOpenOperatorProfile}
          className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded border border-slate-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Set Operator Name & Pic"
        >
          <User className="w-3 h-3 text-indigo-400" />
          <span>{settings.operatorName}</span>
        </button>
      </div>
    </header>
  );
};
