---
id: SEC-02
title: "Zombie Process Elimination"
type: class
module: com.leanllm.security
context_cost: 290
tags: [security, process-isolation, zombie-cleanup]
related_links:
  - "[[docs/scripting/PolyglotExecution]]"
---

# ProcessTreeTerminator

## Overview
`ProcessTreeTerminator` recursively terminates parent and all descendant OS processes using the Java 21 `ProcessHandle` API.

## Architectural Rationale
Standard `Process.destroyForcibly()` only halts the root process. If a TypeScript engine or Python script spawns child worker threads or background child processes, those descendants stay alive indefinitely, causing memory and port resource exhaustion.

## Security Contract
1. Traverses `process.toHandle().descendants()`.
2. Attempts graceful `destroy()`.
3. Pauses for a configurable grace period (`gracePeriodMillis`).
4. Executes `destroyForcibly()` on all remaining live descendant handles and the root.