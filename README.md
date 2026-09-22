# 🕵️ Decision Detective

**Decision Detective** is an AI-powered document analysis and decision-support application that uses **Retrieval-Augmented Generation (RAG)** to analyze information from documents and provide grounded answers with supporting reasoning.

The project is designed to make it easier to ask questions about a document and receive an AI-generated analysis based on the information available in that document.

---

## 🚀 Features

* 📄 Document-based question answering
* 🔎 Retrieval-Augmented Generation (RAG)
* 🤖 LLM-powered analysis
* 🧠 Context-aware responses
* 📌 Evidence-based reasoning
* 🔄 Flip/scenario analysis for evaluating alternative conditions
* 📊 Structured decision analysis
* 🌐 Web-based interface
* 🔐 Backend API architecture

---

## 🧠 How It Works

At a high level, Decision Detective follows a RAG-based workflow:

```text
        Document
           ↓
    Document Processing
           ↓
        Chunking
           ↓
       Embeddings
           ↓
     Vector Retrieval
           ↓
    Relevant Context
           ↓
    LLM + User Query
           ↓
    Generated Analysis
           ↓
        Final Answer
```

Instead of relying only on the language model's internal knowledge, the system retrieves relevant information from the provided document and uses that context when generating its response.

---

## 🏗️ Architecture

```text
┌─────────────────────┐
│      Frontend       │
│  User Interaction   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Backend API    │
│  Request Processing │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   RAG Pipeline      │
│                     │
│ • Document Processing│
│ • Chunking          │
│ • Retrieval         │
│ • Context Building  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│        LLM          │
│ Analysis / Response │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Structured Result │
└─────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React
* JavaScript
* HTML
* CSS

### Backend

* Java
* Spring Boot
* REST APIs

### AI / RAG

* Large Language Model (LLM)
* Retrieval-Augmented Generation (RAG)
* Embeddings
* Document retrieval

### Development

* Git
* GitHub
* RESTful architecture

> The exact model, embedding provider, database/vector store, and supporting libraries depend on the configuration used in the project.

---

## 🎯 Example Use Case

A user can provide a document containing business or organizational information and ask a question about it.

The system:

1. Processes the document.
2. Breaks the content into usable sections.
3. Retrieves relevant information for the user's question.
4. Provides the retrieved context to the LLM.
5. Generates a structured analysis.
6. Presents the reasoning and relevant information to the user.

The application can also perform **scenario/flip analysis**, allowing the user to examine how a change in the underlying condition can affect the resulting decision.

---

## 🔍 Why RAG?

Large language models do not automatically have access to the contents of a user's private documents.

RAG provides a way to connect an LLM with external information at inference time.

The basic idea is:

```text
User Question
      ↓
Retrieve Relevant Information
      ↓
Provide Context to LLM
      ↓
Generate Grounded Response
```

This can improve the relevance of responses when the required information exists inside the supplied documents.

---

## 📂 Project Structure

```text
Decision-Detective/
│
├── dd-frontend/
│   └── ...
│
├── dd-backend/
│   └── ...
│
├── README.md
└── ...
```

> Update the structure above if your repository uses different folder names.

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the required development tools installed for the frontend and backend.

Typical requirements include:

* Java
* Maven
* Node.js
* npm
* Git

### Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd "Decision-Detective"
```

### Backend

Navigate to the backend directory:

```bash
cd dd-backend
```

Run the Spring Boot application:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

### Frontend

Open another terminal:

```bash
cd dd-frontend
npm install
npm run dev
```

The frontend will then be available through the development server.

---

## 🔐 Environment Variables

Create the required environment/configuration values locally.

**Do not commit API keys, passwords, tokens, or other secrets to GitHub.**

Example:

```env
LLM_API_KEY=your_api_key
```

Use the actual environment variable names required by the project.

---

## 📈 Future Improvements

Potential improvements include:

* Better retrieval and reranking
* Improved RAG evaluation
* More document formats
* Improved citation/evidence handling
* Retrieval quality monitoring
* Response quality evaluation
* Authentication and authorization improvements
* Production deployment and observability
* Caching and latency optimization

---

## 👨‍💻 Project

**Decision Detective**
Built as an AI-powered decision-analysis application using **Spring Boot, React, LLMs and RAG**.

The project explores how retrieval-based AI systems can be combined with conventional backend engineering to build practical document-analysis applications.
