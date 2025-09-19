'use client';

import React, { useState } from 'react';
import { DocumentCardProps } from '@/types';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return (
        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6l-4-4H4v16zm8-14v4h4l-4-4z" />
        </svg>
      );
    }

    if (fileType.includes('word') || fileType.includes('document')) {
      return (
        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6l-4-4H4v16zm8-14v4h4l-4-4z" />
        </svg>
      );
    }

    return (
      <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 18h12V6l-4-4H4v16zm8-14v4h4l-4-4z" />
      </svg>
    );
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
    <div
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* File Icon */}
          <div className="flex-shrink-0 mt-1">
            {getFileIcon(document.fileType)}
          </div>

          {/* Document Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {document.filename}
            </h3>

            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>{formatFileSize(document.fileSize)}</span>
              <span>•</span>
              <span>{formatDate(document.uploadedAt)}</span>
            </div>

            {/* Metadata */}
            {document.metadata && (
              <div className="mt-2 text-sm text-gray-600">
                {document.metadata.pageCount && (
                  <span>{document.metadata.pageCount} pages</span>
                )}
                {document.metadata.wordCount && (
                  <span>
                    {document.metadata.pageCount ? ' • ' : ''}
                    {document.metadata.wordCount.toLocaleString()} words
                  </span>
                )}
              </div>
            )}

            {/* Error Message */}
            {document.processingStatus === 'failed' && document.errorMessage && (
              <div className="mt-2 text-sm text-red-600">
                Error: {document.errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex items-center space-x-3">
          {/* Processing Status */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              document.processingStatus
            )}`}
          >
            {document.processingStatus === 'processing' && (
              <svg
                className="animate-spin -ml-1 mr-1 h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {document.processingStatus.charAt(0).toUpperCase() + document.processingStatus.slice(1)}
          </span>

          {/* Delete Button */}
          <div className="flex items-center space-x-2">
            {showDeleteConfirm ? (
              <>
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Confirm
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 p-1 rounded"
                title="Delete document"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}