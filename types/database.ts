// MongoDB Document Schema
export interface Document {
  _id?: string;
  docId: string;
  filename: string;
  originalName: string;
  blobUrl: string;
  userId: string;
  uploadedAt: Date;
  fileSize: number;
  fileType: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    pageCount?: number;
    wordCount?: number;
  };
}

// Qdrant Vector Schema
export interface VectorChunk {
  id: string;
  vector: number[];
  payload: {
    docId: string;
    userId: string;
    chunkIndex: number;
    text: string;
    startPosition: number;
    endPosition: number;
    metadata?: Record<string, any>;
  };
}

// Neo4j Node Types
export interface DocumentNode {
  id: string;
  docId: string;
  userId: string;
  filename: string;
  type: 'Document';
}

export interface ChunkNode {
  id: string;
  chunkId: string;
  docId: string;
  userId: string;
  text: string;
  chunkIndex: number;
  type: 'Chunk';
}

export interface EntityNode {
  id: string;
  entityId: string;
  name: string;
  type: 'Entity';
  category: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'DATE' | 'MONEY' | 'OTHER';
  userId: string;
  confidence: number;
  mentions: number;
}

// Neo4j Relationship Types
export interface Relationship {
  id: string;
  type: 'CONTAINS' | 'MENTIONS' | 'RELATED_TO';
  startNodeId: string;
  endNodeId: string;
  properties?: {
    confidence?: number;
    weight?: number;
    context?: string;
  };
}

// Graph Structure for Visualization
export interface GraphData {
  nodes: Array<DocumentNode | ChunkNode | EntityNode>;
  edges: Relationship[];
}

// Search Results
export interface SearchResult {
  chunkId: string;
  docId: string;
  text: string;
  score: number;
  document: {
    filename: string;
    uploadedAt: Date;
  };
  entities?: EntityNode[];
}

// Chat/Q&A Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: SearchResult[];
}

export interface ChatResponse {
  answer: string;
  sources: SearchResult[];
  confidence: number;
  relatedEntities: EntityNode[];
}