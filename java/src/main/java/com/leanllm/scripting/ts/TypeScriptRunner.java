package com.leanllm.scripting.ts;

import com.leanllm.scripting.AbstractProcessRunner;
import com.leanllm.security.EnvironmentSanitizer;
import java.util.List;

/**
 * @summary Primary runner for guest TypeScript scripts (Deno, Bun, ts-node).
 * @security Injects sandboxing flags before guest script arguments.
 */
public final class TypeScriptRunner extends AbstractProcessRunner {
    private final List<String> sandboxFlags;

    public TypeScriptRunner(String binary, List<String> sandboxFlags, EnvironmentSanitizer sanitizer) {
        super(binary, sanitizer);
        this.sandboxFlags = sandboxFlags != null ? List.copyOf(sandboxFlags) : List.of();
    }

    @Override
    protected List<String> buildPreArguments() {
        return sandboxFlags;
    }
}
