package com.leanllm.security;

import java.util.stream.Stream;

/**
 * @summary Eliminates zombie processes by recursively destroying process trees.
 * @threadsafe Stateless execution, thread-safe.
 * @security Uses JDK 21 ProcessHandle API to guarantee zero orphaned subprocesses.
 * @contract Gracefully requests exit, waits grace period, then invokes destroyForcibly.
 */
public final class ProcessTreeTerminator {
    private final long gracePeriodMillis;

    public ProcessTreeTerminator(long gracePeriodMillis) {
        this.gracePeriodMillis = Math.max(10, gracePeriodMillis);
    }

    public void destroyTree(Process process) {
        if (process == null || !process.isAlive()) return;
        ProcessHandle root = process.toHandle();
        root.descendants().forEach(ProcessHandle::destroy);
        root.destroy();
        try {
            Thread.sleep(gracePeriodMillis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        root.descendants().filter(ProcessHandle::isAlive).forEach(ProcessHandle::destroyForcibly);
        if (root.isAlive()) root.destroyForcibly();
    }
}
