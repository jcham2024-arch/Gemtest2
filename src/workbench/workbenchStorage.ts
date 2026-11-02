import { AgentDefinition, AgentSession, WorkbenchSettings } from './types';

const STORAGE_KEYS = {
  SESSIONS: 'ljac_workbench_sessions_v1',
  AGENTS: 'ljac_workbench_agents_v1',
  SETTINGS: 'ljac_workbench_settings_v1',
  ACTIVE_SESSION: 'ljac_workbench_active_session_v1',
};

export const DEFAULT_AGENTS: AgentDefinition[] = [
  {
    id: 'agent_gemini_architect',
    name: 'Gemini Platform Architect',
    role: 'SYSTEM_ARCHITECT',
    avatarIcon: '🧠',
    assignedModelId: 'gemini-3.8-flash',
    systemCharter: `You are the resident Gemini Platform Architect for the Lean Java Agentic Core (LJAC).
Target platform: Java 21 LTS strictly limited to the java.base module with ZERO external runtime dependencies.
You assist human operators with architectural blueprints, RFC 8259 JSON compliance, Project Loom virtual threads, memory hygiene (SecureSecret), and AgentForge task contracts.`,
    temperature: 0.3,
    assignedRuleProtocols: ['AGENTS.md', '01_architecture_protocols.md'],
    enabledTools: ['ast_slicer', 'rule_dag_linter', 'process_supervisor'],
    workspacePath: '.agent/workspaces/architect/',
    isDefaultHelper: true,
  },
  {
    id: 'agent_ast_slicer',
    name: 'AgentForge AST Slicer',
    role: 'AST_SLICER',
    avatarIcon: '✂️',
    assignedModelId: 'gemini-3.8-flash',
    systemCharter: `You are a high-speed AST Slicer subagent.
Your goal is to parse TypeScript and Java source files and extract target declarations within strict line and token limits (< 150 tokens) to prevent context window bloat.`,
    temperature: 0.1,
    assignedRuleProtocols: ['AGENTS.md', 'ast_slicer_sop.md'],
    enabledTools: ['ast_slicer', 'ast_patcher'],
    workspacePath: '.agent/workspaces/ast_slicer/',
  },
  {
    id: 'agent_rule_auditor',
    name: 'Rule DAG Auditor',
    role: 'RULE_AUDITOR',
    avatarIcon: '🛡️',
    assignedModelId: 'gemini-4-argon',
    systemCharter: `You are the AgentForge Rule DAG Auditor.
You verify that AGENTS.md complies with the 3-Tier Progressive Disclosure protocol (Tier 1 <= 150 lines, Tier 2 operational protocols <= 200 lines, Tier 3 leaf SOPs with 0 outbound links).`,
    temperature: 0.2,
    assignedRuleProtocols: ['AGENTS.md', 'rule_dag_specification.md'],
    enabledTools: ['rule_dag_linter'],
    workspacePath: '.agent/workspaces/auditor/',
  },
  {
    id: 'agent_java_core',
    name: 'Java 21 Core Engineer',
    role: 'CODE_ENGINEER',
    avatarIcon: '⚙️',
    assignedModelId: 'gemini-4-argon',
    systemCharter: `You are a specialized Java 21 LTS Core Systems Engineer.
You write atomic POJOs, immutable Records, and sealed classes (< 120 LOC each) using ONLY java.base. Zero Jackson, Gson, Spring, or third-party libraries permitted.`,
    temperature: 0.2,
    assignedRuleProtocols: ['AGENTS.md', 'java21_core_invariants.md'],
    enabledTools: ['javac_compiler', 'process_supervisor'],
    workspacePath: '.agent/workspaces/java_core/',
  },
];

export const DEFAULT_SETTINGS: WorkbenchSettings = {
  cloudProvider: 'gemini',
  ollamaUrl: 'http://localhost:11434',
  operatorName: 'Lead Engineer',
  operatorAvatar: '👤',
  workspaceRootPath: '/workspace',
  autoScroll: true,
};

export const INITIAL_DEFAULT_SESSION: AgentSession = {
  sessionId: 'session_welcome_default',
  title: 'Platform Architecture Consultation',
  agentId: 'agent_gemini_architect',
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now(),
  turns: [
    {
      id: 'turn_welcome_01',
      role: 'AGENT',
      senderName: 'Gemini Platform Architect',
      senderAvatar: '🧠',
      content: `Greetings! I am the resident **Gemini Platform Architect** for the Lean Java Agentic Core (LJAC).

I am directly linked to:
- **Java 21 Core**: Zero-dependency RFC 8259 JSON engine, \`SecureSecret\` memory hygiene, and recursive \`ProcessTreeTerminator\`.
- **AgentForge H-MAP**: Immutable \`TaskContracts\`, canonical realpath workspace jails, and Project Loom virtual thread runners.

How can I assist you with your architecture, subagents, or code validation today?`,
      timestamp: Date.now() - 3600000,
    },
  ],
};

export function loadAgents(): AgentDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AGENTS);
    if (!raw) return DEFAULT_AGENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_AGENTS;
  } catch {
    return DEFAULT_AGENTS;
  }
}

export function saveAgents(agents: AgentDefinition[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
  } catch (e) {
    console.error('Failed to save agents to localStorage:', e);
  }
}

export function loadSessions(): AgentSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [INITIAL_DEFAULT_SESSION];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_DEFAULT_SESSION];
  } catch {
    return [INITIAL_DEFAULT_SESSION];
  }
}

export function saveSessions(sessions: AgentSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage:', e);
  }
}

export function loadSettings(): WorkbenchSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: WorkbenchSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}

export function exportWorkspaceSnapshotJson(): string {
  const payload = {
    exportVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    agents: loadAgents(),
    sessions: loadSessions(),
    settings: loadSettings(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importWorkspaceSnapshotJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.agents && Array.isArray(parsed.agents)) {
      saveAgents(parsed.agents);
    }
    if (parsed.sessions && Array.isArray(parsed.sessions)) {
      saveSessions(parsed.sessions);
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      saveSettings(parsed.settings);
    }
    return true;
  } catch (e) {
    console.error('Failed to import snapshot:', e);
    return false;
  }
}
