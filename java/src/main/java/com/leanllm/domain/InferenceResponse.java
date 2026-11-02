package com.leanllm.domain;

import java.util.List;
import java.util.Objects;

/**
 * @summary Normalized output structure resulting from model inference.
 * @threadsafe Immutable Java Record.
 */
public record InferenceResponse(
    ChatMessage message,
    List<ToolCall> toolCalls,
    long promptTokens,
    long completionTokens,
    String finishReason
) {
    public InferenceResponse {
        Objects.requireNonNull(message, "message cannot be null");
        toolCalls = toolCalls != null ? List.copyOf(toolCalls) : List.of();
        finishReason = finishReason != null ? finishReason : "stop";
    }

    public boolean hasToolCalls() {
        return !toolCalls.isEmpty();
    }
}
