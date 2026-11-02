package com.apex.platform.auth;

import java.time.Instant;
import java.util.Objects;
import java.util.Set;

/**
 * A cryptographically signed grant authorizing privileged capabilities for an agent
 * or tool execution session (Invariant E2).
 */
public record PermissionGrant(
        String grantId,
        String tenantId,
        Set<CapabilityClass> capabilities,
        Instant issuedAt,
        Instant expiresAt,
        String signature
) {
    public PermissionGrant {
        Objects.requireNonNull(grantId, "grantId");
        Objects.requireNonNull(tenantId, "tenantId");
        Objects.requireNonNull(capabilities, "capabilities");
        Objects.requireNonNull(issuedAt, "issuedAt");
        Objects.requireNonNull(expiresAt, "expiresAt");
        Objects.requireNonNull(signature, "signature");
        capabilities = Set.copyOf(capabilities);
        if (grantId.isBlank()) {
            throw new IllegalArgumentException("grantId must not be blank");
        }
        if (expiresAt.isBefore(issuedAt)) {
            throw new IllegalArgumentException("expiresAt must not be before issuedAt");
        }
    }

    /** Returns true if this grant is active at the given instant. */
    public boolean isValidAt(Instant now) {
        return !now.isBefore(issuedAt) && now.isBefore(expiresAt);
    }

    /** Returns true if the requested capability is explicitly covered by this grant. */
    public boolean covers(CapabilityClass capability) {
        return capabilities.contains(capability);
    }
}
