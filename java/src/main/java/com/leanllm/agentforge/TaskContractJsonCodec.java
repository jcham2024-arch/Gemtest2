package com.leanllm.agentforge;

import com.leanllm.json.JsonNode;
import com.leanllm.json.JsonParser;

import java.util.*;

/**
 * Zero-dependency JSON Codec translating AgentForge TaskContract and ExecutionArtifact objects.
 * Uses LeanJavallm com.leanllm.json.JsonNode and JsonParser without external dependencies.
 */
public final class TaskContractJsonCodec {
    private TaskContractJsonCodec() {}

    public static JsonNode.JsonObject toJson(TaskContract c) {
        Map<String, JsonNode> map = new LinkedHashMap<>();
        map.put("taskId", new JsonNode.JsonString(c.taskId()));
        map.put("agentId", new JsonNode.JsonString(c.agentId()));
        map.put("callerId", new JsonNode.JsonString(c.callerId()));
        map.put("intentDescription", new JsonNode.JsonString(c.intentDescription()));

        List<JsonNode> tools = new ArrayList<>();
        for (String t : c.toolAllowlist()) tools.add(new JsonNode.JsonString(t));
        map.put("toolAllowlist", new JsonNode.JsonArray(tools));

        List<JsonNode> paths = new ArrayList<>();
        for (String p : c.targetPaths()) paths.add(new JsonNode.JsonString(p));
        map.put("targetPaths", new JsonNode.JsonArray(paths));

        map.put("timeoutMs", new JsonNode.JsonNumber(c.timeoutMs()));
        map.put("budgetLimitTokens", new JsonNode.JsonNumber(c.budgetLimitTokens()));
        map.put("status", new JsonNode.JsonString(c.status().name()));

        return new JsonNode.JsonObject(map);
    }

    public static TaskContract fromJson(JsonNode node) {
        if (!(node instanceof JsonNode.JsonObject obj)) {
            throw new IllegalArgumentException("Expected JsonObject for TaskContract, got: " + node.getClass().getSimpleName());
        }

        String taskId = obj.get("taskId").asString();
        String agentId = obj.get("agentId").asString();
        String callerId = obj.get("callerId").asString();
        String intentDescription = obj.get("intentDescription").asString();

        Set<String> tools = new LinkedHashSet<>();
        if (obj.get("toolAllowlist") instanceof JsonNode.JsonArray arr) {
            for (int i = 0; i < arr.size(); i++) {
                tools.add(arr.get(i).asString());
            }
        }

        List<String> paths = new ArrayList<>();
        if (obj.get("targetPaths") instanceof JsonNode.JsonArray arr) {
            for (int i = 0; i < arr.size(); i++) {
                paths.add(arr.get(i).asString());
            }
        }

        long timeoutMs = obj.has("timeoutMs") ? obj.get("timeoutMs").asLong() : 30_000L;
        int budgetLimitTokens = obj.has("budgetLimitTokens") ? obj.get("budgetLimitTokens").asInt() : 4096;
        TaskContract.ContractStatus status = obj.has("status") 
            ? TaskContract.ContractStatus.valueOf(obj.get("status").asString())
            : TaskContract.ContractStatus.PENDING;

        return new TaskContract(
            taskId,
            agentId,
            callerId,
            intentDescription,
            tools,
            paths,
            timeoutMs,
            budgetLimitTokens,
            status
        );
    }

    public static JsonNode.JsonObject toJson(ExecutionArtifact a) {
        Map<String, JsonNode> map = new LinkedHashMap<>();
        map.put("artifactId", new JsonNode.JsonString(a.artifactId()));
        map.put("taskId", new JsonNode.JsonString(a.taskId()));
        map.put("relativePath", new JsonNode.JsonString(a.relativePath()));
        map.put("contentDigest", new JsonNode.JsonString(a.contentDigest()));
        map.put("sizeBytes", new JsonNode.JsonNumber(a.sizeBytes()));
        map.put("verified", new JsonNode.JsonBoolean(a.verified()));
        return new JsonNode.JsonObject(map);
    }

    public static ExecutionArtifact artifactFromJson(JsonNode node) {
        if (!(node instanceof JsonNode.JsonObject obj)) {
            throw new IllegalArgumentException("Expected JsonObject for ExecutionArtifact");
        }
        return new ExecutionArtifact(
            obj.get("artifactId").asString(),
            obj.get("taskId").asString(),
            obj.get("relativePath").asString(),
            obj.get("contentDigest").asString(),
            obj.get("sizeBytes").asLong(),
            obj.get("verified").asBoolean()
        );
    }

    public static TaskContract parseString(String json) {
        return fromJson(JsonParser.parse(json));
    }
}
