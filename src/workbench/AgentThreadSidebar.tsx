import React, { useState } from 'react';
import { AgentSession, AgentDefinition } from './types';
import { 
  Plus, 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  HelpCircle, 
  Edit2, 
  Check, 
  X,
  MessageSquare,
  Bot
} from 'lucide-react';

interface AgentThreadSidebarProps {
  sessions: AgentSession[];
  activeSessionId: string;
  agents: AgentDefinition[];
  onSelectSession: (id: string) => void;
  onCreateSession: (agentId: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  onOpenTips: () => void;
  onExportSnapshot: () => void;
  onImportSnapshot: () => void;
  onClearAllSessions: () => void;
}

export const AgentThreadSidebar: React.FC<AgentThreadSidebarProps> = ({
  sessions,
  activeSessionId,
  agents,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  onOpenSettings,
  onOpenTips,
  onExportSnapshot,
  onImportSnapshot,
  onClearAllSessions,
}) => {
  const [isSpawnMenuOpen, setIsSpawnMenuOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');

  const getAgentForSession = (session: AgentSession): AgentDefinition | undefined => {
    return agents.find((a) => a.id === session.agentId);
  };

  const handleStartRename = (session: AgentSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.sessionId);
    setEditTitleText(session.title);
  };

  const handleSaveRename = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitleText.trim()) {
      onRenameSession(sessionId, editTitleText.trim());
    }
    setEditingSessionId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  return (
    <aside className="w-72 sm:w-80 bg-slate-900/90 border-r border-slate-800 flex flex-col h-full select-none shrink-0">
      {/* Top Header: New Session Button & Menu */}
      <div className="p-3 border-b border-slate-800 relative">
        <button
          onClick={() => setIsSpawnMenuOpen(!isSpawnMenuOpen)}
          className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Session / Spawn Agent</span>
        </button>

        {isSpawnMenuOpen && (
          <div className="absolute top-14 left-3 right-3 bg-slate-950 border border-slate-800 rounded-lg shadow-xl z-50 p-1.5 space-y-1">
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Select Agent Role
            </div>
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  onCreateSession(agent.id);
                  setIsSpawnMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded flex items-center gap-2 text-xs text-slate-200 transition-colors cursor-pointer"
              >
                <span className="text-sm">{agent.avatarIcon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{agent.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{agent.assignedModelId}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sessions Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.map((session) => {
          const agent = getAgentForSession(session);
          const isActive = session.sessionId === activeSessionId;
          const isEditing = editingSessionId === session.sessionId;

          return (
            <div
              key={session.sessionId}
              onClick={() => onSelectSession(session.sessionId)}
              className={`group relative p-2.5 rounded-lg text-xs cursor-pointer transition-all border ${
                isActive
                  ? 'bg-slate-800 border-indigo-500/40 text-slate-100 shadow-sm'
                  : 'bg-slate-900/40 hover:bg-slate-800/60 border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0 select-none">
                  {agent?.avatarIcon || '🤖'}
                </span>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitleText}
                        onChange={(e) => setEditTitleText(e.target.value)}
                        className="w-full bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={(e) => handleSaveRename(session.sessionId, e)}
                        className="text-emerald-400 hover:text-emerald-300 p-0.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="text-slate-400 hover:text-slate-300 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium text-slate-200 truncate flex items-center justify-between">
                        <span className="truncate">{session.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                        <span>{agent?.name || 'Agent'}</span>
                        <span>·</span>
                        <span>{session.turns.length} turns</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Inline Hover Actions */}
                {!isEditing && (
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleStartRename(session, e)}
                      title="Rename Session"
                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {sessions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.sessionId);
                        }}
                        title="Delete Session"
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Storage & Privacy Notice (Adapted from Perchance paradigm) */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        <p>
          <span className="font-semibold text-slate-300">Privacy Notice:</span> Your session data is stored{' '}
          <span className="text-indigo-400">privately in your browser</span> (not on a remote telemetry server). Use the{' '}
          <button
            onClick={onExportSnapshot}
            className="text-indigo-300 underline hover:text-indigo-200 inline font-medium cursor-pointer"
          >
            export
          </button>{' '}
          button below to backup regularly.
        </p>
      </div>

      {/* Bottom Platform Control Bar (Perchance utility ergonomics) */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-1 text-[11px] text-slate-400">
        <button
          onClick={onOpenSettings}
          className="flex-1 py-1 px-2 hover:bg-slate-800 hover:text-slate-200 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
          title="Provider & Model Settings"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>settings</span>
        </button>

        <button
          onClick={onOpenTips}
          className="flex-1 py-1 px-2 hover:bg-slate-800 hover:text-slate-200 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
          title="Agent Rules & Tips"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>tips</span>
        </button>

        <button
          onClick={onExportSnapshot}
          className="flex-1 py-1 px-2 hover:bg-slate-800 hover:text-slate-200 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
          title="Export Workspace JSON Backup"
        >
          <Download className="w-3.5 h-3.5" />
          <span>export</span>
        </button>

        <button
          onClick={onImportSnapshot}
          className="flex-1 py-1 px-2 hover:bg-slate-800 hover:text-slate-200 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
          title="Import Workspace JSON Backup"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>import</span>
        </button>

        <button
          onClick={onClearAllSessions}
          className="p-1 hover:bg-rose-950/50 hover:text-rose-400 rounded transition-colors cursor-pointer"
          title="Reset All Sessions"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
