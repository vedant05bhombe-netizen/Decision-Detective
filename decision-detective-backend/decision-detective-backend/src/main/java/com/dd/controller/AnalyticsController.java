package com.dd.controller;

import com.dd.model.AuditLog;
import com.dd.model.Dataset;
import com.dd.model.Decision;
import com.dd.model.User;
import com.dd.repository.DecisionRepository;
import com.dd.repository.UserRepository;
import com.dd.service.backend.AuditService;
import com.dd.service.backend.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AuditService auditService;
    private final UploadService uploadService;
    private final DecisionRepository decisionRepository;
    private final UserRepository userRepository;

    private Long resolveOrgId(Authentication auth, Long orgId) {
        if (orgId != null) return orgId;
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getOrganization() == null) return null;
        return user.getOrganization().getId();
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            Authentication auth,
            @RequestParam(required = false) Long orgId) {

        Long resolvedOrgId = resolveOrgId(auth, orgId);

        Map<String, Object> summary = new HashMap<>();

        if (resolvedOrgId == null) {
            summary.put("totalDecisions", 0);
            summary.put("verdictYes", 0);
            summary.put("verdictNo", 0);
            summary.put("verdictMaybe", 0);
            summary.put("totalDatasets", 0);
            summary.put("processedDatasets", 0);
            return ResponseEntity.ok(summary);
        }

        List<Decision> decisions = decisionRepository.findByOrganizationIdOrderByCreatedAtDesc(resolvedOrgId);
        List<Dataset> datasets = uploadService.getDatasetsForOrg(resolvedOrgId);

        long yes   = decisions.stream().filter(d -> "YES".equals(d.getVerdict())).count();
        long no    = decisions.stream().filter(d -> "NO".equals(d.getVerdict())).count();
        long maybe = decisions.stream().filter(d -> "MAYBE".equals(d.getVerdict())).count();

        summary.put("totalDecisions", decisions.size());
        summary.put("verdictYes", yes);
        summary.put("verdictNo", no);
        summary.put("verdictMaybe", maybe);
        summary.put("totalDatasets", datasets.size());
        summary.put("processedDatasets", datasets.stream()
                .filter(d -> Dataset.ProcessingStatus.DONE.equals(d.getStatus())).count());

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/audit")
    public ResponseEntity<List<AuditLog>> getAuditLogs(
            Authentication auth,
            @RequestParam(required = false) Long orgId) {

        Long resolvedOrgId = resolveOrgId(auth, orgId);

        if (resolvedOrgId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        return ResponseEntity.ok(auditService.getLogsForOrg(resolvedOrgId));
    }
}