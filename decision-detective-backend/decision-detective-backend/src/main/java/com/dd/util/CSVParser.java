package com.dd.util;

import com.opencsv.CSVReader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
public class CSVParser {


    public List<String> parse(File file) {
        List<String> chunks = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new FileReader(file))) {
            String[] headers = reader.readNext();
            if (headers == null) return chunks;

            String[] row;
            while ((row = reader.readNext()) != null) {
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < headers.length && i < row.length; i++) {
                    sb.append(headers[i].trim()).append(": ").append(row[i].trim());
                    if (i < headers.length - 1) sb.append(" | ");
                }
                if (!sb.isEmpty()) {
                    chunks.add(sb.toString());
                }
            }
        } catch (Exception e) {
            log.error("Error parsing CSV: {}", file.getName(), e);
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }

        log.info("CSV parsed: {} chunks from {}", chunks.size(), file.getName());
        return chunks;
    }
}
