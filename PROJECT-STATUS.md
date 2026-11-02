# PROJECT-STATUS.md — Scope Review & Live Tracking

**Generated:** 2026-11 · **Status:** Active (S1 & S2 complete, S3.0 in progress)
**Purpose:** Single-page orientation for architects, engineers, and automated agents.

---

## 1. What We Are Making

Apex Agent Management Chat — an **enterprise-grade, self-evolving multi-agent platform** that:

- Lets multiple LLM agents (any OpenAI-compatible provider) collaborate in one workspace, each with its own model, tools, and permissions.
- Runs on a **deterministic Java 21 kernel** with no shell interpolation, no dynamic bytecode, and no enterprise dependency in the core.
- Stores every step (thinking, decision, action, observation) in a **Content-Addressable Storage (CAS)** Git-tree evolution plane where changes are validated by a six-category sentinel before human sign-off.
- Exposes an isomorphic **Tauri 2.0 + React 19** universal client rendering streaming tokens, reasoning accordions, tool badges, and HITL diff modals.
- Is multi-tenant, auditable, and risk-tiered from day one.

---

## 2. Architecture: Dual Planes & 9 Core Ports

### Three Layers
- **Layer 1 (`apex-chat/*`)**: Pure POJOs. No I/O, no threads, no network, no Spring.
- **Layer 2 (`apex-core/*`, `apex-platform/*`)**: Core interfaces, ports, planner, tools, and Tier 2 adapters.
- **Layer 3**: Behavior governance stacks (`AGENT_RULES.md`, `CONTEXT.md`, `INVARIANTS.md`).

### Nine Core Ports
1. `ChatModelPort`: Streaming completions and tool calling.
2. `PlannerPort`: Deterministic A* Goal-Oriented Action Planning.
3. `ToolExecutorPort`: Sandboxed process and tool execution.
4. `ApprovalPort`: Human-In-The-Loop gate with typed `RiskLevel` (L0–L5).
5. `StoragePort`: Step log persistence and session querying.
6. `VectorStorePort`: Semantic vector search index.
7. `SecretsPort`: In-memory credential access and memory scrubbing.
8. `AuditPort`: Cryptographically chained execution trace log.
9. `TelemetryPort`: Structured metrics and token budget accounting.

---

## 3. Current Delivery Status

| Phase | Description | Deliverables | Status |
|---|---|---|---|
| **S1.1** | Root POM & Common Records | `apex-chat-common`, `TenantId`, `SessionId`, CI | **Merged** |
| **S1.2** | Enforcement Gates | Maven Enforcer, `jdeps` CI isolation, ArchUnit purity | **Merged** |
| **S2.0** | Module Skeletons | `apex-core` aggregator, 8 child modules | **Merged** |
| **S2.1** | Nine Ports & Records | 9 port interfaces, 13 records, `PORT-CATALOGUE.md` | **Merged** |
| **S2.2** | Native A* Planner & Loop | `AStarPlanner`, `PlanLoop`, `CancellationToken`, K6 proof | **Merged** |
| **S2.3** | Kernel Tools & Jail | 5 tools, `Json` parser, `RealPathJail`, K2+K5 proofs | **Merged** |
| **S2.4** | HTTP Model Adapter | `OpenAiCompatibleProvider` in `engine-llm-http`, streaming | **Merged** |
| **S2.5** | SQLite Storage | `engine-store-sqlite`, WAL mode, step_log persistence | **Merged** |
| **S2.6** | CLI Task Runner | `engine-cli`, YAML task schema, `TaskRunner` | **Merged** |
| **S2.7** | End-to-End Kernel | Kernel completes task file unsupervised | **Merged** |
| **S3.0** | Platform Bootstrap | `apex-platform` aggregator, `RiskLevel` L0-L5 approval typing | **Merged** |
| **S3.1** | Platform Auth | `apex-auth`, `PermissionGrant`, `CapabilityClass`, `TokenValidator` | **Merged** |
| **S3.2** | Platform Tenant | `apex-tenant`, `TenantContext`, `TenantIsolationGuard` | **Merged** |
| **S3.3** | Platform Audit | `apex-audit`, `ChainedAuditPort` (SHA-256 chain + ReentrantLock) | **Merged** |
| **S3.4** | HITL Approval Gate | `HitlGate` in `engine-core` (L0-L2 auto, L3-L5 human gate) | **Merged** |
| **S3.5** | Security Invariant Proofs | K1 (`K1ClassloadingTest`), K3 (`K3KernelInvariantTest`), K4 (`RealPathJailTest`), K7 (`K7InputInjectionGuardTest`), E2 (`E2CapabilityEscalationTest`) | **Merged** |

---

## 4. What Is Ahead

| Phase | Scope | Target Exit |
|---|---|---|
| **S4** | Memory router, three sandbox tiers, `VectorStorePort`, `GraphStorePort` (M2), C4 proof | Multi-hop recall verified |
| **S5** | Self-improvement flywheel, CAS evolution plane, Sentinel E1–E6 proofs | Anti-Masked Erosion proven |
| **S6** | SSE `WireEvent` projection, React chat MVP, C1/C2 proofs | Stream renders without drift |
| **S7** | Confidence-gated council, agreement shortcut, chairman synthesis | Council solves hard tasks |
| **S8** | A2A node: SBC/Android register as `AgentParticipant`, C3 proof | Heterogeneous swarm online |
| **S9** | SBC profile (Pi 400), AT-SPI2 accessibility reader | Low-resource target validated |
| **S10** | Token economics, budget meters, provider fallback chain | Transparent failover proven |
