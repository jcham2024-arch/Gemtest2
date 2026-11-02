package com.apex.platform.auth;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PermissionGrantTest {

    @Test
    void validGrantCoversDeclaredCapabilities() {
        Instant now = Instant.now();
        Instant past = now.minusSeconds(60);
        Instant future = now.plusSeconds(3600);

        PermissionGrant grant = new PermissionGrant(
                "grant-101",
                "tenant-alpha",
                Set.of(CapabilityClass.WRITE, CapabilityClass.NET_EGRESS),
                past,
                future,
                "sig-abc-123"
        );

        assertThat(grant.isValidAt(now)).isTrue();
        assertThat(grant.covers(CapabilityClass.WRITE)).isTrue();
        assertThat(grant.covers(CapabilityClass.NET_EGRESS)).isTrue();
        assertThat(grant.covers(CapabilityClass.PROC_SPAWN)).isFalse();

        assertThat(TokenValidator.validateGrant(grant, "tenant-alpha", CapabilityClass.WRITE, now)).isTrue();
        assertThat(TokenValidator.validateGrant(grant, "tenant-beta", CapabilityClass.WRITE, now)).isFalse();
    }

    @Test
    void grantEnforcesImmutableCollectionDefensiveCopy() {
        Set<CapabilityClass> mutable = Set.of(CapabilityClass.READ);
        Instant now = Instant.now();

        PermissionGrant grant = new PermissionGrant(
                "grant-102",
                "tenant-alpha",
                mutable,
                now,
                now.plusSeconds(100),
                "sig-xyz"
        );

        assertThatThrownBy(() -> grant.capabilities().add(CapabilityClass.WRITE))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void rejectsInvalidExpiryOrder() {
        Instant now = Instant.now();
        assertThatThrownBy(() -> new PermissionGrant(
                "grant-103",
                "tenant-alpha",
                Set.of(CapabilityClass.READ),
                now,
                now.minusSeconds(10),
                "sig"
        )).isInstanceOf(IllegalArgumentException.class);
    }
}
