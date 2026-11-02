package com.apex.platform.auth;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class E2CapabilityEscalationTest {

    @Test
    void unprivilegedReadRequiresNoOperatorGrant() {
        assertThat(CapabilityClass.READ.isPrivileged()).isFalse();
    }

    @Test
    void privilegedCapabilitiesRequireOperatorGrant() {
        assertThat(CapabilityClass.WRITE.isPrivileged()).isTrue();
        assertThat(CapabilityClass.NET_EGRESS.isPrivileged()).isTrue();
        assertThat(CapabilityClass.PROC_SPAWN.isPrivileged()).isTrue();
        assertThat(CapabilityClass.SCREEN_INJECT.isPrivileged()).isTrue();
    }

    @Test
    void escalationFailsWithoutMatchingGrant() {
        Instant now = Instant.now();
        PermissionGrant grant = new PermissionGrant(
                "grant-e2",
                "tenant-1",
                Set.of(CapabilityClass.WRITE),
                now.minusSeconds(10),
                now.plusSeconds(300),
                "valid-signature"
        );

        // WRITE is covered
        assertThat(TokenValidator.validateGrant(grant, "tenant-1", CapabilityClass.WRITE, now)).isTrue();

        // PROC_SPAWN is NOT covered -> escalation blocked
        assertThat(TokenValidator.validateGrant(grant, "tenant-1", CapabilityClass.PROC_SPAWN, now)).isFalse();

        // Expired grant -> escalation blocked
        assertThat(TokenValidator.validateGrant(grant, "tenant-1", CapabilityClass.WRITE, now.plusSeconds(301))).isFalse();
    }
}
