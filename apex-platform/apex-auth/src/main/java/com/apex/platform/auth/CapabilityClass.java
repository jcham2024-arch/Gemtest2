package com.apex.platform.auth;

/**
 * Capability classes governed by operator permission grants (Invariant E2).
 * Any action or tool declaring a privileged capability requires a signed grant.
 */
public enum CapabilityClass {
    /** Read-only access to files or resources within sandbox. */
    READ,
    /** Filesystem write access outside default ephemeral sandbox. */
    WRITE,
    /** Network egress beyond localhost (127.0.0.1). */
    NET_EGRESS,
    /** Subprocess spawning via ProcessBuilder. */
    PROC_SPAWN,
    /** OS GUI input event synthesis or accessibility injection. */
    SCREEN_INJECT;

    /** Returns true if this capability requires an operator grant. */
    public boolean isPrivileged() {
        return this != READ;
    }
}
