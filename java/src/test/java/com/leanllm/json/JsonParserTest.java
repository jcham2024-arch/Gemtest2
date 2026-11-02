package com.leanllm.json;

import com.leanllm.agentforge.TaskContract;
import com.leanllm.agentforge.TaskContractJsonCodec;

import java.util.List;
import java.util.Set;

/**
 * Standalone Zero-Dependency Test Suite for com.leanllm.json.
 * Executable on any standard OpenJDK 21 LTS runtime without JUnit or external test runners.
 */
public final class JsonParserTest {
    private static int testsPassed = 0;
    private static int testsFailed = 0;

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println(" Lean Java Agentic Core - JSON RFC 8259 Test Suite");
        System.out.println("=================================================");

        testScalarParsing();
        testUnicodeAndEscapes();
        testNestedStructures();
        testScientificNotation();
        testLeadingZeroRejection();
        testTrailingGarbageRejection();
        testRecursionDepthLimit();
        testTaskContractRoundTrip();

        System.out.println("-------------------------------------------------");
        System.out.printf("Results: %d Passed, %d Failed%n", testsPassed, testsFailed);
        System.out.println("=================================================");

        if (testsFailed > 0) {
            System.exit(1);
        }
    }

    private static void testScalarParsing() {
        assertEq("String scalar", "hello world", JsonParser.parse("\"hello world\"").asString());
        assertEq("Number integer", 42L, JsonParser.parse("42").asLong());
        assertEq("Number negative", -17.5, JsonParser.parse("-17.5").asDouble());
        assertEq("Boolean true", true, JsonParser.parse("true").asBoolean());
        assertEq("Boolean false", false, JsonParser.parse("false").asBoolean());
        assertTrue("Null check", JsonParser.parse("null").isNull());
    }

    private static void testUnicodeAndEscapes() {
        String json = "\"Hello\\nWorld\\t\\\"Quoted\\\" \\u0041\\u2713\"";
        JsonNode node = JsonParser.parse(json);
        String expected = "Hello\nWorld\t\"Quoted\" A\u2713";
        assertEq("Escapes and Unicode", expected, node.asString());
    }

    private static void testNestedStructures() {
        String json = """
            {
              "name": "LJAC Engine",
              "version": 21,
              "active": true,
              "tags": ["zero-dep", "rfc8259", "agentforge"],
              "metrics": {
                "maxDepth": 64,
                "memoryHygiene": "SecureSecret"
              }
            }
            """;
        JsonNode node = JsonParser.parse(json);
        assertTrue("Is object", node.isObject());
        assertEq("Root property", "LJAC Engine", node.get("name").asString());
        assertEq("Array element", "rfc8259", node.get("tags").get(1).asString());
        assertEq("Nested object", 64L, node.get("metrics").get("maxDepth").asLong());
    }

    private static void testScientificNotation() {
        assertEq("Exponent positive", 10000.0, JsonParser.parse("1e4").asDouble());
        assertEq("Exponent capital with plus", 250.0, JsonParser.parse("2.5E+2").asDouble());
        assertEq("Exponent negative", 0.005, JsonParser.parse("5e-3").asDouble());
    }

    private static void testLeadingZeroRejection() {
        try {
            JsonParser.parse("0123");
            fail("Leading zero RFC 8259 rejection", "Expected IllegalArgumentException for 0123");
        } catch (IllegalArgumentException e) {
            pass("Leading zero RFC 8259 rejection");
        }
    }

    private static void testTrailingGarbageRejection() {
        try {
            JsonParser.parse("{\"valid\": true} trailing_garbage");
            fail("Trailing garbage rejection", "Expected IllegalArgumentException");
        } catch (IllegalArgumentException e) {
            pass("Trailing garbage rejection");
        }
    }

    private static void testRecursionDepthLimit() {
        // Build 65 levels of '['
        StringBuilder sb = new StringBuilder();
        sb.append("[".repeat(65));
        sb.append("1");
        sb.append("]".repeat(65));

        try {
            JsonParser.parse(sb.toString());
            fail("Recursion depth CWE-674 defense", "Expected IllegalStateException for depth > 64");
        } catch (IllegalStateException e) {
            pass("Recursion depth CWE-674 defense");
        }
    }

    private static void testTaskContractRoundTrip() {
        TaskContract contract = new TaskContract(
            "task-uuid-8891",
            "ast_slicer",
            "lead_architect",
            "Slice target TypeScript AST down to 150 tokens",
            Set.of("ast_slicer.ts", "ast_patcher.ts"),
            List.of("src/workbench/types.ts"),
            15_000L,
            2_048,
            TaskContract.ContractStatus.IN_PROGRESS
        );

        JsonNode.JsonObject serialized = TaskContractJsonCodec.toJson(contract);
        String rawJson = serialized.serialize();
        TaskContract deserialized = TaskContractJsonCodec.parseString(rawJson);

        assertEq("TaskContract ID", contract.taskId(), deserialized.taskId());
        assertEq("TaskContract Agent", contract.agentId(), deserialized.agentId());
        assertEq("TaskContract Status", contract.status(), deserialized.status());
        assertEq("TaskContract Timeout", contract.timeoutMs(), deserialized.timeoutMs());
        assertTrue("TaskContract tool permission", deserialized.isToolPermitted("ast_slicer.ts"));
    }

    private static void assertEq(String testName, Object expected, Object actual) {
        if (expected == null && actual == null) {
            pass(testName);
            return;
        }
        if (expected != null && expected.equals(actual)) {
            pass(testName);
        } else {
            fail(testName, "Expected [" + expected + "], but got [" + actual + "]");
        }
    }

    private static void assertTrue(String testName, boolean condition) {
        if (condition) {
            pass(testName);
        } else {
            fail(testName, "Condition failed to evaluate to true");
        }
    }

    private static void pass(String testName) {
        testsPassed++;
        System.out.println("  ✓ PASS: " + testName);
    }

    private static void fail(String testName, String message) {
        testsFailed++;
        System.err.println("  ✗ FAIL: " + testName + " — " + message);
    }
}
