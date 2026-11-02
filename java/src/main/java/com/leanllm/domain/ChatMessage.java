package com.leanllm.domain;

import java.util.List;

/**
 * @summary Immutable conversational turn carrier.
 * @threadsafe Immutable Java Record.
 */
public record ChatMessage(
    ChatRole role,
    String content,
    String toolCallId,
    List<ToolCall> toolCalls
) {
    public ChatMessage {
        toolCalls = toolCalls != null ? List.copyOf(toolCalls) : List.of();
    }

    public static ChatMessage system(String text) {
        return new ChatMessage(ChatRole.SYSTEM, text, null, List.of());
    }

    public static ChatMessage user(String text) {
        return new ChatMessage(ChatRole.USER, text, null, List.of());
    }

    public static ChatMessage assistant(String text) {
        return new ChatMessage(ChatRole.ASSISTANT, text, null, List.of());
    }

    public static ChatMessage toolResult(String callId, String output) {
        return new ChatMessage(ChatRole.TOOL, output, callId, List.of());
    }
}
