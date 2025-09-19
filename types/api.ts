import { Document, SearchResult, ChatResponse, GraphData } from './database';

// Upload API Types
export interface UploadRequest {
  file: File;
  userId: string;
}

export interface UploadResponse {
  success: boolean;
  docId?: string;
  filename?: string;
  message: string;
  error?: string;
}

// Document API Types
export interface GetDocumentsResponse {
  success: boolean;
  documents: Document[];
  total: number;
}

export interface DeleteDocumentRequest {
  docId: string;
  userId: string;
}

export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Chat API Types
export interface ChatRequest {
  query: string;
  userId: string;
  conversationId?: string;
  maxResults?: number;
}

export interface ChatApiResponse {
  success: boolean;
  data?: ChatResponse;
  error?: string;
}

// Search API Types
export interface SearchRequest {
  query: string;
  userId: string;
  limit?: number;
  minScore?: number;
  docIds?: string[];
}

export interface SearchApiResponse {
  success: boolean;
  results?: SearchResult[];
  total?: number;
  error?: string;
}

// Graph API Types
export interface GraphRequest {
  userId: string;
  docIds?: string[];
  entityTypes?: string[];
  maxNodes?: number;
}

export interface GraphApiResponse {
  success: boolean;
  data?: GraphData;
  error?: string;
}

// Processing Status API Types
export interface ProcessingStatusRequest {
  docId: string;
  userId: string;
}

export interface ProcessingStatusResponse {
  success: boolean;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  error?: string;
}

// Error Response Type
export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

// Generic API Response Wrapper
export type ApiResponse<T> = {
  success: true;
  data: T;
} | ErrorResponse;