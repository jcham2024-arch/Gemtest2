# Implementation Plan: Apex Architecture & Pipeline Integration

Incorporate the formal Apex Agent Management Chat architectural specifications, 10-phase delivery roadmap, multi-agent pipeline specs (HCAT and Magentic-One style orchestrator), and testable safety invariants (including 2026 additions K8, E6, M1, M2, C5, C6) into both root repository documents and the interactive React workbench.

---

## Proposed Changes

### 1. Root Specification & Architecture Documents

- **`/README.md`**: Update with Apex dual-plane architecture specification (Immutable Java 21 Kernel Plane + Git-tree CAS Evolution Plane + Tauri 2.0 universal client), repository layout, and explicit salvage mapping from `LeanJavallm`.
- **`/ROADMAP.md`**: Replace 5-phase roadmap with the authoritative 10-phase roadmap (P1 through P10 plus deferred post-v1 items), tagging deliverables with `[SALVAGE: LeanJavallm]`, `[K]`, `[E]`, `[P]`, `[A]`, and `[C]`.
- **`/INVARIANTS.md`**: Incorporate the full testable safety invariant matrix:
  - **Kernel (K1–K8)**: Includes K8 (No carrier pinning on agent executor under JDK 21).
  - **Evolution (E1–E6)**: Includes E6 (Protection inventory monotonicity to prevent masked erosion).
  - **Plugin / Memory (M1–M2)**: Includes M1 (Pre-client MCP descriptor validation against capability grants and binary allowlist) and M2 (Hybrid vector + graph retrieval for multi-hop recall).
  - **Contract & Client (C1–C6)**: Includes C5 (Tauri 2.11.1+ origin and CSP hardening) and C6 (Streaming tool-boundary monotonic ordering).
  - **Sentinel Categories**: 6 parameterized categories (Structural, Security, Capability, Dry-run, Regression, Budget).
  - **Capability Escalation & CI Gates**: Explicit commands and merge-blocking gates.
- **`/STANDARDS.md`**: Add standards for Java 21 records, sealed interfaces, virtual thread pinning prevention (`ReentrantLock`/`Condition`), TypeScript 5.x Zod boundaries, and zero-any rules.
- **`/STRUCTURE.md`**: Add Maven module tree (`apex/`, `kernel/`, `evolution/`, `plugin-host/`, `ipc-omnibus/`, `os-automation/`, `client/`) and Java package map.
- **`/PROJECT-STATUS.md`**: Add the scope review, 9 core ports, and current implementation baseline.
- **`docs/pipeline/` & `docs/analysis/`**:
  - `docs/pipeline/HierarchicalAgentTree.xml`
  - `docs/pipeline/MultiagentPipeline.xml`
  - `docs/analysis/2026-ArchitectureReview.json`

---

### 2. Interactive Workbench & Frontend Data Synchronization

- **`src/types/architecture.ts`**:
  - Add types for the 10-phase roadmap (`P1`–`P10`).
  - Add types for the expanded invariant set (K1–K8, E1–E6, M1–M2, C1–C6).
  - Add types for the HCAT 6-layer verification ladder (`L0` to `L5`) and typed Handoff Envelopes.
- **`src/data/projectData.ts`**:
  - Update roadmap milestones from 5 legacy phases to the 10 Apex phases (P1 Kernel Domain, P2 CAS Engine, P3 Workspace Materialization, P4 Sandboxed Executor, P5 Sentinel, P6 LangChain4j + MCP, P7 TS Client, P8 Tauri Packaging, P9 SBC Profile, P10 Token Economics).
  - Update the architectural layers to model the Dual-Plane architecture: Kernel Plane, CAS Evolution Plane, Plugin Host, IPC Omnibus, OS Automation, and Tauri Universal Client.
  - Add the 9 core ports (`ChatModelPort`, `PlannerPort`, `ToolExecutorPort`, `ApprovalPort`, `StoragePort`, `VectorStorePort`, `SecretsPort`, `AuditPort`, `TelemetryPort`).
  - Include the 6-layer verification ladder (L0 Deterministic, L1 Worker Self-Check, L2 Cross-Family Peer, L3 Independent QA, L4 Integration Verifier, L5 Architect Acceptance).
- **`src/components/ArchitectureView.tsx` & `src/components/RoadmapView.tsx`**:
  - Render the Dual-Plane topology and 9 ports with interactive filtering.
  - Support inspection of the 10 phases, salvage indicators, and verifiable exit criteria.
- **`src/workbench/` & `src/components/SimulatorView.tsx`**:
  - Add an interactive HCAT & Handoff Contract inspector showing typed envelope validation (`handoff-envelope.schema.json`), task state machine (`pending` -> `in_progress` -> `completed`/`rejected`), and verification ladder dispatch.

---

### 3. Logic & Unit Tests

- **`src/utils/roadmapLogic.ts`**:
  - Add validator functions for Handoff Envelopes and ResultContracts.
  - Add helper logic for carrier pinning detection (checking `synchronized` in agent execution paths).
  - Add protection inventory diff checker (detecting masked erosion of active guardrails).
  - Update milestone progress calculators for P1–P10.
- **`src/utils/roadmapLogic.test.ts` & `src/utils/jsonCodec.test.ts`**:
  - Add tests for Handoff Envelope validation and authority attenuation.
  - Add tests for carrier-pinning rule enforcement.
  - Add tests for protection inventory monotonicity (E6).
  - Verify all existing and new unit tests pass cleanly.

---

## Verification Plan

### Automated Tests
- Run `npm test` (`tsx --test src/utils/*.test.ts`) to execute all unit test suites.
- Run `lint_applet` (`tsc --noEmit`) to verify zero TypeScript errors.
- Run `compile_applet` to verify full Vite production build passes.

### Manual / Health Verification
- Query `GET /api/health` to confirm server integrity.
- Verify that navigating across Roadmap, Architecture, POJO Inspector, Obsidian Wiki, Simulator, and Agentic Workbench reflects the updated Apex architecture and invariants cleanly.
