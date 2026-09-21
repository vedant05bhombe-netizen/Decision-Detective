package com.dd.service.rag;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class RAGPipelineService {

    private final RetrievalService retrievalService;
    private final WebClient geminiWebClient;
    private final String apiKey;
    private final String chatModel;

    private static final String SYSTEM_PROMPT = """
            You are Decision Detective — an expert decision-making assistant for organizations.
            You analyze company-specific data and provide clear, reasoned decisions.
            
            Rules:
            1. Base your answer ONLY on the provided context.
            2. Always give a clear verdict: YES, NO, or MAYBE.
            3. Explain your reasoning step by step.
            4. If context is insufficient, say so clearly.
            5. Be concise and professional.
            """;

    public RAGPipelineService(
            RetrievalService retrievalService,
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.model.chat:gemini-1.5-flash}") String chatModel) {

        this.retrievalService = retrievalService;
        this.apiKey = apiKey;
        this.chatModel = chatModel;
        this.geminiWebClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();

        log.info("RAGPipelineService initialized with Gemini model: {}", chatModel);
    }

    public RAGResult process(String question, Long orgId) {
        // Step 1: Retrieve
        List<String> chunks = retrievalService.retrieveRelevantChunks(question, orgId);

        // Step 2: Build context
        String context = buildContext(chunks);

        // Step 3: Build prompt
        String fullPrompt = """
                %s
                
                COMPANY CONTEXT:
                %s
                
                QUESTION:
                %s
                
                Based ONLY on the above company context, provide:
                1. VERDICT: (YES / NO / MAYBE)
                2. REASONING: (step by step)
                3. KEY FACTS USED: (bullet points from context)
                """.formatted(SYSTEM_PROMPT, context, question);

        // Step 4: Call Gemini
        String llmResponse = callGemini(fullPrompt);

        return RAGResult.builder()
                .answer(llmResponse)
                .retrievedChunks(chunks)
                .verdict(extractVerdict(llmResponse))
                .build();
    }

    private String buildContext(List<String> chunks) {
        if (chunks.isEmpty()) return "No company data found.";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < chunks.size(); i++) {
            sb.append("--- Chunk ").append(i + 1).append(" ---\n");
            sb.append(chunks.get(i)).append("\n\n");
        }
        return sb.toString();
    }

    private String callGemini(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "maxOutputTokens", 1500
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

    private String extractVerdict(String response) {
        String upper = response.toUpperCase();
        if (upper.contains("VERDICT: YES") || upper.contains("VERDICT:YES")) return "YES";
        if (upper.contains("VERDICT: NO") || upper.contains("VERDICT:NO")) return "NO";
        if (upper.contains("VERDICT: MAYBE") || upper.contains("VERDICT:MAYBE")) return "MAYBE";
        return "UNDETERMINED";
    }

    @lombok.Builder
    @lombok.Data
    public static class RAGResult {
        private String answer;
        private String verdict;
        private List<String> retrievedChunks;
    }
}