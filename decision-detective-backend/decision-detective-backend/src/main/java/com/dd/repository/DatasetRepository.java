package com.dd.repository;

import com.dd.model.Dataset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DatasetRepository extends JpaRepository<Dataset, Long> {
    List<Dataset> findByOrganizationId(Long orgId);
    List<Dataset> findByOrganizationIdAndStatus(Long orgId, Dataset.ProcessingStatus status);
}
