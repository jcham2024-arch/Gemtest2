package com.leanllm.security;

import java.util.*;

/**
 * @summary Filters host environment blocks using a strict allowlist.
 * @threadsafe Immutable and thread-safe.
 * @security Prevents sensitive host credentials from leaking into child processes.
 * @contract Returns unmodifiable collections.
 */
public final class EnvironmentSanitizer {
    private final Set<String> allowedKeys;

    public EnvironmentSanitizer(Set<String> allowedKeys) {
        this.allowedKeys = Set.copyOf(Objects.requireNonNull(allowedKeys));
    }

    public static EnvironmentSanitizer defaultSandbox() {
        return new EnvironmentSanitizer(Set.of("PATH", "TEMP", "TMP", "USER"));
    }

    public Map<String, String> sanitize(Map<String, String> sourceEnv) {
        if (sourceEnv == null) return Map.of();
        Map<String, String> clean = new HashMap<>();
        for (String key : allowedKeys) {
            String val = sourceEnv.get(key);
            if (val != null) clean.put(key, val);
        }
        return Collections.unmodifiableMap(clean);
    }
}
