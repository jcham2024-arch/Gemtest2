package com.leanllm.agent;

import com.leanllm.domain.ChatMessage;
import com.leanllm.domain.ChatRole;
import com.leanllm.domain.TokenEstimator;
import java.util.*;

/**
 * @summary Sliding-window conversational history compactor.
 * @threadsafe Stateless and thread-safe.
 * @security Preserves critical System instructions while defending against context overflow.
 */
public final class ContextCompactor {
    private final int maxTokens;
    private final TokenEstimator estimator;

    public ContextCompactor(int maxTokens, TokenEstimator estimator) {
        this.maxTokens = Math.max(500, maxTokens);
        this.estimator = Objects.requireNonNull(estimator);
    }

    public List<ChatMessage> compact(List<ChatMessage> history) {
        if (history == null || history.isEmpty()) return List.of();
        if (estimator.estimateMessageTokens(history) <= maxTokens) {
            return List.copyOf(history);
        }

        List<ChatMessage> systemMsgs = new ArrayList<>();
        List<ChatMessage> otherMsgs = new ArrayList<>();
        for (ChatMessage msg : history) {
            if (msg.role() == ChatRole.SYSTEM) systemMsgs.add(msg);
            else otherMsgs.add(msg);
        }

        int systemCost = estimator.estimateMessageTokens(systemMsgs);
        int remainingBudget = Math.max(0, maxTokens - systemCost);

        while (!otherMsgs.isEmpty() && estimator.estimateMessageTokens(otherMsgs) > remainingBudget) {
            otherMsgs.remove(0); // Prune oldest conversational turn
        }

        List<ChatMessage> result = new ArrayList<>(systemMsgs);
        result.addAll(otherMsgs);
        return Collections.unmodifiableList(result);
    }
}
