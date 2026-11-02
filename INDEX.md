---
id: ROOT-00
title: "Lean Java Agentic Core - Knowledge Graph Index"
type: index
module: com.leanllm
context_cost: 180
tags: [master-index, knowledge-graph, agentic-core]
related_links:
  - "[[docs/security/SecureSecret]]"
  - "[[docs/security/EnvironmentSanitizer]]"
  - "[[docs/security/ProcessTreeTerminator]]"
  - "[[docs/json/ZeroDepJson]]"
  - "[[docs/domain/MessageProtocol]]"
  - "[[docs/client/InferenceClients]]"
  - "[[docs/scripting/PolyglotExecution]]"
  - "[[docs/agent/ReActOrchestration]]"
  - "[[docs/ui/UiDecoupling]]"
---

# Lean Java Agentic Core (LJAC) - Master Knowledge Index

Master entrypoint for downstream agentic retrieval and human developers. Follow the [[WikiLinks]] below to inspect subsystem architectural contracts.

## 1. Security & Memory Hygiene
- [[docs/security/SecureSecret|Memory-Safe Credential Hygiene]] — Mutable character buffers with null-byte zeroing.
- [[docs/security/EnvironmentSanitizer|Host Environment Sanitization]] — Whitelist-only environment block defense.
- [[docs/security/ProcessTreeTerminator|Zombie Process Elimination]] — Recursive JDK 21 ProcessHandle tree termination.

## 2. Zero-Dependency Protocol & JSON Engine
- [[docs/json/ZeroDepJson|Zero-Dependency JSON AST & Parser]] — Self-contained recursive descent parser with depth bounds.

## 3. Domain Model & Messaging Protocol
- [[docs/domain/MessageProtocol|Canonical Chat Turns & Tool Schemas]] — Java Records for lightweight domain carrier objects.

## 4. Inference Clients & Network Transport
- [[docs/client/InferenceClients|Cloud REST & Local Loopback Clients]] — HTTP/2 SSE streaming and loopback SSRF defense.

## 5. Dynamic Polyglot Scripting
- [[docs/scripting/PolyglotExecution|TypeScript & Python Process Isolation]] — Out-of-process execution via ProcessBuilder.

## 6. Autonomous ReAct & Presentation
- [[docs/agent/ReActOrchestration|Autonomous ReAct Engine & State Context]] — Thought-Action-Observation state machine.
- [[docs/agent/TaskContractArchitecture|AgentForge TaskContract & Execution Governance Architecture]] — Immutable contract boundaries, Realpath jail, and TypeScript virtual thread bridge.
- [[docs/ui/UiDecoupling|Presentation Abstraction via UiBridge]] — Event-driven observer interface for JavaFX/CLI.
- [[docs/ui/AgenticWorkbenchRoadmap|Enterprise Agentic Workbench Module & Roadmap]] — Standalone TypeScript UI specialized from Perchance layout with AgentForge links.
- [[docs/ui/AgenticWorkbench|Enterprise Agentic LLM Workbench Architecture]] — Component hierarchy, 4-role perspective deck, and local-first snapshot engine.