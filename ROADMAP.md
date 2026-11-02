# Enterprise Agentic LLM Platform Workbench: Specialized Standalone UI & Engine Roadmap

An architectural blueprint and engineering roadmap establishing a **standalone, secure TypeScript Agentic Workbench UI** (`modules/ui-agentic-workbench`). The interface translates the layout and ergonomics of the Perchance chat system into an enterprise agentic workbench, linking directly to the **Lean Java Agentic Core (LJAC)** execution engine and the **AgentForge H-MAP** multi-agent governance platform.

---

## 1. Domain Concept Mapping: Perchance → Enterprise Agentic Workbench

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

## 2. User Experience & Visual Design

Following the SaaS & Dashboard design guidelines (`references/3_saas_dashboard.md`), the interface adopts a focused, high-contrast, dark-mode developer workbench aesthetic.

### Aesthetic Direction & Visual Tokens
- **Canvas Atmosphere**: Deep slate background (`#0b0f17` / `bg-slate-950`) providing high contrast and minimal eye strain during extended coding sessions.
- **Structural Surfaces**: Single-elevation dark panels (`#131b2e` / `bg-slate-900/80`) bounded by clean hairline borders (`border-slate-800`). Zero nested cards within cards.
- **60-30-10 Color Budget**:
  - `60% Neutral Canvas`: `#0b0f17` deep slate field.
  - `30% Structural Panels`: `#131b2e` sidebar, top header, and message bubbles.
  - `10% Accent Points`: Electric Indigo (`#6366f1` / `indigo-500`) for primary actions (`Send`, `Spawn Agent`), Emerald (`#10b981` / `emerald-500`) for active engine status, and Amber (`#f59e0b` / `amber-500`) for system invariants.
- **Typography**: Clean display sans (`Plus Jakarta Sans` / `Outfit`) for headers and navigation, paired with `Public Sans` for message prose. Monospace figures (`JetBrains Mono`, `tabular-nums`) are enforced across turn counts, timestamps, and tool argument payloads.

---

## 3. Standalone Architecture & Module Isolation

The frontend is architected as an isolated TypeScript module located at `modules/ui-agentic-workbench/` (or `src/workbench/`), decoupled from the Java runtime.

### Component Layout & Hierarchy

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

## 4. Technical Architecture: System Flow & Boundary Separation

```
┌────────────────────────────────────────────────────────────────────────┐
│             STANDALONE FRONTEND: modules/ui-agentic-workbench          │
│   • Local-First React Store (`workbenchStorage.ts`)                    │
│   • Multi-role Prompt Deck & Perspective Selector                      │
│   • Zero compile-time coupling to backend classes                      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   │ HTTP REST & SSE Stream (/api/agent/stream)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   EXPRESS / TYPESCRIPT PROXY (server.ts)               │
│   • Route Dispatcher: /api/agent/stream, /api/agent/contracts          │
│   • Secure Secret Handshake (Zero-Fill Memory Buffer)                  │
│   • LLM Providers: Gemini 3.8 Flash, Gemini 4 Argon, Local Ollama      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   │ IPC / Stdio Process Bridge (No Jackson/Gson)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│               LEAN JAVA AGENTIC CORE (Java 21 LTS - java.base)         │
├──────────────────────────────────┬─────────────────────────────────────┤
│   com.leanllm.core               │   com.leanllm.agentforge            │
│   ├── SecureSecret (Wipe char[]) │   ├── TaskContract.java (Record)    │
│   ├── ProcessTreeTerminator      │   ├── ExecutionArtifact.java        │
│   ├── JsonNode & JsonParser      │   ├── McpPathPolicyFilter (Jail)    │
│   ├── ContextCompactor (Sliding) │   ├── RuleDagEngine (AGENTS.md)     │
│   └── AbstractProcessRunner      │   └── TypeScriptTaskRunner (Loom)   │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 5. Phased Implementation Roadmap

### Phase 1: Standalone TypeScript Workbench UI (`modules/ui-agentic-workbench/` & `src/workbench/`)
- Build `AgentThreadSidebar.tsx`: New session / spawn agent button, session cards, storage disclaimer, and bottom utility toolbar.
- Build `AgentArena.tsx` & `ArenaTopBar.tsx`: Agent specification modal trigger, operator profile modal trigger, and live engine status indicator.
- Build `AgentMessageStream.tsx`: Turn bubbles with avatar, Markdown rendering, syntax highlighting, tool execution cards, and inline edit/delete/re-run actions.
- Build `AgentInputDeck.tsx`: 4-role perspective selector (`🤖 Agent`, `👤 Operator`, `⚙️ System Kernel`, `📁 Workspace Link`), auto-resizing prompt textarea, `Send` button, and options drawer.
- Build `workbenchStorage.ts`: Local-first `localStorage` persistence with complete JSON backup export and import.

### Phase 2: Express Backend Stream Endpoints (`server.ts`)
- Implement `/api/agent/stream` supporting streaming SSE for Gemini 3.8 Flash, Gemini 4 Argon, and local Ollama.
- Implement `/api/agent/contracts` to link AgentForge `TaskContract` creation with active session turns.

### Phase 3: Core Java 21 Zero-Dependency Foundation (`java/`)
- Implement RFC 8259 compliant `JsonNode.java` and `JsonParser.java` under `com.leanllm.json`.
- Implement `TaskContract.java` and `McpPathPolicyFilter.java` under `com.leanllm.agentforge`.
- Implement standalone `JsonParserTest.java` running on standard OpenJDK 21 LTS without JUnit.

### Phase 4: Obsidian Documentation Graph (`docs/`)
- Author `docs/ui/AgenticWorkbenchRoadmap.md` with in-depth logic explaining the Perchance-to-Agentic UI translation.
- Document RFC 8259 compliance, CWE-674 recursion limits, and AgentForge integration hooks in `docs/json/ZeroDepJson.md`.

### Phase 5: Verification & Git Commit
- Run logic unit tests: `npx --yes tsx --test src/utils/*.test.ts`.
- Run compiler (`compile_applet`) and TypeScript linter (`tsc --noEmit`).
- Verify live browser interaction and visual appearance via Playwright CLI.
- Commit all changes and push to `https://github.com/jcham2024-arch/LeanJavallm`.
