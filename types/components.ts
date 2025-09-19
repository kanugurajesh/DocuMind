import { Document, ChatMessage, GraphData, EntityNode } from './database';

// Document Components
export interface DocumentListProps {
  documents: Document[];
  onDocumentDelete: (docId: string) => void;
  onDocumentSelect?: (document: Document) => void;
  loading?: boolean;
}

export interface DocumentCardProps {
  document: Document;
  onDelete: (docId: string) => void;
  onClick?: () => void;
}

export interface DocumentUploadProps {
  onUploadComplete: (document: Document) => void;
  onUploadError: (error: string) => void;
  maxSizeKB?: number;
  acceptedTypes?: string[];
}

// Chat Components
export interface ChatInterfaceProps {
  onMessageSend: (message: string) => void;
  messages: ChatMessage[];
  loading?: boolean;
  disabled?: boolean;
}

export interface ChatMessageProps {
  message: ChatMessage;
  showSources?: boolean;
  onSourceClick?: (docId: string) => void;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Graph Components
export interface GraphVisualizationProps {
  graphData: GraphData;
  onNodeClick?: (nodeId: string, nodeType: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  height?: number;
  width?: number;
}

export interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onLayout: (layoutName: string) => void;
  layouts: string[];
}

// Search Components
export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface SearchResultsProps {
  results: any[];
  onResultClick?: (result: any) => void;
  loading?: boolean;
  noResultsMessage?: string;
}

// UI Components
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

// Layout Components
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

// Entity Components
export interface EntityBadgeProps {
  entity: EntityNode;
  onClick?: (entity: EntityNode) => void;
  size?: 'sm' | 'md' | 'lg';
}

export interface EntityListProps {
  entities: EntityNode[];
  onEntityClick?: (entity: EntityNode) => void;
  groupBy?: 'category' | 'document';
}