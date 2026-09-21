package com.dd.controller;

import com.dd.dto.DecisionDTOs.*;
import com.dd.model.Decision;
import com.dd.model.Organization;
import com.dd.model.User;
import com.dd.service.backend.OrgService;
import com.dd.service.backend.UserService;
import com.dd.service.rag.DecisionReasoningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/decisions")
@RequiredArgsConstructor
public class DecisionController {

    private final DecisionReasoningService decisionReasoningService;
    private final UserService userService;
    private final OrgService orgService;


    @PostMapping
    public ResponseEntity<DecisionResponse> ask(@RequestBody DecisionRequest request) {
        User user = userService.getCurrentUser();
        Organization org = orgService.getOrgById(request.getOrganizationId());

        Decision decision = decisionReasoningService.makeDecision(
                request.getQuestion(), org, user, request.isIncludeFlipAnalysis()
        );

        return ResponseEntity.ok(toResponse(decision));
    }

    @GetMapping
    public ResponseEntity<List<DecisionResponse>> getDecisions(
            @RequestParam(required = false) Long orgId) {

        if (orgId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Decision> decisions = decisionReasoningService.getDecisionsForOrg(orgId);
        List<DecisionResponse> responses = decisions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }


    @GetMapping("/{id}")
    public ResponseEntity<DecisionResponse> getById(@PathVariable Long id) {
        Decision decision = decisionReasoningService.getDecisionById(id);
        return ResponseEntity.ok(toResponse(decision));
    }

    private DecisionResponse toResponse(Decision d) {
        return DecisionResponse.builder()
                .id(d.getId())
                .question(d.getQuestion())
                .answer(d.getAnswer())
                .verdict(d.getVerdict())
                .flipAnalysis(d.getFlipAnalysis())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
