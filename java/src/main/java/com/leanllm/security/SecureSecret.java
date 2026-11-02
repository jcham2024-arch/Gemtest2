package com.leanllm.security;

import java.security.Destroyable;
import java.util.Arrays;

/**
 * @summary Memory-safe credential container with deterministic null-byte zeroing.
 * @threadsafe Thread-safe via synchronized access locks.
 * @security Never retains immutable Strings; scrubs buffer with '\0' upon close.
 * @contract Implements AutoCloseable and Destroyable. Throws IllegalStateException if accessed post-destruction.
 */
public final class SecureSecret implements AutoCloseable, Destroyable {
    private final char[] secretBuffer;
    private boolean destroyed = false;

    public SecureSecret(char[] secret) {
        if (secret == null) throw new IllegalArgumentException("Secret cannot be null");
        this.secretBuffer = Arrays.copyOf(secret, secret.length);
    }

    public SecureSecret(String secret) {
        this(secret != null ? secret.toCharArray() : null);
    }

    public synchronized char[] accessSecret() {
        if (destroyed) throw new IllegalStateException("Secret has already been destroyed");
        return Arrays.copyOf(secretBuffer, secretBuffer.length);
    }

    @Override
    public synchronized void close() {
        if (!destroyed) {
            Arrays.fill(secretBuffer, '\0');
            destroyed = true;
        }
    }

    @Override
    public synchronized void destroy() {
        close();
    }

    @Override
    public synchronized boolean isDestroyed() {
        return destroyed;
    }
}
