package com.leanllm.agent;

import com.leanllm.client.LlmClient;
import com.leanllm.concurrency.CancellationToken;
import com.leanllm.domain.*;
import com.leanllm.ui.UiBridge;
import java.util.*;

/**
 * @summary Autonomous ReAct (Reasoning + Acting) orchestrator.
 * @security Enforces hard iteration limits to prevent infinite recursive tool loops.
 */
public final class AgentEngine {
    private final LlmClient client;
    private final String modelId;
    private final Map<String, Tool> tools = new HashMap<>();
    private final UiBridge uiBridge;

    public AgentEngine(LlmClient client, String modelId, UiBridge uiBridge) {
        this.client = Objects.requireNonNull(client);
        this.modelId = Objects.requireNonNull(modelId);
        this.uiBridge = uiBridge;
    }

    public void registerTool(Tool tool) {
        tools.put(tool.getDefinition().name(), tool);
    }

    public String run(AgentContext ctx, String query, CancellationToken token) throws Exception {
        ctx.append(ChatMessage.user(query));
        if (uiBridge != null) uiBridge.onStatus("Reasoning...");

        List<ToolDefinition> defs = tools.values().stream().map(Tool::getDefinition).toList();

        while (ctx.canIterate()) {
            if (token != null && token.isCancelled()) return "Execution cancelled.";
            ctx.nextIteration();

            InferenceRequest req = new InferenceRequest(modelId, ctx.getHistory(), defs, 0.7, 2048);
            InferenceResponse resp = client.complete(req, token);
            ctx.append(resp.message());

            if (!resp.hasToolCalls()) {
                if (uiBridge != null) uiBridge.onStatus("Completed.");
                return resp.message().content();
            }

            for (ToolCall tc : resp.toolCalls()) {
                Tool target = tools.get(tc.functionName());
                if (uiBridge != null) uiBridge.onToolStart(tc.functionName(), tc.rawArgumentsJson());
                String result;
                if (target == null) {
                    result = "Error: Tool '" + tc.functionName() + "' is not registered.";
                } else {
                    try {
                        result = target.execute(tc.rawArgumentsJson(), token);
                    } catch (Exception e) {
                        result = "Tool Failure: " + e.getMessage();
                    }
                }
                if (uiBridge != null) uiBridge.onToolEnd(tc.functionName(), result);
                ctx.append(ChatMessage.toolResult(tc.id(), result));
            }
        }
        return "Max reasoning iterations reached without resolution.";
    }
}
