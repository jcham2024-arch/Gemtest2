import React, { useState, useEffect, useRef } from 'react';
import { AgentTurn } from './types';
import { 
  Edit2, 
  Trash2, 
  RotateCw, 
  Check, 
  X, 
  Copy, 
  Terminal, 
  Clock, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';

interface AgentMessageStreamProps {
  turns: AgentTurn[];
  isStreaming: boolean;
  onEditTurn: (turnId: string, newContent: string) => void;
  onDeleteTurn: (turnId: string) => void;
  onRegenerateTurn: (turnId: string) => void;
}

export const AgentMessageStream: React.FC<AgentMessageStreamProps> = ({
  turns,
  isStreaming,
  onEditTurn,
  onDeleteTurn,
  onRegenerateTurn,
}) => {
  const [editingTurnId, setEditingTurnId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const streamEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, isStreaming]);

  const handleStartEdit = (turn: AgentTurn) => {
    setEditingTurnId(turn.id);
    setEditContent(turn.content);
  };

  const handleSaveEdit = (turnId: string) => {
    if (editContent.trim()) {
      onEditTurn(turnId, editContent.trim());
    }
    setEditingTurnId(null);
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleToolExpanded = (id: string) => {
    setExpandedTools((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {turns.map((turn, index) => {
        const isEditing = editingTurnId === turn.id;
        const isUserTurn = turn.role === 'OPERATOR';
        const isSystemTurn = turn.role === 'SYSTEM_KERNEL';

        return (
          <div
            key={turn.id}
            className={`group flex items-start gap-3 max-w-4xl mx-auto ${
              isUserTurn ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 border select-none ${
                isUserTurn
                  ? 'bg-indigo-950/80 border-indigo-700/60 text-indigo-300'
                  : isSystemTurn
                  ? 'bg-amber-950/80 border-amber-700/60 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {turn.senderAvatar || (isUserTurn ? '👤' : '🤖')}
            </div>

            {/* Bubble Container */}
            <div
              className={`flex-1 min-w-0 rounded-xl p-4 border transition-all ${
                isUserTurn
                  ? 'bg-indigo-950/30 border-indigo-900/60 text-indigo-100'
                  : isSystemTurn
                  ? 'bg-amber-950/20 border-amber-900/50 text-amber-100 font-mono text-xs'
                  : 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-sm'
              }`}
            >
              {/* Header: Sender Name, Role Badge, Timestamp & Actions */}
              <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{turn.senderName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded uppercase font-mono ${
                      isUserTurn
                        ? 'bg-indigo-900/60 text-indigo-300'
                        : isSystemTurn
                        ? 'bg-amber-900/60 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {turn.role}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Inline Hover Action Deck (✏️ edit, 🗑️ delete, 🔁 regenerate) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    onClick={() => handleCopyText(turn.content, index)}
                    className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
                    title="Copy message"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleStartEdit(turn)}
                    className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
                    title="Edit turn"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {turn.role === 'AGENT' && (
                    <button
                      onClick={() => onRegenerateTurn(turn.id)}
                      className="p-1 text-slate-400 hover:text-indigo-300 rounded hover:bg-slate-800 transition-colors"
                      title="Regenerate turn"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {turns.length > 1 && (
                    <button
                      onClick={() => onDeleteTurn(turn.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                      title="Delete turn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tool Execution Badge / Collapsible Card */}
              {turn.toolCall && (
                <div className="mb-3 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden text-xs">
                  <button
                    onClick={() => toggleToolExpanded(turn.id)}
                    className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-indigo-400 font-mono text-[11px]">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Tool Execution: {turn.toolCall.toolName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      {turn.toolCall.durationMs && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {turn.toolCall.durationMs}ms
                        </span>
                      )}
                      {expandedTools[turn.id] ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </div>
                  </button>

                  {expandedTools[turn.id] && (
                    <div className="p-3 border-t border-slate-800 bg-black/40 space-y-2 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500">Arguments:</span>
                        <pre className="mt-1 p-2 bg-slate-950 rounded text-slate-300 overflow-x-auto">
                          {turn.toolCall.argumentsJson}
                        </pre>
                      </div>
                      {turn.toolCall.resultSnippet && (
                        <div>
                          <span className="text-slate-500">Output Snippet:</span>
                          <pre className="mt-1 p-2 bg-slate-950 rounded text-emerald-300 overflow-x-auto">
                            {turn.toolCall.resultSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Content / In-Place Editor */}
              {isEditing ? (
                <div className="space-y-2 mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-28 bg-slate-950 border border-indigo-500/60 rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingTurnId(null)}
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(turn.id)}
                      className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium cursor-pointer"
                    >
                      Save Turn
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {turn.content}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Real-time Streaming Cursor */}
      {isStreaming && (
        <div className="flex items-center gap-2 max-w-4xl mx-auto text-xs text-indigo-400 font-mono animate-pulse">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Agent streaming response...</span>
        </div>
      )}

      <div ref={streamEndRef} />
    </div>
  );
};
