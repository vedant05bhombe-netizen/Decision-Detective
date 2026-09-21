package com.dd.repository;

import com.dd.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByOrganizationIdOrderByTimestampDesc(Long orgId);
}
