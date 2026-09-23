# 🕵️ Decision Detective

> **AI-powered document intelligence and decision analysis using Retrieval-Augmented Generation (RAG).**

Decision Detective is a full-stack AI application that allows organizations to upload business documents and ask questions about their data.

The system retrieves relevant information from uploaded documents, generates embeddings, performs vector similarity search, and passes the retrieved context to a Gemini language model to produce a structured decision with:

* **YES / NO / MAYBE verdict**
* Step-by-step reasoning
* Key facts from the retrieved context
* Retrieved document context
* Flip/scenario analysis

The application combines a traditional **Spring Boot backend** with a **React frontend** and an AI-powered **RAG pipeline backed by PostgreSQL + pgvector**.

---

## ✨ Features

### 📄 Document Intelligence

* Upload **PDF, CSV, and TXT** documents
* Validate uploaded files
* Store documents by organization
* Process documents asynchronously
* Split documents into smaller chunks
* Generate embeddings for document chunks
* Track processing status and chunk count

### 🧠 RAG-Based Decision Analysis

* Convert documents into vector embeddings
* Store embeddings in PostgreSQL using `pgvector`
* Convert user questions into embeddings
* Retrieve the most relevant document chunks
* Build a context-aware prompt
* Generate a decision using Gemini
* Extract a structured `YES / NO / MAYBE` verdict

### 🔄 Flip Analysis

After generating a decision, the system can perform a second AI analysis to determine:

> What conditions or changes could cause the current decision to change?

This allows users to explore alternative scenarios rather than only receiving a static answer.

### 🔐 Authentication & Security

* User registration and login
* JWT-based authentication
* BCrypt password hashing
* Stateless Spring Security configuration
* Protected API endpoints
* Organization-based data isolation

### 📊 Organization Dashboard

The dashboard provides an overview of:

* Total decisions
* YES verdicts
* NO verdicts
* Uploaded datasets
* Dataset processing status
* Recent decisions
* Audit activity

### 🌐 Web Application

The React frontend includes:

* Login
* Registration
* Dashboard
* Document upload
* AI chat / decision analysis
* Protected routes
* API integration through Axios
* Markdown response rendering
* Animated UI interactions

---

## 🧠 How the RAG Pipeline Works

Decision Detective follows this workflow:

```text
                    USER
                      │
                      ▼
              Upload Document
                      │
                      ▼
             File Validation
                      │
                      ▼
          PDF / CSV / TXT Parsing
                      │
                      ▼
               Text Chunking
                      │
                      ▼
             Gemini Embeddings
                      │
                      ▼
          PostgreSQL + pgvector
                      │
                      │
              ───── QUERY ─────
                      │
                      ▼
             User Question
                      │
                      ▼
             Gemini Embedding
                      │
                      ▼
          Vector Similarity Search
                      │
                      ▼
             Top Relevant Chunks
                      │
                      ▼
              Context Building
                      │
                      ▼
            Gemini 2.5 Flash
                      │
                      ▼
          Structured AI Analysis
                      │
             ┌────────┴────────┐
             ▼                 ▼
          Verdict         Reasoning
        YES/NO/MAYBE       + Key Facts
             │
             ▼
        Flip Analysis
             │
             ▼
             USER
```

---

## 🔎 Retrieval Process

When a user asks a question, the backend:

1. Generates an embedding for the question using Gemini.
2. Converts the embedding into a PostgreSQL vector.
3. Searches the organization's stored vectors.
4. Uses vector similarity to find the most relevant chunks.
5. Retrieves the top **5** matching chunks by default.
6. Builds a context containing those chunks.
7. Sends the context and question to Gemini.
8. Extracts the resulting verdict.
9. Stores the decision and retrieved context.
10. Optionally performs flip analysis.

The vector search uses PostgreSQL's `pgvector` similarity operator.

```text
Question
   ↓
Embedding
   ↓
Vector
   ↓
pgvector similarity search
   ↓
Top-K chunks
   ↓
LLM context
   ↓
Decision
```

---

## 🏗️ System Architecture

```text
┌───────────────────────────────────────┐
│              React Frontend           │
│                                       │
│  Login │ Register │ Chat │ Upload     │
│              Dashboard                │
└───────────────────┬───────────────────┘
                    │
                    │ REST API
                    ▼
┌───────────────────────────────────────┐
│          Spring Boot Backend          │
│                                       │
│ Controllers                            │
│    │                                  │
│ Services                              │
│    │                                  │
│ Repositories                          │
│    │                                  │
│ PostgreSQL                            │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│              RAG Layer                │
│                                       │
│ Document Processing                   │
│        ↓                              │
│ Chunking                              │
│        ↓                              │
│ EmbeddingService                      │
│        ↓                              │
│ PostgreSQL + pgvector                 │
│        ↓                              │
│ RetrievalService                      │
│        ↓                              │
│ RAGPipelineService                    │
│        ↓                              │
│ Gemini LLM                            │
└───────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React 18
* Vite
* JavaScript
* React Router
* Axios
* React Markdown
* Framer Motion
* CSS

### Backend

* Java 17
* Spring Boot 3.2.5
* Spring Web
* Spring WebFlux
* Spring Data JPA
* Spring Security
* Spring Validation
* Maven
* Lombok

### Database

* PostgreSQL
* pgvector

### AI / RAG

* Google Gemini API
* Gemini Embedding Model
* Gemini 2.5 Flash
* Vector embeddings
* Semantic vector retrieval
* Retrieval-Augmented Generation

### Document Processing

* Apache PDFBox
* OpenCSV
* Apache POI
* Custom TXT chunking

### Authentication

* Spring Security
* JWT
* BCrypt

### API Documentation

* SpringDoc OpenAPI
* Swagger UI

### Development

* Git
* GitHub
* Docker Compose
* PostgreSQL/pgvector

---

## 📂 Project Structure

```text
Decision-Detective/
│
├── dd-frontend/
│   └── dd-frontend/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   │   └── Layout.jsx
│       │   │
│       │   ├── context/
│       │   │   └── AuthContext.jsx
│       │   │
│       │   ├── pages/
│       │   │   ├── Chat.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Login.jsx
│       │   │   ├── Register.jsx
│       │   │   └── Upload.jsx
│       │   │
│       │   ├── services/
│       │   │   └── api.js
│       │   │
│       │   ├── App.jsx
│       │   ├── index.css
│       │   └── main.jsx
│       │
│       ├── package.json
│       └── vite.config.js
│
├── decision-detective-backend/
│   └── decision-detective-backend/
│       ├── docker/
│       │   └── init.sql
│       │
│       ├── rag-data/
│       │   ├── processed/
│       │   └── raw-files/
│       │
│       ├── src/
│       │   └── main/
│       │       ├── java/com/dd/
│       │       │   ├── config/
│       │       │   ├── controller/
│       │       │   ├── dto/
│       │       │   ├── exception/
│       │       │   ├── model/
│       │       │   ├── repository/
│       │       │   ├── service/
│       │       │   │   ├── backend/
│       │       │   │   └── rag/
│       │       │   └── util/
│       │       │
│       │       └── resources/
│       │           └── application.properties
│       │
│       ├── pom.xml
│       └── docker-compose.yml
│
├── screenshots/
│   ├── Screenshot 2026-09-22 080121.png
│   └── Screenshot 2026-09-22 080139.png
│
└── README.md
```

---

## 🖼️ Screenshots

### Dashboard

![Dashboard](./screenshots/Screenshot%202026-09-22%20080121.png)

### Application

![Decision Detective](./screenshots/Screenshot%202026-09-22%20080139.png)


### Flip and Ai Analysis

![Decision Detective](./screenshots/Screenshot%202026-09-23%20121122.png)

---

## ⚙️ Getting Started

### Prerequisites

Install:

* Java 17+
* Maven
* Node.js
* npm
* PostgreSQL 16+ with pgvector

Docker can also be used for the PostgreSQL + pgvector database included in the project.

---

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd "Decision - Detective"
```

---

## 2. Start PostgreSQL + pgvector

From the backend directory:

```bash
cd decision-detective-backend/decision-detective-backend
```

Start the database:

```bash
docker compose up -d
```

The included Docker configuration uses the `pgvector/pgvector:pg16` image.

---

## 3. Configure the Backend

Create your local configuration using environment variables for sensitive credentials.

Do **not** commit:

* Gemini API keys
* Database passwords
* JWT secrets
* Other credentials

The application uses configuration values for:

```text
Database connection
JWT secret
Gemini API key
Gemini embedding model
Gemini chat model
```

---

## 4. Run the Spring Boot Backend

From:

```text
decision-detective-backend/decision-detective-backend
```

Run:

```bash
mvn spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

---

## 5. Open Swagger API Documentation

Once the backend is running:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI documentation is available at:

```text
http://localhost:8080/api-docs
```

---

## 6. Run the React Frontend

Open another terminal:

```bash
cd dd-frontend/dd-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide the local development URL in the terminal.

---

## 🔐 Authentication Flow

The backend uses stateless JWT authentication.

```text
Register / Login
       ↓
Authentication API
       ↓
JWT Token
       ↓
Frontend stores authentication state
       ↓
Authenticated API Requests
       ↓
JwtAuthFilter
       ↓
Protected Spring Boot endpoints
```

Public routes include authentication and API documentation endpoints, while application APIs require authentication.

---

## 📄 Supported Documents

The current upload workflow supports:

| Format | Processing           |
| ------ | -------------------- |
| PDF    | Apache PDFBox        |
| CSV    | OpenCSV              |
| TXT    | Custom text chunking |

Uploaded documents are associated with an organization and processed asynchronously.

---

## 🧩 Document Processing

For TXT documents, the current implementation uses:

* Chunk size: **800 characters**
* Overlap: **100 characters**

The processing flow is:

```text
Upload
  ↓
Validation
  ↓
Save document
  ↓
Create Dataset record
  ↓
Async processing
  ↓
Parse document
  ↓
Create chunks
  ↓
Generate embeddings
  ↓
Store vectors
  ↓
Mark dataset as DONE
```

---

## 🧠 RAG Components

The RAG implementation is separated into dedicated backend services.

### `EmbeddingService`

Responsible for:

* Calling Gemini's embedding API
* Converting embeddings to float arrays
* Converting embeddings into PostgreSQL vector format

### `RetrievalService`

Responsible for:

* Embedding the user's question
* Performing vector similarity search
* Retrieving the most relevant chunks

### `RAGPipelineService`

Responsible for:

* Retrieving context
* Building the LLM prompt
* Calling Gemini
* Extracting the final verdict

### `DecisionReasoningService`

Responsible for:

* Coordinating the RAG decision workflow
* Persisting decisions
* Storing retrieved context
* Triggering flip analysis
* Writing audit records

### `FlipAnalysisService`

Responsible for generating alternative conditions that could change the current decision.

---

## 🗃️ Data Model

The backend contains entities for:

* Users
* Organizations
* Datasets
* Decisions
* Vector chunks
* Audit logs

Vector chunks maintain relationships with the source dataset and organization, allowing retrieval to be scoped to an organization.

---

## 🔌 Main API Areas

The backend exposes REST endpoints for areas including:

```text
/api/auth
/api/chat
/api/upload
/api/decisions
/api/analytics
```

The exact endpoints can be explored through Swagger UI after starting the backend.

---

## 🎯 Example Workflow

Imagine an organization uploads a policy document containing employee rules.

A user asks:

```text
Can employee X receive this benefit?
```

Decision Detective:

```text
Question
   ↓
Question embedding
   ↓
Vector search
   ↓
Relevant policy chunks
   ↓
Gemini
   ↓
YES / NO / MAYBE
   ↓
Reasoning
   ↓
Key facts
   ↓
Flip analysis
```

The goal is to make the model reason over the organization's supplied information rather than simply answering from general model knowledge.

---

## 🚀 What This Project Demonstrates

Decision Detective combines conventional backend engineering with modern AI application architecture.

### Software Engineering

* REST API design
* Spring Boot
* Spring Security
* JWT authentication
* JPA
* PostgreSQL
* Async processing
* Exception handling
* API documentation
* Organization-level data isolation

### AI Engineering

* LLM API integration
* Embeddings
* Vector databases
* Semantic retrieval
* RAG pipelines
* Prompt construction
* Context grounding
* AI-generated reasoning
* Scenario / flip analysis

### Full-Stack Development

* React
* Vite
* React Router
* Axios
* Protected routes
* Dashboard
* File upload
* AI chat interface

---

## 🔮 Future Improvements

Potential improvements include:

* Retrieval reranking
* Better chunking strategies
* Hybrid keyword + vector retrieval
* Retrieval evaluation
* Answer faithfulness evaluation
* Citation-level source tracking
* Streaming LLM responses
* Better document metadata
* Additional document formats
* Response caching
* Rate limiting
* Production observability
* Improved AI evaluation metrics
* Deployment automation

---

## ⚠️ Security

Never commit secrets to GitHub.

Sensitive values such as:

```text
GEMINI_API_KEY
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
```

should be supplied through environment variables or a local configuration file excluded by `.gitignore`.

If a credential has already been committed to a public repository, **rotate/revoke it immediately** rather than simply deleting it from the latest commit.

---

## 👨‍💻 Project

**Decision Detective**

A full-stack AI application exploring how **Spring Boot, PostgreSQL/pgvector, embeddings, retrieval, and LLMs** can be combined to build document-grounded decision systems.

Built with:

```text
React
   +
Spring Boot
   +
PostgreSQL / pgvector
   +
Gemini
   +
RAG
```

---
