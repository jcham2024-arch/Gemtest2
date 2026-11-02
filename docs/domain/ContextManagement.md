---
id: DOM-02
title: "Token Estimation & Context Compaction"
type: classes
module: com.leanllm.agent
context_cost: 310
tags: [context-management, token-budget, sliding-window]
related_links:
  - "[[docs/domain/MessageProtocol]]"
  - "[[docs/agent/ReActOrchestration]]"
---

# Token Estimation & Context Compaction

## Overview
`TokenEstimator` provides zero-dependency character-to-token heuristic budgeting, while `ContextCompactor` applies sliding-window message history truncation.

## Architectural Rationale
Multi-turn agent loops quickly exceed model context limits, triggering 400 Bad Request rejections. The compactor prunes older user/assistant turns while strictly protecting `SYSTEM` role prompts at the start of conversation.

## Heuristic Formula
- Base ratio: `~3.8` to `4.0` chars per token.
- Safety padding: `+10%` to account for punctuation and sub-word tokenizer variance.