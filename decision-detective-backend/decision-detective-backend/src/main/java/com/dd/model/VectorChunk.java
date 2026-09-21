package com.dd.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "vector_chunks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VectorChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "embedding", columnDefinition = "vector(3072)")
    private String embedding;

    @Column(name = "chunk_index")
    private Integer chunkIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dataset_id")
    private Dataset dataset;

    @Column(name = "organization_id")
    private Long organizationId;
}