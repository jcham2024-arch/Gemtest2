package com.apex.engine.core.port;

import com.apex.engine.core.port.model.ApprovalDecision;
import com.apex.engine.core.port.model.ApprovalRequest;
import com.apex.engine.planner.RiskLevel;
import org.junit.jupiter.api.Test;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;

class HitlGateTest {

    @Test
    void autoApprovesLowRiskTiersWithoutInvokingPort() {
        AtomicBoolean invoked = new AtomicBoolean(false);
        ApprovalPort mockPort = req -> {
            invoked.set(true);
            return new ApprovalDecision(req.id(), false, "Denied");
        };

        HitlGate gate = new HitlGate(mockPort);

        // L0, L1, L2 should not invoke port
        ApprovalDecision d0 = gate.evaluate(new ApprovalRequest("req-0", "read stats", RiskLevel.L0));
        ApprovalDecision d1 = gate.evaluate(new ApprovalRequest("req-1", "query DB", RiskLevel.L1));
        ApprovalDecision d2 = gate.evaluate(new ApprovalRequest("req-2", "cache write", RiskLevel.L2));

        assertThat(d0.approved()).isTrue();
        assertThat(d1.approved()).isTrue();
        assertThat(d2.approved()).isTrue();
        assertThat(invoked.get()).isFalse();
    }

    @Test
    void delegatesHighRiskTiersToApprovalPort() {
        AtomicBoolean invoked = new AtomicBoolean(false);
        ApprovalPort mockPort = req -> {
            invoked.set(true);
            return new ApprovalDecision(req.id(), true, "Operator granted permission");
        };

        HitlGate gate = new HitlGate(mockPort);

        ApprovalDecision d3 = gate.evaluate(new ApprovalRequest("req-3", "file write outside sandbox", RiskLevel.L3));
        assertThat(d3.approved()).isTrue();
        assertThat(d3.comment()).contains("Operator granted permission");
        assertThat(invoked.get()).isTrue();
    }
}
