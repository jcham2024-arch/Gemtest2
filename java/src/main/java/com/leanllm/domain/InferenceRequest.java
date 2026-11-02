package com.leanllm.domain;

import java.util.List;
import java.util.Objects;

/**
 * @summary Normalized payload for model inference execution.
 * @threadsafe Immutable Java Record.
 */
public record InferenceRequest(
    String modelId,
    List<ChatMessage> messages,
    List<ToolDefinition> tools,
    double temperature,
    int maxTokens
) {
    public InferenceRequest {
        Objects.requireNonNull(modelId, "modelId cannot be null");
        messages = List.copyOf(Objects.requireNonNull(messages));
        tools = tools != null ? List.copyOf(tools) : List.of();
        temperature = Math.max(0.0, Math.min(2.0, temperature));
        maxTokens = Math.max(1, maxTokens);
    }
}
