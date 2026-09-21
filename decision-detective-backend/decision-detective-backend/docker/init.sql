-- Run this ONCE in your PostgreSQL database before starting the app
-- psql -U postgres -d decision_detective -f init.sql

-- 1. Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. The app will auto-create tables via Hibernate DDL (spring.jpa.hibernate.ddl-auto=update)
-- But we need to manually alter vector_chunks to use vector type after table creation:
-- Run this AFTER first app startup:
-- ALTER TABLE vector_chunks ALTER COLUMN embedding TYPE vector(1536) USING embedding::vector(1536);

-- 3. Create HNSW index for fast similarity search (run after data is loaded):
-- CREATE INDEX ON vector_chunks USING hnsw (embedding vector_cosine_ops);
