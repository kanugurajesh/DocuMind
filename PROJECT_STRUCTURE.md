# Documind Project Structure

## Root Structure
```
documind/
├── app/                    # Next.js App Router
├── components/             # React Components
├── lib/                    # Shared Libraries & Utils
├── types/                  # TypeScript Type Definitions
├── public/                 # Static Assets
└── ...config files
```

## App Router Structure
```
app/
├── api/                    # API Routes
│   ├── documents/          # Document CRUD operations
│   ├── chat/              # Q&A chat endpoints
│   └── upload/            # File upload handling
├── dashboard/             # Main dashboard page
├── graph/                 # Graph visualization page
├── sign-in/              # Authentication pages
├── sign-up/
├── layout.tsx            # Root layout with Clerk
├── page.tsx              # Home/landing page
└── globals.css
```

## Components Structure
```
components/
├── ui/                    # Reusable UI components
├── documents/            # Document-related components
├── chat/                 # Chat interface components
└── graph/                # Graph visualization components
```

## Lib Structure
```
lib/
├── db/                   # Database connections & utils
│   ├── mongodb.ts        # MongoDB connection
│   ├── qdrant.ts         # Qdrant vector DB
│   └── neo4j.ts          # Neo4j graph DB
├── ai/                   # AI/ML utilities
│   ├── embeddings.ts     # Text embedding generation
│   ├── chat.ts           # LLM chat functionality
│   └── processing.ts     # Document processing
├── storage/              # File storage utilities
│   └── azure.ts          # Azure Blob Storage
└── utils/                # General utilities
    └── helpers.ts
```

## Types Structure
```
types/
├── index.ts              # Main type definitions
├── database.ts           # Database model types
├── api.ts                # API request/response types
└── components.ts         # Component prop types
```