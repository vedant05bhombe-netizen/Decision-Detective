package com.dd.service.backend;

import com.dd.model.Organization;
import com.dd.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrgService {

    private final OrganizationRepository orgRepository;

    public Organization createOrg(String name, String description) {
        Organization org = Organization.builder()
                .name(name)
                .description(description)
                .build();
        return orgRepository.save(org);
    }

    public Organization getOrgById(Long id) {
        return orgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found: " + id));
    }

    public List<Organization> getAllOrgs() {
        return orgRepository.findAll();
    }
}
