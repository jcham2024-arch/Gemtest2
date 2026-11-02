---
id: UI-02
title: "Enterprise Agentic LLM Workbench Module & Roadmap"
type: specification
module: ui-agentic-workbench
context_cost: 420
tags: [agentic-workbench, standalone-ui, typescript, perchance-adaptation, agentforge-integration]
related_links:
  - "[[docs/ui/UiDecoupling]]"
  - "[[docs/agent/ReActOrchestration]]"
  - "[[docs/json/ZeroDepJson]]"
  - "[[docs/security/SecureSecret]]"
---

# Enterprise Agentic LLM Workbench: Standalone Module & Technical Roadmap

## 1. Executive Summary & Design Rationale

This document establishes the architecture and execution roadmap for the **Enterprise Agentic LLM Workbench UI** (`modules/ui-agentic-workbench`). The frontend is engineered as a **completely isolated, standalone TypeScript module**, strictly decoupled from the Java runtime and backend object libraries.

The interface specializes the layout and operational simplicity of character-based LLM chat engines (such as Perchance AI Chat) into an **Enterprise-Grade Agentic LLM Platform**. It bridges human operators with autonomous subagent swarms managed by **AgentForge H-MAP** and executed on the **Lean Java Agentic Core (LJAC)**.

---

## 2. Domain Concept Mapping: Perchance → Agentic Platform

Every functional affordance from the reference interface is mapped to an authoritative agentic primitive:

| Reference UI Affordance | Specialized Agentic Translation | Underlying Mechanism & Formal Invariant |
| :--- | :--- | :--- |
| **`💬 New Chat / Character`** | **`+ New Session / Spawn Subagent`** | Dispatches a new session bound to an AgentForge `TaskContract` or launches a specialized subagent from the agent catalog. |
| **Thread List & Avatars** | **Active Subagent Tasks & Sessions** | Displays active execution sessions with agent avatar/icon, assigned model, turn counter, contract status (`PENDING`, `RUNNING`, `COMPLETED`), and delete/rename actions. |
| **"Chloe" (Default Character)** | **Built-in Gemini Platform Architect** | Default platform assistant (`gemini-3.8-flash` with Google Search or `gemini-4-argon` with High Thinking) providing zero-dep Java 21, AgentForge, and architectural guidance. |
| **Additional Characters** | **Specialized AgentForge Subagents** | Configurable subagents: Lead Architect, AST Slicer, Rule DAG Auditor, and Code Engineer. Each possesses a charter, tool allowlist, and sandboxed directory (`.agent/workspaces/agents/<id>/`). |
| **`✏️ Edit Character`** | **`⚙️ Configure Agent Specification`** | Modal to edit: Agent Title, Assigned Model ID, System Charter / Persona Prompt, Active Rule Protocols (`AGENTS.md`), Tool Allowlist, and execution timeouts. |
| **`🏷️ Set Ur Name/Pic`** | **`👤 Operator Profile & Workspace`** | Configures Operator handle (e.g. "Lead Engineer"), authorization level, and active workspace root path. |
| **Inline Actions (`✏️`, `🗑️`, `🔁`)** | **Turn Rewind, Edit & Tool Re-run** | `✏️` In-place prompt refinement; `🗑️` Prune turn from conversation history; `🔁` Re-trigger inference stream or re-execute agent tool call. |
| **Perspective Selector** | **Stream Role & Injection Selector** | `🤖 Active Agent` (direct prompt), `👤 Operator` (human feedback), `⚙️ System Kernel` (system invariant injection), `📁 Workspace Link` (file/directory snippet link). |
| **Bottom Utility Bar** | **Platform Governance Toolbar** | `⚙️ Provider Settings` (Cloud models, API keys, Ollama), `💾 Export Session` (complete JSON backup), `📁 Import Session`, `🗑️ Clear Sessions`. |

---

## 3. Strict Module Boundaries & Component Architecture

### Boundary Separation Principle
1. **Frontend Isolation**: The UI module (`modules/ui-agentic-workbench`) has **zero compile-time dependencies** on Java `.class` files, JARs, or backend modules. It compiles independently with `tsc` and bundles via Vite.
2. **Normalized Wire Protocol**: Communication with the backend occurs exclusively over standard HTTP REST (`/api/agent/*`) and Server-Sent Events (SSE: `/api/agent/stream`) transmitting RFC 8259 compliant JSON payloads.
3. **Local-First Privacy**: In alignment with local-first desktop paradigms, session state is preserved in browser `localStorage` and can be exported as a portable JSON snapshot. No conversational data is persisted in external telemetry servers.

### Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STANDALONE WORKBENCH UI (TypeScript)                            │
├──────────────────────────────────┬─────────────────────────────────────────────────────┤
│   AgentThreadSidebar.tsx (280px) │   AgentArena.tsx (Flex 1)                           │
│   ├── [New Session / Spawn Agent]│   ├── ArenaTopBar.tsx                               │
│   ├── SessionList.tsx            │   │   ├── [⚙️ Configure Agent Spec]                 │
│   │   └── AgentSessionCard.tsx   │   │   ├── [👤 Operator Profile]                     │
│   ├── StorageNotice.tsx          │   │   └── [Engine Status: Java 21 Zero-Dep]         │
│   └── PlatformControlBar.tsx     │   ├── AgentMessageStream.tsx                        │
│       ├── SettingsModalTrigger   │   │   ├── AgentMessageBubble.tsx                    │
│       ├── ExportJsonButton       │   │   │   ├── InlineEditForm.tsx                    │
│       ├── ImportJsonButton       │   │   │   └── ToolExecutionBadge.tsx                │
│       └── ClearSessionsButton    │   │   └── StreamingCursor.tsx                       │
│                                  │   └── AgentInputDeck.tsx                            │
│                                  │       ├── StreamRoleSelector.tsx                    │
│                                  │       │   ├── [🤖 Active Agent]                     │
│                                  │       │   ├── [👤 Operator]                         │
│                                  │       │   ├── [⚙️ System Kernel]                    │
│                                  │       │   └── [📁 Workspace Link]                   │
│                                  │       ├── PromptTextArea.tsx                        │
│                                  │       ├── SendButton.tsx                            │
│                                  │       └── OptionsDrawer.tsx (Temp / Max Tokens)     │
└──────────────────────────────────┴─────────────────────────────────────────────────────┘
```

---

## 4. Integration with Lean Java Core & AgentForge H-MAP

### 4.1 RFC 8259 Zero-Dependency JSON Serialization
The Java core processes all session turns, tool calls, and AgentForge `TaskContract` objects using `com.leanllm.json.JsonNode` and `com.leanllm.json.JsonParser`.
- **Zero External Dependencies**: Replaces Jackson and Gson entirely using standard OpenJDK 21 LTS `java.base`.
- **DoS Guardrail (CWE-674)**: Strict recursion depth limit (`MAX_DEPTH = 64`) prevents stack overflow vulnerabilities from maliciously crafted payloads.
- **Reference**: IETF RFC 8259 ("The JavaScript Object Notation (JSON) Data Interchange Format") and ECMA-404.

### 4.2 Deterministic Memory Hygiene (`SecureSecret`)
When an operator configures cloud API keys in the Settings modal, credentials are sent over HTTPS/TLS to the proxy and held in memory strictly as mutable `char[]` buffers wrapped in `SecureSecret`. Upon completion of the transport request, buffers are overwritten with null characters (`\0`) to eradicate credentials from JVM heap inspection.

### 4.3 Subprocess Isolation & Process Tree Termination
When specialized subagents invoke guest scripts (`ast_slicer.ts`, `rule_dag_linter.ts`):
- Execution is jailed within canonical workspace paths verified via `McpPathPolicyFilter.java`.
- Virtual thread pools (Project Loom, JEP 444) manage concurrent execution without OS thread exhaustion.
- Process tree termination (`ProcessTreeTerminator.java`) uses JDK 21 `ProcessHandle` to traverse and terminate zombie process trees recursively upon timeout.

---

## 5. Formal References & Specifications

1. **IETF RFC 8259**: *The JavaScript Object Notation (JSON) Data Interchange Format*. Internet Engineering Task Force, Dec 2017. URL: `https://www.rfc-editor.org/rfc/rfc8259`.
2. **ECMA-404**: *The JSON Data Interchange Syntax*. Ecma International, 2nd Edition, Dec 2017. URL: `https://ecma-international.org/publications-and-standards/standards/ecma-404/`.
3. **MITRE CWE-674**: *Uncontrolled Recursion*. Common Weakness Enumeration. URL: `https://cwe.mitre.org/data/definitions/674.html`.
4. **Oracle JEP 444**: *Virtual Threads*. JDK 21 LTS Standard, Sept 2023. URL: `https://openjdk.org/jeps/444`.
5. **IEEE Std 1003.1-2017 (POSIX.1)**: *Standard for Information Technology—Portable Operating System Interface (POSIX) Base Specifications, Issue 7*. Process Management and Signals (`SIGTERM`, `SIGKILL`).
6. **AgentForge H-MAP Specification**: *Hierarchical Multi-Agent Platform*. Repository: `https://github.com/jcham2024-arch/Agenticplatformsetup`.
