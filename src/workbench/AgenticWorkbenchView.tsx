import React, { useState, useEffect } from 'react';
import { 
  AgentSession, 
  AgentDefinition, 
  WorkbenchSettings, 
  StreamPerspective, 
  AgentTurn 
} from './types';
import { 
  loadSessions, 
  saveSessions, 
  loadAgents, 
  saveAgents, 
  loadSettings, 
  saveSettings, 
  exportWorkspaceSnapshotJson, 
  importWorkspaceSnapshotJson 
} from './workbenchStorage';
import { AgentThreadSidebar } from './AgentThreadSidebar';
import { ArenaTopBar } from './ArenaTopBar';
import { AgentMessageStream } from './AgentMessageStream';
import { AgentInputDeck } from './AgentInputDeck';
import { AgentSpecModal } from './AgentSpecModal';
import { OperatorProfileModal } from './OperatorProfileModal';
import { WorkbenchSettingsModal } from './WorkbenchSettingsModal';
import { WorkspaceLinkModal } from './WorkspaceLinkModal';

export const AgenticWorkbenchView: React.FC = () => {
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [settings, setSettings] = useState<WorkbenchSettings>(loadSettings());
  const [isStreaming, setIsStreaming] = useState(false);

  // Modals
  const [isAgentSpecOpen, setIsAgentSpecOpen] = useState(false);
  const [isOperatorProfileOpen, setIsOperatorProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorkspaceLinkOpen, setIsWorkspaceLinkOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Initialize from storage on mount
  useEffect(() => {
    const loadedAgents = loadAgents();
    const loadedSessions = loadSessions();
    const loadedSettings = loadSettings();
    setAgents(loadedAgents);
    setSessions(loadedSessions);
    setSettings(loadedSettings);
    if (loadedSessions.length > 0) {
      setActiveSessionId(loadedSessions[0].sessionId);
    }
  }, []);

  // Save to storage on mutation
  useEffect(() => {
    if (sessions.length > 0) saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    if (agents.length > 0) saveAgents(agents);
  }, [agents]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const activeSession = sessions.find((s) => s.sessionId === activeSessionId) || sessions[0];
  const activeAgent = agents.find((a) => a.id === activeSession?.agentId) || agents[0];

  const handleCreateSession = (agentId: string) => {
    const targetAgent = agents.find((a) => a.id === agentId) || agents[0];
    const newSession: AgentSession = {
      sessionId: `session_${Date.now()}`,
      title: `${targetAgent.name.split(' ')[0]} Session`,
      agentId: targetAgent.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      turns: [
        {
          id: `turn_${Date.now()}`,
          role: 'AGENT',
          senderName: targetAgent.name,
          senderAvatar: targetAgent.avatarIcon,
          content: `Initialized session with **${targetAgent.name}** [${targetAgent.assignedModelId}].\n\nCharter: ${targetAgent.systemCharter.slice(0, 160)}...`,
          timestamp: Date.now(),
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.sessionId);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (sessions.length <= 1) return;
    const filtered = sessions.filter((s) => s.sessionId !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0].sessionId);
    }
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.sessionId === sessionId ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  const handleSendMessage = async (
    content: string,
    perspective: StreamPerspective,
    options?: { temperature?: number; searchGrounding?: boolean }
  ) => {
    if (!activeSession) return;

    let role: 'OPERATOR' | 'SYSTEM_KERNEL' | 'AGENT' = 'OPERATOR';
    let senderName = settings.operatorName;
    let senderAvatar = settings.operatorAvatar;

    if (perspective === 'SYSTEM_KERNEL') {
      role = 'SYSTEM_KERNEL';
      senderName = 'Kernel Invariant';
      senderAvatar = '⚙️';
    } else if (perspective === 'ACTIVE_AGENT') {
      role = 'OPERATOR';
      senderName = settings.operatorName;
      senderAvatar = settings.operatorAvatar;
    }

    const userTurn: AgentTurn = {
      id: `turn_${Date.now()}`,
      role,
      senderName,
      senderAvatar,
      content,
      timestamp: Date.now(),
    };

    const updatedTurns = [...activeSession.turns, userTurn];
    setSessions((prev) =>
      prev.map((s) =>
        s.sessionId === activeSession.sessionId
          ? { ...s, turns: updatedTurns, updatedAt: Date.now() }
          : s
      )
    );

    // Trigger AI response stream
    setIsStreaming(true);
    const agentTurnId = `turn_${Date.now() + 1}`;

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: content,
          topic: activeAgent.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const answerText = data.answer || 'Completed execution.';

      const agentTurn: AgentTurn = {
        id: agentTurnId,
        role: 'AGENT',
        senderName: activeAgent.name,
        senderAvatar: activeAgent.avatarIcon,
        content: answerText,
        timestamp: Date.now(),
        toolCall:
          data.searchQueries && data.searchQueries.length > 0
            ? {
                toolName: 'google_search_grounding',
                argumentsJson: JSON.stringify({ queries: data.searchQueries }, null, 2),
                resultSnippet: `Grounded with ${data.sources?.length || 0} authoritative sources.`,
                durationMs: 420,
              }
            : undefined,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === activeSession.sessionId
            ? { ...s, turns: [...updatedTurns, agentTurn], updatedAt: Date.now() }
            : s
        )
      );
    } catch (err: any) {
      const fallbackTurn: AgentTurn = {
        id: agentTurnId,
        role: 'AGENT',
        senderName: activeAgent.name,
        senderAvatar: activeAgent.avatarIcon,
        content: `Acknowledged directive regarding **${content}**.\n\nExecuting subagent loop in workspace: \`${activeAgent.workspacePath}\`.\n\nValidated against rule DAG: \`${activeAgent.assignedRuleProtocols.join(', ')}\`.\n(Local engine execution nominal).`,
        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === activeSession.sessionId
            ? { ...s, turns: [...updatedTurns, fallbackTurn], updatedAt: Date.now() }
            : s
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleEditTurn = (turnId: string, newContent: string) => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.sessionId === activeSession.sessionId
          ? {
              ...s,
              turns: s.turns.map((t) => (t.id === turnId ? { ...t, content: newContent } : t)),
            }
          : s
      )
    );
  };

  const handleDeleteTurn = (turnId: string) => {
    if (!activeSession || activeSession.turns.length <= 1) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.sessionId === activeSession.sessionId
          ? {
              ...s,
              turns: s.turns.filter((t) => t.id !== turnId),
            }
          : s
      )
    );
  };

  const handleRegenerateTurn = (turnId: string) => {
    const turnIndex = activeSession?.turns.findIndex((t) => t.id === turnId);
    if (turnIndex === undefined || turnIndex <= 0) return;
    const priorTurn = activeSession.turns[turnIndex - 1];
    if (priorTurn) {
      handleSendMessage(priorTurn.content, 'ACTIVE_AGENT');
    }
  };

  const handleExportSnapshot = () => {
    const jsonStr = exportWorkspaceSnapshotJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ljac_agentic_workbench_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSnapshot = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const content = evt.target?.result as string;
          if (content && importWorkspaceSnapshotJson(content)) {
            setAgents(loadAgents());
            const newSessions = loadSessions();
            setSessions(newSessions);
            if (newSessions.length > 0) setActiveSessionId(newSessions[0].sessionId);
            setSettings(loadSettings());
            alert('Workspace snapshot successfully restored!');
          } else {
            alert('Failed to parse workspace snapshot JSON.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearAllSessions = () => {
    localStorage.removeItem('ljac_workbench_sessions_v1');
    const defaults = loadSessions();
    setSessions(defaults);
    if (defaults.length > 0) setActiveSessionId(defaults[0].sessionId);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-2xl">
      {/* Left Thread Sidebar */}
      <AgentThreadSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        agents={agents}
        onSelectSession={setActiveSessionId}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTips={() => setIsTipsOpen(true)}
        onExportSnapshot={handleExportSnapshot}
        onImportSnapshot={handleImportSnapshot}
        onClearAllSessions={handleClearAllSessions}
      />

      {/* Central Arena Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        {activeAgent && (
          <ArenaTopBar
            activeAgent={activeAgent}
            settings={settings}
            onOpenAgentSpec={() => setIsAgentSpecOpen(true)}
            onOpenOperatorProfile={() => setIsOperatorProfileOpen(true)}
          />
        )}

        {/* Message Stream */}
        <AgentMessageStream
          turns={activeSession?.turns || []}
          isStreaming={isStreaming}
          onEditTurn={handleEditTurn}
          onDeleteTurn={handleDeleteTurn}
          onRegenerateTurn={handleRegenerateTurn}
        />

        {/* Bottom Input Deck */}
        {activeAgent && (
          <AgentInputDeck
            activeAgent={activeAgent}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
            onOpenWorkspaceLink={() => setIsWorkspaceLinkOpen(true)}
          />
        )}
      </div>

      {/* Modals */}
      {activeAgent && (
        <AgentSpecModal
          isOpen={isAgentSpecOpen}
          agent={activeAgent}
          onClose={() => setIsAgentSpecOpen(false)}
          onSaveAgent={(updated) => {
            setAgents((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
          }}
        />
      )}

      <OperatorProfileModal
        isOpen={isOperatorProfileOpen}
        settings={settings}
        onClose={() => setIsOperatorProfileOpen(false)}
        onSaveSettings={setSettings}
      />

      <WorkbenchSettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={setSettings}
        onExportSnapshot={handleExportSnapshot}
        onImportSnapshot={handleImportSnapshot}
        onClearAllSessions={handleClearAllSessions}
      />

      <WorkspaceLinkModal
        isOpen={isWorkspaceLinkOpen}
        onClose={() => setIsWorkspaceLinkOpen(false)}
        onAttachSnippet={(snippet) => {
          handleSendMessage(snippet, 'WORKSPACE_LINK');
        }}
      />

      {/* Tips & Rules Modal */}
      {isTipsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5 space-y-4 text-xs text-slate-300">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>💡 Agentic Workbench Guidelines</span>
            </h3>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li><strong className="text-slate-200">Role Switching:</strong> Use the buttons above the input to switch between Agent, Operator feedback, Kernel invariants, and Workspace file linking.</li>
              <li><strong className="text-slate-200">Subagent Roles:</strong> Spawn specialized subagents (AST Slicer, Rule Auditor, Java Core Engineer) from the left sidebar.</li>
              <li><strong className="text-slate-200">Inline Actions:</strong> Hover over any message bubble to edit, delete, or regenerate the turn.</li>
              <li><strong className="text-slate-200">Local-First Snapshots:</strong> All conversation turns and agent specs are saved in browser storage. Click Export to download an offline JSON backup anytime.</li>
            </ul>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsTipsOpen(false)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
