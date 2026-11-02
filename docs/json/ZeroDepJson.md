---
id: JSON-01
title: "Zero-Dependency RFC 8259 JSON Engine & AST"
type: specification
module: com.leanllm.json
context_cost: 440
tags: [json, ast, rfc-8259, ecma-404, cwe-674, zero-dependency, parser]
related_links:
  - "[[docs/domain/MessageProtocol]]"
  - "[[docs/client/InferenceClients]]"
  - "[[docs/agent/TaskContractArchitecture]]"
---

# Zero-Dependency RFC 8259 JSON Engine & AST

## 1. Overview & Architectural Motivation

In modern Java development, developers routinely pull in multi-megabyte third-party libraries (such as Jackson Databind, Gson, or fastjson) for basic JSON serialization. While feature-rich, these third-party dependencies introduce severe operational vulnerabilities:
1. **Supply Chain Risks & Critical CVEs**: Historical vulnerabilities in reflection-based deserializers (e.g., polymorphic type handling leading to arbitrary remote code execution).
2. **Version Drift & Classpath Pollution**: Dependency conflicts across multi-module enterprise systems.
3. **Overhead in Minimal Container / Substrate Environments**: High reflection and class metadata overhead contrary to the Lean Java Agentic Core (LJAC) philosophy.

The Lean Java Agentic Core JSON engine operates **strictly within standard OpenJDK 21 LTS (`java.base`)**. It provides an immutable, thread-safe Abstract Syntax Tree (`JsonNode`) and an RFC 8259 compliant recursive-descent parser (`JsonParser`).

---

## 2. Sealed AST Hierarchy (`JsonNode`)

`JsonNode` utilizes Java 21 `sealed class` mechanics with exhaustive permits to model the full JSON grammar:

```
                      ┌──────────────────┐
                      │  JsonNode (Root) │
                      └────────┬─────────┘
                               │
       ┌───────────┬───────────┼───────────┬───────────┬───────────┐
       ▼           ▼           ▼           ▼           ▼           ▼
┌────────────┐┌───────────┐┌───────────┐┌───────────┐┌───────────┐┌───────────┐
│ JsonObject ││ JsonArray ││JsonString ││JsonNumber ││JsonBoolean││ JsonNull  │
└────────────┘└───────────┘└───────────┘└───────────┘└───────────┘└───────────┘
```

### Invariants & Guarantees
- **Immutability**: `JsonObject` wraps members in `Collections.unmodifiableMap(new LinkedHashMap<>(...))` preserving deterministic key insertion order. `JsonArray` wraps items in `Collections.unmodifiableList(...)`.
- **Type-Safe Accessors**: Dedicated methods (`asString()`, `asDouble()`, `asLong()`, `asInt()`, `asBoolean()`, `asObject()`, `asArray()`) eliminate unchecked casts.
- **RFC 8259 String Escaping**: `escapeString()` correctly encodes quotation marks (`\"`), backslashes (`\\`), reverse solidus (`\/`), control backspace (`\b`), form feed (`\f`), newline (`\n`), carriage return (`\r`), horizontal tab (`\t`), and ISO control characters (`< 0x20` rendered as `\u00xx`).

---

## 3. Recursive-Descent Parser (`JsonParser`)

`JsonParser` implements an efficient single-pass recursive-descent scanner.

### 3.1 Defense Against CWE-674 Uncontrolled Recursion
Adversaries can exploit recursive parsers by submitting payloads with hundreds of nested opening braces or brackets (`[[[[...]]]]`), inducing JVM `StackOverflowError` and triggering Denial of Service (DoS).
`JsonParser` defends against this vulnerability by maintaining a strict nesting depth counter:

$$\text{depth} \le \text{MAX\_RECURSION\_DEPTH} \quad (64)$$

If an incoming payload exceeds 64 levels of nested objects or arrays, the parser immediately terminates execution and raises an `IllegalStateException`.

### 3.2 RFC 8259 Strict Syntax Compliance
- **Number Grammar**: Forbids invalid leading zeros (e.g. `0123` throws `IllegalArgumentException` in accordance with RFC 8259 Section 6). Fully supports negative signs, fractional points, and scientific exponent notations (`e`, `E`, `+`, `-`).
- **Unicode Hex Decoders**: Decodes 4-hex digit sequences (`\uXXXX`) into native UTF-16 code units.
- **Trailing Character Guard**: Consumes the entire source input and ensures no rogue trailing tokens exist following the root JSON element.

---

## 4. Formal References & Authoritative Citations

1. **IETF RFC 8259**: *The JavaScript Object Notation (JSON) Data Interchange Format*. Internet Engineering Task Force (IETF), Dec 2017. URL: `https://www.rfc-editor.org/rfc/rfc8259`.
2. **ECMA-404**: *The JSON Data Interchange Syntax*. Ecma International, 2nd Edition, Dec 2017. URL: `https://ecma-international.org/publications-and-standards/standards/ecma-404/`.
3. **MITRE CWE-674**: *Uncontrolled Recursion*. Common Weakness Enumeration, The MITRE Corporation. URL: `https://cwe.mitre.org/data/definitions/674.html`.
4. **Oracle Java 21 Sealed Classes**: *JEP 409: Sealed Classes*. OpenJDK Standard, 2021. URL: `https://openjdk.org/jeps/409`.