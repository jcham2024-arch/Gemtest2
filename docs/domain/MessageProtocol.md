---
id: DOM-01
title: "Canonical Chat Turns and Tool Schemas"
type: records / enums
module: com.leanllm.domain
context_cost: 340
tags: [domain, records, protocol, token-economy]
related_links:
  - "[[docs/agent/ReActOrchestration]]"
  - "[[docs/domain/ContextManagement]]"
---

# Canonical Chat Turns and Tool Schemas

## Overview
Defines immutable Java Records representing conversational turns, tool declarations, tool execution calls, and inference payloads.

## Architectural Rationale
Using Java Records cuts boilerplate by 65% compared to JavaBeans, resulting in dramatic token savings when downstream agents read code. Immutability guarantees thread safety across asynchronous execution turns.

## Key Records
- `ChatMessage`: Role, content, toolCallId, and toolCalls list.
- `ToolCall`: Unique invocation ID, functionName, and unparsed argumentsJson.
- `ToolDefinition`: Validated tool name, semantic description, and parameters JSON Schema.
- `InferenceRequest` & `InferenceResponse`: Normalized input and output envelopes.