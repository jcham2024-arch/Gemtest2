package com.leanllm.domain;

import java.util.Objects;

/**
 * @summary Model tool invocation directive.
 * @threadsafe Immutable Java Record.
 */
public record ToolCall(String id, String functionName, String rawArgumentsJson) {
    public ToolCall {
        Objects.requireNonNull(id, "ToolCall id cannot be null");
        Objects.requireNonNull(functionName, "functionName cannot be null");
        rawArgumentsJson = rawArgumentsJson != null ? rawArgumentsJson : "{}";
    }
}
