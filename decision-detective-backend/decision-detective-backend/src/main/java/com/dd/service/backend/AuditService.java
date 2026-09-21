package com.dd.service.backend;

import com.dd.model.AuditLog;
import com.dd.model.Organization;
import com.dd.repository.AuditRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditRepository auditRepository;

    public void log(String action, String details, String performedBy, Organization org) {
        AuditLog audit = AuditLog.builder()
                .action(action)
                .details(details)
                .performedBy(performedBy)
                .organization(org)
                .build();
        auditRepository.save(audit);
        log.info("[AUDIT] {} | {} | {}", action, performedBy, details);
    }

    public List<AuditLog> getLogsForOrg(Long orgId) {
        return auditRepository.findByOrganizationIdOrderByTimestampDesc(orgId);
    }
}
