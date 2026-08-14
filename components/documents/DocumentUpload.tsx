"use client";

import axios from "axios";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { showToast } from "@/lib/toast";
import type { Document, DocumentUploadProps } from "@/types";

export function DocumentUpload({
  onUploadComplete,
  onUploadError,
  maxSizeKB = 10240, // 10MB default
  acceptedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ],
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);

      for (const file of acceptedFiles) {
        try {
          // Validate file size
          if (file.size > maxSizeKB * 1024) {
            const errorMsg = `File "${file.name}" exceeds ${maxSizeKB / 1024}MB limit`;
            showToast.error(errorMsg);
            onUploadError(errorMsg);
            continue;
          }

          // Validate file type
          if (!acceptedTypes.includes(file.type)) {
            const errorMsg = `File "${file.name}" has unsupported format`;
            showToast.error(errorMsg);
            onUploadError(errorMsg);
            continue;
          }

          // Create form data
          const formData = new FormData();
          formData.append("file", file);

          // Upload file with progress tracking
          const response = await axios.post("/api/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                setUploadProgress((prev) => ({
                  ...prev,
                  [file.name]: progress,
                }));
              }
            },
          });

          if (response.data.success) {
            // Create a document object from the response
            const document: Partial<Document> = {
              docId: response.data.docId,
              filename: response.data.filename,
              originalName: file.name,
              fileSize: file.size,
              fileType: file.type,
              uploadedAt: new Date(),
              processingStatus: "pending",
            };

            showToast.success(`"${file.name}" uploaded successfully!`);
            onUploadComplete(document as Document);
          } else {
            const errorMsg = response.data.error || "Upload failed";
            showToast.error(`Failed to upload "${file.name}": ${errorMsg}`);
            onUploadError(errorMsg);
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.error || error.message || "Upload failed";
          const fullErrorMsg = `Failed to upload "${file.name}": ${errorMessage}`;
          showToast.error(fullErrorMsg);
          onUploadError(fullErrorMsg);
        }

        // Remove from progress tracking
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }

      setUploading(false);
    },
    [acceptedTypes, maxSizeKB, onUploadComplete, onUploadError],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: acceptedTypes.reduce(
        (acc, type) => {
          acc[type] = [];
          return acc;
        },
        {} as Record<string, string[]>,
      ),
      maxSize: maxSizeKB * 1024,
      disabled: uploading,
    });

  const progressFiles = Object.keys(uploadProgress);

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-sm p-8 text-center transition-colors cursor-pointer
          ${
            isDragActive && !isDragReject
              ? "border-ledger bg-ledger-tint"
              : isDragReject
                ? "border-destructive bg-stamp-tint"
                : "border-border hover:border-ledger"
          }
          ${uploading ? "cursor-not-allowed opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto h-14 w-14 rounded-sm border border-border bg-background flex items-center justify-center">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* Upload Text */}
          <div>
            <p className="font-display text-lg font-medium text-foreground">
              {isDragActive
                ? isDragReject
                  ? "Unsupported file type"
                  : "Drop files here"
                : "Upload your documents"}
            </p>
            <p className="text-sm text-muted-foreground">
              {uploading
                ? "Filing in progress…"
                : "Drag and drop, or click to browse"}
            </p>
          </div>

          {/* File Type Info */}
          <div className="catalog-number">
            <p>Supported formats: PDF, DOCX, DOC, TXT</p>
            <p>Maximum file size: {maxSizeKB / 1024}MB</p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {progressFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Uploading files…
          </p>
          {progressFiles.map((filename) => (
            <div key={filename} className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="truncate">{filename}</span>
                <span>{uploadProgress[filename]}%</span>
              </div>
              <div className="w-full bg-muted h-1.5">
                <div
                  className="bg-ledger h-1.5 transition-all duration-300"
                  style={{ width: `${uploadProgress[filename]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
