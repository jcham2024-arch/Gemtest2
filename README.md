# Lean Java Agentic Core (LJAC)

> **Java 21 LTS (strictly java.base module)** · **Zero external runtime dependencies. No third-party libraries permitted (no Jackson, no Gson, no Spring, no Apache Commons, no OkHttp).**

A self-contained, enterprise-grade, ultra-lean agentic framework capable of running on any machine with a standard JVM. The system manages autonomous ReAct (Reason + Act) cycles, provides transparent local and cloud LLM inference, and delegates dynamic workloads to sandboxed external scripts without native JNI bindings or heavy embedded interpreters.

---

## 🏛️ Polyglot Architecture

- **Java 21 LTS Orchestration Core**: Zero external runtime dependencies (`java.base` module only). Manages ReAct cycles, thread-safe context compaction, HTTP/2 Server-Sent Events (SSE) streaming, credential scrubbing, and process supervision.
- **TypeScript (Deno / Bun / ts-node)**: Primary guest scripting language for all dynamic agent tools, API adapters, and JSON data transformations.
- **Python 3**: Auxiliary guest scripting language strictly for numerical mathematics, scientific computing, and ML inference.
- **Subprocess Isolation**: Out-of-process execution managed directly via `ProcessBuilder` without intermediate shell wrappers (`no sh -c` or `cmd /c`).

---

## 🔒 5 Critical Remediated Architectural Gaps

1. **Zombie Subprocess Elimination (`ProcessTreeTerminator`)**: Uses JDK 21 `ProcessHandle.descendants()` to recursively kill process trees, eliminating orphan child processes upon timeout or cancellation.
2. **Context Window Overflow Defense (`TokenEstimator` & `ContextCompactor`)**: Heuristic character-to-token budgeting (~3.8 chars/token) with sliding-window compaction that preserves `SYSTEM` instructions at index 0.
3. **Cooperative Cancellation (`CancellationToken`)**: Thread-safe `AtomicBoolean` signaling primitive for halting inference streams and script execution.
4. **Ephemeral Script Lifecycle (`EphemeralScriptManager`)**: `AutoCloseable` temporary script manager guaranteeing disk cleanup upon context exit.
5. **Zero OS Thread Overhead (`AbstractProcessRunner`)**: Uses Java 21 Virtual Threads (`Thread.ofVirtual().start()`) for non-blocking stream drainage without pipe deadlocks.

---

## 📦 Codebase Structure

```
├── docs/                                 # Obsidian-flavored Markdown Documentation Graph
│   ├── security/                         # Memory hygiene, environment sanitization, tree termination
│   ├── json/                             # Zero-dependency JSON AST & recursive-descent parser
│   ├── domain/                           # Canonical turns, tool schemas, token estimation
│   ├── client/                           # HTTP/2 SSE transport, Cloud & Local SSRF loopback clients
│   ├── scripting/                        # Polyglot Deno/Bun & Python process isolation
│   ├── agent/                            # ReAct cognitive engine & script-delegating tools
│   └── ui/                               # Decoupled UiBridge observer interface
├── INDEX.md                              # Master knowledge graph index
├── java/                                 # Zero-Dependency Java 21 Source Code
│   └── src/main/java/com/leanllm/        # 26 atomic POJOs, Records & Interfaces (<120 LOC each)
└── src/                                  # Interactive Executive Architecture & Roadmap Platform (React + Express)
```

---

## 💻 Building the Java Core

Standard OpenJDK 21 LTS:

```bash
cd java
javac -d bin --release 21 -Xlint:all src/main/java/com/leanllm/*/*.java
```

---

## 🚀 Running the Architecture & Roadmap Platform

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to explore:
- The 5-Phase Master Implementation Roadmap & Downstream Agent Tasks
- 8 Subsystem Technical Architecture Deep-Dive
- 26-POJO Code Inspector with Javadoc and code copy
- Interactive Obsidian Knowledge Graph with clickable [[WikiLinks]]
- Live Simulators (ReAct cognitive loop, SecureSecret memory wipe, ContextCompactor, EnvironmentSanitizer)
- AI Architectural Consultant (Search Grounding via `gemini-3.8-flash` & High Thinking via `gemini-4-argon`)

---

## 🖥️ Modular Standalone UI: Enterprise Agentic LLM Workbench

Located at `modules/ui-agentic-workbench/` (or `src/workbench/`), this isolated TypeScript module specializes the layout and simplicity of Perchance-style character chat systems into an enterprise agentic workbench:
- **Built-in Gemini Platform Architect**: The default platform assistant ("Chloe" equivalent) powered by Gemini with search grounding and reasoning.
- **Specialized AgentForge Subagents**: Multi-agent task execution governed by `TaskContract` objects and progressive disclosure Rule DAGs (`AGENTS.md`).
- **4-Stream Perspective Deck**: `🤖 Active Agent`, `👤 Operator`, `⚙️ System Kernel`, and `📁 Workspace Link` (replaces image generation with file/folder tree binding).
- **Zero-Dependency Java Link**: Real-time communication via SSE and RFC 8259 JSON serialization without external libraries.
- **Read Full Specification**: See [[docs/ui/AgenticWorkbenchRoadmap.md|Agentic Workbench Module & Roadmap]].
