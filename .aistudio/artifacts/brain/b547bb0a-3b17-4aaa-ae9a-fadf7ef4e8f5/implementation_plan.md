# Revised Implementation Plan: Cohesive Apex Platform & Workbench Unification

Unify the active **ApexAgentManagementChat** codebase (`jcham2024-arch/ApexAgentManagementChat` at `phase/s3.0-platform-bootstrap`) and the interactive **AI Studio Developer Workbench** into a single cohesive, production-grade repository.

---

## Analysis of ApexAgentManagementChat (`phase/s3.0-platform-bootstrap`)

### 1. Current Phase & Process State
- **S1 (Platform Foundation)**: Complete. Maven Enforcer, `jdeps` isolation check, and ArchUnit purity gates enforced.
- **S2 (Kernel Self-Hosting)**: Complete across all 8 sub-phases:
  - `S2.0`: Aggregator and module skeletons.
  - `S2.1`: Nine port interfaces (`ChatModelPort`, `PlannerPort`, `ToolExecutorPort`, `ApprovalPort`, `StoragePort`, `VectorStorePort`, `SecretsPort`, `AuditPort`, `TelemetryPort`) and 13 domain records.
  - `S2.2`: `AStarPlanner` (GOAP without LLM call), `PlanLoop`, `CancellationToken`, K6 proof (≤100ms cancellation).
  - `S2.3`: Five kernel tools (`ReadFileTool`, `WriteFileTool`, `ListDirTool`, `RunCommandTool`, `HttpTool`), zero-dep `Json` parser, `RealPathJail`, `ProcessTreeTerminator`, K2+K5 proofs.
  - `S2.4`: `OpenAiCompatibleProvider` in `engine-llm-http` with SSE streaming and error classification.
  - `S2.5`: SQLite `step_log` in `engine-store-sqlite` with WAL mode and session queries.
  - `S2.6`: `TaskRunner` with safe YAML loader and CLI entry in `engine-cli`.
  - `S2.7`: End-to-end unsupervised task execution.
- **S3.0 (Security & Platform Bootstrap)**: Currently in progress:
  - `apex-platform` aggregator parent with `apex-auth`, `apex-tenant`, `apex-audit` skeletons.
  - `RiskLevel` (L0–L5) moved to `com.apex.engine.planner` with `requiresApproval()`.
  - `ApprovalRequest.riskLevel` strongly typed as `RiskLevel`.

### 2. Available Components for Unification
- **Java Microkernel Modules**:
  - `apex-chat/` (`apex-chat-common`): Layer 1 pure POJOs.
  - `apex-core/` (`engine-core`, `engine-planner`, `engine-store`, `engine-tools`): Core interfaces, planner, loop.
  - `apex-platform/` (`apex-auth`, `apex-tenant`, `apex-audit`): Layer 2 security, multi-tenancy, and audit logs.
  - `engine-cli/`: CLI runner & task YAML schema.
  - `engine-llm-http/`: HTTP provider adapter.
  - `engine-store-sqlite/`: Storage port implementation.
  - `engine-tools-impl/`: Kernel tool implementations and sandboxing.
- **Specification & Governance**:
  - `AGENT_RULES.md`: 16 authoritative coding and execution rules.
  - `CONTEXT.md`: Project map and module registry.
  - `INVARIANTS.md`: Full safety invariant matrix including 2026 additions (K8, E6, M1, M2, C5, C6).
  - `STANDARDS.md` & `STRUCTURE.md`: Java 21 & TypeScript coding standards.
  - `PROJECT-STATUS.md`: Live status review.
  - S2 & S3 session documents (`PHASE-S2-*.md`, `PHASE-S3.0-*.md`).
  - HCAT and Multi-agent pipeline specifications (`HierarchicalAgentTree.xml`, `MultiagentPipeline.xml`).
- **Interactive UI Workbench & Server (AI Studio)**:
  - Vite + React 19 + Tailwind v4 + Motion developer cockpit.
  - Express server with Gemini 3.8 Flash search-grounded research and Gemini 4 High-Thinking architecture consultant.
  - TypeScript simulators, validators, and unit tests.

---

## Unification Plan & Deliverables

### Step 1: Root Project Structure & Specification Files
Structure the repository so that the web runtime operates natively on port 3000 while housing the complete Maven multi-module tree:
1. Place the root `pom.xml` for Apex alongside `package.json`.
2. Sync root governance files:
   - `AGENT_RULES.md`
   - `CONTEXT.md` (updated with `apex-platform` modules)
   - `README.md` (Dual-Plane architecture, module tree, salvage mapping)
   - `ROADMAP.md` (10 phases P1–P10 / S1–S10 with live status indicators)
   - `INVARIANTS.md` (Complete 22 invariants: K1–K8, E1–E6, M1–M2, C1–C6, Sentinel categories, CI gates)
   - `STANDARDS.md`
   - `STRUCTURE.md`
   - `PROJECT-STATUS.md`
3. Archive pipeline specifications under `docs/pipeline/` and 2026 review under `docs/analysis/`.

### Step 2: Ingest Apex Java Microkernel Modules
Import the verified Java modules from `ApexAgentManagementChat`:
- `apex-chat/`
- `apex-core/` (`engine-core`, `engine-planner`, `engine-store`, `engine-tools`)
- `apex-platform/` (`apex-auth`, `apex-tenant`, `apex-audit`)
- `engine-cli/`
- `engine-llm-http/`
- `engine-store-sqlite/`
- `engine-tools-impl/`
Keep the existing `java/` reference POJOs intact as documented salvage references (`[SALVAGE: LeanJavallm]`).

### Step 3: Synchronize Frontend Types & Data Models
1. **`src/types/architecture.ts`**:
   - Model all 10 roadmap phases (P1–P10) and sub-phases (S1.1–S3.0).
   - Model the 9 Core Ports and their adapter relationships.
   - Model the `RiskLevel` L0–L5 hierarchy.
   - Model all 22 testable invariants (K1–K8, E1–E6, M1–M2, C1–C6).
   - Model HCAT verification layers (L0–L5), verification profiles (Light, Standard, Heavy), and Handoff Envelopes.
2. **`src/data/projectData.ts`**:
   - Synchronize with the live Apex components, ports, and phase completion statuses (S1 & S2 complete, S3.0 in progress).
   - Add new Apex POJOs/records (`ApprovalRequest`, `RiskLevel`, `PlanLoop`, `AStarPlanner`, `Action`, `Goal`, `Condition`, `SqliteStoragePort`, `OpenAiCompatibleProvider`) alongside salvage POJOs.
   - Add HCAT verification ladder definitions and sample Handoff Contracts.

### Step 4: Enrich Interactive Workbench & Simulators
1. **`src/components/ArchitectureView.tsx`**:
   - Dual-Plane visualizer: Kernel Plane (Java 21, LangChain4j, Virtual Threads) vs. CAS Evolution Plane (Git-tree, blobs, sentinel).
   - 9-Port interactive architecture diagram with adapter status.
2. **`src/components/RoadmapView.tsx`**:
   - Track progress across S1 (Done), S2 (Done: 8/8 sub-phases), S3 (In progress: S3.0), and S4–S10.
   - Filter by Plane (`[K]`, `[E]`, `[P]`, `[A]`, `[C]`) and Salvage tag (`[SALVAGE: LeanJavallm]`).
3. **`src/components/PojoInspectorView.tsx`**:
   - Allow inspection of both Apex Java records/ports and reference salvage POJOs with syntax highlighting, thread safety tags, and invariant links.
4. **`src/components/SimulatorView.tsx`**:
   - **HCAT Verification Ladder**: Interactive simulator evaluating L0 through L5 gates.
   - **Handoff Contract Validator**: Enforcing `handoff-envelope.schema.json` and tool authority attenuation.
   - **2026 Invariant Checkers**:
     - K8: Carrier-pinning static scanner (`synchronized` / `Object.wait()` detection in virtual thread code).
     - E6: Protection inventory monotonicity diff checker (preventing Masked Erosion).
     - M1: MCP tool descriptor security validator.

### Step 5: Unit Testing & Logic Verification
1. **`src/utils/roadmapLogic.ts`**:
   - Add validators for Handoff Envelopes, ResultContracts, K8 carrier pinning, E6 protection inventory monotonicity, and M1 MCP security.
   - Update milestone calculations for the 10-phase roadmap.
2. **`src/utils/roadmapLogic.test.ts` & `src/utils/jsonCodec.test.ts`**:
   - Test suites verifying K8, E6, M1, C6, HCAT envelope validation, and task state machine.
   - Verify 100% test pass rate with `npm test`.

---

## Verification Plan

### Automated Gates
1. Run `npm test` (`tsx --test src/utils/*.test.ts`) to execute all TypeScript unit tests.
2. Run `lint_applet` (`tsc --noEmit`) to verify clean type checking.
3. Run `compile_applet` to verify successful Vite production build.

### Runtime Server & UX Check
1. Query `curl -s http://localhost:3000/api/health` to confirm server status.
2. Verify all dashboard tabs render seamlessly: Roadmap, Architecture, POJO Inspector, Wiki, Simulator, and Agentic Workbench.
