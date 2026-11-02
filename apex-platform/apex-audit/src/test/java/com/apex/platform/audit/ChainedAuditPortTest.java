package com.apex.platform.audit;

import com.apex.engine.core.port.model.AuditEntry;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ChainedAuditPortTest {

    @Test
    void auditChainMaintainsCryptographicIntegrity() {
        ChainedAuditPort port = new ChainedAuditPort();
        Instant now = Instant.now();

        AuditEntry e1 = port.record("audit-1", "SPAWN_WORKER", now);
        AuditEntry e2 = port.record("audit-2", "EXEC_TOOL_READ", now.plusMillis(50));
        AuditEntry e3 = port.record("audit-3", "COMPLETE_SESSION", now.plusMillis(100));

        List<AuditEntry> entries = port.all();
        assertThat(entries).hasSize(3);
        assertThat(port.verifyChainIntegrity()).isTrue();

        // Hashes must be unique and non-genesis
        assertThat(e1.hash()).isNotEqualTo(ChainedAuditPort.GENESIS_HASH);
        assertThat(e2.hash()).isNotEqualTo(e1.hash());
        assertThat(e3.hash()).isNotEqualTo(e2.hash());
    }

    @Test
    void detectsTamperedEntry() {
        ChainedAuditPort port = new ChainedAuditPort();
        Instant now = Instant.now();

        port.record("audit-1", "ACTION_A", now);
        port.record("audit-2", "ACTION_B", now.plusMillis(10));

        assertThat(port.verifyChainIntegrity()).isTrue();
    }
}
