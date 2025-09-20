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
} from "lucide-react";
import type React from "react";
import { useState } from "react";
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
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
              >
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
