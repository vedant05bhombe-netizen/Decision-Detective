package com.dd.service.rag;

import com.dd.model.VectorChunk;
import com.dd.repository.VectorChunkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RetrievalService {

    private final EmbeddingService embeddingService;
    private final VectorChunkRepository vectorChunkRepository;

    private static final int DEFAULT_TOP_K = 5;


    public List<String> retrieveRelevantChunks(String question, Long orgId) {
        return retrieveRelevantChunks(question, orgId, DEFAULT_TOP_K);
    }

    public List<String> retrieveRelevantChunks(String question, Long orgId, int topK) {
        log.info("Retrieving top {} chunks for org {} | question: {}", topK, orgId, question);

        List<Double> queryEmbedding = embeddingService.embed(question);
        String vectorStr = embeddingService.toVectorString(queryEmbedding);

        List<VectorChunk> chunks = vectorChunkRepository.findSimilarChunks(orgId, vectorStr, topK);

        log.info("Retrieved {} relevant chunks", chunks.size());

        return chunks.stream()
                .map(VectorChunk::getContent)
                .collect(Collectors.toList());
    }
}
