package com.leanllm.agentforge;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Objects;

/**
 * Security policy filter enforcing Realpath canonical jail containment.
 * Prevents subagents and tools from escaping authorized workspace boundaries via symlinks or '..' traversal.
 *
 * @threadsafe Immutable and safe for concurrent invocation across virtual threads.
 * @security Defends against CWE-22 Path Traversal and CWE-59 Link Resolution attacks.
 */
public final class McpPathPolicyFilter {
    private final Path jailRootCanonical;

    public McpPathPolicyFilter(Path jailRoot) {
        Objects.requireNonNull(jailRoot, "jailRoot cannot be null");
        try {
            File f = jailRoot.toFile();
            this.jailRootCanonical = f.exists() ? f.toPath().toRealPath() : f.toPath().toAbsolutePath().normalize();
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to resolve canonical path for jail root: " + jailRoot, e);
        }
    }

    /**
     * Validates that the requested target path resides strictly inside the jail root.
     *
     * @param targetPath Path to inspect (relative or absolute).
     * @return Canonical Path guaranteed to be inside the jail boundary.
     * @throws SecurityException if targetPath escapes the jail root boundary.
     */
    public Path validatePath(Path targetPath) {
        Objects.requireNonNull(targetPath, "targetPath cannot be null");
        Path resolved = jailRootCanonical.resolve(targetPath).normalize();
        try {
            Path canonical = resolved.toFile().exists() 
                ? resolved.toRealPath() 
                : resolved.toAbsolutePath().normalize();

            if (!canonical.startsWith(jailRootCanonical)) {
                throw new SecurityException("Access Denied: Path escapes workspace jail [" 
                    + jailRootCanonical + "]: " + targetPath);
            }
            return canonical;
        } catch (IOException e) {
            throw new SecurityException("Failed to verify realpath for: " + targetPath, e);
        }
    }

    public Path getJailRoot() {
        return jailRootCanonical;
    }
}
