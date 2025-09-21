"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Download,
  Eye,
  FileText,
  FileType,
  HardDrive,
  MoreVertical,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";
import {
  formatDate,
  formatFileSize,
  getFileIcon,
  getStatusIcon,
  getStatusVariant,
} from "@/lib/utils";
import type { DocumentCardProps } from "@/types";

export function DocumentCard({
  document,
  onDelete,
  onClick,
}: DocumentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const StatusIcon = getStatusIcon(document.processingStatus);
  const { icon: FileIconComponent, className: fileIconClass } = getFileIcon(
    document.fileType,
  );

  const renderStatusIcon = () => {
    const iconProps = {
      className:
        document.processingStatus === "processing"
          ? "h-3 w-3 animate-spin"
          : "h-3 w-3",
    };
    return <StatusIcon {...iconProps} />;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      showToast.loading(`Deleting "${document.filename}"...`);
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

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      showToast.loading(`Preparing download for "${document.filename}"...`);

      const response = await axios.get(`/api/documents/${document.docId}/download`);

      if (response.data.success) {
        // Create a temporary anchor element to trigger download
        const link = globalThis.document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = response.data.filename;
        link.target = '_blank';
        globalThis.document.body.appendChild(link);
        link.click();
        globalThis.document.body.removeChild(link);

        showToast.success(`Downloaded "${document.filename}"`);
      } else {
        throw new Error(response.data.error || 'Download failed');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      showToast.error(`Failed to download "${document.filename}"`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card
      className="card-enhanced hover:shadow-xl transition-all duration-300 cursor-pointer group border-l-4 border-l-blue-500"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* File Icon */}
            <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300">
              <FileIconComponent className={`w-6 h-6 ${fileIconClass} icon-blue`} />
            </div>

            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold truncate text-enhanced group-hover:text-blue-700 transition-colors">
                  {document.filename}
                </h3>
                <Badge
                  className={`ml-auto font-medium px-3 py-1 ${
                    document.processingStatus === "completed"
                      ? "badge-success"
                      : document.processingStatus === "processing"
                      ? "badge-processing"
                      : document.processingStatus === "failed"
                      ? "badge-failed"
                      : "badge-warning"
                  }`}
                >
                  {renderStatusIcon()}
                  <span className="ml-1 capitalize">
                    {document.processingStatus}
                  </span>
                </Badge>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-enhanced mb-3">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 group-hover:bg-gray-100 transition-colors">
                  <HardDrive className="h-3 w-3 icon-green" />
                  <span className="font-medium">{formatFileSize(document.fileSize)}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 group-hover:bg-gray-100 transition-colors">
                  <Calendar className="h-3 w-3 icon-purple" />
                  <span className="font-medium">{formatDate(document.uploadedAt)}</span>
                </div>
              </div>

              {/* Metadata */}
              {document.metadata && (
                <div className="flex items-center space-x-4 text-sm text-muted-enhanced mb-2">
                  {document.metadata.pageCount && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-50 group-hover:bg-orange-100 transition-colors">
                      <FileType className="h-3 w-3 icon-orange" />
                      <span className="font-medium">{document.metadata.pageCount} pages</span>
                    </div>
                  )}
                  {document.metadata.wordCount && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                      <FileText className="h-3 w-3 icon-indigo" />
                      <span className="font-medium">
                        {document.metadata.wordCount.toLocaleString()} words
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {document.processingStatus === "failed" &&
                document.errorMessage && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-700 font-medium">
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
              <DropdownMenuItem onClick={handleViewDetails}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownload}
                disabled={isDownloading}
                className={`${isDownloading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 focus:bg-blue-50'} transition-colors`}
              >
                <Download className="mr-2 h-4 w-4 text-blue-600" />
                <span className="font-medium">{isDownloading ? 'Downloading...' : 'Download'}</span>
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

      {/* Document Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl card-enhanced border-0 shadow-xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-enhanced">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100">
                <FileIconComponent className={`w-6 h-6 ${fileIconClass} icon-blue`} />
              </div>
              {document.filename}
            </DialogTitle>
            <DialogDescription className="text-muted-enhanced">
              Comprehensive document details and metadata information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-enhanced">File Size</label>
                <p className="text-base font-mono text-enhanced bg-gray-50 rounded-md px-3 py-2 border">{formatFileSize(document.fileSize)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-enhanced">File Type</label>
                <p className="text-base font-mono text-enhanced bg-gray-50 rounded-md px-3 py-2 border">{document.fileType}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-enhanced">Uploaded</label>
                <p className="text-base text-enhanced bg-gray-50 rounded-md px-3 py-2 border">{formatDate(document.uploadedAt)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-enhanced">Status</label>
                <div className="flex items-center">
                  <Badge className={`${
                    document.processingStatus === "completed"
                      ? "badge-success"
                      : document.processingStatus === "processing"
                      ? "badge-processing"
                      : document.processingStatus === "failed"
                      ? "badge-failed"
                      : "badge-warning"
                  } px-3 py-1.5 text-sm font-medium`}>
                    {renderStatusIcon()}
                    <span className="ml-2 capitalize">{document.processingStatus}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Metadata */}
            {document.metadata && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold text-enhanced mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 icon-blue" />
                    Document Information
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    {document.metadata.title && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-enhanced">Title</label>
                        <p className="text-base text-enhanced bg-gray-50 rounded-md px-3 py-2 border">{document.metadata.title}</p>
                      </div>
                    )}
                    {document.metadata.author && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-enhanced">Author</label>
                        <p className="text-base text-enhanced bg-gray-50 rounded-md px-3 py-2 border">{document.metadata.author}</p>
                      </div>
                    )}
                    {document.metadata.pageCount && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-enhanced">Pages</label>
                        <p className="text-base text-enhanced bg-gray-50 rounded-md px-3 py-2 border">{document.metadata.pageCount}</p>
                      </div>
                    )}
                    {document.metadata.wordCount && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-enhanced">Words</label>
                        <p className="text-base text-enhanced bg-gray-50 rounded-md px-3 py-2 border">{document.metadata.wordCount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {document.processingStatus === "failed" && document.errorMessage && (
              <div className="border-t pt-4">
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-700 mb-1">Processing Error</p>
                      <p className="text-sm text-red-600 leading-relaxed">{document.errorMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isDownloading}
                className="gap-2 hover-lift focus-ring-enhanced px-6 py-2.5 font-medium border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
              <Button
                onClick={() => {
                  setShowDetails(false);
                  onClick?.();
                }}
                className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5 font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                Open Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
