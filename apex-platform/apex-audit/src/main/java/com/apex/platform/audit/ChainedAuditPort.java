package com.apex.platform.audit;

import com.apex.engine.core.port.AuditPort;
import com.apex.engine.core.port.model.AuditEntry;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Chained tamper-evident implementation of {@link AuditPort} (S3.3).
 * Links each entry to the preceding SHA-256 hash. Thread-safe via ReentrantLock
 * to avoid JDK 21 virtual-thread carrier pinning (Invariant K8).
 */
public final class ChainedAuditPort implements AuditPort {

    public static final String GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

    private final List<AuditEntry> entries = new ArrayList<>();
    private final ReentrantLock lock = new ReentrantLock();
    private String lastHash = GENESIS_HASH;

    @Override
    public void append(AuditEntry entry) {
        Objects.requireNonNull(entry, "entry");
        lock.lock();
        try {
            String calculatedHash = computeHash(entry.id(), entry.action(), entry.at(), lastHash);
            AuditEntry chainedEntry = new AuditEntry(entry.id(), entry.action(), entry.at(), calculatedHash);
            entries.add(chainedEntry);
            lastHash = calculatedHash;
        } finally {
            lock.unlock();
        }
    }

    /**
     * Appends a new event and returns the cryptographically chained entry.
     */
    public AuditEntry record(String id, String action, Instant at) {
        lock.lock();
        try {
            String calculatedHash = computeHash(id, action, at, lastHash);
            AuditEntry entry = new AuditEntry(id, action, at, calculatedHash);
            entries.add(entry);
            lastHash = calculatedHash;
            return entry;
        } finally {
            lock.unlock();
        }
    }

    @Override
    public List<AuditEntry> all() {
        lock.lock();
        try {
            return List.copyOf(entries);
        } finally {
            lock.unlock();
        }
    }

    /**
     * Verifies that the entire audit chain is unbroken and matches cryptographic hashes.
     */
    public boolean verifyChainIntegrity() {
        lock.lock();
        try {
            String expectedPrev = GENESIS_HASH;
            for (AuditEntry entry : entries) {
                String expectedHash = computeHash(entry.id(), entry.action(), entry.at(), expectedPrev);
                if (!entry.hash().equalsIgnoreCase(expectedHash)) {
                    return false;
                }
                expectedPrev = entry.hash();
            }
            return true;
        } finally {
            lock.unlock();
        }
    }

    private static String computeHash(String id, String action, Instant at, String prevHash) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String payload = id + ":" + action + ":" + at.toEpochMilli() + ":" + prevHash;
            byte[] hash = digest.digest(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 digest unavailable", e);
        }
    }
}
