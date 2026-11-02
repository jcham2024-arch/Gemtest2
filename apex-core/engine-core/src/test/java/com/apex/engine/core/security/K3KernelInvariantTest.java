package com.apex.engine.core.security;

import com.apex.engine.core.KernelInvariants;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class K3KernelInvariantTest {

    @Test
    void invariantsAreCompiledFinalConstantsWithNoRuntimeWritePath() throws Exception {
        Field field = KernelInvariants.class.getDeclaredField("IMMUTABLE_KERNEL_INVARIANTS");

        int modifiers = field.getModifiers();
        assertThat(Modifier.isPublic(modifiers)).isTrue();
        assertThat(Modifier.isStatic(modifiers)).isTrue();
        assertThat(Modifier.isFinal(modifiers)).isTrue();

        @SuppressWarnings("unchecked")
        List<String> invariants = (List<String>) field.get(null);
        assertThat(invariants).isNotEmpty();
        assertThat(invariants).contains(
                "K1: No dynamic JVM classloading",
                "K8: No carrier pinning on the agent executor"
        );

        // Attempt mutation -> must throw UnsupportedOperationException
        assertThatThrownBy(() -> invariants.add("K_NEW: Invalid runtime insertion"))
                .isInstanceOf(UnsupportedOperationException.class);
    }
}
