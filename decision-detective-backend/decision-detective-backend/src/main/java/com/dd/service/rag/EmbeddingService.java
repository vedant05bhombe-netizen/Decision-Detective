package com.dd.service.rag;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmbeddingService {

    private final WebClient geminiWebClient;
    private final String apiKey;
    private final String embeddingModel;

    public EmbeddingService(
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.model.embedding:gemini-embedding-001}") String embeddingModel) {

        this.apiKey = apiKey;
        this.embeddingModel = embeddingModel;
        this.geminiWebClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();

        log.info("EmbeddingService initialized with model: {}", embeddingModel);
    }

    public List<Double> embed(String text) {
        Map<String, Object> requestBody = Map.of(
                "model", "models/" + embeddingModel,
                "content", Map.of(
                        "parts", List.of(Map.of("text", text))
                )
        );

        String url = "/v1beta/models/" + embeddingModel + ":embedContent?key=" + apiKey;

        log.debug("Calling Gemini embedding URL: /v1beta/models/{}:embedContent", embeddingModel);

        Map response = geminiWebClient.post()
                .uri(url)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null || !response.containsKey("embedding")) {
            throw new RuntimeException("Invalid response from Gemini Embedding API: " + response);
        }

        Map<String, Object> embedding = (Map<String, Object>) response.get("embedding");
        return (List<Double>) embedding.get("values");
    }

    public float[] toFloatArray(List<Double> embedding) {
        float[] result = new float[embedding.size()];
        for (int i = 0; i < embedding.size(); i++) {
            result[i] = embedding.get(i).floatValue();
        }
        return result;
    }

    public String toVectorString(List<Double> embedding) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.size(); i++) {
            sb.append(embedding.get(i));
            if (i < embedding.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}