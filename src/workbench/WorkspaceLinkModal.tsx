import React, { useState } from 'react';
import { X, FolderGit2, FileText, Check } from 'lucide-react';

interface WorkspaceLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachSnippet: (snippetText: string) => void;
}

export const WorkspaceLinkModal: React.FC<WorkspaceLinkModalProps> = ({
  isOpen,
  onClose,
  onAttachSnippet,
}) => {
  const [customPath, setCustomPath] = useState('');

  if (!isOpen) return null;

  const presets = [
    {
      title: 'Java 21 Core Package Tree',
      desc: 'Injects com.leanllm directory structure into prompt',
      snippet: `[WORKSPACE LINK]: java/src/main/java/com/leanllm/
├── agent/ (ReAct cognitive loop & tools)
├── agentforge/ (TaskContract, Realpath jail, Loom Virtual Thread bridge)
├── client/ (HTTP/2 SSE & loopback clients)
├── json/ (Zero-dependency RFC 8259 AST & recursive parser)
├── scripting/ (Subprocess isolation & TypeScript runner)
└── security/ (SecureSecret, ProcessTreeTerminator, EnvironmentSanitizer)`,
    },
    {
      title: 'AGENTS.md Tier 1 Charter',
      desc: 'Injects Tier 1 progressive disclosure kernel constraints',
      snippet: `[WORKSPACE LINK]: AGENTS.md (Tier 1 Kernel Charter)
Constraints:
1. Max 150 lines in Tier 1 master index.
2. Zero external dependencies in Java 21 core (strictly java.base).
3. Out-of-process TypeScript tools (< 12ms execution budget).
4. Canonical Realpath jail verification on all file operations.`,
    },
    {
      title: 'TaskContract.java Record Schema',
      desc: 'Injects immutable AgentForge TaskContract definition',
      snippet: `[WORKSPACE LINK]: java/src/main/java/com/leanllm/agentforge/TaskContract.java
public record TaskContract(
    String taskId, String agentId, String callerId, String intentDescription,
    Set<String> toolAllowlist, List<String> targetPaths,
    long timeoutMs, int budgetLimitTokens, ContractStatus status
)`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span>Workspace File & Folder Linker</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-400 leading-relaxed">
            Select a project asset or type a workspace file path to attach directly to the agent prompt context.
          </p>

          <div className="space-y-2">
            {presets.map((preset, i) => (
              <div
                key={i}
                onClick={() => {
                  onAttachSnippet(preset.snippet);
                  onClose();
                }}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 group-hover:text-indigo-300">
                    {preset.title}
                  </span>
                  <FileText className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{preset.desc}</div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-slate-400 mb-1 font-medium">Custom File or Path Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="e.g. src/workbench/types.ts"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => {
                  if (customPath.trim()) {
                    onAttachSnippet(`[WORKSPACE LINK]: ${customPath.trim()}`);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs cursor-pointer"
              >
                Attach
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-800 flex justify-end bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
