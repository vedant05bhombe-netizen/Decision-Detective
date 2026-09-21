package com.dd.dto;

import com.dd.model.Dataset;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

public class UploadDTOs {

    @Data
    @Builder
    public static class UploadResponse {
        private Long datasetId;
        private String fileName;
        private String fileType;
        private Dataset.ProcessingStatus status;
        private String message;
        private LocalDateTime uploadedAt;
    }
}
