package com.leanllm.json;

import java.util.*;

/**
 * Zero-dependency RFC 8259 compliant recursive-descent JSON parser.
 * Built strictly on standard OpenJDK 21 LTS java.base module.
 *
 * @threadsafe Thread-safe when used via static entrypoints parse() or tryParse().
 * @security Strictly enforces MAX_RECURSION_DEPTH (64) to defend against CWE-674 stack exhaustion.
 */
public final class JsonParser {
    private final String src;
    private int idx = 0;
    private int depth = 0;

    private JsonParser(String src) {
        this.src = Objects.requireNonNull(src, "JSON source cannot be null");
    }

    /**
     * Parses a raw JSON string into a strongly-typed JsonNode hierarchy.
     *
     * @param rawJson JSON string conforming to RFC 8259.
     * @return Root JsonNode.
     * @throws IllegalArgumentException on syntax violation or malformed token.
     * @throws IllegalStateException when nesting depth exceeds MAX_RECURSION_DEPTH.
     */
    public static JsonNode parse(String rawJson) {
        JsonParser parser = new JsonParser(rawJson);
        parser.skipWhitespace();
        if (parser.idx >= parser.src.length()) {
            throw new IllegalArgumentException("Empty or whitespace-only JSON input");
        }
        JsonNode root = parser.parseValue();
        parser.skipWhitespace();
        if (parser.idx < parser.src.length()) {
            throw new IllegalArgumentException("Unexpected trailing characters at index " + parser.idx 
                + ": '" + parser.src.substring(parser.idx, Math.min(parser.src.length(), parser.idx + 10)) + "'");
        }
        return root;
    }

    /**
     * Attempts to parse JSON without throwing runtime exceptions.
     */
    public static Optional<JsonNode> tryParse(String rawJson) {
        try {
            return Optional.of(parse(rawJson));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private JsonNode parseValue() {
        skipWhitespace();
        if (idx >= src.length()) {
            throw new IllegalArgumentException("Unexpected end of JSON at index " + idx);
        }
        if (++depth > JsonNode.MAX_RECURSION_DEPTH) {
            throw new IllegalStateException("Max JSON recursion depth (" + JsonNode.MAX_RECURSION_DEPTH 
                + ") exceeded (CWE-674 mitigation)");
        }
        try {
            char c = src.charAt(idx);
            return switch (c) {
                case '{' -> parseObject();
                case '[' -> parseArray();
                case '"' -> new JsonNode.JsonString(parseString());
                case 't', 'f' -> parseBoolean();
                case 'n' -> parseNull();
                default -> {
                    if (c == '-' || (c >= '0' && c <= '9')) {
                        yield parseNumber();
                    }
                    throw new IllegalArgumentException("Unexpected token '" + c + "' at index " + idx);
                }
            };
        } finally {
            depth--;
        }
    }

    private JsonNode.JsonObject parseObject() {
        idx++; // skip '{'
        Map<String, JsonNode> map = new LinkedHashMap<>();
        skipWhitespace();
        if (peek() == '}') {
            idx++;
            return new JsonNode.JsonObject(map);
        }

        while (true) {
            skipWhitespace();
            if (peek() != '"') {
                throw new IllegalArgumentException("Expected string key in object at index " + idx + ", found '" + peek() + "'");
            }
            String key = parseString();
            skipWhitespace();
            if (consume() != ':') {
                throw new IllegalArgumentException("Expected ':' separator after key \"" + key + "\" at index " + idx);
            }
            JsonNode value = parseValue();
            map.put(key, value);

            skipWhitespace();
            char next = consume();
            if (next == '}') break;
            if (next != ',') {
                throw new IllegalArgumentException("Expected ',' or '}' in object at index " + idx + ", found '" + next + "'");
            }
        }
        return new JsonNode.JsonObject(map);
    }

    private JsonNode.JsonArray parseArray() {
        idx++; // skip '['
        List<JsonNode> list = new ArrayList<>();
        skipWhitespace();
        if (peek() == ']') {
            idx++;
            return new JsonNode.JsonArray(list);
        }

        while (true) {
            list.add(parseValue());
            skipWhitespace();
            char next = consume();
            if (next == ']') break;
            if (next != ',') {
                throw new IllegalArgumentException("Expected ',' or ']' in array at index " + idx + ", found '" + next + "'");
            }
        }
        return new JsonNode.JsonArray(list);
    }

    private String parseString() {
        consume(); // skip opening quote '"'
        StringBuilder sb = new StringBuilder();
        while (idx < src.length()) {
            char c = consume();
            if (c == '"') return sb.toString();
            if (c == '\\') {
                if (idx >= src.length()) {
                    throw new IllegalArgumentException("Unterminated escape sequence in string at " + idx);
                }
                char esc = consume();
                switch (esc) {
                    case '"' -> sb.append('"');
                    case '\\' -> sb.append('\\');
                    case '/' -> sb.append('/');
                    case 'b' -> sb.append('\b');
                    case 'f' -> sb.append('\f');
                    case 'n' -> sb.append('\n');
                    case 'r' -> sb.append('\r');
                    case 't' -> sb.append('\t');
                    case 'u' -> {
                        if (idx + 4 > src.length()) {
                            throw new IllegalArgumentException("Incomplete \\uXXXX unicode escape at " + idx);
                        }
                        String hex = src.substring(idx, idx + 4);
                        idx += 4;
                        try {
                            sb.append((char) Integer.parseInt(hex, 16));
                        } catch (NumberFormatException e) {
                            throw new IllegalArgumentException("Invalid hex in \\uXXXX unicode escape: " + hex, e);
                        }
                    }
                    default -> throw new IllegalArgumentException("Invalid escape character '\\" + esc + "' at " + idx);
                }
            } else if (c < 0x20) {
                throw new IllegalArgumentException("Unescaped control character (0x" + Integer.toHexString(c) + ") in string at " + idx);
            } else {
                sb.append(c);
            }
        }
        throw new IllegalArgumentException("Unterminated string starting before index " + idx);
    }

    private JsonNode.JsonBoolean parseBoolean() {
        if (src.startsWith("true", idx)) {
            idx += 4;
            return new JsonNode.JsonBoolean(true);
        }
        if (src.startsWith("false", idx)) {
            idx += 5;
            return new JsonNode.JsonBoolean(false);
        }
        throw new IllegalArgumentException("Invalid boolean literal at index " + idx);
    }

    private JsonNode.JsonNull parseNull() {
        if (src.startsWith("null", idx)) {
            idx += 4;
            return new JsonNode.JsonNull();
        }
        throw new IllegalArgumentException("Invalid null literal at index " + idx);
    }

    private JsonNode.JsonNumber parseNumber() {
        int start = idx;
        if (peek() == '-') idx++;
        
        if (idx >= src.length()) {
            throw new IllegalArgumentException("Trailing minus sign with no digits at " + idx);
        }

        char firstDigit = peek();
        if (firstDigit == '0') {
            idx++;
            char next = peek();
            if (next >= '0' && next <= '9') {
                throw new IllegalArgumentException("Leading zeros forbidden in RFC 8259 numbers at index " + start);
            }
        } else if (firstDigit >= '1' && firstDigit <= '9') {
            while (idx < src.length() && Character.isDigit(src.charAt(idx))) idx++;
        } else {
            throw new IllegalArgumentException("Invalid numeric digit at index " + idx);
        }

        // Fraction
        if (peek() == '.') {
            idx++;
            if (idx >= src.length() || !Character.isDigit(src.charAt(idx))) {
                throw new IllegalArgumentException("Expected digits after decimal point at index " + idx);
            }
            while (idx < src.length() && Character.isDigit(src.charAt(idx))) idx++;
        }

        // Exponent
        if (peek() == 'e' || peek() == 'E') {
            idx++;
            if (peek() == '+' || peek() == '-') idx++;
            if (idx >= src.length() || !Character.isDigit(src.charAt(idx))) {
                throw new IllegalArgumentException("Expected digits in numeric exponent at index " + idx);
            }
            while (idx < src.length() && Character.isDigit(src.charAt(idx))) idx++;
        }

        String numStr = src.substring(start, idx);
        try {
            return new JsonNode.JsonNumber(Double.parseDouble(numStr));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Malformed number '" + numStr + "' at index " + start, e);
        }
    }

    private void skipWhitespace() {
        while (idx < src.length()) {
            char c = src.charAt(idx);
            if (c == ' ' || c == '\t' || c == '\n' || c == '\r') {
                idx++;
            } else {
                break;
            }
        }
    }

    private char peek() {
        return idx < src.length() ? src.charAt(idx) : '\0';
    }

    private char consume() {
        if (idx >= src.length()) {
            throw new IllegalArgumentException("Unexpected end of stream at index " + idx);
        }
        return src.charAt(idx++);
    }
}
