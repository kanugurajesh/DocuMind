# Documind - AI-Powered Document Intelligence Platform

<div align="center">

**Transform documents into intelligent knowledge with AI-powered semantic search and graph visualization**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4.svg)](https://tailwindcss.com/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-DC244C.svg)](https://qdrant.tech/)
[![Neo4j](https://img.shields.io/badge/Neo4j-Knowledge%20Graph-008CC1.svg)](https://neo4j.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI%20%2F%20Ollama-LLM-412991.svg)](https://platform.openai.com/)


</div>

## 🚀 Overview

Documind is a document intelligence platform that transforms uploaded files into an interactive, searchable knowledge base. Upload documents, ask questions in natural language, and get answers grounded in — and cited to — your own files, while a second AI pipeline builds a queryable knowledge graph of the entities and relationships hiding across the whole collection.

### The problem

Most "chat with your PDF" tools stop at naive RAG: embed some chunks, retrieve the nearest neighbors, paste them into a prompt. That falls apart the moment a question spans multiple documents or depends on how entities relate to each other — a plain vector search has no notion of "this person also appears in that other contract" or "these two reports are about the same acquisition."

Documind exists to answer a narrower, harder question: **can a RAG system also understand the *structure* connecting a document collection, not just its text?** That meant building two AI subsystems on top of the same ingestion pipeline:

1. A **retrieval-augmented generation pipeline** for grounded, cited natural-language Q&A over a user's documents.
2. A **knowledge-graph extraction pipeline** that runs entity recognition, cross-document entity resolution, semantic clustering, document similarity, and topic modeling on the same chunks — turning a flat pile of files into a queryable graph of who/what/where and how they connect, rendered as an interactive visualization.

Both pipelines had to run identically against a hosted LLM (OpenAI) or a fully local one (Ollama) with zero code branching at the call sites, and the whole stack had to run for free on a laptop via Docker — so the project doubled as an exercise in designing backend-agnostic infrastructure abstractions (AI client, storage client, database clients) that don't leak their provider into application code. See **AI Systems Deep Dive** below for how each pipeline actually works, with the real thresholds and models involved.

### ✨ Key Features

- **🤖 AI-Powered Q&A**: Ask questions in natural language and get intelligent answers with source citations
- **📊 Interactive Knowledge Graph**: Visualize relationships between entities with advanced filtering and layout options
- **🔍 Semantic Search**: Find relevant information using vector-based similarity search
- **📄 Multi-Format Support**: Process PDFs, Word documents, and text files seamlessly
- **🔐 Secure & Private**: Complete user data isolation with enterprise-grade security
- **⚡ Real-time Processing**: Background document processing with live status updates
- **🎛️ Smart Filtering**: Customizable graph views with entity type filters and confidence thresholds
- **🔧 Resilient Architecture**: Graceful error handling with fallback options for all services

## 📸 Screenshots

### Landing Page

| Hero | Feature grid | Process & CTA |
|---|---|---|
| ![Landing page hero](images/landing-hero.png) | ![Landing page feature grid](images/landing-features.png) | ![Landing page process and call to action](images/landing-process-cta.png) |

### Authentication

| Sign up | Sign in |
|---|---|
| ![Sign up form](images/sign-up.png) | ![Sign in form](images/sign-in.png) |

### Dashboard

| Overview | Account menu |
|---|---|
| ![Dashboard overview](images/dashboard.png) | ![Dashboard account menu](images/dashboard-account-menu.png) |

### Document Chat (RAG Q&A)

| Empty state | Question asked | Answer with cited sources |
|---|---|---|
| ![Document chat empty state](images/document-chat-empty.png) | ![Document chat question asked](images/document-chat-question.png) | ![Document chat answer with cited sources](images/document-chat-answer-sources.png) |

### Knowledge Graph

| Overview | Legend | Filters panel | Node detail |
|---|---|---|---|
| ![Knowledge graph overview](images/knowledge-graph-overview.png) | ![Knowledge graph with legend](images/knowledge-graph-legend.png) | ![Knowledge graph filters panel](images/knowledge-graph-filters.png) | ![Knowledge graph node detail](images/knowledge-graph-node-detail.png) |

## 🧠 AI Systems Deep Dive

This is the section worth reading closely if you're evaluating the AI/ML engineering rather than the product. Every claim below is backed by code — file paths point to the actual implementation, not a design doc.

### 1. Retrieval-Augmented Generation (RAG) pipeline

**Ingestion — runs once per uploaded document:**

```mermaid
flowchart TD
    A["Raw file (PDF / DOCX / TXT)"] -->|"LangChain PDFLoader · mammoth.js · plain text"| B["Extracted text + metadata<br/>title, author, page count"]
    B -->|"whitespace normalization<br/>control-char stripping"| C["Preprocessed text"]
    C -->|"lib/ai/processing.ts :: chunkText()"| D["Sliding-window chunks<br/>500 words/chunk, 50-word overlap"]
    D -->|"batched, 100 chunks/call<br/>rate-limit delay"| E["Embeddings<br/>Ollama nomic-embed-text (768-dim)<br/>or OpenAI text-embedding-3-small (1536-dim)"]
    E --> F[("Qdrant upsert<br/>cosine distance<br/>indexed on userId + docId")]
```

**Query — runs on every chat message:**

```mermaid
flowchart TD
    A["User question"] -->|"embedded with the ingestion-time model"| B["Query embedding"]
    B --> C[("Qdrant ANN search<br/>filtered to userId (+ docId)<br/>score ≥ 0.2, top-k = 10")]
    C --> D["Prompt assembly<br/>numbered, source-labeled context blocks<br/>'[Source 1 - filename.pdf]: chunk text'"]
    D -->|"temperature 0.3"| E["LLM completion<br/>answers only from context, cites sources,<br/>admits when context is insufficient"]
    E --> F["Answer + ranked sources + confidence score<br/>0.8 × avg retrieval score + 0.2 if answer > 50 chars, capped at 1.0"]
```

The user-scoping filter is applied **inside the Qdrant query** (`lib/db/qdrant.ts :: searchVectors`) via a payload-indexed `must` clause on `userId`, not as a post-fetch filter in application code — one user's documents are never in another user's candidate set, even before a similarity score is computed. See `lib/ai/chat.ts` for the full retrieval → prompt → generation flow.

### 2. Knowledge-graph extraction pipeline

The same chunks feed a second, independent pipeline that builds a Neo4j graph instead of (or alongside) the vector index. It runs as five stages, implemented in `lib/ai/entities.ts`, `lib/ai/document-similarity.ts`, and `lib/ai/topic-modeling.ts`:

```mermaid
flowchart LR
    A["1. Entity extraction<br/>LLM NER per chunk"] --> B["2. Co-occurrence linking<br/>COOCCURS_WITH edges"]
    B --> C["3. Cross-document resolution<br/>SAME_AS / SIMILAR_TO"]
    C --> D["4. Semantic clustering<br/>category-specific heuristics"]
    D --> E["5. Similarity & topics<br/>DOCUMENT_SIMILAR_TO + LLM topic modeling"]
```

| Stage | What it does | Signal / threshold |
|---|---|---|
| **1. Entity extraction** | Per-chunk LLM call (temperature 0.1) returns structured JSON: named entities (`PERSON` / `ORGANIZATION` / `LOCATION` / `DATE` / `MONEY` / `OTHER`) with confidence scores, plus explicit relationships between them | LLM structured output, capped at 10 entities/chunk |
| **2. Co-occurrence linking** | Every entity pair found in the same chunk gets a `COOCCURS_WITH` edge, weighted by combined entity confidence and how close together the two mentions appear in the raw text | Character-distance proximity bonus |
| **3. Cross-document resolution** | New entities are compared against a user's *existing* entities of the same category: exact-name match, Jaccard word overlap, person-name subset matching ("J. Smith" ⊂ "John Smith"), organization-abbreviation containment | `SAME_AS` above 0.8 similarity, `SIMILAR_TO` between 0.6–0.8 |
| **4. Semantic clustering** | Category-specific heuristics group related entities — shared professional titles for people, shared industry terms for organizations, geographic containment for locations — plus cross-category inference (`WORKS_AT`, `LOCATED_IN`) derived from co-occurrence | `SIMILAR_TO` between 0.4–0.8 |
| **5. Document similarity & topics** | Per-document embeddings (mean-pooled from that document's chunk vectors) are compared pairwise by cosine similarity for `DOCUMENT_SIMILAR_TO` edges; a separate LLM call clusters the whole collection into topics and assigns documents to them | Cosine similarity > 0.3 |

Stages 3–5 are triggered on demand from the graph UI ("Cluster Entities" / "Analyze Doc Similarity" / "Extract Topics") rather than automatically on every upload, since they're collection-wide operations — re-running them after adding a new document lets the graph re-resolve entities against the *whole* corpus, not just the new file.

The result renders with Cytoscape.js: node size scales with degree (how connected an entity is), edge styling varies by relationship type (structural `MENTIONS`/`CONTAINS` edges recede into the background; semantic edges stay prominent), and every relationship carries its confidence score as graph data so results can be filtered by it.

### 3. One client, two inference backends

Every AI call in the app — chat completion, embeddings, entity extraction, topic modeling — goes through a single factory (`lib/ai/client.ts`) built on the `openai` SDK:

```ts
export function getOpenAIClient(): OpenAI {
  if (aiMode === "local") {
    return new OpenAI({ baseURL: "http://localhost:11434/v1", apiKey: "ollama" });
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
```

Ollama speaks the OpenAI `/v1` API, so switching `AI_MODE` between `local` and `cloud` is a config change, not a code change — no call site knows or cares which provider it's talking to. The same pattern extends to storage (MinIO/S3), the vector DB (Qdrant local/cloud), the graph DB (Neo4j local/Aura), and auth (Auth.js/Clerk) — each independently toggleable, all through one `docker-compose.yml` with per-service [Compose profiles](https://docs.docker.com/compose/how-tos/profiles/) (see **One Compose File, Only What You Need** below). That lets the whole stack run for $0 on a laptop during development while staying a single env var away from a fully managed cloud deployment.

## 🏗️ Architecture

Documind employs a sophisticated multi-database architecture designed for scalability and performance:

### 📐 High-Level Architecture Overview

```mermaid
flowchart TB
    FE["Frontend<br/>Next.js 15 (App Router) · React 19 · TypeScript<br/>Tailwind CSS v4 · Radix UI · Cytoscape.js<br/>Clerk or Auth.js (AUTH_MODE)"]
    BE["Backend<br/>Next.js API Routes · Auth middleware<br/>AI processing pipeline<br/>File processing (LangChain / mammoth.js)"]
    ST[("File Storage<br/>MinIO / AWS S3<br/>Presigned URLs")]
    AI["AI Services<br/>Ollama or OpenAI<br/>Embeddings · Chat · Entity Extraction"]
    MG[("MongoDB")]
    QD[("Qdrant")]
    N4[("Neo4j")]

    FE -->|API Routes| BE
    BE --> ST
    BE --> AI
    BE --> MG
    BE --> QD
    BE --> N4
```

### 🗄️ Database Architecture

```mermaid
flowchart LR
    subgraph MongoDB["MongoDB"]
        M1["Documents metadata"]
        M2["User data"]
        M3["Processing status"]
        M4["File references"]
    end
    subgraph Qdrant["Qdrant"]
        Q1["Vector embeddings"]
        Q2["Semantic search"]
        Q3["Similarity matching"]
    end
    subgraph Neo4j["Neo4j"]
        N1["Knowledge graph"]
        N2["Entities & relations"]
        N3["Topics & clusters"]
    end
```

### 🔧 Technology Stack

#### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Modern utility-first styling
- **Radix UI**: Accessible component primitives
- **React Hot Toast**: User notifications
- **Cytoscape.js**: Interactive graph visualization

#### Backend & APIs
- **Next.js API Routes**: RESTful endpoints
- **Clerk**: Authentication and user management
- **OpenAI SDK**: Embeddings, chat completion, and entity extraction — points at OpenAI or a local Ollama server (OpenAI-compatible `/v1` API), depending on `AI_MODE`

#### Processing Pipeline
- **Mammoth.js**: Word document processing
- **LangChain (`@langchain/community` PDFLoader)**: PDF text extraction
- **Text Chunking**: Intelligent content segmentation
- **Entity Extraction**: NER with relationship mapping

### 🌊 Data Flow Architecture

```mermaid
flowchart TD
    A["1. User Authentication<br/>Clerk or Auth.js"] --> B["2. File Upload<br/>MinIO / AWS S3"]
    B --> C["3. Background Processing"]
    C --> C1["Text extraction"]
    C --> C2["AI analysis (Ollama / OpenAI)"]
    C --> C3["Vector generation (Qdrant)"]
    C --> C4["Entity extraction (Neo4j)"]
    C --> C5["Metadata storage (MongoDB)"]
    C1 & C2 & C3 & C4 & C5 --> D["4. Real-time Status Updates"]
    D --> E["5. Interactive Features"]
    E --> E1["Semantic search"]
    E --> E2["AI chat"]
    E --> E3["Graph visualization"]
    E --> E4["Document management"]
```

### 🔄 Document Processing Flow

```mermaid
flowchart LR
    A["File Upload<br/>MinIO / AWS S3<br/>Presigned URLs"] --> B["Text Extraction<br/>mammoth.js (Word)<br/>LangChain PDFLoader (PDF)"]
    B --> C["AI Processing<br/>Ollama / OpenAI<br/>Entity recognition · Topic modeling"]
    C --> D[("Vector embeddings<br/>Qdrant")]
    C --> E[("Entity extraction<br/>Neo4j")]
    C --> F[("Metadata storage<br/>MongoDB")]
```

## 📋 Prerequisites

Before running Documind, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Docker Desktop** (for running any services set to `local` mode — see below)
- **MongoDB** instance (local Docker or MongoDB Atlas)
- **Qdrant** vector database (local Docker or Qdrant Cloud)
- **Neo4j** graph database (local Docker or Neo4j Aura)
- **File storage** (local Docker MinIO or AWS S3)
- **AI provider** (local Docker Ollama or OpenAI API key)
- **Authentication** (self-hosted email/password — no external account needed, or a Clerk account for cloud mode)

### 🐳 One Compose File, Only What You Need

All five backing services live in a single `docker-compose.yml`, each tagged with a [Compose profile](https://docs.docker.com/compose/how-tos/profiles/) (`mongodb`, `qdrant`, `neo4j`, `storage`, `ai`) matching its `*_MODE` variable. Running `docker compose up -d` with no profiles starts **nothing** — you activate only the services you're actually running locally.

Rather than tracking which profiles to pass by hand, `npm run docker:up` reads `.env.local`, checks each `*_MODE` variable, and starts (via `docker compose --profile <x> ... up -d`) only the containers whose mode is `local` — any service set to `cloud` is left alone:

```bash
npm run docker:up     # starts only the services whose *_MODE=local in .env.local
npm run docker:down   # stops the same set
```

For example, with `QDRANT_MODE=local` and everything else `cloud`, `npm run docker:up` runs the equivalent of `docker compose --profile qdrant up -d` — only the Qdrant container starts. You can still target profiles manually if you prefer: `docker compose --profile mongodb --profile qdrant up -d`.

`AUTH_MODE` is a sixth toggle following the same `local`/`cloud` convention, but it has **no Compose profile** — local auth is a library (Auth.js), not a service, so `npm run docker:up` never starts a container for it.

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/kanugurajesh/DocuMind.git
cd DocuMind
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note:** `--legacy-peer-deps` is required because `@langchain/community` (used for PDF parsing) declares a peer dependency conflict with the `openai` SDK version this project uses.

### 3. Environment Configuration

Copy the example environment file and configure your services:

```bash
cp .env.example .env.local
```

Update `.env.local` with your service credentials:

```env
# Authentication
# Mode: "local" (self-hosted email/password via Auth.js, stored in MongoDB) | "cloud" (uses Clerk)
AUTH_MODE=local
NEXT_PUBLIC_AUTH_MODE=local
# Generate with: npx auth secret
AUTH_SECRET=generate_with_npx_auth_secret

# Clerk Authentication (used when AUTH_MODE=cloud)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# MongoDB Configuration
# Mode: "local" (Docker Desktop, mongodb://localhost:27017/documind) | "cloud" (uses MONGODB_URI)
MONGODB_MODE=local
MONGODB_LOCAL_URI=mongodb://localhost:27017/documind
MONGODB_URI=mongodb+srv://user:password@your-cluster.mongodb.net/documind
MONGODB_DB_NAME=documind

# Qdrant Vector Database
# Mode: "local" (Docker Desktop, http://localhost:6333) | "cloud" (uses QDRANT_URL + QDRANT_API_KEY)
QDRANT_MODE=local
QDRANT_URL=https://your-instance.cloud.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key

# Neo4j Graph Database
# Mode: "local" (Docker Desktop, bolt://localhost:7687) | "cloud" (uses NEO4J_URI + credentials)
NEO4J_MODE=local
NEO4J_LOCAL_PASSWORD=neo4j
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password

# File Storage
# Mode: "local" (Docker Desktop MinIO, http://localhost:9000) | "cloud" (uses AWS S3)
STORAGE_MODE=local
STORAGE_LOCAL_ENDPOINT=http://localhost:9000
STORAGE_LOCAL_ACCESS_KEY=minioadmin
STORAGE_LOCAL_SECRET_KEY=minioadmin
STORAGE_LOCAL_BUCKET_NAME=documind

# AWS S3 Storage (used when STORAGE_MODE=cloud)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=your-bucket-name

# AI / LLM Configuration
# Mode: "local" (Docker Desktop Ollama, http://localhost:11434) | "cloud" (uses OpenAI)
AI_MODE=local
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_CHAT_MODEL=llama3.1
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# OpenAI API (used when AI_MODE=cloud)
OPENAI_API_KEY=sk-your_openai_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_FILE_SIZE_MB=10
MAX_CHUNK_SIZE=500

# Must match the active embedding model's output size.
# Ollama nomic-embed-text = 768 | OpenAI text-embedding-3-small = 1536
EMBEDDING_DIMENSIONS=768
```

### 4. Database Setup

Ensure all databases are running and accessible:

#### MongoDB — Local or Cloud

MongoDB supports two modes controlled by `MONGODB_MODE` in `.env.local`.

**Local (Docker Desktop) — recommended for development:**

Set in `.env.local`:
```env
MONGODB_MODE=local
MONGODB_LOCAL_URI=mongodb://localhost:27017/documind
```
Then start the container (or `docker compose --profile mongodb up -d` directly):
```bash
npm run docker:up
```

**Cloud (MongoDB Atlas):**

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Copy the connection string and add your IP to the access list

Set in `.env.local`:
```env
MONGODB_MODE=cloud
MONGODB_URI=mongodb+srv://user:password@your-cluster.mongodb.net/documind
```

#### Qdrant — Local or Cloud

Qdrant supports two modes controlled by `QDRANT_MODE` in `.env.local`.

**Local (Docker Desktop) — recommended for development:**

Set in `.env.local`:
```env
QDRANT_MODE=local
```
Then start the container (or `docker compose --profile qdrant up -d` directly) and verify it's running:
```bash
npm run docker:up
curl http://localhost:6333/healthz
```

**Cloud (Qdrant Cloud):**

1. Create a free cluster at [cloud.qdrant.io](https://cloud.qdrant.io)
2. Copy the cluster URL and API key

Set in `.env.local`:
```env
QDRANT_MODE=cloud
QDRANT_URL=https://your-instance.cloud.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key
```

#### Neo4j — Local or Cloud

Neo4j supports two modes controlled by `NEO4J_MODE` in `.env.local`.

**Local (Docker Desktop) — recommended for development:**

Set in `.env.local`:
```env
NEO4J_MODE=local
NEO4J_LOCAL_PASSWORD=neo4j   # must match the neo4j service's NEO4J_AUTH in docker-compose.yml
```
Then start the container (or `docker compose --profile neo4j up -d` directly) and open the browser UI (login: `neo4j` / `neo4j`):
```bash
npm run docker:up
# http://localhost:7474
```

> **Note:** On first login Neo4j may prompt you to change the default password. If you do, update `NEO4J_LOCAL_PASSWORD` to match and restart the dev server.

**Cloud (Neo4j Aura):**

1. Create a free instance at [console.neo4j.io](https://console.neo4j.io)
2. Copy the connection URI, username, and password

Set in `.env.local`:
```env
NEO4J_MODE=cloud
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password
```

#### File Storage — Local or Cloud

File storage supports two modes controlled by `STORAGE_MODE` in `.env.local`.

**Local (Docker Desktop MinIO) — recommended for development:**

Set in `.env.local`:
```env
STORAGE_MODE=local
STORAGE_LOCAL_ENDPOINT=http://localhost:9000
STORAGE_LOCAL_ACCESS_KEY=minioadmin
STORAGE_LOCAL_SECRET_KEY=minioadmin
STORAGE_LOCAL_BUCKET_NAME=documind
```
Then start the container (or `docker compose --profile storage up -d` directly) and open the browser console (login: `minioadmin` / `minioadmin`):
```bash
npm run docker:up
# http://localhost:9001
```
The bucket is created automatically on first run if it doesn't exist.

**Cloud (AWS S3):**

1. Create an S3 bucket in your AWS account
2. Create an IAM user/role with read/write access to that bucket

Set in `.env.local`:
```env
STORAGE_MODE=cloud
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=your-bucket-name
```

#### AI Provider — Local or Cloud

Chat, embeddings, and entity/topic extraction all go through a single `openai` SDK client (`lib/ai/client.ts`) that supports two modes controlled by `AI_MODE` in `.env.local`. Ollama exposes an OpenAI-compatible `/v1` API, so no separate SDK is needed for local mode.

**Local (Docker Desktop Ollama) — recommended for development, no API costs:**

Set in `.env.local`:
```env
AI_MODE=local
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_CHAT_MODEL=llama3.1
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_DIMENSIONS=768
```
Then start the container (or `docker compose --profile ai up -d` directly) and pull a chat model and an embedding model — `npm run docker:up` doesn't pull models for you, since that's a one-time setup step:
```bash
npm run docker:up
docker compose --profile ai exec ollama ollama pull llama3.1
docker compose --profile ai exec ollama ollama pull nomic-embed-text
```

**Cloud (OpenAI):**

1. Create an API key at [platform.openai.com](https://platform.openai.com)

Set in `.env.local`:
```env
AI_MODE=cloud
OPENAI_API_KEY=sk-your_openai_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
```

> **Note:** `EMBEDDING_DIMENSIONS` must match the active embedding model's output size and is only applied when the Qdrant collection (`documind_chunks`) is first created — it does **not** resize an existing collection. If you switch `AI_MODE` after documents have already been embedded, delete the `documind_chunks` collection in Qdrant and re-upload documents so vector dimensions stay consistent.

#### Authentication — Local or Cloud

Authentication supports two modes controlled by `AUTH_MODE` (and its client-visible twin, `NEXT_PUBLIC_AUTH_MODE`) in `.env.local`. Unlike the other four toggles, local mode here is a **library, not a container** — [Auth.js](https://authjs.dev) (NextAuth v5) with a Credentials provider stores email/password accounts (bcrypt-hashed) in whichever MongoDB is already configured, so `npm run docker:up` has nothing extra to start for this one.

**Local (self-hosted email/password) — recommended for development, no external account needed:**

Generate a session secret once:
```bash
npx auth secret
```
This writes `AUTH_SECRET` into `.env.local` for you (or copy the printed value in manually).

Set in `.env.local`:
```env
AUTH_MODE=local
NEXT_PUBLIC_AUTH_MODE=local
AUTH_SECRET=your_generated_secret
```
Then visit `/sign-up` to create the first account — no email verification or password reset flow in local mode (matching the other local modes' zero-external-service approach). Accounts are stored in the `users` collection of the active MongoDB instance.

**Cloud (Clerk):**

1. Create a free application at [clerk.com](https://clerk.com)
2. Copy the publishable and secret keys

Set in `.env.local`:
```env
AUTH_MODE=cloud
NEXT_PUBLIC_AUTH_MODE=cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
```

> **Note:** `AUTH_MODE` changes what gets rendered client-side (sign-in/up forms, the header's account menu), so switching it requires a full rebuild/restart of the dev server — not just an env var reload — since `NEXT_PUBLIC_*` values are inlined into the client bundle at build time.

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 📂 Project Structure

```
documind/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── chat/                 # Q&A endpoint
│   │   ├── documents/            # Document management
│   │   ├── graph/                # Graph operations
│   │   ├── search/               # Search functionality
│   │   └── upload/               # File upload
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/    # Auth.js route handler (local mode)
│   │       └── register/         # Local-mode sign-up endpoint
│   ├── chat/                     # Chat interface page
│   ├── dashboard/                # Main dashboard
│   ├── graph/                    # Knowledge graph view
│   ├── sign-in/                  # Authentication pages (mode-conditional UI)
│   ├── sign-up/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── auth/                     # Local-mode sign-in/sign-up forms
│   ├── chat/                     # Chat interface components
│   ├── documents/                # Document management
│   ├── graph/                    # Graph visualization
│   ├── layout/                   # Layout components
│   ├── providers/                # AuthProvider (Clerk vs Auth.js SessionProvider)
│   └── ui/                       # Reusable UI components
├── lib/                          # Utilities and configurations
│   ├── ai/                       # AI processing modules
│   │   ├── chat.ts               # Chat functionality
│   │   ├── embeddings.ts         # Vector embeddings
│   │   ├── entities.ts           # Entity extraction
│   │   ├── pipeline.ts           # Processing pipeline
│   │   └── processing.ts         # Text processing
│   ├── api/                      # API utilities
│   ├── auth/                     # Unified auth: server (index.ts) + client (client.tsx) hooks
│   ├── db/                       # Database connections
│   │   ├── mongodb.ts            # MongoDB client
│   │   ├── neo4j.ts              # Neo4j client
│   │   └── qdrant.ts             # Qdrant client
│   └── storage/                  # File storage
├── types/                        # TypeScript definitions
│   └── next-auth.d.ts            # Auth.js session/user type augmentation
├── scripts/
│   └── docker-services.js        # Starts/stops only the services set to "local" mode
├── auth.config.ts                # Edge-safe Auth.js config (used by middleware.ts)
├── auth.ts                       # Full Auth.js config (Credentials provider, Node runtime only)
├── docker-compose.yml            # MongoDB/Qdrant/Neo4j/MinIO/Ollama, one profile per service
├── middleware.ts                 # Clerk or Auth.js middleware, chosen by AUTH_MODE
└── next.config.ts               # Next.js configuration
```

## 🔄 Document Processing Pipeline

End-to-end flow from upload to a fully indexed, graph-linked document. The AI-specific steps (chunking, embeddings, entity extraction, resolution, clustering) are covered in detail in **AI Systems Deep Dive** above — this is the operational view.

1. **Upload** — verify the user session (local Auth.js or Clerk, depending on `AUTH_MODE`), save the file to local MinIO or AWS S3, create a document record in MongoDB, and hand off to background processing
2. **Extraction & chunking** — pull text from PDF/DOCX/TXT and split it into overlapping word-windows
3. **Embedding & vector storage** — batch-embed every chunk and upsert into Qdrant, scoped to the uploading user
4. **Knowledge graph construction** — extract entities per chunk, link co-occurrences, resolve entities against the user's existing graph, and store everything in Neo4j with proper indexing
5. **Status updates** — the document's `processingStatus` moves through `pending → processing → completed`/`failed`, polled live by the dashboard, with error messages surfaced on failure

Note that resolving *duplicate* entities and clustering documents by similarity are collection-wide operations, so they're triggered on demand from the graph page rather than automatically per upload (see stage 3–5 of the knowledge-graph pipeline above).

## 🔍 Search & Q&A System

Covered in full in **AI Systems Deep Dive → Retrieval-Augmented Generation (RAG) pipeline** above — retrieval is a straight Qdrant vector search scoped to the asking user, with Neo4j powering a *separate* graph-exploration experience rather than feeding the chat prompt directly.

### Knowledge Graph Exploration

- **Interactive Visualization**: Cytoscape.js powered graphs with optimized layouts
- **Real hover-driven edge labels**: connection types stay hidden until you hover the specific edge — a plain `edge:hover` CSS-style selector doesn't exist in Cytoscape core, so this is implemented with real `mouseover`/`mouseout` listeners
- **Advanced Filtering**: filter by entity type, node cap, and structural noise (chunk nodes, co-occurrence mesh)
- **Entity Relationships**: explore connections between people, organizations, locations, and concepts
- **Document Mapping**: visualize how documents relate through shared entities and topics
- **Graph Statistics**: real-time metrics showing nodes, edges, and entity distributions

## 🔐 Security & Privacy

### Authentication
- **Local mode**: Self-hosted email/password via Auth.js — bcrypt-hashed passwords, JWT sessions, no external account needed
- **Cloud mode**: Clerk-managed sign-up/sign-in flows
- **Session Management**: Automatic token handling (JWT locally, Clerk-managed in cloud mode)
- **Route Protection**: Middleware-based access control (Auth.js or Clerk, depending on `AUTH_MODE`)

### Data Isolation
- **User Scoping**: Complete isolation of user data
- **Query Filtering**: Automatic user-based filtering
- **Access Control**: Document ownership verification

### Security Features
- **Encrypted Storage**: Secure file storage in MinIO or AWS S3
- **API Security**: Protected routes with authentication
- **Error Handling**: Safe error messages without data leakage

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Code formatting
npm run format

# Start only the Docker services set to "local" mode in .env.local
npm run docker:up

# Stop them again
npm run docker:down
```

### Code Quality

- **TypeScript**: Full type safety across the application
- **Biome**: Modern linting and formatting
- **Error Boundaries**: Graceful error handling
- **Loading States**: Comprehensive loading indicators

## 🚀 Deployment

### Environment Setup

1. **Database Services**: Ensure all databases are accessible
2. **Environment Variables**: Configure production credentials
3. **File Storage**: Set up AWS S3 bucket (or self-host MinIO with `STORAGE_MODE=local`)
4. **AI Provider**: Configure OpenAI API access (or self-host Ollama with `AI_MODE=local`)
5. **Authentication**: Configure Clerk for production (or self-host with `AUTH_MODE=local` + a strong `AUTH_SECRET` — note that local mode has no email verification or password reset flow, by design; add those yourself before relying on it in production)

### Recommended Platforms

- **Vercel**: Optimal for Next.js applications
- **Netlify**: Alternative deployment option
- **Railway**: Full-stack deployment with databases
- **AWS/GCP/Azure**: Enterprise-grade hosting

### Production Checklist

- [ ] Environment variables configured
- [ ] Database connections tested
- [ ] File upload limits set
- [ ] Authentication flows verified
- [ ] Error monitoring enabled
- [ ] Performance optimization applied

## 🔧 Troubleshooting

### Common Issues

#### Authentication Errors

If sign-in/sign-up fails or protected routes won't load:

1. **"Configuration" error page or middleware crash on startup** — `AUTH_SECRET` is missing or empty. Generate one with `npx auth secret` and set it in `.env.local`, then restart the dev server.
2. **Signed in but immediately redirected to `/sign-in`** — usually a mismatch between the cookie the session was issued with and the current `AUTH_SECRET`/`AUTH_MODE`; sign out, clear cookies for `localhost:3000`, and sign in again.
3. **"An account with this email already exists" on sign-up** — expected; go to `/sign-in` instead. Local mode has no password reset flow (by design — see the Authentication setup section above), so a forgotten password currently means creating a new account or manually updating the `users` collection in MongoDB.
4. **Switched `AUTH_MODE` but UI didn't change** — `NEXT_PUBLIC_AUTH_MODE` is inlined into the client bundle at build time; a dev-server restart (or rebuild in production) is required, not just an env var edit.
5. **`next build` fails mentioning the Edge Runtime** — something in `middleware.ts`'s local-mode branch is reaching `auth.ts` instead of `auth.config.ts` (e.g. through an accidental import). `auth.ts`'s Credentials provider pulls in the MongoDB driver, which isn't Edge-compatible; `middleware.ts` must only ever import `auth.config.ts`.

#### MongoDB Connection Errors

If you encounter connection errors with MongoDB:

1. **Switch to local mode** — set `MONGODB_MODE=local` in `.env.local`, then start the container:
   ```bash
   npm run docker:up
   ```
2. **Verify the container is healthy:**
   ```bash
   docker ps --filter name=mongodb
   ```
3. **Cloud mode issues** — check that `MONGODB_URI` is correct, includes the right credentials, and that your IP is on the Atlas access list
4. **After changing `MONGODB_MODE`**, restart the dev server — the client is initialized once per process

#### Qdrant Connection Errors

If you encounter `ENOTFOUND` or `fetch failed` errors with Qdrant:

1. **Switch to local mode** — set `QDRANT_MODE=local` in `.env.local`, then start the container:
   ```bash
   npm run docker:up
   ```
2. **Verify the container is healthy:**
   ```bash
   curl http://localhost:6333/healthz
   ```
3. **Cloud mode issues** — check that `QDRANT_URL` and `QDRANT_API_KEY` are correct and the cluster is running at [cloud.qdrant.io](https://cloud.qdrant.io)
4. **After changing `QDRANT_MODE`**, restart the dev server — the client is initialized once per process

#### Neo4j Connection Errors

If you encounter connection errors with Neo4j:

1. **Switch to local mode** — set `NEO4J_MODE=local` in `.env.local`, then start the container:
   ```bash
   npm run docker:up
   ```
2. **Verify the container is healthy** — open `http://localhost:7474` in your browser (login: `neo4j` / `neo4j`)
3. **Password mismatch** — if you changed the default password in the browser UI, update `NEO4J_LOCAL_PASSWORD` in `.env.local` to match
4. **Cloud mode issues** — verify `NEO4J_URI`, `NEO4J_USERNAME`, and `NEO4J_PASSWORD` match your Neo4j Aura instance
5. **After changing `NEO4J_MODE`**, restart the dev server

#### File Storage Errors

If uploads or downloads fail with connection or credential errors:

1. **Switch to local mode** — set `STORAGE_MODE=local` in `.env.local`, then start the container:
   ```bash
   npm run docker:up
   ```
2. **Verify the container is healthy** — open `http://localhost:9001` in your browser (login: `minioadmin` / `minioadmin`)
3. **Cloud mode issues** — check that `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_S3_BUCKET_NAME` are correct and the IAM user has read/write access to the bucket
4. **After changing `STORAGE_MODE`**, restart the dev server — the client is initialized once per process

#### AI Provider Errors

If chat, embedding, or entity/topic extraction requests fail:

1. **Switch to local mode** — set `AI_MODE=local` in `.env.local`, start the container, and pull models:
   ```bash
   npm run docker:up
   docker compose --profile ai exec ollama ollama pull llama3.1
   docker compose --profile ai exec ollama ollama pull nomic-embed-text
   ```
2. **Verify Ollama is healthy:**
   ```bash
   curl http://localhost:11434/api/tags
   ```
3. **Cloud mode issues** — check that `OPENAI_API_KEY` is correct and has available quota
4. **Embedding dimension mismatch** — if you see Qdrant errors about vector size after switching `AI_MODE`, delete the `documind_chunks` Qdrant collection and re-upload documents (see the AI Provider setup section above)
5. **After changing `AI_MODE`**, restart the dev server — the client is initialized once per process

#### Graph Visualization Issues

- **No Connections Visible**: Check that documents have been processed and entities extracted
- **Cluttered Graph**: Turn off "Show node names" for a cleaner view, or hover individual nodes/edges to reveal names on demand
- **Performance Issues**: Reduce max nodes limit in the filters panel
- **Layout Problems**: Use graph controls (fit to view, center, reset zoom) to optimize display

#### Database Connection Issues

- **MongoDB**: Ensure connection string is correct and database is accessible
- **Neo4j**: Verify bolt:// URL and credentials are valid
- **File Storage**: Check access credentials and bucket permissions (MinIO or AWS S3)
- **AI Provider**: Check `AI_MODE`, Ollama connectivity, or `OPENAI_API_KEY` validity

### Development Setup

#### Quick Local Development
```bash
# Set all modes to local in .env.local
# MONGODB_MODE=local
# QDRANT_MODE=local
# NEO4J_MODE=local
# STORAGE_MODE=local
# AI_MODE=local
# AUTH_MODE=local
# NEXT_PUBLIC_AUTH_MODE=local

# Generate an auth session secret (writes AUTH_SECRET into .env.local)
npx auth secret

# Install dependencies
npm install

# Start only the services set to "local" above (reads .env.local automatically)
# — note there's no container for AUTH_MODE, it's a library, not a service
npm run docker:up

# Pull the local chat and embedding models (one-time setup)
docker compose --profile ai exec ollama ollama pull llama3.1
docker compose --profile ai exec ollama ollama pull nomic-embed-text

# Run development server
npm run dev
```

#### Switching Between Local and Cloud

To switch MongoDB, Qdrant, Neo4j, file storage, the AI provider, or authentication between local and cloud, update the mode variable(s) in `.env.local`, re-run `npm run docker:up` (it starts newly-local services and leaves the rest alone — run `npm run docker:down` first if you want to stop a container you just switched away from), and restart the dev server:

| Variable | `local` | `cloud` |
|---|---|---|
| `MONGODB_MODE` | Docker Desktop (`mongodb://localhost:27017`) | MongoDB Atlas (`MONGODB_URI`) |
| `QDRANT_MODE` | Docker Desktop (`http://localhost:6333`) | Qdrant Cloud (`QDRANT_URL` + `QDRANT_API_KEY`) |
| `NEO4J_MODE` | Docker Desktop (`bolt://localhost:7687`) | Neo4j Aura (`NEO4J_URI` + credentials) |
| `STORAGE_MODE` | Docker Desktop MinIO (`http://localhost:9000`) | AWS S3 (`AWS_S3_BUCKET_NAME` + credentials) |
| `AI_MODE` | Docker Desktop Ollama (`http://localhost:11434`) | OpenAI (`OPENAI_API_KEY`) |
| `AUTH_MODE` (+ `NEXT_PUBLIC_AUTH_MODE`) | Self-hosted Auth.js (`AUTH_SECRET`, no container) | Clerk (`CLERK_SECRET_KEY` + publishable key) |

The default for all six is `cloud` when the variable is unset in code — the shipped `.env.example` sets each to `local` for a zero-config dev setup. Switching `AI_MODE` also changes the embedding model, so `EMBEDDING_DIMENSIONS` and the Qdrant collection must be kept in sync (see the AI Provider setup section above). `AUTH_MODE` is the only one of the six needing its `NEXT_PUBLIC_` twin kept in sync too, and the only one requiring a full restart rather than a hot env reload, since it changes what renders client-side.

#### Environment Validation
The application includes built-in connection testing and will provide clear error messages for misconfigured services.

## 📊 Performance Optimizations

### Vector Search
- **Efficient Indexing**: Optimized Qdrant collections
- **Batch Processing**: Bulk operations for embeddings
- **Caching Strategy**: Smart result caching

### Database Performance
- **MongoDB Indexes**: Optimized query performance
- **Neo4j Optimization**: Efficient graph traversal
- **Connection Pooling**: Managed database connections

### Frontend Performance
- **Next.js Optimization**: Built-in performance features
- **Component Optimization**: Memoization and lazy loading
- **Bundle Optimization**: Efficient code splitting

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- **TypeScript**: Maintain type safety
- **Testing**: Add tests for new features
- **Documentation**: Update docs for changes
- **Code Style**: Follow established patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Community
- **Issues**: [GitHub Issues](https://github.com/kanugurajesh/DocuMind/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kanugurajesh/DocuMind/discussions)

---

<div align="center">

**Built with ❤️ by Kanugu Rajesh**

</div>
