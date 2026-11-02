package com.apex.platform.tenant;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TenantIsolationGuardTest {

    @Test
    void allowsMatchingTenantAccess() {
        TenantContext ctx = new TenantContext("tenant-alpha", "ws-1");
        assertThatCode(() -> TenantIsolationGuard.assertTenantAccess(ctx, "tenant-alpha"))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsCrossTenantAccess() {
        TenantContext ctx = new TenantContext("tenant-alpha", "ws-1");
        assertThatThrownBy(() -> TenantIsolationGuard.assertTenantAccess(ctx, "tenant-beta"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Tenant access violation");
    }

    @Test
    void rejectsBlankTenant() {
        assertThatThrownBy(() -> new TenantContext("", "ws-1"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
