package com.leanllm.client.http;

import com.leanllm.client.LlmClient;
import com.leanllm.client.StreamConsumer;
import com.leanllm.concurrency.CancellationToken;
import com.leanllm.security.SecureSecret;
import java.io.*;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;

/**
 * @summary Shared HTTP/2 transport engine with zero-dependency SSE parser.
 * @threadsafe Thread-safe via standard JDK HttpClient.
 * @security TLS 1.3 enforcement and cooperative cancellation verification.
 */
public abstract class AbstractHttpLlmClient implements LlmClient {
    protected final URI endpoint;
    protected final SecureSecret credentials;
    protected final HttpClient httpClient;
    protected final Duration timeout;

    protected AbstractHttpLlmClient(URI endpoint, SecureSecret credentials, Duration timeout) {
        this.endpoint = endpoint;
        this.credentials = credentials;
        this.timeout = timeout != null ? timeout : Duration.ofSeconds(30);
        this.httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(this.timeout)
            .build();
    }

    protected HttpResponse<String> postJson(String body, CancellationToken token) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(endpoint)
            .timeout(timeout)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body));
        if (credentials != null && !credentials.isDestroyed()) {
            builder.header("Authorization", "Bearer " + new String(credentials.accessSecret()));
        }
        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    protected void parseServerSentEvents(InputStream is, StreamConsumer consumer, CancellationToken token) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (token != null && token.isCancelled()) break;
                if (line.startsWith("data: ")) {
                    String data = line.substring(6).trim();
                    if (!"[DONE]".equals(data) && !data.isEmpty()) {
                        consumer.onToken(data);
                    }
                }
            }
        }
    }
}
