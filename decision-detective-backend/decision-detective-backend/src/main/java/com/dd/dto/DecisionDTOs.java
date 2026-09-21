package com.dd.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

public class DecisionDTOs {

    @Data
    public static class DecisionRequest {
        private String question;
        private Long organizationId;
        private boolean includeFlipAnalysis = true;
    }

    @Data
    @Builder
    public static class DecisionResponse {
        private Long id;
        private String question;
        private String answer;
        private String reasoning;
        private String verdict;
        private String flipAnalysis;
        private List<String> sourceChunks;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class FlipResponse {
        private Long decisionId;
        private String originalVerdict;
        private List<FlipScenario> scenarios;
    }

    @Data
    @Builder
    public static class FlipScenario {
        private String condition;
        private String newVerdict;
        private String explanation;
    }
}
