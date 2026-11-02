# Roadmap — Apex Agent Management Chat

Ten phases. Each ships with its full test suite (JUnit 5 + Testcontainers on the Java side, Vitest on the TypeScript side). A phase is "done" only when its exit criteria are green in CI.

Tags:
- `[SALVAGE: LeanJavallm]` — component adapted from `LeanJavallm` source
- `[SALVAGE: Agenticplatformsetup]` — pattern retained (no code reused)
- `[K]` kernel plane · `[E]` evolution plane · `[P]` plugin host · `[A]` OS automation · `[C]` client

---

## P1 — Kernel Domain Records & Context Threading `[K]`
**Goal:** Compile-time-typed foundation with no runtime mutation surface.

**Deliverables**
- `TenantId`, `SessionId`, `CommitId`, `BlobId`, `PermissionGrant` records
- `AgentStreamEvent` sealed hierarchy (9 permitted subtypes)
- `DomainMessage` sealed hierarchy (4 permitted subtypes)
- `ExecutionContext` record + HTTP filter that threads it explicitly (replaces invalid `ScopedValue` claims)
- `CancellationToken` primitive `[SALVAGE: LeanJavallm]` — atomic-flag cooperative cancellation, used by P6/P7 streams and P4 tools

**Exit criteria**
- `./mvnw test` green
- 100% branch coverage on record compact constructors
- Property test: mutating any record's input collection throws at construction
- `CancellationToken` cancellation is observed within 100ms by an awaiting `CompletableFuture`

---

## P2 — CAS Engine `[E]`
**Goal:** Content-addressed storage with no concurrent-corruption path.

**Deliverables**
- Postgres adapter (`WorkspaceStoragePort`)
- SQLite adapter (SBC profile; WAL + single-writer + optimistic CAS)
- Flyway migrations for `workspace_blob`, `workspace_tree`, `workspace_commit`, `workspace_branch`

**Exit criteria**
- `CasConcurrencyIT`: 16 virtual threads × 4 branches, zero corruption
- `WorkspaceBlob` insert is idempotent (SHA-256 dedupe proven)
- Branch pointer update loses no writes under contention
- `PRAGMA integrity_check` passes after SQLite stress test

---

## P3 — Workspace Materialization `[E]→[K]`
**Goal:** Tree → immutable `CompiledAgentWorkspace` + `AgentProfileView`.

**Deliverables**
- `WorkspaceMaterializer` parsing `SKILL.md`, `tools/**/*.json`, `config/mcp-servers.json`, `meta/agent-profile.json`
- `IMMUTABLE_KERNEL_INVARIANTS` compiled constant merged at materialization
- `AgentProfileView` as the *single* wire DTO between TS and Java

**Exit criteria**
- Round-trip test: commit → materialize → profile view → OpenAPI → TS type
- Materialized workspaces are deeply immutable (property test)
- 60s cache by `CommitId` proven correct (no stale reads after branch move)

---

## P4 — Sandboxed Process Executor `[P]`
**Goal:** Command execution with no shell-injection surface and no orphan processes.

**Deliverables**
- `SandboxedProcessExecutor` (tokenized `argv`, no `/bin/sh`)
- **Realpath jail** for working directory `[SALVAGE: Agenticplatformsetup]` — resolve `toRealPath()`, assert `startsWith(workspaceRoot)`, reject deviation before `ProcessBuilder.start()`
- **`ProcessTreeTerminator`** `[SALVAGE: LeanJavallm]` — on timeout or cancellation, walk `ProcessHandle.descendants()` and `destroyForcibly()` every descendant, not just direct child
- Per-tenant binary allow-list
- 30s default timeout, 50KB output cap

**Exit criteria**
- `ProcessInjectionIT`: `;`, `$()`, `` ` ``, `|`, `&&` reach target binary as literal argv bytes
- `OrphanProcessIT`: tool spawning grandchild leaves zero surviving processes after timeout or cancellation
- `PathTraversalIT`: `../` in argv or working directory rejected pre-exec
- Output cap truncates without OOM at 50KB
- Cancellation via `CancellationToken` terminates process tree within 500ms

---

## P5 — SandboxValidationSentinel `[E]`
**Goal:** The safety keystone — six-category gate before any proposal.

**Deliverables (per `docs/INVARIANTS.md` §Sentinel Categories)**
1. Structural — schemas, no traversal
2. Security — credential regex, injection markers
3. Capability — every tool class covered by operator grant
4. Dry-run — every new tool probes successfully
5. Regression — replay last 20 messages, no new guardrail trips, ≤110% tokens
6. Budget — system prompt ≤25% grant, ≤80% parent + 4K tokens; `SKILL.md` tiered limits (150/200 lines) `[SALVAGE: Agenticplatformsetup]`
7. Monotonic Protection Inventory (E6) — candidate cannot drop active guardrail IDs without operator grant

**Exit criteria**
- 6 × parameterized test classes, each with passing and failing fixtures
- Any failure rolls branch to parent and emits `SANDBOX_REJECTED:{CATEGORY}`
- Capability-class escalation (`WRITE`, `NET_EGRESS`, `PROC_SPAWN`, `SCREEN_INJECT`) forces HITL regardless of sentinel outcome

---

## P6 — LangChain4j Orchestration + MCP `[K]×[P]`
**Goal:** Working supervisor/specialist loop over SSE, with context overflow defense.

**Deliverables**
- `DynamicAgentFactory` building `SupervisorAgent` from `AgentProfileView`
- `McpToolProvider` wiring (STDIO + Streamable HTTP) with descriptor allowlist validation (M1)
- Supervisor meta-tools: `spawnAgent`, `delegateTask`, `writeWorkspaceFile`
- `writeWorkspaceFile` is sandbox-branch-only (cannot touch `main`)
- **`TokenEstimator`** `[SALVAGE: LeanJavallm]` — cheap heuristic token count
- **`ContextCompactor`** `[SALVAGE: LeanJavallm]` — sliding-window pruning preserving SYSTEM message
- ReAct loop structure informed by `AgentEngine` `[SALVAGE: LeanJavallm]`
- Streaming tool-boundary monotonic sequence preservation (C6)

**Exit criteria**
- E2E: prompt → orchestrator spawns `@SecOps` → SecOps invokes stub tool → stream renders both messages
- `writeWorkspaceFile` to `main` rejected by construction
- `writeWorkspaceFile` to sandbox branch triggers §P5 sentinel
- `ContextCompactor` preserves SYSTEM message and last N turns under forced-overflow fixture
- `CancellationToken` cancellation mid-stream stops inference promptly

---

## P7 — TypeScript Client & SSE `[C]`
**Goal:** Live streaming into the Perchance-style workspace.

**Deliverables**
- `AgentStreamClient` (`fetch` + `ReadableStream`, exponential backoff)
- `AgentRoutingBar`, `AgentMessageCard`, `ReasoningAccordion`, `ToolInvocationBadge`
- Zustand session store
- `openapi-typescript` generation wired into CI

**Exit criteria**
- Types are isomorphic: CI `git diff --exit-code` on generated `.d.ts`
- SSE reconnects after network drop without duplicating messages
- `ERROR` events render gracefully (no UI crash)

---

## P8 — Tauri Packaging & HITL Approval `[C]`
**Goal:** Native desktop shell + human sign-off on agent proposals.

**Deliverables**
- Tauri 2.11.1+ shell with CSP hardening (`script-src` excludes `data:` and `blob:`) (C5)
- `GitDiffReviewModal` (2-way diff + embedded sentinel report)
- `PermissionGrant` signing flow
- Content sanitization for agent-authored tokens

**Exit criteria**
- App launches across Linux WebKitGTK / Windows WebView2 / macOS WKWebView
- Proposal → diff → approve → merge → hot recompile works end-to-end
- Reject → rollback leaves `main` untouched (verified by commit hash)

---

## P9 — SBC Profile & Accessibility `[A]`
**Goal:** Raspberry Pi 400 + Kali deployment target.

**Deliverables**
- `sbc` Spring profile (SQLite, budget defaults)
- AT-SPI2 `AccessibilityReader` (Linux)
- `HostEcosystemDiscoveryService` (PATH + port probes)
- Dead-man switch + input rate limit for injection guards

**Exit criteria**
- Platform runs on Pi 400, idle RSS 300–400MB
- Accessibility tree of running Godot/Reaper window read as JSON
- Dead-man switch defaults `false` and blocks injection when disarmed
- Password fields (`role == "passwordField"`) never injected into

---

## P10 — Token Economics & Provider Fallback `[K]`
**Goal:** Cost control, resilience, and memory routing.

**Deliverables**
- `ChatModelProvider` interface + `ModelRegistry`
- `TokenMeter` (pre-inference gate + post-inference accounting) built on `TokenEstimator`
- Fallback chain on `provider_5xx` / `provider_timeout` / `rate_limited`
- Hybrid retrieval with `GraphStorePort` + `VectorStorePort` for multi-hop queries (M2)
- SSE `BudgetWarning` (80%) and `BudgetExhausted` (100%)

**Exit criteria**
- Budget exhausted → stream terminates with `BudgetExhausted`
- Provider 5xx → transparent fallback within same conversation
- Per-tenant budget accounting survives restart (persisted in SQLite)

---

## Post-v1 (Deferred)
- Multi-region LLM routing
- Cross-tenant skill marketplace
- TLA+ formal verification of the sentinel
- Android deployment (Tauri 2.0 + AccessibilityService bridge)
- Descending-order AST patch tooling `[SALVAGE: Agenticplatformsetup]`
