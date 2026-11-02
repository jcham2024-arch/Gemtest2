package com.leanllm.agentforge;

import java.util.*;

/**
 * Immutable task contract governing multi-agent handoffs and task execution boundaries.
 * Aligned with the AgentForge H-MAP specification and Lean Java Agentic Core (LJAC).
 *
 * @param taskId Unique UUID or identifier for the task contract.
 * @param agentId Target agent assigned to execute the contract (e.g. 'ast_slicer', 'architect').
 * @param callerId Invoking entity (Operator handle or parent agent ID).
 * @param intentDescription Human/agent readable statement of execution objective.
 * @param toolAllowlist Set of permitted tool identifiers the agent may invoke.
 * @param targetPaths List of relative workspace file paths permitted for inspection/modification.
 * @param timeoutMs Maximum allowable execution wall-clock time in milliseconds before process tree termination.
 * @param budgetLimitTokens Maximum allowable token budget for the task execution turn.
 * @param status Lifecycle status of the contract.
 */
public record TaskContract(
    String taskId,
    String agentId,
    String callerId,
    String intentDescription,
    Set<String> toolAllowlist,
    List<String> targetPaths,
    long timeoutMs,
    int budgetLimitTokens,
    ContractStatus status
) {
    public enum ContractStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        FAILED,
        TERMINATED_TIMEOUT
    }

    public TaskContract {
        Objects.requireNonNull(taskId, "taskId cannot be null");
        Objects.requireNonNull(agentId, "agentId cannot be null");
        Objects.requireNonNull(callerId, "callerId cannot be null");
        Objects.requireNonNull(intentDescription, "intentDescription cannot be null");
        toolAllowlist = Set.copyOf(Objects.requireNonNull(toolAllowlist, "toolAllowlist cannot be null"));
        targetPaths = List.copyOf(Objects.requireNonNull(targetPaths, "targetPaths cannot be null"));
        status = Objects.requireNonNullElse(status, ContractStatus.PENDING);
        if (timeoutMs <= 0) timeoutMs = 30_000L; // 30s default
        if (budgetLimitTokens <= 0) budgetLimitTokens = 4_096;
    }

    public boolean isToolPermitted(String toolName) {
        return toolAllowlist.contains(toolName) || toolAllowlist.contains("*");
    }

    public TaskContract withStatus(ContractStatus newStatus) {
        return new TaskContract(
            taskId,
            agentId,
            callerId,
            intentDescription,
            toolAllowlist,
            targetPaths,
            timeoutMs,
            budgetLimitTokens,
            newStatus
        );
    }
}
