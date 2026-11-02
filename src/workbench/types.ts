export type AgentRole = 
  | 'SYSTEM_ARCHITECT' 
  | 'CODE_ENGINEER' 
  | 'AST_SLICER' 
  | 'RULE_AUDITOR' 
  | 'CUSTOM_AGENT';

export type StreamPerspective = 
  | 'ACTIVE_AGENT' 
  | 'OPERATOR' 
  | 'SYSTEM_KERNEL' 
  | 'WORKSPACE_LINK';

export interface AgentDefinition {
  id: string;
  name: string;
  role: AgentRole;
  avatarIcon: string;
  assignedModelId: 'gemini-3.8-flash' | 'gemini-4-argon' | 'claude-3-7' | 'local-ollama';
  systemCharter: string;
  temperature: number;
  assignedRuleProtocols: string[];
  enabledTools: string[];
  workspacePath: string;
  isDefaultHelper?: boolean;
}

export interface AgentTurn {
  id: string;
  role: 'AGENT' | 'OPERATOR' | 'SYSTEM_KERNEL' | 'TOOL_RESULT';
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: number;
  toolCall?: {
    toolName: string;
    argumentsJson: string;
    resultSnippet?: string;
    durationMs?: number;
  };
  isStreaming?: boolean;
  isEditing?: boolean;
}

export interface AgentSession {
  sessionId: string;
  title: string;
  agentId: string;
  turns: AgentTurn[];
  taskContractId?: string;
  linkedWorkspacePath?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorkbenchSettings {
  cloudProvider: 'gemini' | 'ollama' | 'mock';
  apiKey?: string;
  ollamaUrl: string;
  operatorName: string;
  operatorAvatar: string;
  workspaceRootPath: string;
  autoScroll: boolean;
}
