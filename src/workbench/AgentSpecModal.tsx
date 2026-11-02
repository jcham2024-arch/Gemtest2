import React, { useState } from 'react';
import { AgentDefinition } from './types';
import { X, Save, Sliders, Shield } from 'lucide-react';

interface AgentSpecModalProps {
  isOpen: boolean;
  agent: AgentDefinition;
  onClose: () => void;
  onSaveAgent: (updatedAgent: AgentDefinition) => void;
}

export const AgentSpecModal: React.FC<AgentSpecModalProps> = ({
  isOpen,
  agent,
  onClose,
  onSaveAgent,
}) => {
  const [name, setName] = useState(agent.name);
  const [avatarIcon, setAvatarIcon] = useState(agent.avatarIcon);
  const [assignedModelId, setAssignedModelId] = useState(agent.assignedModelId);
  const [systemCharter, setSystemCharter] = useState(agent.systemCharter);
  const [protocols, setProtocols] = useState(agent.assignedRuleProtocols.join(', '));
  const [tools, setTools] = useState(agent.enabledTools.join(', '));

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveAgent({
      ...agent,
      name: name.trim(),
      avatarIcon: avatarIcon.trim() || '🤖',
      assignedModelId,
      systemCharter: systemCharter.trim(),
      assignedRuleProtocols: protocols.split(',').map((s) => s.trim()).filter(Boolean),
      enabledTools: tools.split(',').map((s) => s.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Configure Agent Specification</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="block text-slate-400 mb-1 font-medium">Agent Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Avatar Icon</label>
              <input
                type="text"
                value={avatarIcon}
                onChange={(e) => setAvatarIcon(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Assigned LLM Model</label>
            <select
              value={assignedModelId}
              onChange={(e) => setAssignedModelId(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Search Grounding & Fast Latency)</option>
              <option value="gemini-4-argon">gemini-4-argon (High Thinking Level & Deep Reasoning)</option>
              <option value="local-ollama">local-ollama (Offline Loopback http://localhost:11434)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              System Charter & Persona Constraints
            </label>
            <textarea
              value={systemCharter}
              onChange={(e) => setSystemCharter(e.target.value)}
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px] leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Rule Protocols (CSV)</label>
              <input
                type="text"
                value={protocols}
                onChange={(e) => setProtocols(e.target.value)}
                placeholder="AGENTS.md, 01_architecture.md"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Allowed Tools (CSV)</label>
              <input
                type="text"
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                placeholder="ast_slicer, ast_patcher"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Specification</span>
          </button>
        </div>
      </div>
    </div>
  );
};
