package com.leanllm.factory;

import com.leanllm.scripting.python.PythonRunner;
import com.leanllm.scripting.ts.TypeScriptRunner;
import com.leanllm.security.EnvironmentSanitizer;
import java.nio.file.*;
import java.util.List;

/**
 * @summary Host discovery factory prioritizing modern TypeScript engines.
 */
public final class ScriptRunnerFactory {
    private ScriptRunnerFactory() {}

    public static TypeScriptRunner createTypeScriptRunner() {
        String[] candidates = {"deno", "bun", "npx ts-node"};
        String resolved = "deno"; // default or discovered via PATH probe
        List<String> flags = resolved.contains("deno") ? List.of("run", "--deny-net") : List.of();
        return new TypeScriptRunner(resolved, flags, EnvironmentSanitizer.defaultSandbox());
    }

    public static PythonRunner createPythonRunner(Path optionalVenv) {
        Path binary = optionalVenv != null ? optionalVenv.resolve("bin/python3") : Path.of("python3");
        return new PythonRunner(binary, EnvironmentSanitizer.defaultSandbox());
    }
}
