---
id: SCRIPT-01
title: "TypeScript and Python Process Isolation"
type: abstract runner / classes
module: com.leanllm.scripting
context_cost: 390
tags: [scripting, polyglot, deno, bun, python, virtual-threads]
related_links:
  - "[[docs/security/ProcessTreeTerminator]]"
  - "[[docs/agent/ScriptDelegation]]"
---

# TypeScript and Python Process Isolation

## Overview
Executes dynamic guest scripts in isolated OS processes managed directly via `ProcessBuilder` without intermediate shell wrappers (`sh -c` or `cmd /c`).

## Polyglot Strategy
- **TypeScript**: Primary execution runtime using Deno (with sandbox flags like `--deny-net`), Bun, or ts-node.
- **Python**: Secondary opt-in runner using `python3` with `-B` (no bytecode) and `-u` (unbuffered) flags.

## Virtual Thread Stream Drainage
Concurrent stream drainage for stdout and stderr uses Java 21 Virtual Threads (`Thread.ofVirtual().start()`), eliminating OS thread overhead and pipe deadlocks.