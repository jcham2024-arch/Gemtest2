# Apex Agent Management Chat

> Enterprise-grade, self-evolving multi-agent platform. Java 21 microkernel + Content-Addressable Storage (CAS) evolution plane + Tauri 2.0 / React 19 universal client.

---

## What this is

Apex is a **dual-plane agentic platform**:

- **Kernel Plane** — an immutable, compile-time-typed Java 21 microkernel (Spring Boot 3.3, LangChain4j, Virtual Threads) that owns execution invariants, tenant isolation, guardrails, and the LLM reasoning loop. It has **no write path** to its own behavior.
- **Evolution Plane** — a Content-Addressable Storage (CAS) Git-tree where all agent growth (prompts, skills, tool manifests, MCP configs) lives as versioned blobs on ephemeral sandbox branches. Changes are gated by an automated six-category validation sentinel and human sign-off before merging to `main`.

The frontend is a **Tauri 2.0 + React 19** universal client with an interactive workspace cockpit, connected via typed SSE over a strictly isomorphic TypeScript/Java contract.

---

## Why this design

The central problem with autonomous AI agents is: *how do you let them improve themselves without letting them destroy the host?*

Apex answers this by making "self-improvement" a first-class, versioned, sandboxed, human-auditable operation — the same discipline Git + CI/CD brought to software delivery.

The distinguishing feature against prior attempts is **enforced isomorphism**: the TypeScript client cannot drift from the Java kernel because the CI build fails when generated types diverge (`docs/INVARIANTS.md` §C1).

---

## Architecture at a Glance

### Dual-Plane Topology
```
       ┌────────────────────────────────────────────────────────┐
       │               HUMAN OPERATOR / TAURI UI                │
       └───────────────────────────┬────────────────────────────┘
                                   │ Typed SSE / OpenAPI (C1)
       ┌───────────────────────────▼────────────────────────────┐
       │                      KERNEL PLANE                      │
       │  Java 21 LTS · Virtual Threads (K8) · 9 Core Ports     │
       │  · ChatModelPort         · PlannerPort (AStar)         │
       │  · ToolExecutorPort      · ApprovalPort (L0-L5)        │
       │  · StoragePort           · VectorStorePort             │
       │  · SecretsPort           · AuditPort                   │
       │  · TelemetryPort         · GraphStorePort (M2)         │
       │  (Immutable: no runtime write path to own behavior)    │
       └─────────────┬────────────────────────────▲─────────────┘
                     │                            │
      writeWorkspaceFile (Sandbox only)   ProposalCreated (Verified)
                     │                            │
       ┌─────────────▼────────────────────────────┴─────────────┐
       │                    EVOLUTION PLANE                     │
       │  · CAS Workspace Engine (Postgres / SQLite WAL)        │
       │  · Content-addressed blobs, trees, commits, branches   │
       │  · SandboxValidationSentinel (6 Categories: E1-E6)     │
       │  · Protection Inventory Monotonicity (Masked Erosion)  │
       └────────────────────────────────────────────────────────┘
```

### Nine Core Ports
Owned exclusively by `engine-core`:
1. `ChatModelPort` — Streaming LLM completions and tool calls (OpenAI-compatible HTTP provider in `engine-llm-http`).
2. `PlannerPort` — Deterministic Goal-Oriented Action Planning (`AStarPlanner` in `engine-planner`, ~660 LOC native).
3. `ToolExecutorPort` — Sandboxed process and tool execution (`engine-tools-impl`).
4. `ApprovalPort` — Human-In-The-Loop gate with typed `RiskLevel` (L0–L5).
5. `StoragePort` — Step log and session persistence (`engine-store-sqlite`).
6. `VectorStorePort` — Vector embeddings index for semantic retrieval.
7. `SecretsPort` — Deterministic credential access and memory-safe scrubbing.
8. `AuditPort` — Cryptographically chained execution trace log.
9. `TelemetryPort` — Structured metrics and token budget accounting.

---

## Repository Layout

```
.
├── pom.xml                          # Root Maven parent (packaging=pom)
├── package.json                     # AI Studio React 19 + Vite + Express workbench
├── server.ts                        # Server-side Gemini 3.8/4 architecture consultant
├── apex-chat/                       # Layer 1 pure POJOs (zero I/O, zero external deps)
│   └── apex-chat-common/            # TenantId, SessionId, CommitId, BlobId records
├── apex-core/                       # Layer 2 core interfaces and engine implementations
│   ├── engine-core/                 # 9 port interfaces, domain models, RiskLevel
│   ├── engine-planner/              # AStarPlanner, PlanLoop, Action, Goal, Condition
│   ├── engine-store/                # StoragePort interfaces
│   └── engine-tools/                # Tool interfaces and contracts
├── apex-platform/                   # Layer 2 security, multi-tenancy, audit (Tier 2)
│   ├── apex-auth/                   # JWT & PermissionGrant verification
│   ├── apex-tenant/                 # Row-Level Security (RLS)
│   └── apex-audit/                  # Chained audit log
├── engine-cli/                      # TaskRunner, YAML schema, CLI entrypoint
├── engine-llm-http/                 # OpenAI-compatible streaming LLM provider
├── engine-store-sqlite/             # SQLite step_log with WAL mode & session queries
├── engine-tools-impl/               # RealPathJail, ProcessTreeTerminator, 5 kernel tools
├── java/                            # LeanJavallm salvage reference implementations
├── src/                             # AI Studio React 19 interactive developer workbench
├── docs/
│   ├── INVARIANTS.md                # 22 testable safety guarantees (K1-K8, E1-E6, M1-M2, C1-C6)
│   ├── ROADMAP.md                   # 10-phase delivery plan (P1–P10)
│   ├── STANDARDS.md                 # Java 21 & TypeScript 5.x standards
│   ├── STRUCTURE.md                 # Maven module & Java package directory
│   ├── PROJECT-STATUS.md            # Live phase progress & scope review
│   ├── pipeline/                    # HCAT & Multi-agent pipeline XML specifications
│   └── analysis/                    # 2026 Ecosystem Review & vulnerability mitigations
└── .github/workflows/               # CI: type-drift, ArchUnit, jdeps, JUnit 5
```

---

## Provenance & Salvage

Apex consolidates and formalizes components from **`jcham2024-arch/LeanJavallm`**:

- **`ProcessTreeTerminator`** → Descendant-walk kill using `ProcessHandle.descendants().destroyForcibly()` for sandboxed processes (Invariant K5).
- **`ContextCompactor` + `TokenEstimator`** → Context-overflow defense preserving SYSTEM prompts at index 0 and sliding-window conversational pruning (Invariant C4).
- **`CancellationToken`** → Atomic-flag cooperative cancellation primitive for SSE streams and tool execution (Invariant K6).
- **`AgentEngine` loop structure** → Supervisor reasoning loop reference.

Patterns retained from **`jcham2024-arch/Agenticplatformsetup`**:
- **RealPathJail** → Canonical-path `toRealPath().startsWith(root)` path-traversal barrier (Invariant K4).
- **Tiered `SKILL.md` line limits** → 150/200 line limits in the sentinel budget category.

---

## Status & Progress

- **S1 (Platform Foundation)**: **Complete** (Root POM, `apex-chat-common`, ArchUnit purity gate, `jdeps` isolation).
- **S2 (Kernel Self-Hosting)**: **Complete** (S2.0 skeletons, S2.1 nine ports, S2.2 AStarPlanner, S2.3 tools & realpath jail, S2.4 HTTP LLM provider, S2.5 SQLite store, S2.6 CLI task runner, S2.7 E2E test).
- **S3.0 (Security & Platform Bootstrap)**: **In Progress** (`apex-platform` aggregator, `RiskLevel` L0-L5 typed approval requests).
- **Phases S4–S10 / P4–P10**: Detailed in `docs/ROADMAP.md`.
