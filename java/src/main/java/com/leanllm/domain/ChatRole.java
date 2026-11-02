package com.leanllm.domain;

/**
 * @summary Canonical participant roles in an agent conversational session.
 * @contract Lowercase wire representation via roleName().
 */
public enum ChatRole {
    SYSTEM, USER, ASSISTANT, TOOL;

    public String roleName() {
        return name().toLowerCase();
    }
}
