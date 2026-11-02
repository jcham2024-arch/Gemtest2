package com.leanllm.scripting;

import com.leanllm.concurrency.CancellationToken;
import com.leanllm.security.EnvironmentSanitizer;
import com.leanllm.security.ProcessTreeTerminator;
import java.io.*;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;

/**
 * @summary Non-blocking ProcessBuilder supervisor using Java 21 Virtual Threads.
 * @security Direct binary execution without intermediate shell wrappers (no sh -c).
 */
public abstract class AbstractProcessRunner {
    protected final String executableBinary;
    protected final EnvironmentSanitizer sanitizer;
    protected final ProcessTreeTerminator terminator;

    protected AbstractProcessRunner(String binary, EnvironmentSanitizer sanitizer) {
        this.executableBinary = Objects.requireNonNull(binary);
        this.sanitizer = sanitizer != null ? sanitizer : EnvironmentSanitizer.defaultSandbox();
        this.terminator = new ProcessTreeTerminator(100);
    }

    protected abstract List<String> buildPreArguments();

    public ScriptExecutionResult run(ScriptExecutionRequest req, CancellationToken token) throws Exception {
        List<String> cmd = new ArrayList<>();
        cmd.add(executableBinary);
        cmd.addAll(buildPreArguments());
        cmd.add(req.scriptPath().toString());
        cmd.addAll(req.arguments());

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.directory(req.workingDirectory().toFile());
        Map<String, String> env = pb.environment();
        env.clear();
        env.putAll(sanitizer.sanitize(System.getenv()));
        env.putAll(req.environmentOverrides());

        Instant start = Instant.now();
        Process proc = pb.start();

        if (token != null) token.onCancel(() -> terminator.destroyTree(proc));

        CompletableFuture<String> stdoutFuture = CompletableFuture.supplyAsync(() -> readStream(proc.getInputStream()), Thread.ofVirtual().factory());
        CompletableFuture<String> stderrFuture = CompletableFuture.supplyAsync(() -> readStream(proc.getErrorStream()), Thread.ofVirtual().factory());

        boolean finished = proc.waitFor(req.timeout().toMillis(), TimeUnit.MILLISECONDS);
        if (!finished) {
            terminator.destroyTree(proc);
            throw new TimeoutException("Process timed out after " + req.timeout());
        }

        String stdout = stdoutFuture.get(500, TimeUnit.MILLISECONDS);
        String stderr = stderrFuture.get(500, TimeUnit.MILLISECONDS);
        Duration elapsed = Duration.between(start, Instant.now());

        return new ScriptExecutionResult(proc.exitValue(), stdout, stderr, elapsed);
    }

    private String readStream(InputStream is) {
        try (BufferedReader r = new BufferedReader(new InputStreamReader(is))) {
            StringBuilder sb = new StringBuilder();
            String l;
            while ((l = r.readLine()) != null) sb.append(l).append("\n");
            return sb.toString();
        } catch (IOException e) { return ""; }
    }
}
