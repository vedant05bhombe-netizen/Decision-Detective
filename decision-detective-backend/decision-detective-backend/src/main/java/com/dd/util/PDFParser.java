package com.dd.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class PDFParser {

    private static final int CHUNK_SIZE = 800;
    private static final int OVERLAP = 100;

    public List<String> parse(File file) {
        List<String> chunks = new ArrayList<>();

        try (PDDocument doc = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String fullText = stripper.getText(doc).trim();
            chunks = splitIntoChunks(fullText);
        } catch (Exception e) {
            log.error("Error parsing PDF: {}", file.getName(), e);
            throw new RuntimeException("Failed to parse PDF file: " + e.getMessage());
        }

        log.info("PDF parsed: {} chunks from {}", chunks.size(), file.getName());
        return chunks;
    }

    private List<String> splitIntoChunks(String text) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isEmpty()) return chunks;

        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + CHUNK_SIZE, text.length());
            chunks.add(text.substring(start, end).trim());
            start += CHUNK_SIZE - OVERLAP;
        }

        return chunks;
    }
}