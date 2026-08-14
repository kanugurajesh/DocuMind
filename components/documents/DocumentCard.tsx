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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    let loadingToastId: string | undefined;

    try {
      setIsDeleting(true);
      loadingToastId = showToast.loading(`Deleting "${document.filename}"...`);
      await onDelete(document.docId);

      // Dismiss loading toast - success notification is handled by parent component
      showToast.dismiss(loadingToastId);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Delete error:', error);
      // Dismiss loading toast if it exists
      if (loadingToastId) {
        showToast.dismiss(loadingToastId);
      }
      showToast.error(`Failed to delete "${document.filename}"`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;

    let loadingToastId: string | undefined;

    try {
      setIsDownloading(true);
      loadingToastId = showToast.loading(`Preparing download for "${document.filename}"...`);

      const response = await axios.get(`/api/documents/${document.docId}/download`);

      // Dismiss the loading toast
      showToast.dismiss(loadingToastId);

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
      // Dismiss the loading toast if it exists
      if (loadingToastId) {
        showToast.dismiss(loadingToastId);
      }
      showToast.error(`Failed to download "${document.filename}"`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card
      className="card-index cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* File Icon */}
            <div className="flex-shrink-0 mt-1 p-2 rounded-sm border border-border bg-background group-hover:border-ledger transition-colors">
              <FileIconComponent className={`w-6 h-6 ${fileIconClass} icon-blue`} />
            </div>

            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-display text-lg font-semibold truncate text-enhanced transition-colors">
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

              <div className="flex items-center gap-4 catalog-number mb-3">
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {formatFileSize(document.fileSize)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(document.uploadedAt)}
                </span>
              </div>

              {/* Metadata */}
              {document.metadata && (
                <div className="flex items-center gap-4 catalog-number mb-2">
                  {document.metadata.pageCount && (
                    <span className="flex items-center gap-1">
                      <FileType className="h-3 w-3" />
                      {document.metadata.pageCount} pages
                    </span>
                  )}
                  {document.metadata.wordCount && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {document.metadata.wordCount.toLocaleString()} words
                    </span>
                  )}
                </div>
              )}

              {/* Error Message */}
              {document.processingStatus === "failed" &&
                document.errorMessage && (
                  <div className="mt-2 p-3 bg-stamp-tint border border-destructive/40">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <p className="text-sm text-destructive font-medium">
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
                className={isDownloading ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Download className="mr-2 h-4 w-4 icon-blue" />
                <span className="font-medium">{isDownloading ? 'Downloading…' : 'Download'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span className="font-medium">Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      {/* Document Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-enhanced">
              <div className="p-2 rounded-sm border border-border bg-background">
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
                <p className="text-base font-mono text-enhanced bg-muted rounded-sm px-3 py-2 border border-border">{formatFileSize(document.fileSize)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-enhanced">File Type</label>
                <p className="text-base font-mono text-enhanced bg-muted rounded-sm px-3 py-2 border border-border">{document.fileType}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-enhanced">Uploaded</label>
                <p className="text-base text-enhanced bg-muted rounded-sm px-3 py-2 border border-border">{formatDate(document.uploadedAt)}</p>
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
                <div className="rule-ledger pt-4">
                  <h4 className="font-display text-lg font-semibold text-enhanced mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 icon-blue" />
                    Document Information
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    {document.metadata.title && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-enhanced">Title</label>
                        <p className="text-base text-enhanced bg-muted rounded-sm px-3 py-2 border border-border">{document.metadata.title}</p>
                      </div>
                    )}
                    {document.metadata.author && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-enhanced">Author</label>
                        <p className="text-base text-enhanced bg-muted rounded-sm px-3 py-2 border border-border">{document.metadata.author}</p>
                      </div>
                    )}
                    {document.metadata.pageCount && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-enhanced">Pages</label>
                        <p className="text-base text-enhanced bg-muted rounded-sm px-3 py-2 border border-border">{document.metadata.pageCount}</p>
                      </div>
                    )}
                    {document.metadata.wordCount && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-enhanced">Words</label>
                        <p className="text-base text-enhanced bg-muted rounded-sm px-3 py-2 border border-border">{document.metadata.wordCount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {document.processingStatus === "failed" && document.errorMessage && (
              <div className="rule-ledger pt-4">
                <div className="p-4 bg-stamp-tint border border-destructive/40">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-destructive mb-1">Processing Error</p>
                      <p className="text-sm text-destructive/90 leading-relaxed">{document.errorMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 rule-ledger">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isDownloading}
                className="gap-2 px-6 py-2.5"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Downloading…' : 'Download'}
              </Button>
              <Button
                onClick={() => {
                  setShowDetails(false);
                  onClick?.();
                }}
                className="gap-2 px-6 py-2.5"
              >
                <ExternalLink className="h-4 w-4" />
                Open Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-enhanced">
              <div className="p-2 rounded-sm border border-destructive/40 bg-stamp-tint">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              Delete Document
            </DialogTitle>
            <DialogDescription className="text-muted-enhanced">
              This action cannot be undone. The document will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-stamp-tint border border-destructive/40">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-destructive mb-1">Are you sure you want to delete?</p>
                  <p className="text-sm text-destructive/90 leading-relaxed">
                    <span className="font-medium">"{document.filename}"</span> will be permanently deleted from your document library.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 rule-ledger">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="gap-2 px-6 py-2.5"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="gap-2 px-6 py-2.5"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Deleting…' : 'Delete Document'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
