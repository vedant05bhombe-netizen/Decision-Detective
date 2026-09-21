package com.dd.repository;

import com.dd.model.Decision;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DecisionRepository extends JpaRepository<Decision, Long> {
    List<Decision> findByOrganizationIdOrderByCreatedAtDesc(Long orgId);
    List<Decision> findByAskedByIdOrderByCreatedAtDesc(Long userId);
}
