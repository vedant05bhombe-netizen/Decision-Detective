package com.dd.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Component
public class FileValidator {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "text/csv", "text/plain",
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "csv", "txt", "pdf", "xlsx"
    );

    private static final long MAX_SIZE_BYTES = 50L * 1024 * 1024; // 50MB

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty or null");
        }

        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new RuntimeException("File too large. Max allowed: 50MB");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            throw new RuntimeException("File name is null");
        }

        String ext = getExtension(originalName).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new RuntimeException("Unsupported file type: " + ext + ". Allowed: csv, txt, pdf, xlsx");
        }
    }

    public String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1) : "";
    }
}
