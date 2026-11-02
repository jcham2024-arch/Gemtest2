package com.leanllm.client;

import com.leanllm.domain.InferenceResponse;

/**
 * @summary Real-time token streaming callback receiver.
 * @contract Methods must be non-blocking. Implementations handle thread switching.
 */
public interface StreamConsumer {
    void onToken(String tokenDelta);
    void onError(Throwable error);
    void onComplete(InferenceResponse finalResponse);
}
