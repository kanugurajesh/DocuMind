"use client";

import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DocumentListProps } from "@/types";
import { DocumentCard } from "./DocumentCard";

export function DocumentList({
  documents,
  onDocumentDelete,
  onDocumentSelect,
  loading = false,
}: DocumentListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="card-enhanced border-l-4 border-l-gray-300">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2 rounded-lg" />
                  <div className="flex space-x-4">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-1/3 rounded-md" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center shadow-lg border border-blue-200">
          <FileText className="h-10 w-10 icon-blue" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-enhanced">No documents yet</h3>
        <p className="text-muted-enhanced mb-6 max-w-sm mx-auto">
          Upload your first document to get started with intelligent document
          analysis and AI-powered insights.
        </p>
        <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <Upload className="h-4 w-4" />
          Upload Documents
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.docId}
          document={document}
          onDelete={onDocumentDelete}
          onClick={() => onDocumentSelect?.(document)}
        />
      ))}
    </div>
  );
}
