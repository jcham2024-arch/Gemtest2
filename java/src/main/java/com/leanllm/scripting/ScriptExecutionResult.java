package com.leanllm.scripting;

import java.time.Duration;
import java.util.Objects;

/**
 * @summary Outcome of external script execution.
 * @threadsafe Immutable Java Record.
 */
public record ScriptExecutionResult(
    int exitCode,
    String stdout,
    String stderr,
    Duration duration
) {
    public ScriptExecutionResult {
        stdout = Objects.requireNonNull(stdout);
        stderr = Objects.requireNonNull(stderr);
        duration = Objects.requireNonNull(duration);
    }

    public boolean isSuccess() { return exitCode == 0; }
}
