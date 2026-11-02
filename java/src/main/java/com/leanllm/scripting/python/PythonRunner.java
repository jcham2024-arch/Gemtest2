package com.leanllm.scripting.python;

import com.leanllm.scripting.AbstractProcessRunner;
import com.leanllm.security.EnvironmentSanitizer;
import java.nio.file.Path;
import java.util.List;

/**
 * @summary Secondary runner for Python workloads (venv or python3).
 * @security Passes -B (no bytecode) and -u (unbuffered streams) by default.
 */
public final class PythonRunner extends AbstractProcessRunner {
    public PythonRunner(Path pythonBinary, EnvironmentSanitizer sanitizer) {
        super(pythonBinary.toString(), sanitizer);
    }

    @Override
    protected List<String> buildPreArguments() {
        return List.of("-B", "-u");
    }
}
