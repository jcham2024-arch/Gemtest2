package com.apex.engine.core.security;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class K1ClassloadingTest {

    @Test
    void productionCodeContainsZeroDynamicClassloading() throws IOException {
        Path root = Path.of("").toAbsolutePath();
        List<String> bannedKeywords = List.of("defineClass", "URLClassLoader", "sun.misc.Unsafe");

        // Scan main sources across modules if running in repo context
        Path mainSrc = root.resolve("apex-core/engine-core/src/main/java");
        if (Files.exists(mainSrc)) {
            try (Stream<Path> paths = Files.walk(mainSrc)) {
                List<Path> javaFiles = paths.filter(p -> p.toString().endsWith(".java")).toList();
                for (Path file : javaFiles) {
                    String content = Files.readString(file);
                    for (String banned : bannedKeywords) {
                        assertThat(content)
                                .withFailMessage("Banned dynamic classloading pattern '%s' found in %s", banned, file)
                                .doesNotContain(banned);
                    }
                }
            }
        }
    }
}
