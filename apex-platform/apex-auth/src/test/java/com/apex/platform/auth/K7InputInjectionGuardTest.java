package com.apex.platform.auth;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class K7InputInjectionGuardTest {

    @Test
    void disarmedGuardBlocksInjection() {
        InputInjectionGuard guard = new InputInjectionGuard(10);
        assertThat(guard.isArmed()).isFalse();

        assertThatThrownBy(() -> guard.checkInjectionAllowed("textField", "username"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("dead-man switch is disarmed");
    }

    @Test
    void armedGuardBlocksPasswordFields() {
        InputInjectionGuard guard = new InputInjectionGuard(10);
        guard.arm();

        assertThatThrownBy(() -> guard.checkInjectionAllowed("passwordField", "userPassword"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("password field target detected");

        assertThatThrownBy(() -> guard.checkInjectionAllowed("entry", "pinCode"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("password field target detected");
    }

    @Test
    void armedGuardAllowsStandardInputWithinRateLimit() {
        InputInjectionGuard guard = new InputInjectionGuard(5);
        guard.arm();

        for (int i = 0; i < 5; i++) {
            assertThatCode(() -> guard.checkInjectionAllowed("textField", "searchQuery"))
                    .doesNotThrowAnyException();
        }

        // 6th event exceeds limit
        assertThatThrownBy(() -> guard.checkInjectionAllowed("textField", "searchQuery"))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("rate limit exceeded");
    }
}
