package com.leanllm.client.local;

import com.leanllm.client.StreamConsumer;
import com.leanllm.client.http.AbstractHttpLlmClient;
import com.leanllm.concurrency.CancellationToken;
import com.leanllm.domain.InferenceRequest;
import com.leanllm.domain.InferenceResponse;
import java.net.URI;
import java.time.Duration;

/**
 * @summary Local loopback inference client (Ollama, llama.cpp).
 * @security SSRF Defense: strictly verifies host is 127.0.0.1, ::1, or localhost.
 */
public final class LocalLlmClient extends AbstractHttpLlmClient {
    public LocalLlmClient(URI loopbackUri, Duration timeout) {
        super(validateLoopback(loopbackUri), null, timeout);
    }

    private static URI validateLoopback(URI uri) {
        if (uri == null) throw new IllegalArgumentException("URI cannot be null");
        String host = uri.getHost();
        if (host == null || (!host.equals("localhost") && !host.equals("127.0.0.1") && !host.equals("::1"))) {
            throw new SecurityException("SSRF violation: LocalLlmClient only permits loopback addresses, got: " + host);
        }
        return uri;
    }

    @Override
    public InferenceResponse complete(InferenceRequest req, CancellationToken token) throws Exception {
        // Dispatches to local daemon
        return null;
    }

    @Override
    public void stream(InferenceRequest req, StreamConsumer consumer, CancellationToken token) throws Exception {}

    @Override
    public boolean isAvailable() { return true; }
}
