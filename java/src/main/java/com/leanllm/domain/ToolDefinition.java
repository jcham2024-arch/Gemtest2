package com.leanllm.domain;

import com.leanllm.json.JsonNode;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * @summary Declarative tool schema exposed to the LLM.
 * @threadsafe Immutable Java Record.
 */
public record ToolDefinition(String name, String description, JsonNode parametersSchema) {
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]{1,64}$");

    public ToolDefinition {
        Objects.requireNonNull(name, "Tool name cannot be null");
        if (!NAME_PATTERN.matcher(name).matches()) {
            throw new IllegalArgumentException("Invalid tool name format: " + name);
        }
        Objects.requireNonNull(description, "Description cannot be null");
        Objects.requireNonNull(parametersSchema, "ParametersSchema cannot be null");
    }
}
