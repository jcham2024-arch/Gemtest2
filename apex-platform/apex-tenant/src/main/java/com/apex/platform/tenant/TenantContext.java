package com.apex.platform.tenant;

import java.util.Objects;

/**
 * Encapsulates the verified tenant identity for a request or session.
 * Explicitly threaded through method parameters to avoid ThreadLocal in virtual threads.
 */
public record TenantContext(String tenantId, String workspaceId) {
    public TenantContext {
        Objects.requireNonNull(tenantId, "tenantId");
        Objects.requireNonNull(workspaceId, "workspaceId");
        if (tenantId.isBlank()) {
            throw new IllegalArgumentException("tenantId must not be blank");
        }
        if (workspaceId.isBlank()) {
            throw new IllegalArgumentException("workspaceId must not be blank");
        }
    }
}
