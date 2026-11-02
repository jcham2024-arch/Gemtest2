package com.apex.platform.auth;

import java.util.Objects;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Guards OS input injection synthesis (Invariant K7).
 * Enforces a dead-man switch, rate limiting, and password field detection.
 */
public final class InputInjectionGuard {

    private final AtomicBoolean deadManArmed = new AtomicBoolean(false);
    private final AtomicInteger operationsInWindow = new AtomicInteger(0);
    private final int maxOperationsPerSecond;

    public InputInjectionGuard(int maxOperationsPerSecond) {
        if (maxOperationsPerSecond <= 0) {
            throw new IllegalArgumentException("maxOperationsPerSecond must be positive");
        }
        this.maxOperationsPerSecond = maxOperationsPerSecond;
    }

    public void arm() {
        deadManArmed.set(true);
    }

    public void disarm() {
        deadManArmed.set(false);
    }

    public boolean isArmed() {
        return deadManArmed.get();
    }

    /**
     * Checks whether an OS input event may be dispatched.
     * Throws SecurityException if disarmed, rate-limited, or target is a password field.
     */
    public void checkInjectionAllowed(String targetFieldRole, String targetFieldName) {
        Objects.requireNonNull(targetFieldRole, "targetFieldRole");
        Objects.requireNonNull(targetFieldName, "targetFieldName");

        if (!deadManArmed.get()) {
            throw new SecurityException("OS input injection blocked: dead-man switch is disarmed");
        }

        if (targetFieldRole.equalsIgnoreCase("passwordField")
                || targetFieldName.toLowerCase().contains("password")
                || targetFieldName.toLowerCase().contains("pin")) {
            throw new SecurityException("OS input injection blocked: password field target detected");
        }

        int currentCount = operationsInWindow.incrementAndGet();
        if (currentCount > maxOperationsPerSecond) {
            throw new SecurityException("OS input injection blocked: rate limit exceeded (" + currentCount + "/" + maxOperationsPerSecond + ")");
        }
    }

    public void resetRateLimitWindow() {
        operationsInWindow.set(0);
    }
}
