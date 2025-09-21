# Documind - AI-Powered Document Intelligence Platform

<div align="center">

![Documind Logo](https://via.placeholder.com/120x120/6366f1/ffffff?text=DM)

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
│  • AI Processing Pipeline (LangChain + OpenAI)                  │
│  • File processing (PDF, Word, Text)                            │
└─────────────────────────────────────────────────────────────────┘
                                 ║
         ┌---------------────────╫────────--------------┐
         ▼                       ║                      ▼
┌─────────────────┐    ┌─────────╫───────┐      ┌─────────────────┐
│   File Storage  │    │    AI Services  │      │   Databases     │
│                 │    │                 │      │                 │
│  • AWS S3       │    │  • OpenAI GPT   │      │  • MongoDB      │
│  • Presigned    │    │  • Embeddings   │      │  • Qdrant       │
│    URLs         │    │  • LangChain    │      │  • Neo4j        │
│  • Secure       │    │  • Text         │      │  • Multi-DB     │
│    Storage      │    │    Processing   │      │    Architecture │
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
- **OpenAI**: Embeddings and language model
- **LangChain**: AI orchestration framework

#### Processing Pipeline
- **Mammoth.js**: Word document processing
- **PDF-Parse**: PDF text extraction
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
   • AI analysis (OpenAI)
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
     │              │               └─→ LangChain + OpenAI processing
     │              │                   Topic modeling
     │              │                   Entity recognition
     │              │
     │              └─→ PDF/Word/Text extraction
     │                  Mammoth.js for Word docs
     │                  pdf-parse for PDFs
     │
     └─→ AWS S3 secure storage
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
- **MongoDB** instance (local or cloud)
- **Qdrant** vector database
- **Neo4j** graph database
- **AWS S3** bucket
- **OpenAI API** key
- **Clerk** account for authentication

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/documind.git
cd documind
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure your services:

```bash
cp .env.example .env.local
```

Update `.env.local` with your service credentials:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/documind
MONGODB_DB_NAME=documind

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key

# Neo4j Graph Database
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password

# AWS S3 Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=your-bucket-name

# OpenAI API
OPENAI_API_KEY=sk-your_openai_key
OPENAI_MODEL=gpt-4o-mini

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_FILE_SIZE_MB=10
MAX_CHUNK_SIZE=500
EMBEDDING_DIMENSIONS=1536
```

### 4. Database Setup

Ensure all databases are running and accessible:

#### MongoDB
```bash
# Local MongoDB
mongod --dbpath /path/to/data/db

# Or use MongoDB Atlas (cloud)
```

#### Qdrant
```bash
# Using Docker (recommended for development)
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant

# Or use our provided Docker Compose setup
docker-compose -f docker-compose.qdrant.yml up -d

# Or use Qdrant Cloud
```

#### Neo4j
```bash
# Using Docker
docker run --publish=7474:7474 --publish=7687:7687 --env NEO4J_AUTH=neo4j/your_password neo4j

# Or use Neo4j Aura (cloud)
```

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
│   ├── chat/                     # Chat interface page
│   ├── dashboard/                # Main dashboard
│   ├── graph/                    # Knowledge graph view
│   ├── sign-in/                  # Authentication pages
│   ├── sign-up/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── chat/                     # Chat interface components
│   ├── documents/                # Document management
│   ├── graph/                    # Graph visualization
│   ├── layout/                   # Layout components
│   └── ui/                       # Reusable UI components
├── lib/                          # Utilities and configurations
│   ├── ai/                       # AI processing modules
│   │   ├── chat.ts               # Chat functionality
│   │   ├── embeddings.ts         # Vector embeddings
│   │   ├── entities.ts           # Entity extraction
│   │   ├── pipeline.ts           # Processing pipeline
│   │   └── processing.ts         # Text processing
│   ├── api/                      # API utilities
│   ├── db/                       # Database connections
│   │   ├── mongodb.ts            # MongoDB client
│   │   ├── neo4j.ts              # Neo4j client
│   │   └── qdrant.ts             # Qdrant client
│   └── storage/                  # File storage
├── types/                        # TypeScript definitions
├── docker-compose.qdrant.yml     # Local Qdrant Docker setup
├── middleware.ts                 # Clerk middleware
└── next.config.ts               # Next.js configuration
```

## 🔄 Document Processing Pipeline

### 1. Upload Phase
- **Authentication**: Verify user via Clerk
- **Storage**: Save file to AWS S3
- **Metadata**: Create document record in MongoDB
- **Queue**: Initiate background processing

### 2. Processing Phase
- **Text Extraction**: Extract content from PDF/DOCX/TXT
- **Chunking**: Split text into optimal segments (500 tokens)
- **Embeddings**: Generate vector representations using OpenAI
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
- **Clerk Integration**: Secure sign-up/sign-in flows
- **Session Management**: Automatic token handling
- **Route Protection**: Middleware-based access control

### Data Isolation
- **User Scoping**: Complete isolation of user data
- **Query Filtering**: Automatic user-based filtering
- **Access Control**: Document ownership verification

### Security Features
- **Encrypted Storage**: Secure file storage in AWS S3
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
3. **File Storage**: Set up AWS S3 bucket
4. **Authentication**: Configure Clerk for production

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

#### Qdrant Connection Errors

If you encounter `ENOTFOUND` errors with Qdrant:

1. **Check Instance Status**: Verify your Qdrant Cloud instance is running
2. **Use Local Fallback**: Switch to local Docker setup:
   ```bash
   # Start local Qdrant
   docker-compose -f docker-compose.qdrant.yml up -d

   # Update .env.local
   QDRANT_URL=http://localhost:6333
   # Remove QDRANT_API_KEY for local instance
   ```
3. **Network Issues**: Check firewall/VPN settings
4. **Graceful Degradation**: The app continues working with limited functionality if Qdrant is unavailable

#### Graph Visualization Issues

- **No Connections Visible**: Check that documents have been processed and entities extracted
- **Cluttered Graph**: Use the "Show Connection Labels" toggle to reduce visual noise
- **Performance Issues**: Reduce max nodes limit in the filters panel
- **Layout Problems**: Use graph controls (fit to view, center, reset zoom) to optimize display

#### Database Connection Issues

- **MongoDB**: Ensure connection string is correct and database is accessible
- **Neo4j**: Verify bolt:// URL and credentials are valid
- **AWS S3**: Check access credentials and bucket permissions

### Development Setup

#### Quick Local Development
```bash
# Start all services with Docker
docker-compose -f docker-compose.qdrant.yml up -d

# Install dependencies
npm install

# Run development server
npm run dev
```

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

### Documentation
- **API Reference**: `/docs/api`
- **Component Library**: `/docs/components`
- **Deployment Guide**: `/docs/deployment`

### Community
- **Issues**: [GitHub Issues](https://github.com/yourusername/documind/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/documind/discussions)
- **Discord**: [Join our community](https://discord.gg/documind)

### Enterprise Support
For enterprise deployments and custom integrations, contact us at [enterprise@documind.com](mailto:enterprise@documind.com)

---

<div align="center">

**Built with ❤️ by the Kanugu Rajesh**

[Website](https://documind.com) • [Documentation](https://docs.documind.com) • [Blog](https://blog.documind.com)

</div>