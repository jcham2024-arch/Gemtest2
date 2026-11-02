package com.apex.platform.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Objects;
import java.util.Set;

/**
 * Validates authentication tokens and signed permission grants.
 * Employs constant-time equality comparisons to prevent timing side-channels.
 */
public final class TokenValidator {

    /**
     * Validates whether a token signature matches expected hash in constant time.
     */
    public static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }
        byte[] bytesA = a.getBytes(StandardCharsets.UTF_8);
        byte[] bytesB = b.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(bytesA, bytesB);
    }

    /**
     * Validates an operator permission grant against an active request and required capability.
     */
    public static boolean validateGrant(
            PermissionGrant grant,
            String expectedTenantId,
            CapabilityClass requiredCapability,
            Instant now
    ) {
        Objects.requireNonNull(grant, "grant");
        Objects.requireNonNull(expectedTenantId, "expectedTenantId");
        Objects.requireNonNull(requiredCapability, "requiredCapability");
        Objects.requireNonNull(now, "now");

        if (!grant.tenantId().equals(expectedTenantId)) {
            return false;
        }
        if (!grant.isValidAt(now)) {
            return false;
        }
        return grant.covers(requiredCapability);
    }

    private TokenValidator() {}
}
