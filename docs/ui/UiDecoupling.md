---
id: UI-01
title: "Presentation Abstraction via UiBridge"
type: interface
module: com.leanllm.ui
context_cost: 260
tags: [ui-bridge, observer-pattern, decoupling]
related_links:
  - "[[docs/agent/ReActOrchestration]]"
---

# Presentation Abstraction via UiBridge

## Overview
Decoupled event-driven observer interface separating the Java agent core from any user interface (JavaFX, CLI, WebSockets).

## Contract
- Non-blocking methods (`onStatus`, `onToken`, `onToolStart`, `onToolEnd`, `onError`).
- Implementations handle UI thread marshaling (e.g. `Platform.runLater` in JavaFX).