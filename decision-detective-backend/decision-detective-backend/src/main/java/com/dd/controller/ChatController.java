package com.dd.controller;

import com.dd.model.Decision;
import com.dd.model.Organization;
import com.dd.model.User;
import com.dd.service.backend.OrgService;
import com.dd.service.backend.UserService;
import com.dd.service.rag.DecisionReasoningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final DecisionReasoningService decisionReasoningService;
    private final UserService userService;
    private final OrgService orgService;


    @PostMapping
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> body) {
        String message = (String) body.get("message");
        String chatId  = (String) body.getOrDefault("chatId", null);

        if (message == null || message.isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("response", "Please provide a message.");
            return ResponseEntity.badRequest().body(err);
        }

        log.info("[CHAT] message={} chatId={}", message, chatId);

        User user = userService.getCurrentUser();
        Organization org = user.getOrganization();

        Map<String, Object> result = new HashMap<>();


        if (org == null) {
            result.put("response", "You are not associated with any organization. Please contact your admin.");
            return ResponseEntity.ok(result);
        }

        try {
            Decision decision = decisionReasoningService.makeDecision(message, org, user, true);

            result.put("response", decision.getAnswer());
            result.put("decision", Map.of(
                    "id",         decision.getId(),
                    "confidence", mapVerdictToConfidence(decision.getVerdict()),
                    "createdBy",  user.getName(),
                    "createdAt",  decision.getCreatedAt(),
                    "context",    decision.getRetrievedContext() != null
                            ? decision.getRetrievedContext().substring(0,
                            Math.min(200, decision.getRetrievedContext().length()))
                            : ""
            ));

            if (decision.getFlipAnalysis() != null) {
                result.put("flipAnalysis", decision.getFlipAnalysis());
            }

        } catch (Exception e) {
            log.error("[CHAT] Error processing message: {}", e.getMessage());
            result.put("response", "Sorry, I encountered an error processing your request: " + e.getMessage());
        }

        return ResponseEntity.ok(result);
    }

    private String mapVerdictToConfidence(String verdict) {
        if (verdict == null) return "Medium";
        return switch (verdict.toUpperCase()) {
            case "YES"   -> "High";
            case "NO"    -> "Low";
            case "MAYBE" -> "Medium";
            default      -> "Medium";
        };
    }
}