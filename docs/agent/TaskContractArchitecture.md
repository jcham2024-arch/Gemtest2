---
id: AGENT-03
title: "AgentForge TaskContract & Execution Governance Architecture"
type: specification
module: com.leanllm.agentforge
context_cost: 410
tags: [agentforge, task-contract, realpath-jail, typescript-bridge, governance]
related_links:
  - "[[docs/agent/ReActOrchestration]]"
  - "[[docs/json/ZeroDepJson]]"
  - "[[docs/security/ProcessTreeTerminator]]"
  - "[[docs/ui/AgenticWorkbenchRoadmap]]"
---

# AgentForge TaskContract & Execution Governance Architecture

## 1. Executive Summary & Design Rationale

In hierarchical multi-agent systems, agents must not execute arbitrary code or access unbounded filesystem trees without explicit governance. The **AgentForge H-MAP** specification establishes formal boundaries where every subagent action is mediated by an immutable **TaskContract**.

The Lean Java Agentic Core incorporates `com.leanllm.agentforge` to provide zero-dependency Java 21 governance primitives that enforce realpath jail containment, tool allowlisting, token budgeting, and out-of-process script execution.

---

## 2. Immutable TaskContract Schema

Modeled as a Java 21 Record, `TaskContract` defines the contract boundary between an invoking operator/lead agent and an assigned subagent:

```java
public record TaskContract(
    String taskId,
    String agentId,
    String callerId,
    String intentDescription,
    Set<String> toolAllowlist,
    List<String> targetPaths,
    long timeoutMs,
    int budgetLimitTokens,
    ContractStatus status
)
```

### Lifecycle State Machine
```
   ┌───────────┐
   │  PENDING  │ ──> Operator or Lead Agent dispatches contract
   └─────┬─────┘
         │
         ▼
   ┌───────────┐
   │IN_PROGRESS│ ──> Subagent executes within realpath jail
   └─────┬─────┘
         │
         ├───────────────────────┬───────────────────────┐
         ▼                       ▼                       ▼
   ┌───────────┐           ┌───────────┐           ┌────────────────────┐
   │ COMPLETED │           │  FAILED   │           │ TERMINATED_TIMEOUT │
   └───────────┘           └───────────┘           └────────────────────┘
   Artifacts verified      Runtime exception       ProcessTreeTerminator kills
   & digests signed        captured by bridge      entire process tree
```

---

## 3. Realpath Canonical Jail Containment (`McpPathPolicyFilter`)

Subagents must never escape their authorized workspace root (e.g. `.agent/workspaces/agents/<id>/`). Standard path resolution (`Path.resolve()`) is vulnerable to directory traversal attacks utilizing `../` or malicious symlinks pointing to sensitive host directories (`/etc`, `~/.ssh`).

`McpPathPolicyFilter` mitigates this vulnerability by enforcing **Canonical Realpath verification**:

$$\text{canonicalPath} = \text{targetPath.toRealPath()}$$
$$\text{invariant: } \text{canonicalPath.startsWith(jailRootCanonical)}$$

If any file resolution resolves outside the canonical jail root, a `SecurityException` is immediately raised, blocking execution.

---

## 4. Virtual Thread Bridge (`TypeScriptTaskBridge`)

Dynamic agent tools (such as `ast_slicer.ts` or `rule_dag_linter.ts`) run out-of-process via standard `ProcessBuilder`.
To prevent OS thread starvation and pipe deadlocks, `TypeScriptTaskBridge` uses **Project Loom Virtual Threads (`Thread.ofVirtual()`)** in conjunction with `ProcessTreeTerminator`:
1. **Zero OS Thread Cost**: Concurrently drains `stdout` and `stderr` streams on lightweight virtual threads.
2. **Deterministic Termination**: If the guest script exceeds `contract.timeoutMs()`, `ProcessTreeTerminator` traverses the OS `ProcessHandle.descendants()` tree and issues `SIGTERM` followed by `SIGKILL`, eliminating zombie processes.

---

## 5. Formal References & Specifications

1. **AgentForge H-MAP Specification**: *Hierarchical Multi-Agent Platform*. Repository: `https://github.com/jcham2024-arch/Agenticplatformsetup`.
2. **Oracle JEP 444**: *Virtual Threads*. JDK 21 LTS Standard, Sept 2023. URL: `https://openjdk.org/jeps/444`.
3. **MITRE CWE-22**: *Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')*. Common Weakness Enumeration. URL: `https://cwe.mitre.org/data/definitions/22.html`.
4. **MITRE CWE-59**: *Improper Link Resolution Before File Access ('Link Following')*. Common Weakness Enumeration. URL: `https://cwe.mitre.org/data/definitions/59.html`.
5. **IEEE Std 1003.1-2017 (POSIX.1)**: *Standard for Information Technology—Portable Operating System Interface (POSIX)*. Process management and signal handling.
