package com.dd.service.rag;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class FlipAnalysisService {

    private final WebClient geminiWebClient;
    private final String apiKey;
    private final String chatModel;

    private static final String FLIP_SYSTEM_PROMPT = """
            You are an expert business analyst who identifies what conditions would change a decision.
            Given a decision and its answer, identify 2-3 concrete scenarios that would FLIP the outcome.
            Be specific and practical. Format as:
            
            FLIP SCENARIO 1:
            Condition: [what would need to change]
            New Verdict: [YES/NO/MAYBE]
            Why: [brief explanation]
            
            FLIP SCENARIO 2: ...
            """;

    public FlipAnalysisService(
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.model.chat:gemini-2.0-flash}") String chatModel) {
        this.apiKey = apiKey;
        this.chatModel = chatModel;
        this.geminiWebClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }

    public String analyze(String question, String currentAnswer, Long orgId) {
        log.info("Running flip analysis for org={}", orgId);

        String fullPrompt = """
                %s
                
                ORIGINAL QUESTION: %s
                
                CURRENT DECISION:
                %s
                
                What 2-3 specific conditions or changes would FLIP this decision to a different outcome?
                """.formatted(FLIP_SYSTEM_PROMPT, question, currentAnswer);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", fullPrompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.4,
                        "maxOutputTokens", 800
                )
        );

        String url = "/v1beta/models/" + chatModel + ":generateContent?key=" + apiKey;

        Map response = geminiWebClient.post()
                .uri(url)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        return (String) parts.get(0).get("text");
    }
}