package com.dd.service.rag;

import com.dd.model.Decision;
import com.dd.model.Organization;
import com.dd.model.User;
import com.dd.repository.DecisionRepository;
import com.dd.service.backend.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DecisionReasoningService {

    private final RAGPipelineService ragPipelineService;
    private final FlipAnalysisService flipAnalysisService;
    private final DecisionRepository decisionRepository;
    private final AuditService auditService;

    public Decision makeDecision(String question, Organization org, User user, boolean includeFlip) {
        log.info("Making decision for org={} question={}", org.getId(), question);


        RAGPipelineService.RAGResult result = ragPipelineService.process(question, org.getId());


        String flipAnalysis = null;
        if (includeFlip) {
            flipAnalysis = flipAnalysisService.analyze(question, result.getAnswer(), org.getId());
        }


        String contextStr = result.getRetrievedChunks().stream()
                .collect(Collectors.joining("\n---\n"));

        Decision decision = Decision.builder()
                .question(question)
                .answer(result.getAnswer())
                .verdict(result.getVerdict())
                .retrievedContext(contextStr)
                .flipAnalysis(flipAnalysis)
                .askedBy(user)
                .organization(org)
                .build();

        decision = decisionRepository.save(decision);


        auditService.log(
                "DECISION_MADE",
                "Q: " + question + " | Verdict: " + result.getVerdict(),
                user.getEmail(),
                org
        );

        return decision;
    }

    public List<Decision> getDecisionsForOrg(Long orgId) {
        return decisionRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
    }

    public Decision getDecisionById(Long id) {
        return decisionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Decision not found: " + id));
    }
}
