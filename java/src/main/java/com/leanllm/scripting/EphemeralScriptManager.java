package com.leanllm.scripting;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * @summary AutoCloseable temporary script lifecycle supervisor.
 * @security Deletes agent-generated guest scripts to eliminate disk clutter.
 */
public final class EphemeralScriptManager implements AutoCloseable {
    private final Path sandboxDir;
    private final Set<Path> trackedFiles = Collections.synchronizedSet(new HashSet<>());

    public EphemeralScriptManager(Path sandboxDir) throws IOException {
        this.sandboxDir = Files.createDirectories(sandboxDir);
    }

    public Path createScript(String name, String content) throws IOException {
        Path p = sandboxDir.resolve(UUID.randomUUID() + "_" + name);
        Files.writeString(p, content, StandardOpenOption.CREATE_NEW);
        trackedFiles.add(p);
        return p;
    }

    public void purgeAll() {
        synchronized (trackedFiles) {
            for (Path p : trackedFiles) {
                try { Files.deleteIfExists(p); } catch (IOException ignored) {}
            }
            trackedFiles.clear();
        }
    }

    @Override
    public void close() { purgeAll(); }
}
