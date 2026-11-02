---
id: AGENT-01
title: "Autonomous ReAct Engine & State Context"
type: classes
module: com.leanllm.agent
context_cost: 350
tags: [react-loop, state-machine, iteration-guardrails]
related_links:
  - "[[docs/ui/UiDecoupling]]"
  - "[[docs/domain/MessageProtocol]]"
---

# Autonomous ReAct Engine & State Context

## Overview
Drives the cyclic Thought -> Action -> Observation cognitive loop.

## Architectural Rationale
`AgentEngine` prompts the LLM, checks for tool call directives in `InferenceResponse`, dispatches tool execution, appends tool outputs as conversational turns, and loops until the final answer is reached.

## Safety Guardrails
- Hard iteration limit (`maxIterations`, default 10 turns) enforced by `AgentContext`.
- Tool execution exceptions are caught and reported as tool result messages back to the LLM rather than crashing the JVM.