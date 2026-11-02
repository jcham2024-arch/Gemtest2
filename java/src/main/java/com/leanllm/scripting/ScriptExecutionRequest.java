package com.leanllm.scripting;

import java.nio.file.Path;
import java.time.Duration;
import java.util.*;

/**
 * @summary Immutable execution envelope for guest script invocations.
 * @threadsafe Immutable Java Record.
 */
public record ScriptExecutionRequest(
    Path scriptPath,
    List<String> arguments,
    Map<String, String> environmentOverrides,
    Path workingDirectory,
    Duration timeout
) {
    public ScriptExecutionRequest {
        Objects.requireNonNull(scriptPath, "scriptPath cannot be null");
        arguments = arguments != null ? List.copyOf(arguments) : List.of();
        environmentOverrides = environmentOverrides != null ? Map.copyOf(environmentOverrides) : Map.of();
        workingDirectory = Objects.requireNonNull(workingDirectory, "workingDirectory cannot be null");
        timeout = timeout != null ? timeout : Duration.ofSeconds(15);
    }
}
