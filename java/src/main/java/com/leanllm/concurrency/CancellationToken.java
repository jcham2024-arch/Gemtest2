package com.leanllm.concurrency;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * @summary Thread-safe cooperative task cancellation signaling primitive.
 * @threadsafe Thread-safe via AtomicBoolean and synchronized callback dispatch.
 * @security Enables immediate interruption of hanging network and script operations.
 */
public final class CancellationToken {
    private final AtomicBoolean cancelled = new AtomicBoolean(false);
    private volatile String cancelReason = "";
    private final List<Runnable> callbacks = new ArrayList<>();

    public void cancel(String reason) {
        if (cancelled.compareAndSet(false, true)) {
            this.cancelReason = reason != null ? reason : "User cancelled";
            synchronized (callbacks) {
                callbacks.forEach(Runnable::run);
                callbacks.clear();
            }
        }
    }

    public boolean isCancelled() { return cancelled.get(); }
    public String getCancelReason() { return cancelReason; }

    public void onCancel(Runnable callback) {
        if (callback == null) return;
        if (cancelled.get()) {
            callback.run();
        } else {
            synchronized (callbacks) {
                if (cancelled.get()) callback.run();
                else callbacks.add(callback);
            }
        }
    }
}
