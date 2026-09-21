package com.dd.repository;

import com.dd.model.VectorChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface VectorChunkRepository extends JpaRepository<VectorChunk, Long> {

    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO vector_chunks (content, embedding, chunk_index, dataset_id, organization_id)
        VALUES (:content, CAST(:embedding AS vector), :chunkIndex, :datasetId, :orgId)
        """, nativeQuery = true)
    void insertWithEmbedding(
            @Param("content") String content,
            @Param("embedding") String embedding,
            @Param("chunkIndex") int chunkIndex,
            @Param("datasetId") Long datasetId,
            @Param("orgId") Long orgId
    );

    @Query(value = """
        SELECT vc.*
        FROM vector_chunks vc
        WHERE vc.organization_id = :orgId
        ORDER BY vc.embedding <=> CAST(:queryVector AS vector)
        LIMIT :topK
        """, nativeQuery = true)
    List<VectorChunk> findSimilarChunks(
            @Param("orgId") Long orgId,
            @Param("queryVector") String queryVector,
            @Param("topK") int topK
    );

    List<VectorChunk> findByDatasetId(Long datasetId);

    @Modifying
    @Transactional
    void deleteByDatasetId(Long datasetId);
}