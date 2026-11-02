package com.leanllm.agent;

import com.leanllm.concurrency.CancellationToken;
import com.leanllm.domain.ToolDefinition;

/**
 * @summary Executable agent tool contract.
 */
public interface Tool {
    ToolDefinition getDefinition();
    String execute(String rawArgumentsJson, CancellationToken token) throws Exception;
}
