package com.dd.service.backend;

import com.dd.dto.UploadDTOs.UploadResponse;
import com.dd.model.Dataset;
import com.dd.model.Organization;
import com.dd.model.User;
import com.dd.repository.DatasetRepository;
import com.dd.repository.VectorChunkRepository;
import com.dd.service.rag.EmbeddingService;
import com.dd.util.CSVParser;
import com.dd.util.FileValidator;
import com.dd.util.PDFParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UploadService {

    private final DatasetRepository datasetRepository;
    private final VectorChunkRepository vectorChunkRepository;
    private final EmbeddingService embeddingService;
    private final FileValidator fileValidator;
    private final CSVParser csvParser;
    private final PDFParser pdfParser;
    private final AuditService auditService;

    @Value("${rag.data.raw-path}")
    private String rawPath;

    public UploadResponse upload(MultipartFile file, Organization org, User user) throws IOException {
        fileValidator.validate(file);

        String ext = fileValidator.getExtension(file.getOriginalFilename()).toLowerCase();
        String storagePath = saveFile(file, org.getId());

        Dataset dataset = Dataset.builder()
                .fileName(file.getOriginalFilename())
                .fileType(ext)
                .storagePath(storagePath)
                .status(Dataset.ProcessingStatus.PENDING)
                .organization(org)
                .uploadedBy(user)
                .build();
        dataset = datasetRepository.save(dataset);

        auditService.log("FILE_UPLOAD", "File: " + file.getOriginalFilename(), user.getEmail(), org);

        processAsync(dataset.getId());

        return UploadResponse.builder()
                .datasetId(dataset.getId())
                .fileName(dataset.getFileName())
                .fileType(dataset.getFileType())
                .status(Dataset.ProcessingStatus.PENDING)
                .message("File uploaded. Embedding in progress.")
                .uploadedAt(LocalDateTime.now())
                .build();
    }

    @Async
    public void processAsync(Long datasetId) {
        Dataset dataset = datasetRepository.findById(datasetId).orElseThrow();
        dataset.setStatus(Dataset.ProcessingStatus.PROCESSING);
        datasetRepository.save(dataset);

        try {
            File file = new File(dataset.getStoragePath());
            List<String> chunks = parseFile(file, dataset.getFileType());

            int index = 0;
            for (String chunk : chunks) {
                if (chunk.isBlank()) continue;
                List<Double> embedding = embeddingService.embed(chunk);
                String vectorStr = embeddingService.toVectorString(embedding);

                vectorChunkRepository.insertWithEmbedding(
                        chunk,
                        vectorStr,
                        index++,
                        dataset.getId(),
                        dataset.getOrganization().getId()
                );
            }

            dataset.setChunkCount(index);
            dataset.setStatus(Dataset.ProcessingStatus.DONE);
            log.info("Dataset {} processed: {} chunks embedded", datasetId, index);

        } catch (Exception e) {
            log.error("Failed to process dataset {}: {}", datasetId, e.getMessage(), e);
            dataset.setStatus(Dataset.ProcessingStatus.FAILED);
        }

        datasetRepository.save(dataset);
    }

    private List<String> parseFile(File file, String fileType) {
        return switch (fileType.toLowerCase()) {
            case "csv" -> csvParser.parse(file);
            case "pdf" -> pdfParser.parse(file);
            case "txt" -> parseTxt(file);
            default -> throw new RuntimeException("Unsupported file type: " + fileType);
        };
    }

    private List<String> parseTxt(File file) {
        try {
            String content = Files.readString(file.toPath());
            int chunkSize = 800;
            int overlap = 100;
            java.util.List<String> chunks = new java.util.ArrayList<>();
            int start = 0;
            while (start < content.length()) {
                int end = Math.min(start + chunkSize, content.length());
                chunks.add(content.substring(start, end).trim());
                start += chunkSize - overlap;
            }
            return chunks;
        } catch (IOException e) {
            throw new RuntimeException("Failed to read TXT file: " + e.getMessage());
        }
    }

    private String saveFile(MultipartFile file, Long orgId) throws IOException {
        Path dir = Paths.get(rawPath, "org_" + orgId);
        Files.createDirectories(dir);

        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return target.toString();
    }

    public List<Dataset> getDatasetsForOrg(Long orgId) {
        return datasetRepository.findByOrganizationId(orgId);
    }
}