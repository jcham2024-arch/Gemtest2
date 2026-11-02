package com.leanllm.agent;

import com.leanllm.concurrency.CancellationToken;
import com.leanllm.domain.ToolDefinition;
import com.leanllm.scripting.*;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * @summary Bridge tool delegating execution to external guest scripts.
 */
public final class ScriptDelegatingTool implements Tool {
    private final ToolDefinition definition;
    private final AbstractProcessRunner runner;
    private final Path scriptPath;
    private final Duration timeout;

    public ScriptDelegatingTool(ToolDefinition def, AbstractProcessRunner runner, Path script, Duration timeout) {
        this.definition = def;
        this.runner = runner;
        this.scriptPath = script;
        this.timeout = timeout != null ? timeout : Duration.ofSeconds(15);
    }

    @Override
    public ToolDefinition getDefinition() { return definition; }

    @Override
    public String execute(String rawArgs, CancellationToken token) throws Exception {
        ScriptExecutionRequest req = new ScriptExecutionRequest(
            scriptPath, List.of(rawArgs), Map.of(), scriptPath.getParent(), timeout
        );
        ScriptExecutionResult res = runner.run(req, token);
        if (!res.isSuccess()) {
            return "Tool Execution Error (Code " + res.exitCode() + "): " + res.stderr();
        }
        return res.stdout().trim();
    }
}
