# PROJECT-STATUS.md — Scope Review & Context Renew

**Generated:** 2026-01 · **Status:** In progress
**Purpose:** Single-page orientation for the human and any agent picking
up the project. Read once; not a source of truth for build rules.

---

## 1. What we are making

Apex Agent Management Chat — an **enterprise-grade, self-evolving
multi-agent platform** that:

- Lets multiple LLM agents (any OpenAI-compatible provider) collaborate
  in one chat, each with its own model, tools, and permissions.
- Runs on a **deterministic Java 21 kernel** with no shell
  interpolation, no dynamic bytecode, and no enterprise dependency in
  the core.
- Stores every step (thinking, decision, action, observation) so a
  self-improvement flywheel can detect failures and propose fixes.
- Exposes a **TypeScript GUI** (Tauri + React) that renders streaming
  responses, tool cards, reasoning traces, and HITL approval modals.
- Is multi-tenant, auditable, and risk-tiered from day one.
- Ships in three deployment targets — cloud server, SBC swarm node,
  Android SDK node — from **byte-identical Tier 0 core jars**.

**Differentiators we own:** the planner (native A*, not Embabel), the
confidence-gated council, the self-improvement flywheel, the CAS
evolution plane, the risk-tiered HITL gate (L0–L5), and the memory
router.

**Explicit non-goals for v1:** recursive model training, custom vector
DB, cross-tenant skill marketplace, Android SDK packaging (deferred to
S9).

---

## 2. Architecture at a glance

**Three layers:**

| Layer | Content | Rules |
|---|---|---|
| **Layer 1** | `apex-chat/*` — pure POJOs (10-part spec + File 11 amendments) | No I/O, no threads, no network, no Spring |
| **Layer 2** | `apex-core/*` (ports, planner, loop, tools) + adapters | Tier 0 pure, Tier 1 JDK-only, Tier 2 Spring/Google |
| **Layer 3** | Prompt stacks (behavior governance) — `AGENT_RULES.md`, `CONTEXT.md` | Always loaded |

**Nine ports** owned by the core: `ChatModelPort`, `PlannerPort`,
`ToolExecutorPort`, `ApprovalPort`, `StoragePort`, `VectorStorePort`,
`SecretsPort`, `AuditPort`, `TelemetryPort`. Every adapter implements
exactly one.

**Three enforcement gates** at every commit: Maven Enforcer, `jdeps`,
ArchUnit. A Tier 0 module that imports Spring, Google, or Embabel is a
build failure.

**ADR-locked decisions:**
- Spring AI is the Tier 2 integration adapter (not the foundation).
- Google MCP Toolbox is the Tier 2 data adapter (not the foundation).
- **Embabel is NOT used** — planner is reimplemented natively in
  `engine-planner` (~660 LOC) so the core stays Android-capable.
- Java 21, virtual threads, records + sealed interfaces.
- Commercial-license clean: Apache 2.0 / MIT / BSD only, no GPL/AGPL/
  SSPL, even transitively.

---

## 3. Where we are now

**Committed to `main` (per your tracking):**

| Item | Content |
|---|---|
| `AGENT_RULES.md` | Behavior contract (16 prohibitions, coding rules, commit format) |
| `CONTEXT.md` | Project map + file index |
| S1.1 skeleton | Root POM, `apex-chat-common`, `TenantId`, CI |
| S1.2 gates | Maven Enforcer, `jdeps` CI step, ArchUnit purity test |
| `PHASE-S2-KERNEL.md` | S2 router |
| S2.0 | Module skeletons — `apex-core` aggregator, 8 child modules, INVARIANTS stub |

**Packages delivered but merge status per your tracking:**

| Package | Content | Status |
|---|---|---|
| S2.1 | Nine port interfaces, 13 records, `PORT-CATALOGUE.md` | Delivered |
| S2.2 | `AStarPlanner`, `PlanLoop`, `CancellationToken`, K6 proof | Delivered |
| S2.3 | Five kernel tools, `Json` parser, `RealPathJail`, K2+K5 proofs | Delivered |

**Proven invariants:** K6 (cancellation ≤100ms), K2 (no shell
interpolation), K5 (process tree kill) — all with named tests once
S2.2/S2.3 merge.

---

## 4. What is left

**Remaining S2 sub-phases (4 of 8):**

| Sub-phase | Scope | Ends with |
|---|---|---|
| **S2.4** | `OpenAiCompatibleProvider` in `engine-llm-http` | Mocked provider streams a response |
| **S2.5** | SQLite `step_log` in `engine-store-sqlite` | Steps persist and query |
| **S2.6** | `TaskRunner` + task schema + CLI entry in `engine-cli` | Task file loads and validates |
| **S2.7** | End-to-end kernel test | Kernel completes one task file unsupervised |

**S2 is complete when the kernel can read a task file, plan, call a
model, run tools, and report — autonomously.** That is the self-hosting
milestone. After S2, phases become task files the kernel executes.

**Remaining phases (7):**

| Phase | Scope |
|---|---|
| **S3** | Security: `apex-auth` (JWT), `apex-tenant` (RLS), `apex-audit` (chained log), L0–L5 HITL gate, K1/K3/K4/K7 proofs, E2 proof |
| **S4** | Memory router + three sandbox tiers + `VectorStorePort` + C4 proof |
| **S5** | Self-improvement flywheel: classify → analyze → propose → gate → deploy; CAS evolution plane; E1/E3/E4/E5 proofs |
| **S6** | Server (SSE `WireEvent` projection, Spring Boot shell) + React chat MVP + cost dashboard + C1/C2 proofs |
| **S7** | Council: confidence gate, parallel solvers, agreement shortcut, chairman synthesis |
| **S8** | A2A node: SBC/Android register as `AgentParticipant`, C3 proof |
| **S9** (deferred) | Android SDK: Kotlin, Foreground Service, Room, LiteRT, AccessibilityService |

---

## 5. Open prerequisites

| Prerequisite | Needed for | Status |
|---|---|---|
| `docs/apex-chat-spec/` (11 files) | S2.7 E2E, S3+, S6 | Not yet committed; S2.7 requires pasting |
| `PHASE-S2.4-MODEL-ADAPTER.md` | Next session | To be produced |
| Provider API keys (`OPENROUTER_API_KEY`, `NVIDIA_API_KEY`) | S2.4 live test, S2.7 E2E | Env vars, no secrets in repo |

---

## 6. Pipeline protocol

1. Human uploads the sub-phase package (single `.md`).
2. Agent loads `AGENT_RULES.md`, `CONTEXT.md`, `PHASE-S2-KERNEL.md`,
   then the package.
3. Agent executes; commits on `phase/s2.<N>-<slug>`; pushes.
4. Agent reports CI link; human reviews and squash-merges.
5. Next package is produced.

**Sub-phase files are delivered as attachments**, not committed to the
repo before their session. The router and the two always-loaded files
are in the repo.

---

## 7. Next action

Produce **`PHASE-S2.4-MODEL-ADAPTER.md`**. It will implement
`ChatModelPort` in `engine-llm-http` against an OpenAI-compatible
endpoint (OpenRouter by default, configurable via env var), with a
mocked-provider test proving streaming and error classification.

**No spec paste required** — S2.4 is self-contained per
`PHASE-S2-KERNEL.md` §4 superseded by S2.2 context note §1.1.

---

**End of status document.**