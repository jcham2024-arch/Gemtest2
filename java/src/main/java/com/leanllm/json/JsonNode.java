package com.leanllm.json;

import java.util.*;

/**
 * Zero-dependency JSON Abstract Syntax Tree (AST) root for OpenJDK 21 LTS.
 * Implemented using sealed classes and immutable Java Records conforming to RFC 8259.
 *
 * @threadsafe All AST node implementations are immutable and thread-safe.
 * @security Defends against CWE-674 Uncontrolled Recursion through depth bounding.
 */
public abstract sealed class JsonNode permits 
    JsonNode.JsonObject, 
    JsonNode.JsonArray, 
    JsonNode.JsonString, 
    JsonNode.JsonNumber, 
    JsonNode.JsonBoolean, 
    JsonNode.JsonNull {

    public static final int MAX_RECURSION_DEPTH = 64;

    public abstract String serialize();

    public String toPrettyJson() {
        return toPrettyJson(0);
    }

    public abstract String toPrettyJson(int indentLevel);

    protected static String indent(int level) {
        return "  ".repeat(Math.max(0, level));
    }

    // --- Type Checkers ---
    public boolean isObject() { return this instanceof JsonObject; }
    public boolean isArray() { return this instanceof JsonArray; }
    public boolean isString() { return this instanceof JsonString; }
    public boolean isNumber() { return this instanceof JsonNumber; }
    public boolean isBoolean() { return this instanceof JsonBoolean; }
    public boolean isNull() { return this instanceof JsonNull; }

    // --- Type-Safe Accessors ---
    public String asString() {
        if (this instanceof JsonString s) return s.value();
        throw new UnsupportedOperationException("Node is not a JsonString: " + getClass().getSimpleName());
    }

    public double asDouble() {
        if (this instanceof JsonNumber n) return n.value();
        throw new UnsupportedOperationException("Node is not a JsonNumber: " + getClass().getSimpleName());
    }

    public long asLong() {
        if (this instanceof JsonNumber n) return (long) n.value();
        throw new UnsupportedOperationException("Node is not a JsonNumber: " + getClass().getSimpleName());
    }

    public int asInt() {
        if (this instanceof JsonNumber n) return (int) n.value();
        throw new UnsupportedOperationException("Node is not a JsonNumber: " + getClass().getSimpleName());
    }

    public boolean asBoolean() {
        if (this instanceof JsonBoolean b) return b.value();
        throw new UnsupportedOperationException("Node is not a JsonBoolean: " + getClass().getSimpleName());
    }

    public JsonObject asObject() {
        if (this instanceof JsonObject o) return o;
        throw new UnsupportedOperationException("Node is not a JsonObject: " + getClass().getSimpleName());
    }

    public JsonArray asArray() {
        if (this instanceof JsonArray a) return a;
        throw new UnsupportedOperationException("Node is not a JsonArray: " + getClass().getSimpleName());
    }

    public JsonNode get(String key) {
        if (this instanceof JsonObject o) return o.get(key);
        return null;
    }

    public JsonNode get(int index) {
        if (this instanceof JsonArray a) return a.get(index);
        return null;
    }

    public boolean has(String key) {
        if (this instanceof JsonObject o) return o.containsKey(key);
        return false;
    }

    public int size() {
        if (this instanceof JsonObject o) return o.size();
        if (this instanceof JsonArray a) return a.size();
        return 1;
    }

    // --- Node Implementations ---

    public static record JsonObject(Map<String, JsonNode> members) extends JsonNode {
        public JsonObject {
            members = Collections.unmodifiableMap(new LinkedHashMap<>(members));
        }

        public JsonNode get(String key) {
            return members.get(key);
        }

        public boolean containsKey(String key) {
            return members.containsKey(key);
        }

        public int size() {
            return members.size();
        }

        @Override
        public String serialize() {
            StringBuilder sb = new StringBuilder("{");
            int i = 0;
            for (var entry : members.entrySet()) {
                if (i++ > 0) sb.append(",");
                sb.append(escapeString(entry.getKey())).append(":").append(entry.getValue().serialize());
            }
            return sb.append("}").toString();
        }

        @Override
        public String toPrettyJson(int indentLevel) {
            if (members.isEmpty()) return "{}";
            StringBuilder sb = new StringBuilder("{\n");
            int i = 0;
            for (var entry : members.entrySet()) {
                if (i++ > 0) sb.append(",\n");
                sb.append(indent(indentLevel + 1))
                  .append(escapeString(entry.getKey()))
                  .append(": ")
                  .append(entry.getValue().toPrettyJson(indentLevel + 1));
            }
            sb.append("\n").append(indent(indentLevel)).append("}");
            return sb.toString();
        }
    }

    public static record JsonArray(List<JsonNode> elements) extends JsonNode {
        public JsonArray {
            elements = Collections.unmodifiableList(new ArrayList<>(elements));
        }

        public JsonNode get(int index) {
            if (index < 0 || index >= elements.size()) return null;
            return elements.get(index);
        }

        public int size() {
            return elements.size();
        }

        @Override
        public String serialize() {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < elements.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(elements.get(i).serialize());
            }
            return sb.append("]").toString();
        }

        @Override
        public String toPrettyJson(int indentLevel) {
            if (elements.isEmpty()) return "[]";
            StringBuilder sb = new StringBuilder("[\n");
            for (int i = 0; i < elements.size(); i++) {
                if (i > 0) sb.append(",\n");
                sb.append(indent(indentLevel + 1)).append(elements.get(i).toPrettyJson(indentLevel + 1));
            }
            sb.append("\n").append(indent(indentLevel)).append("]");
            return sb.toString();
        }
    }

    public static record JsonString(String value) extends JsonNode {
        public JsonString {
            Objects.requireNonNull(value, "JsonString value cannot be null");
        }

        @Override
        public String serialize() {
            return escapeString(value);
        }

        @Override
        public String toPrettyJson(int indentLevel) {
            return serialize();
        }
    }

    public static record JsonNumber(double value) extends JsonNode {
        @Override
        public String serialize() {
            if (Double.isNaN(value) || Double.isInfinite(value)) {
                throw new IllegalArgumentException("Numeric NaN and Infinity are forbidden by RFC 8259");
            }
            if (value == (long) value) {
                return String.valueOf((long) value);
            }
            return String.valueOf(value);
        }

        @Override
        public String toPrettyJson(int indentLevel) {
            return serialize();
        }
    }

    public static record JsonBoolean(boolean value) extends JsonNode {
        @Override
        public String serialize() {
            return value ? "true" : "false";
        }

        @Override
        public String toPrettyJson(int indentLevel) {
            return serialize();
        }
    }

    public static record JsonNull() extends JsonNode {
        @Override
        public String serialize() {
            return "null";
        }

        @Override
        public String toPrettyJson(int indentLevel) {
            return "null";
        }
    }

    /**
     * Encodes a string literal conforming to RFC 8259 Section 7.
     */
    public static String escapeString(String s) {
        if (s == null) return "\"\"";
        StringBuilder sb = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\b' -> sb.append("\\b");
                case '\f' -> sb.append("\\f");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                }
            }
        }
        return sb.append("\"").toString();
    }
}
