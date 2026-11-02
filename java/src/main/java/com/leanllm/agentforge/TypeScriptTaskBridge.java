package com.leanllm.agentforge;

import com.leanllm.concurrency.CancellationToken;
import com.leanllm.scripting.ScriptExecutionRequest;
import com.leanllm.scripting.ScriptExecutionResult;
import com.leanllm.scripting.TypeScriptProcessRunner;
import com.leanllm.security.EnvironmentSanitizer;

import java.nio.file.Path;
import java.time.Duration;
import java.util.*;

/**
 * Executes AgentForge TypeScript subagent tools with contract validation and realpath jail enforcement.
 * Utilizes OpenJDK 21 Virtual Threads for non-blocking I/O drainage.
 *
 * @threadsafe Immutable configuration, thread-safe for parallel execution.
 */
public final class TypeScriptTaskBridge {
    private final TypeScriptProcessRunner runner;
    private final McpPathPolicyFilter pathFilter;

    public TypeScriptTaskBridge(String tsRunnerBinary, McpPathPolicyFilter pathFilter) {
        this.runner = new TypeScriptProcessRunner(
            tsRunnerBinary != null ? tsRunnerBinary : "npx tsx", 
            EnvironmentSanitizer.defaultSandbox()
        );
        this.pathFilter = Objects.requireNonNull(pathFilter, "pathFilter cannot be null");
    }

    /**
     * Executes a specialized TypeScript tool governed by an immutable TaskContract.
     *
     * @param contract The governing TaskContract.
     * @param toolScriptPath Path to the TypeScript tool script (e.g. 'ast_slicer.ts').
     * @param scriptArgs Arguments passed to the script.
     * @param token Optional cancellation token.
     * @return ScriptExecutionResult containing exit code, stdout, stderr, and elapsed duration.
     * @throws SecurityException if the tool is not allowed in contract or touches out-of-jail paths.
     */
    public ScriptExecutionResult executeTool(
        TaskContract contract,
        Path toolScriptPath,
        List<String> scriptArgs,
        CancellationToken token
    ) throws Exception {
        Objects.requireNonNull(contract, "contract cannot be null");
        Objects.requireNonNull(toolScriptPath, "toolScriptPath cannot be null");

        String toolName = toolScriptPath.getFileName().toString();
        if (!contract.isToolPermitted(toolName)) {
            throw new SecurityException("TaskContract [" + contract.taskId() 
                + "] forbids execution of tool: " + toolName);
        }

        // Validate workspace jail for target paths
        for (String target : contract.targetPaths()) {
            pathFilter.validatePath(Path.of(target));
        }

        ScriptExecutionRequest req = new ScriptExecutionRequest(
            pathFilter.validatePath(toolScriptPath),
            scriptArgs != null ? scriptArgs : List.of(),
            pathFilter.getJailRoot(),
            Duration.ofMillis(contract.timeoutMs()),
            Map.of("TASK_CONTRACT_ID", contract.taskId(), "AGENT_ID", contract.agentId())
        );

        return runner.run(req, token);
    }
}
