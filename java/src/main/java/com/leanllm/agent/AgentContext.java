package com.leanllm.agent;

import com.leanllm.domain.ChatMessage;
import java.util.*;

/**
 * @summary Thread-safe state tracker for an agentic conversational session.
 * @threadsafe Synchronized methods protect internal conversational history.
 */
public final class AgentContext {
    private final List<ChatMessage> history = new ArrayList<>();
    private final int maxIterations;
    private int currentIteration = 0;
    private final ContextCompactor compactor;

    public AgentContext(int maxIterations, ContextCompactor compactor) {
        this.maxIterations = Math.max(1, maxIterations);
        this.compactor = compactor;
    }

    public synchronized void append(ChatMessage msg) {
        history.add(Objects.requireNonNull(msg));
        if (compactor != null) {
            List<ChatMessage> compacted = compactor.compact(history);
            history.clear();
            history.addAll(compacted);
        }
    }

    public synchronized boolean canIterate() { return currentIteration < maxIterations; }

    public synchronized void nextIteration() {
        if (!canIterate()) throw new IllegalStateException("Max iterations (" + maxIterations + ") exceeded");
        currentIteration++;
    }

    public synchronized List<ChatMessage> getHistory() {
        return Collections.unmodifiableList(new ArrayList<>(history));
    }
}
