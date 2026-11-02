---
id: UI-03
title: "Enterprise Agentic LLM Workbench Architecture & Specification"
type: specification
module: ui-agentic-workbench
context_cost: 450
tags: [agentic-workbench, standalone-ui, typescript, perchance-adaptation, local-first, sse]
related_links:
  - "[[docs/ui/AgenticWorkbenchRoadmap]]"
  - "[[docs/ui/UiDecoupling]]"
  - "[[docs/agent/TaskContractArchitecture]]"
  - "[[docs/json/ZeroDepJson]]"
---

# Enterprise Agentic LLM Workbench Architecture & Specification

## 1. Overview & Paradigm Translation

The **Enterprise Agentic LLM Workbench** (`src/workbench/`) is an isolated, standalone TypeScript module that translates the high-density ergonomics and simplicity of character-based LLM chat interfaces (e.g. Perchance AI Chat) into an **Enterprise-Grade Agentic LLM Workbench**.

It directly interfaces with the **Lean Java Agentic Core (LJAC)** and the **AgentForge H-MAP** multi-agent governance platform.

### Paradigm Translation Table

| Reference UI Feature | Specialized Agentic Translation | Architectural Invariant |
| :--- | :--- | :--- |
| **`💬 New Chat / Character`** | **`+ New Session / Spawn Agent`** | Spawns a new execution context bound to an AgentForge `TaskContract`. |
| **Sidebar Thread Cards** | **Active Agent Task Sessions** | Displays active execution sessions with agent icon, turn counter, and inline session rename/delete. |
| **"Chloe" (Default Character)** | **Built-in Gemini Platform Architect** | Default platform assistant (`gemini-3.8-flash` with Google Search or `gemini-4-argon` with High Thinking) providing zero-dep Java 21, AgentForge, and architectural guidance. |
| **Additional Characters** | **Specialized AgentForge Subagents** | Configurable subagents: Lead Architect, AST Slicer, Rule DAG Auditor, and Code Engineer with explicit `TaskContracts` and tool allowlists. |
| **`✏️ Edit Character`** | **`⚙️ Configure Agent Specification`** | Modal to edit: Agent Title, Assigned Model ID, System Charter / Persona Prompt, Active Rule Protocols (`AGENTS.md`), Tool Allowlist, and execution timeouts. |
| **`🏷️ Set Ur Name/Pic`** | **`👤 Operator Profile & Workspace`** | Configures Operator handle (e.g. "Lead Engineer"), authorization level, and active workspace root path. |
| **Inline Actions (`✏️`, `🗑️`, `🔁`)** | **Turn Rewind, Edit & Tool Re-run** | `✏️` In-place prompt refinement; `🗑️` Prune turn from conversation history; `🔁` Re-trigger inference stream or re-execute agent tool call. |
| **Perspective Selector** | **Stream Role & Injection Selector** | `🤖 Active Agent` (direct prompt), `👤 Operator` (human feedback), `⚙️ System Kernel` (system invariant injection), `📁 Workspace Link` (file/directory snippet link). |
| **Bottom Utility Bar** | **Platform Governance Toolbar** | `⚙️ Provider Settings` (Cloud models, API keys, Ollama), `💾 Export Session` (complete JSON backup), `📁 Import Session`, `🗑️ Clear Sessions`. |

---

## 2. Component Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STANDALONE WORKBENCH UI (TypeScript)                            │
├──────────────────────────────────┬─────────────────────────────────────────────────────┤
│   AgentThreadSidebar.tsx (320px) │   AgentArena (Flex 1)                               │
│   ├── [New Session / Spawn Agent]│   ├── ArenaTopBar.tsx                               │
│   ├── SessionList.tsx            │   │   ├── [⚙️ Edit Agent Spec Modal]                │
│   │   └── AgentSessionCard.tsx   │   │   ├── [👤 Operator Profile Modal]               │
│   ├── StorageNotice.tsx          │   │   └── [Java 21 LTS 0-Dep Status]                │
│   └── PlatformControlBar.tsx     │   ├── AgentMessageStream.tsx                        │
│       ├── SettingsModal          │   │   ├── AgentMessageBubble.tsx                    │
│       ├── ExportSnapshotButton   │   │   │   ├── InlineEditForm.tsx                    │
│       ├── ImportSnapshotButton   │   │   │   └── ToolExecutionBadge.tsx                │
│       └── ClearAllSessionsButton │   │   └── StreamingCursor.tsx                       │
│                                  │   └── AgentInputDeck.tsx                            │
│                                  │       ├── StreamRoleSelector.tsx                    │
│                                  │       │   ├── [🤖 Active Agent]                     │
│                                  │       │   ├── [👤 Operator]                         │
│                                  │       │   ├── [⚙️ System Kernel]                    │
│                                  │       │   └── [📁 Workspace Link]                   │
│                                  │       ├── PromptTextArea.tsx                        │
│                                  │       ├── SendButton.tsx                            │
│                                  │       └── OptionsDrawer.tsx (Temp / Search Ground)  │
└──────────────────────────────────┴─────────────────────────────────────────────────────┘
```

---

## 3. Local-First Privacy & Backup Portability

In accordance with enterprise data protection and the Perchance local-first guarantee:
1. **Local Storage Persistence**: Conversation history and custom agent definitions are persisted strictly within client browser `localStorage` (`ljac_workbench_sessions_v1`, `ljac_workbench_agents_v1`).
2. **Deterministic Portability**: Operators can download a complete offline JSON snapshot via the `export` button and restore state onto another workstation via the `import` button.
3. **Zero External Telemetry**: The UI never sends conversational logs to unvetted telemetry endpoints.

---

## 4. Formal Invariants & Subsystem Verification

1. **Strict TypeScript Discipline**: 100% strict TypeScript types (`strict: true`), eliminating runtime type errors and preventing unchecked `any` leakage.
2. **XSS Defense**: Content is rendered safely through React virtual DOM reconciliation, eliminating insecure `dangerouslySetInnerHTML` injections.
3. **Zero Java Dependency in UI**: The UI module contains zero compile-time dependencies on the Java runtime. It communicates with the backend exclusively via normalized REST endpoints (`/api/research`, `/api/deep-think`) and SSE streaming protocols.
