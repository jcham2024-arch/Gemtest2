package com.apex.engine.core;

import java.util.List;

/**
 * Compiled invariant declarations that are merged into materialized workspaces (Invariant K3).
 * Declared as deeply immutable compiled constants with no runtime write path.
 */
public final class KernelInvariants {

    public static final List<String> IMMUTABLE_KERNEL_INVARIANTS = List.of(
            "K1: No dynamic JVM classloading",
            "K2: No shell interpolation",
            "K3: IMMUTABLE_KERNEL_INVARIANTS compiled constants",
            "K4: Tool execution scoped to canonical workspace root",
            "K5: No orphan processes after timeout or cancellation",
            "K6: Cancellation is prompt",
            "K7: OS injection guarded by dead-man + rate limit + password block",
            "K8: No carrier pinning on the agent executor"
    );

    private KernelInvariants() {}
}
