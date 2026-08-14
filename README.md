# Documind - AI-Powered Document Intelligence Platform

<div align="center">

**Transform documents into intelligent knowledge with AI-powered semantic search and graph visualization**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4.svg)](https://tailwindcss.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-9333EA.svg)](https://clerk.com/)


</div>

## 🚀 Overview

Documind is a cutting-edge document intelligence platform that transforms your documents into an interactive, searchable knowledge base. Upload documents, extract insights, and interact using natural language queries powered by advanced AI technologies.

### ✨ Key Features

- **🤖 AI-Powered Q&A**: Ask questions in natural language and get intelligent answers with source citations
- **📊 Interactive Knowledge Graph**: Visualize relationships between entities with advanced filtering and layout options
- **🔍 Semantic Search**: Find relevant information using vector-based similarity search
- **📄 Multi-Format Support**: Process PDFs, Word documents, and text files seamlessly
- **🔐 Secure & Private**: Complete user data isolation with enterprise-grade security
- **⚡ Real-time Processing**: Background document processing with live status updates
- **🎛️ Smart Filtering**: Customizable graph views with entity type filters and confidence thresholds
- **🔧 Resilient Architecture**: Graceful error handling with fallback options for all services

## Photos

<img width="1920" height="1080" alt="Screenshot 2025-09-25 093745" src="https://github.com/user-attachments/assets/4a6d220b-0bc1-4d93-a77a-e60374474ffa" />

<img width="1920" height="1080" alt="Screenshot 2025-09-25 093751" src="https://github.com/user-attachments/assets/776bd593-a3b0-4f45-b173-4111570ac0b4" />

<img width="1920" height="1080" alt="Screenshot 2025-09-25 093821" src="https://github.com/user-attachments/assets/21932850-baec-4bf3-8083-78458e2c38fc" />

<img width="1920" height="1080" alt="Screenshot 2025-09-25 093828" src="https://github.com/user-attachments/assets/50526ec3-7969-4bb4-aa15-fad8a3c75fb6" />

<img width="1920" height="1080" alt="Screenshot 2025-09-25 094350" src="https://github.com/user-attachments/assets/feec26ab-4e05-4bb1-b4cb-c1e6843970d7" />

<img width="1920" height="1080" alt="Screenshot 2025-09-25 094401" src="https://github.com/user-attachments/assets/9b0a2f27-3dd3-4398-9d40-1e9878321a70" />

<img width="1920" height="1080" alt="Screenshot 2025-09-25 093908" src="https://github.com/user-attachments/assets/f0088bc2-50aa-48f1-ba90-8f9caeaaa4c9" />

## 🏗️ Architecture

Documind employs a sophisticated multi-database architecture designed for scalability and performance:

### 📐 High-Level Architecture Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  • Next.js 15 with App Router (React 19)                        │
│  • TypeScript for type safety                                   │
│  • Tailwind CSS v4 for styling                                  │
│  • Radix UI components                                          │
│  • Clerk for authentication                                     │
│  • Cytoscape.js for graph visualization                         │
└─────────────────────────────────────────────────────────────────┘
                                 ║
                                 ║ API Routes
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  • Next.js API Routes                                           │
│  • Middleware for authentication                                │
│  • AI Processing Pipeline (Ollama or OpenAI)                     │
│  • File processing (PDF via LangChain, Word, Text)              │
└─────────────────────────────────────────────────────────────────┘
                                 ║
         ┌---------------────────╫────────--------------┐
         ▼                       ║                      ▼
┌─────────────────┐    ┌─────────╫───────┐      ┌─────────────────┐
│   File Storage  │    │    AI Services  │      │   Databases     │
│                 │    │                 │      │                 │
│  • MinIO/AWS S3 │    │  • Ollama/GPT   │      │  • MongoDB      │
│  • Presigned    │    │  • Embeddings   │      │  • Qdrant       │
│    URLs         │    │  • Entity       │      │  • Neo4j        │
│  • Secure       │    │    Extraction   │      │  • Multi-DB     │
│    Storage      │    │                 │      │    Architecture │
└─────────────────┘    └─────────────────┘      └─────────────────┘
```

### 🗄️ Database Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    MongoDB      │    │     Qdrant      │    │     Neo4j       │
│                 │    │                 │    │                 │
│  • Documents    │    │  • Vector       │    │  • Knowledge    │
│    metadata     │    │    embeddings   │    │    Graph        │
│  • User data    │    │  • Semantic     │    │  • Entities     │
│  • Processing   │    │    search       │    │  • Relations    │
│    status       │    │  • Similarity   │    │  • Topics       │
│  • File refs    │    │    matching     │    │  • Clusters     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
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
```
1. User Authentication (Clerk)
   ↓
2. File Upload to S3
   ↓
3. Background Processing:
   • Text extraction
   • AI analysis (Ollama or OpenAI)
   • Vector generation (Qdrant)
   • Entity extraction (Neo4j)
   • Metadata storage (MongoDB)
   ↓
4. Real-time Status Updates
   ↓
5. Interactive Features:
   • Semantic search
   • AI chat
   • Graph visualization
   • Document management
```

### 🔄 Document Processing Flow
```
File Upload → Text Extraction → AI Processing → Multi-DB Storage
     │              │               │              │
     │              │               │              └─→ Vector embeddings (Qdrant)
     │              │               │                 Entity extraction (Neo4j)
     │              │               │                 Metadata storage (MongoDB)
     │              │               │
     │              │               └─→ Ollama/OpenAI processing
     │              │                   Topic modeling
     │              │                   Entity recognition
     │              │
     │              └─→ PDF/Word/Text extraction
     │                  Mammoth.js for Word docs
     │                  pdf-parse for PDFs
     │
     └─→ MinIO/AWS S3 secure storage
         Presigned URLs
```

### 🏛️ Component Architecture
```
Frontend Structure:
├── Pages:
│   ├── / (Landing page)
│   ├── /dashboard (Main interface)
│   ├── /chat (AI Q&A interface)
│   ├── /graph (Knowledge graph visualization)
│   └── /sign-in & /sign-up (Authentication)
│
├── Components:
│   ├── ui/ (Radix UI components)
│   ├── chat/ (Chat interface)
│   ├── documents/ (File management)
│   ├── graph/ (Cytoscape visualization)
│   └── layout/ (Navigation, headers)
│
└── API Routes:
    ├── /upload (File upload & processing)
    ├── /documents (CRUD operations)
    ├── /search (Semantic search)
    ├── /chat (AI Q&A)
    └── /graph (Graph data & operations)
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

### 1. Upload Phase
- **Authentication**: Verify user session (local Auth.js or Clerk, depending on `AUTH_MODE`)
- **Storage**: Save file to local MinIO or AWS S3
- **Metadata**: Create document record in MongoDB
- **Queue**: Initiate background processing

### 2. Processing Phase
- **Text Extraction**: Extract content from PDF/DOCX/TXT
- **Chunking**: Split text into optimal segments (500 tokens)
- **Embeddings**: Generate vector representations using Ollama or OpenAI
- **Storage**: Store vectors in Qdrant with user scoping

### 3. Knowledge Graph Construction
- **Entity Extraction**: Identify people, organizations, locations, dates using AI
- **Relationship Mapping**: Create co-occurrence and semantic similarity connections
- **Quality Filtering**: Filter relationships by confidence thresholds (>0.3 for co-occurrence, >0.5 for similarity)
- **Cross-Document Resolution**: Link same entities across different documents
- **Graph Storage**: Build optimized knowledge graph in Neo4j with proper indexing
- **User Isolation**: Ensure complete data privacy with user-scoped queries

### 4. Status Updates
- **Real-time**: Live processing status updates
- **Error Handling**: Comprehensive error reporting
- **Completion**: Automatic notification system

## 🔍 Search & Q&A System

### Semantic Search Flow

1. **Query Processing**: Convert user query to vector embedding
2. **Vector Search**: Find similar content in Qdrant (user-scoped)
3. **Context Retrieval**: Gather related entities from Neo4j
4. **LLM Integration**: Combine context with user query
5. **Response Generation**: Provide answers with source citations

### Knowledge Graph Exploration

- **Interactive Visualization**: Cytoscape.js powered graphs with optimized layouts
- **Smart Edge Rendering**: Clean visualization with hover-to-reveal labels for reduced clutter
- **Advanced Filtering**: Filter by entity types, confidence thresholds, and relationship strengths
- **Customizable Display**: Toggle edge labels, adjust node limits, and control visual density
- **Entity Relationships**: Explore connections between people, organizations, locations, and concepts
- **Document Mapping**: Visualize how documents relate through shared entities and topics
- **Graph Statistics**: Real-time metrics showing nodes, edges, and entity distributions

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
- **Cluttered Graph**: Use the "Show Connection Labels" toggle to reduce visual noise
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
