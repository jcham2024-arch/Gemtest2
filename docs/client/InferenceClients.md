---
id: NET-01
title: "Cloud REST & Local Loopback Clients"
type: interfaces / classes
module: com.leanllm.client
context_cost: 360
tags: [transport, http2, sse-streaming, ssrf-defense]
related_links:
  - "[[docs/security/SecureSecret]]"
  - "[[docs/ui/UiDecoupling]]"
---

# Cloud REST & Local Loopback Clients

## Overview
Unified inference transport built directly upon JDK 21 `java.net.http.HttpClient`.

## Architectural Rationale
Provides HTTP/2 connection multiplexing, TLS 1.3 security, and zero-dependency Server-Sent Events (SSE) streaming via line inspection.

## SSRF Defense Contract
`LocalLlmClient` asserts the host name equals `localhost`, `127.0.0.1`, or `::1`. Any attempt to target intranet or external IP addresses throws a `SecurityException`.