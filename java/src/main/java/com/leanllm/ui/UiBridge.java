package com.leanllm.ui;

/**
 * @summary Event-driven decoupling bridge between agent core and presentation layers.
 * @contract Non-blocking; implementations dispatch to appropriate thread (e.g. JavaFX Platform.runLater).
 */
public interface UiBridge {
    void onStatus(String status);
    void onToken(String tokenDelta);
    void onToolStart(String toolName, String args);
    void onToolEnd(String toolName, String output);
    void onError(String message, Throwable cause);
}
