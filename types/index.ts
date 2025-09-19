// Database Types
export * from './database';

// API Types
export * from './api';

// Component Types
export * from './components';

// Environment Types
export interface EnvConfig {
  // Clerk
  clerkPublishableKey: string;
  clerkSecretKey: string;

  // Databases
  mongodbUri: string;
  mongodbDbName: string;
  qdrantUrl: string;
  qdrantApiKey?: string;
  neo4jUri: string;
  neo4jUsername: string;
  neo4jPassword: string;

  // AWS S3 Storage
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
  awsS3BucketName: string;

  // OpenAI
  openaiApiKey: string;
  openaiModel: string;

  // App Config
  maxFileSizeMB: number;
  maxChunkSize: number;
  embeddingDimensions: number;
}

// Utility Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Processing Types
export interface ProcessingJob {
  id: string;
  docId: string;
  userId: string;
  type: 'text_extraction' | 'embedding_generation' | 'entity_extraction';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  result?: any;
  error?: string;
}