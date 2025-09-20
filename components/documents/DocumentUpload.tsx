"use client";

import axios from "axios";
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
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${
            isDragActive && !isDragReject
              ? "border-blue-400 bg-blue-50"
              : isDragReject
                ? "border-red-400 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
          }
          ${uploading ? "cursor-not-allowed opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          {/* Upload Icon */}
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Upload Text */}
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive
                ? isDragReject
                  ? "Unsupported file type"
                  : "Drop files here"
                : "Upload your documents"}
            </p>
            <p className="text-sm text-gray-500">
              {uploading
                ? "Processing uploads..."
                : "Drag & drop files or click to browse"}
            </p>
          </div>

          {/* File Type Info */}
          <div className="text-xs text-gray-400">
            <p>Supported formats: PDF, DOCX, DOC, TXT</p>
            <p>Maximum file size: {maxSizeKB / 1024}MB</p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {progressFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-900">
            Uploading files...
          </p>
          {progressFiles.map((filename) => (
            <div key={filename} className="space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="truncate">{filename}</span>
                <span>{uploadProgress[filename]}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
