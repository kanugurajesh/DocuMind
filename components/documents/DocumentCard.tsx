'use client';

import React, { useState } from 'react';
import { DocumentCardProps } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  File,
  MoreVertical,
  Trash2,
  Download,
  Eye,
  Calendar,
  HardDrive,
  FileType,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export function DocumentCard({ document, onDelete, onClick }: DocumentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'processing';
      case 'failed':
        return 'destructive';
      case 'pending':
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'processing':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3" />;
      case 'pending':
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="w-6 h-6 text-red-500" />;
    }

    if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="w-6 h-6 text-blue-500" />;
    }

    return <File className="w-6 h-6 text-muted-foreground" />;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete(document.docId);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* File Icon */}
            <div className="flex-shrink-0 mt-1">
              {getFileIcon(document.fileType)}
            </div>

            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold truncate">
                  {document.filename}
                </h3>
                <Badge variant={getStatusVariant(document.processingStatus)} className="ml-auto">
                  {getStatusIcon(document.processingStatus)}
                  <span className="ml-1 capitalize">{document.processingStatus}</span>
                </Badge>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  <span>{formatFileSize(document.fileSize)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(document.uploadedAt)}</span>
                </div>
              </div>

              {/* Metadata */}
              {document.metadata && (
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                  {document.metadata.pageCount && (
                    <div className="flex items-center gap-1">
                      <FileType className="h-3 w-3" />
                      <span>{document.metadata.pageCount} pages</span>
                    </div>
                  )}
                  {document.metadata.wordCount && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{document.metadata.wordCount.toLocaleString()} words</span>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {document.processingStatus === 'failed' && document.errorMessage && (
                <div className="mt-2 p-2 bg-destructive/10 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">
                      {document.errorMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {showDeleteConfirm ? (
                <>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCancelDelete}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}