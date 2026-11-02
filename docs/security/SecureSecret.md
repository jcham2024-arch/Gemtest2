---
id: SEC-01
title: "Memory-Safe Credential Hygiene"
type: class
module: com.leanllm.security
context_cost: 320
tags: [security, memory-safety, credentials]
related_links:
  - "[[docs/client/InferenceClients]]"
  - "[[docs/security/EnvironmentSanitizer]]"
---

# SecureSecret

## Overview
`SecureSecret` is a memory-safe credential wrapper that holds sensitive authorization keys in a mutable `char[]` buffer, providing explicit deterministic zeroing via `AutoCloseable`.

## Architectural Rationale
Standard Java `String` objects reside in the JVM String Pool or heap indefinitely until garbage-collected. In memory dumps or core dumps, secrets are exposed in plaintext. `SecureSecret` enables deterministic overwriting with null bytes (`\0`) immediately after header transmission.

## Security Contract
- Implements `AutoCloseable` and `java.security.Destroyable`.
- Any invocation of `accessSecret()` after `close()` throws `IllegalStateException`.
- Thread-safe via synchronized access locks.

## Interconnections
- Consumed by: [[docs/client/InferenceClients]]
- Sibling: [[docs/security/EnvironmentSanitizer]]