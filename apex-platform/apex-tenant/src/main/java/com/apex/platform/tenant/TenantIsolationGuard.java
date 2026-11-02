package com.apex.platform.tenant;

import java.util.Objects;

/**
 * Asserts that queries, writes, and operations strictly isolate tenant data.
 * Throws SecurityException if a tenant attempts cross-boundary access.
 */
public final class TenantIsolationGuard {

    /**
     * Asserts that the active tenant context matches the target data owner.
     */
    public static void assertTenantAccess(TenantContext currentTenant, String targetTenantId) {
        Objects.requireNonNull(currentTenant, "currentTenant");
        Objects.requireNonNull(targetTenantId, "targetTenantId");
        if (!currentTenant.tenantId().equals(targetTenantId)) {
            throw new SecurityException("Tenant access violation: " + currentTenant.tenantId()
                    + " attempted to access data owned by " + targetTenantId);
        }
    }

    private TenantIsolationGuard() {}
}
