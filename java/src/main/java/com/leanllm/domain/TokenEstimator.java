package com.leanllm.domain;

import java.util.List;

/**
 * @summary Zero-dependency character-to-token heuristic calculator.
 * @threadsafe Stateless and thread-safe.
 */
public final class TokenEstimator {
    private final double charsPerToken;

    public TokenEstimator() { this(3.8); }
    public TokenEstimator(double charsPerToken) {
        this.charsPerToken = Math.max(1.0, charsPerToken);
    }

    public int estimateTokens(String text) {
        if (text == null || text.isEmpty()) return 0;
        return (int) Math.ceil((text.length() / charsPerToken) * 1.1);
    }

    public int estimateMessageTokens(List<ChatMessage> messages) {
        if (messages == null || messages.isEmpty()) return 0;
        int sum = 0;
        for (ChatMessage m : messages) {
            sum += estimateTokens(m.content()) + 8;
            for (ToolCall tc : m.toolCalls()) {
                sum += estimateTokens(tc.functionName()) + estimateTokens(tc.rawArgumentsJson()) + 12;
            }
        }
        return sum;
    }
}
