package com.dd.controller;

import com.dd.dto.UploadDTOs.UploadResponse;
import com.dd.model.Dataset;
import com.dd.model.Organization;
import com.dd.model.User;
import com.dd.service.backend.OrgService;
import com.dd.service.backend.UploadService;
import com.dd.service.backend.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;
    private final UserService userService;
    private final OrgService orgService;


    @PostMapping
    public ResponseEntity<UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "orgId", required = false) Long orgId
    ) throws IOException {

        User user = userService.getCurrentUser();
        Organization org = orgId != null
                ? orgService.getOrgById(orgId)
                : user.getOrganization();

        UploadResponse response = uploadService.upload(file, org, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/datasets")
    public ResponseEntity<List<Dataset>> getDatasets(
            @RequestParam(required = false) Long orgId) {

        if (orgId == null) {
            User user = userService.getCurrentUser();
            if (user.getOrganization() == null) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            orgId = user.getOrganization().getId();
        }

        return ResponseEntity.ok(uploadService.getDatasetsForOrg(orgId));
    }
}