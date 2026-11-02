package com.apex.engine.core.port;

import com.apex.engine.core.port.model.ApprovalDecision;
import com.apex.engine.core.port.model.ApprovalRequest;
import com.apex.engine.planner.RiskLevel;

import java.util.Objects;

/**
 * Human-in-the-loop (HITL) gate evaluating {@link RiskLevel} (S3.4).
 * Low risk tiers (L0–L2) auto-approve; high risk tiers (L3–L5) require explicit
 * approval from the configured {@link ApprovalPort}.
 */
public final class HitlGate {

    private final ApprovalPort approvalPort;

    public HitlGate(ApprovalPort approvalPort) {
        this.approvalPort = Objects.requireNonNull(approvalPort, "approvalPort");
    }

    /**
     * Evaluates whether the request requires human intervention or auto-approves.
     */
    public ApprovalDecision evaluate(ApprovalRequest request) {
        Objects.requireNonNull(request, "request");
        if (!request.riskLevel().requiresApproval()) {
            return new ApprovalDecision(request.id(), true, "Auto-approved: " + request.riskLevel());
        }
        return approvalPort.request(request);
    }
}
