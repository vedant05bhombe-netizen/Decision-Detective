# Decision Detective - Backend

RAG-based decision intelligence system built with Spring Boot + pgvector.

## Tech Stack
- **Spring Boot 3.2** — Web, Security, JPA
- **PostgreSQL + pgvector** — Vector similarity search
- **OpenAI API** — Embeddings (text-embedding-3-small) + Chat (gpt-4o)
- **JWT** — Stateless authentication
- **Swagger UI** — API docs at `/swagger-ui.html`

---

## Project Structure
```
src/main/java/com/dd/
├── config/           ← PURE BACKEND (Security, JWT, CORS, Swagger, OpenAI client)
├── controller/       ← PURE BACKEND (REST API endpoints)
├── service/
│   ├── backend/      ← PURE BACKEND (Auth, Upload, Audit, Org)
│   └── rag/          ← ⭐ RAG CORE (Embedding, Retrieval, Pipeline, Flip Analysis)
├── repository/       ← PURE BACKEND (JPA repos + pgvector native query)
├── model/            ← Entities (User, Org, Decision, Dataset, VectorChunk, AuditLog)
├── dto/              ← Request/Response DTOs
├── util/             ← File parsers (CSV, PDF, TXT)
└── exception/        ← Global error handler

rag-data/
├── raw-files/        ← ⭐ RAG DATA: uploaded company files go here
├── processed/        ← ⭐ RAG DATA: chunks and metadata
└── vector-db/        ← reference folder (actual vectors live in pgvector)
```

---

## Setup

### 1. Start PostgreSQL with pgvector
```bash
docker-compose up -d
```

### 2. Set environment variables
```bash
export OPENAI_API_KEY=sk-...
export JWT_SECRET=YourSuperSecretKeyMakeItLong
```

### 3. Run the app
```bash
mvn spring-boot:run
```

### 4. After first startup — enable vector column
Connect to your DB and run:
```sql
ALTER TABLE vector_chunks 
ALTER COLUMN embedding TYPE vector(1536) 
USING embedding::vector(1536);

-- Optional: HNSW index for fast search
CREATE INDEX ON vector_chunks USING hnsw (embedding vector_cosine_ops);
```

---

## API Endpoints

### Auth
```
POST /api/auth/register    → Register user
POST /api/auth/login       → Login, get JWT token
```

### Upload (RAG Data Ingestion)
```
POST /api/upload?orgId=1   → Upload CSV/PDF/TXT → embed → store in pgvector
GET  /api/upload/datasets?orgId=1 → List uploaded files
```

### Decisions (RAG Query)
```
POST /api/decisions        → Ask a question, get AI decision
GET  /api/decisions?orgId=1 → Get decision history
GET  /api/decisions/{id}   → Get single decision
```

### Analytics
```
GET /api/analytics/summary?orgId=1 → Verdict counts, dataset stats
GET /api/analytics/audit?orgId=1   → Audit log
```

### Swagger UI
```
http://localhost:8080/swagger-ui.html
```

---

## RAG Flow
```
User uploads file
      ↓
UploadController → UploadService
      ↓
CSVParser / PDFParser / TxtParser → chunks
      ↓
EmbeddingService → OpenAI Embeddings API → float[1536]
      ↓
VectorChunkRepository → pgvector (vector_chunks table)

User asks question
      ↓
DecisionController → DecisionReasoningService
      ↓
RAGPipelineService:
  1. EmbeddingService.embed(question)
  2. RetrievalService → pgvector cosine search → top 5 chunks
  3. OpenAI Chat API (context + question)
  4. FlipAnalysisService → what would change the decision
      ↓
Decision saved to DB + AuditLog
      ↓
Response to frontend
```

---

## RAG Data (rag-data/)
Drop your company files in `rag-data/raw-files/` OR upload via API.

Supported formats:
- `.csv` — HR data, employee records, budgets
- `.pdf` — Policies, reports, documents
- `.txt` — Notes, emails, memos
