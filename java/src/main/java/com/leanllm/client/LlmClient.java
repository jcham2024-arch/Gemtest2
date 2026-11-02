package com.leanllm.client;

import com.leanllm.concurrency.CancellationToken;
import com.leanllm.domain.InferenceRequest;
import com.leanllm.domain.InferenceResponse;

/**
 * @summary Operational contract for LLM inference backends.
 * @contract Passes CancellationToken through all blocking/streaming operations.
 */
public interface LlmClient {
    InferenceResponse complete(InferenceRequest req, CancellationToken token) throws Exception;
    void stream(InferenceRequest req, StreamConsumer consumer, CancellationToken token) throws Exception;
    boolean isAvailable();
}
