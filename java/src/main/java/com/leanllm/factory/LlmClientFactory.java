package com.leanllm.factory;

import com.leanllm.client.LlmClient;
import com.leanllm.client.cloud.CloudLlmClient;
import com.leanllm.client.local.LocalLlmClient;
import com.leanllm.security.SecureSecret;
import java.net.URI;
import java.time.Duration;

/**
 * @summary Factory for instantiating validated LLM transport clients.
 */
public final class LlmClientFactory {
    private LlmClientFactory() {}

    public static LlmClient createCloud(URI endpoint, SecureSecret apiKey, Duration timeout) {
        return new CloudLlmClient(endpoint, apiKey, timeout);
    }

    public static LlmClient createLocal(URI loopbackUri, Duration timeout) {
        return new LocalLlmClient(loopbackUri, timeout);
    }
}
